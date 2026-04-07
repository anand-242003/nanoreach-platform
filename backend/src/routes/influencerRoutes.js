import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";
import {
  createOrUpdateProfile,
  addSocialLinks,
  uploadDocuments,
  addPastWork,
  submitForVerification,
  getMyProfile,
} from "../controllers/influencerProfileController.js";

const router = express.Router();

router.post("/profile", protect, createOrUpdateProfile);
router.post("/profile/social", protect, addSocialLinks);
router.post("/profile/documents", protect, upload.single('document'), uploadDocuments);
router.post("/profile/work", protect, addPastWork);
router.post("/submit-verification", protect, submitForVerification);
router.get("/profile", protect, getMyProfile);

export default router;
