import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../model/User";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { AuthRequest } from "../middleware/auth";
import { signToken } from "../services/jwtService";
import { sendEmail } from "../services/emailService";

const generateToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

// ─── REGISTER ───────────────────────────────────────────────
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, image } = req.body;

  if (!name || !email || !password) {
    throw AppError.badRequest("Please provide name, email and password");
  }

  if (password.length < 6) {
    throw AppError.badRequest("Password must be at least 6 characters");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw AppError.conflict("Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = generateToken();

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    image,
    verificationToken: hashToken(verificationToken),
    verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: "Verify Your Email",
    html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email. Expires in 24 hours.</p>`,
  });

  const token = signToken({ id: user.id, role: user.role });
  const { password: _pw, ...userWithoutPassword } = user.toObject();

  sendResponse(res, 201, "Registration successful. Please verify your email.", {
    token,
    user: userWithoutPassword,
  });
});

// ─── VERIFY EMAIL ───────────────────────────────────────────
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    throw AppError.badRequest("Invalid verification token");
  }

  const user = await User.findOne({
    verificationToken: hashToken(token),
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw AppError.badRequest("Invalid or expired verification token");
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  sendResponse(res, 200, "Email verified successfully");
});

// ─── RESEND VERIFICATION ──────────────────────────────────
export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw AppError.badRequest("Please provide your email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw AppError.notFound("User not found");
  }

  if (user.isVerified) {
    throw AppError.badRequest("Email is already verified");
  }

  const verificationToken = generateToken();
  user.verificationToken = hashToken(verificationToken);
  user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: "Verify Your Email",
    html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email. Expires in 24 hours.</p>`,
  });

  sendResponse(res, 200, "Verification email sent successfully");
});

// ─── LOGIN ──────────────────────────────────────────────────
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw AppError.badRequest("Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw AppError.unauthorized("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw AppError.unauthorized("Invalid credentials");
  }

  if (!user.isVerified) {
    throw AppError.forbidden("Please verify your email before logging in");
  }

  const token = signToken({ id: user.id, role: user.role });
  const { password: _pw, ...userWithoutPassword } = user.toObject();

  sendResponse(res, 200, "Login successful", { token, user: userWithoutPassword });
});

// ─── FORGOT PASSWORD ────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw AppError.badRequest("Please provide your email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw AppError.notFound("User not found");
  }

  const resetToken = generateToken();
  user.resetPasswordToken = hashToken(resetToken);
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Expires in 1 hour.</p>`,
  });

  sendResponse(res, 200, "Password reset email sent successfully");
});

// ─── RESET PASSWORD ─────────────────────────────────────────
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;
  const { password } = req.body;

  if (!token || typeof token !== "string") {
    throw AppError.badRequest("Invalid reset token");
  }

  if (!password || password.length < 6) {
    throw AppError.badRequest("Password must be at least 6 characters");
  }

  const user = await User.findOne({
    resetPasswordToken: hashToken(token),
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw AppError.badRequest("Invalid or expired reset token");
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendResponse(res, 200, "Password reset successfully");
});

// ─── CHANGE PASSWORD ────────────────────────────────────────
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw AppError.badRequest("Please provide current and new password");
  }

  if (newPassword.length < 6) {
    throw AppError.badRequest("New password must be at least 6 characters");
  }

  const user = await User.findById(req.user!.id).select("+password");
  if (!user) {
    throw AppError.notFound("User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw AppError.unauthorized("Current password is incorrect");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  sendResponse(res, 200, "Password changed successfully");
});

// ─── LOGOUT ─────────────────────────────────────────────────
export const logoutUser = asyncHandler(async (_req: AuthRequest, res: Response) => {
  sendResponse(res, 200, "Logged out successfully");
});

// ─── GOOGLE AUTH CALLBACK ───────────────────────────────────
export const googleAuthCallback = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as any;

  if (!user) {
    throw AppError.unauthorized("Google authentication failed");
  }

  const token = signToken({ id: user.id, role: user.role });
  const { password, verificationToken, verificationTokenExpires, resetPasswordToken, resetPasswordExpires, ...userWithoutPassword } = user.toObject();

  // Redirect to frontend with token
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
});