import express from "express";
import { loginUser, registerUser ,googleAuthCallback} from "../controllers/auth";
import passport from "passport";
import "../services/googleAuthService"; // Initialize strategy
const router = express.Router();

// @route   Post /api/auth/login
// @desc    Login user and return JWT token
// @access  Public
router.post("/login", loginUser);

// @route   Post /api/auth/register
// @desc    Register user and return JWT token
// @access  Public
router.post("/register", registerUser);



// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
  }),
  googleAuthCallback
);

export default router;
