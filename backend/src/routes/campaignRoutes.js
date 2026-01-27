import express from "express";
import { protect, requireBrand } from "../middlewares/authMiddleware.js";
import {
  getAllCampaigns,
  getMyCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../controllers/campaignController.js";

const router = express.Router();

router.get("/", protect, getAllCampaigns);
router.get("/my", protect, requireBrand, getMyCampaigns);
router.get("/:id", protect, getCampaignById);
router.post("/", protect, requireBrand, createCampaign);
router.put("/:id", protect, requireBrand, updateCampaign);
router.delete("/:id", protect, requireBrand, deleteCampaign);

export default router;