import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";
import { 
  createInfluencerProfile,
  createBrandProfile,
  getMyProfile,
  updateInfluencerProfile,
  updateBrandProfile
} from "../controllers/profileController.js";

const router = express.Router();

router.post("/influencer", protect, upload.single('document'), createInfluencerProfile);
router.post("/brand", protect, upload.single('document'), createBrandProfile);
router.get("/me", protect, getMyProfile);
router.put("/influencer", protect, upload.single('document'), updateInfluencerProfile);
router.put("/brand", protect, upload.single('document'), updateBrandProfile);

export default router;
