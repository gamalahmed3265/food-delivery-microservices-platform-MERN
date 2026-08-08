import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  getMe,
  updateUserRole,
  deleteUser,
} from "../controllers/user";
import { protect, authorize } from "../middleware/auth";

const router = Router();

router.get("/me", protect, getMe);
router.get("/", protect, authorize("admin"), getAllUsers);
router.get("/:id", protect, authorize("admin"), getUserById);
router.patch("/:id/role", protect, authorize("admin"), updateUserRole);
router.delete("/:id", protect, authorize("admin"), deleteUser);

export default router;