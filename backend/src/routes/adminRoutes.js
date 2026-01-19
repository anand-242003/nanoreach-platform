import express from "express";
import { protect, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  getPendingInfluencers,
  getPendingBrands,
  getInfluencerDetails,
  getBrandDetails,
  approveInfluencer,
  rejectInfluencer,
  approveBrand,
  rejectBrand,
} from "../controllers/adminVerificationController.js";

const router = express.Router();

router.get("/verifications/influencers", protect, requireAdmin, getPendingInfluencers);
router.get("/verifications/brands", protect, requireAdmin, getPendingBrands);
router.get("/verifications/influencers/:id", protect, requireAdmin, getInfluencerDetails);
router.get("/verifications/brands/:id", protect, requireAdmin, getBrandDetails);
router.post("/verifications/influencers/:id/approve", protect, requireAdmin, approveInfluencer);
router.post("/verifications/influencers/:id/reject", protect, requireAdmin, rejectInfluencer);
router.post("/verifications/brands/:id/approve", protect, requireAdmin, approveBrand);
router.post("/verifications/brands/:id/reject", protect, requireAdmin, rejectBrand);

export default router;
