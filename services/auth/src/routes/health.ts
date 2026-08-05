import express from "express";

const router = express.Router();

// @route   GET /api/health
// @desc    Health check endpoint
// @access  Public
router.get("/", (req, res) => {
  return res.status(200).json({ message: "Health service is healthy" });
});

export default router;