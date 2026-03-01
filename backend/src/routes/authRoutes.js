import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { 
  signup, 
  login, 
  logout, 
  getMe, 
  getVerificationStatus,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  updateUserProfile,
  changePassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", protect, getMe);
router.get("/verification-status", protect, getVerificationStatus);
router.put("/update-profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);

export default router;