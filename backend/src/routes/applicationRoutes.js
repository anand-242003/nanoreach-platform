import express from "express";
import { protect, requireInfluencer, requireBrand, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  createApplication,
  getMyApplications,
  getCampaignApplications,
  reviewApplication,
  getPendingApplications,
  adminApproveApplication,
  adminRejectApplication,
  getApplicationById,
} from "../controllers/applicationController.js";

const router = express.Router();

router.post("/", protect, requireInfluencer, createApplication);
router.get("/my", protect, requireInfluencer, getMyApplications);

router.get("/campaign/:campaignId", protect, requireBrand, getCampaignApplications);
router.put("/:applicationId/review", protect, requireBrand, reviewApplication);

router.get("/pending", protect, requireAdmin, getPendingApplications);
router.put("/:applicationId/approve", protect, requireAdmin, adminApproveApplication);
router.put("/:applicationId/reject", protect, requireAdmin, adminRejectApplication);

router.get("/:applicationId", protect, getApplicationById);

export default router;
