import express from "express";
import { protect, requireBrand, requireInfluencer, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  getAllCampaigns,
  getMyCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  publishCampaign,
  getMatchingCampaigns,
  updateCampaignStatus,
  getROIEstimate,
  getCampaignLeaderboard,
} from "../controllers/campaignController.js";

const router = express.Router();

router.get("/matching", protect, requireInfluencer, getMatchingCampaigns);

router.get("/", protect, getAllCampaigns);
router.get("/my", protect, requireBrand, getMyCampaigns);
router.get("/:id", protect, getCampaignById);
router.get("/:id/leaderboard", protect, getCampaignLeaderboard);
router.post("/", protect, requireBrand, createCampaign);
router.put("/:id", protect, requireBrand, updateCampaign);
router.put("/:id/publish", protect, requireBrand, publishCampaign);
router.delete("/:id", protect, requireBrand, deleteCampaign);

router.put("/:id/status", protect, updateCampaignStatus);

router.get("/:id/roi-estimate", protect, getROIEstimate);

export default router;