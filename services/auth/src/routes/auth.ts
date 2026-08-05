import express from "express";
import { loginUser, registerUser } from "../controllers/auth";

const router = express.Router();

// @route   Post /api/auth/login
// @desc    Login user and return JWT token
// @access  Public
router.post("/login", loginUser);

// @route   Post /api/auth/register
// @desc    Register user and return JWT token
// @access  Public
router.post("/register", registerUser);

export default router;
