import express from "express";
import { protect, requireInfluencer, requireBrand } from "../middlewares/authMiddleware.js";
import {
  createApplication,
  getMyApplications,
  getCampaignApplications,
  reviewApplication,
} from "../controllers/applicationController.js";

const router = express.Router();

router.post("/", protect, requireInfluencer, createApplication);
router.get("/my", protect, requireInfluencer, getMyApplications);
router.get("/campaign/:campaignId", protect, requireBrand, getCampaignApplications);
router.put("/:applicationId/review", protect, requireBrand, reviewApplication);

export default router;
