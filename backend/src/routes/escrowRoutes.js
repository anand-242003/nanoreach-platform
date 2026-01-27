import express from "express";
import { protect, requireBrand, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  createEscrow,
  getEscrowStatus,
  confirmPayment,
  verifyAndFundEscrow,
  rejectPayment,
  releaseEscrow,
  refundEscrow,
  getPendingEscrows,
  getPlatformBankDetails,
  getMyPendingEscrows,
} from "../controllers/escrowController.js";

const router = express.Router();

router.get("/bank-details", protect, getPlatformBankDetails);
router.get("/my-pending", protect, requireBrand, getMyPendingEscrows);
router.post("/campaigns/:campaignId/create", protect, requireBrand, createEscrow);
router.get("/campaigns/:campaignId/status", protect, getEscrowStatus);
router.post("/campaigns/:campaignId/confirm-payment", protect, requireBrand, confirmPayment);

router.get("/pending", protect, requireAdmin, getPendingEscrows);
router.post("/:escrowId/verify", protect, requireAdmin, verifyAndFundEscrow);
router.post("/:escrowId/reject", protect, requireAdmin, rejectPayment);
router.post("/:escrowId/release", protect, requireAdmin, releaseEscrow);
router.post("/:escrowId/refund", protect, requireAdmin, refundEscrow);

export default router;
