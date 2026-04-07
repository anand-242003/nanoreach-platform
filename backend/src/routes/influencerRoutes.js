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

const handleSingleDocumentUpload = (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (!err) {
      return next();
    }

    const isClientError = err?.name === 'MulterError' || err?.message?.includes('Invalid file type');
    return res.status(isClientError ? 400 : 500).json({
      message: err.message || 'File upload failed',
    });
  });
};

router.post("/profile", protect, createOrUpdateProfile);
router.post("/profile/social", protect, addSocialLinks);
router.post("/profile/documents", protect, handleSingleDocumentUpload, uploadDocuments);
router.post("/profile/work", protect, addPastWork);
router.post("/submit-verification", protect, submitForVerification);
router.get("/profile", protect, getMyProfile);

export default router;
