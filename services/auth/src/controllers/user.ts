import { Response } from "express";
import User from "../model/User";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { AuthRequest } from "../middleware/auth";

// ─── GET ALL USERS (Admin only) ──────────────────────────────
export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = await User.find().select("-password");

  sendResponse(res, 200, "Users retrieved successfully", {
    count: users.length,
    users,
  });
});

// ─── GET SINGLE USER ───────────────────────────────────────
export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password");
  if (!user) {
    throw AppError.notFound("User not found");
  }

  sendResponse(res, 200, "User retrieved successfully", { user });
});

// ─── GET CURRENT LOGGED-IN USER ─────────────────────────────
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id).select("-password");
  if (!user) {
    throw AppError.notFound("User not found");
  }

  sendResponse(res, 200, "Profile retrieved successfully", { user });
});

// ─── UPDATE USER ROLE (Admin only) ──────────────────────────
export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    throw AppError.badRequest("Please provide a role");
  }

  const validRoles = ["user", "admin", "moderator"];
  if (!validRoles.includes(role)) {
    throw AppError.badRequest(`Role must be one of: ${validRoles.join(", ")}`);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw AppError.notFound("User not found");
  }

  sendResponse(res, 200, "User role updated successfully", { user });
});

// ─── DELETE USER (Admin only) ───────────────────────────────
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (id === req.user!.id) {
    throw AppError.badRequest("You cannot delete your own account");
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw AppError.notFound("User not found");
  }

  sendResponse(res, 200, "User deleted successfully", { userId: id });
});