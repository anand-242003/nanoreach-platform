import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { signup, login, logout, getMe, getVerificationStatus } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.get("/verification-status", protect, getVerificationStatus);

export default router;