import { Response } from "express";
import { Document } from "mongoose";
import bcrypt from "bcryptjs";
import User, { IUser } from "../model/User";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { AuthRequest } from "../middleware/auth";
import { signToken } from "../services/jwtService";

// ─── REGISTER ───────────────────────────────────────────────
export const registerUser = asyncHandler(async (req: AuthRequest, res: Response) => {
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
  const user = await User.create({ name, email, password: hashedPassword, image });

  const token = signToken({ id: user.id, role: user.role });
  const { password: _pw, ...userWithoutPassword } = user.toObject();

  sendResponse(res, 201, "Registration successful", { token, user: userWithoutPassword });
});

// ─── LOGIN ──────────────────────────────────────────────────
export const loginUser = asyncHandler(async (req: AuthRequest, res: Response) => {
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

  const token = signToken({ id: user.id, role: user.role });
  const { password: _pw, ...userWithoutPassword } = user.toObject();

  sendResponse(res, 200, "Login successful", { token, user: userWithoutPassword });
});

// ─── GOOGLE AUTH CALLBACK ───────────────────────────────────
export const googleAuthCallback = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Passport attaches the full Mongoose document here, not just {id, role}
  const user = req.user as unknown as (IUser & Document) | undefined;

  if (!user) {
    throw AppError.unauthorized("Google authentication failed");
  }

  const token = signToken({ id: user.id, role: user.role });
  const { password: _pw, ...userWithoutPassword } = user.toObject();

  // Option A: Redirect to frontend (web apps)
  // res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);

  // Option B: Return JSON (mobile/SPA)
  sendResponse(res, 200, "Google login successful", {
    token,
    user: userWithoutPassword,
  });
});