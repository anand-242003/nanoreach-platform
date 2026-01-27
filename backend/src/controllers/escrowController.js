import prisma from "../config/db.js";

const SECURITY_DEPOSIT_PERCENTAGE = 0.25;

const PLATFORM_BANK_DETAILS = {
  bankName: "HDFC Bank",
  accountNumber: "50100259376412",
  ifsc: "HDFC0001234",
  accountName: "DRK MTTR Private Limited",
  branch: "Mumbai Main Branch",
};

// Create escrow for a campaign
export const createEscrow = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const brandId = req.user.id;

    console.log('Creating escrow for campaign:', campaignId);

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { escrow: true },
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.brandId !== brandId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (campaign.escrow) {
      return res.status(400).json({ message: "Escrow already exists for this campaign" });
    }

    const securityDeposit = Math.round(campaign.budget * SECURITY_DEPOSIT_PERCENTAGE);

    const escrow = await prisma.escrow.create({
      data: {
        campaignId,
        amount: securityDeposit,
        totalPrizePool: campaign.budget,
        status: 'PENDING',
      },
    });

    console.log('Escrow created:', escrow.id);

    res.status(201).json({
      message: "Escrow created. Please pay the security deposit to activate your campaign.",
      escrow,
      paymentInstructions: {
        securityDeposit,
        totalPrizePool: campaign.budget,
        depositPercentage: '25%',
        ...PLATFORM_BANK_DETAILS,
        reference: `ESC-${escrow.id.slice(-8).toUpperCase()}`,
      },
    });
  } catch (error) {
    console.error("Create Escrow Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get escrow status for a campaign
export const getEscrowStatus = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const escrow = await prisma.escrow.findUnique({
      where: { campaignId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            budget: true,
            status: true,
          },
        },
      },
    });

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    res.json({ escrow });
  } catch (error) {
    console.error("Get Escrow Status Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark escrow as payment pending (brand confirms payment)
export const confirmPayment = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { paymentReference } = req.body;
    const brandId = req.user.id;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { escrow: true },
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.brandId !== brandId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!campaign.escrow) {
      return res.status(400).json({ message: "Create escrow first" });
    }

    if (campaign.escrow.status !== 'PENDING') {
      return res.status(400).json({ 
        message: `Escrow is in ${campaign.escrow.status} state` 
      });
    }

    const escrow = await prisma.escrow.update({
      where: { campaignId },
      data: {
        status: 'PAYMENT_PENDING',
        paymentReference,
        paymentMethod: 'BANK_TRANSFER',
      },
    });

    res.json({
      message: "Payment confirmation submitted. Awaiting admin verification.",
      escrow,
    });
  } catch (error) {
    console.error("Confirm Payment Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: Get all pending escrows
export const getPendingEscrows = async (req, res) => {
  try {
    const escrows = await prisma.escrow.findMany({
      where: {
        OR: [
          { status: 'PAYMENT_PENDING' },
          { status: 'FUNDED' },
        ],
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            budget: true,
            status: true,
            brand: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ escrows });
  } catch (error) {
    console.error("Get Pending Escrows Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: Verify payment and fund escrow
export const verifyAndFundEscrow = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
      include: { campaign: true },
    });

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    if (escrow.status !== 'PAYMENT_PENDING') {
      return res.status(400).json({ 
        message: `Escrow is in ${escrow.status} state, expected PAYMENT_PENDING` 
      });
    }

    const updated = await prisma.escrow.update({
      where: { id: escrowId },
      data: {
        status: 'FUNDED',
        fundedAt: new Date(),
        verifiedBy: adminId,
        notes: notes || 'Verified',
      },
    });

    await prisma.campaign.update({
      where: { id: escrow.campaignId },
      data: { status: 'ACTIVE' },
    });

    await prisma.adminAction.create({
      data: {
        performedBy: adminId,
        actionType: 'VERIFY_ESCROW',
        targetType: 'Escrow',
        targetId: escrowId,
        notes,
      },
    });

    res.json({
      message: "Escrow funded and campaign activated",
      escrow: updated,
    });
  } catch (error) {
    console.error("Verify Escrow Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: Reject payment
export const rejectPayment = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const updated = await prisma.escrow.update({
      where: { id: escrowId },
      data: {
        status: 'PENDING',
        notes: `Rejected: ${reason}`,
      },
    });

    await prisma.adminAction.create({
      data: {
        performedBy: adminId,
        actionType: 'REJECT_ESCROW',
        targetType: 'Escrow',
        targetId: escrowId,
        notes: reason,
      },
    });

    res.json({
      message: "Payment rejected",
      escrow: updated,
    });
  } catch (error) {
    console.error("Reject Payment Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: Release escrow to winners
export const releaseEscrow = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { distributions } = req.body;
    const adminId = req.user.id;

    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
      include: { campaign: true },
    });

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    if (escrow.status !== 'FUNDED') {
      return res.status(400).json({ message: "Escrow is not funded" });
    }

    const updated = await prisma.escrow.update({
      where: { id: escrowId },
      data: {
        status: 'RELEASED',
        releasedAt: new Date(),
        releaseDetails: distributions || [],
      },
    });

    await prisma.campaign.update({
      where: { id: escrow.campaignId },
      data: { status: 'COMPLETED' },
    });

    await prisma.adminAction.create({
      data: {
        performedBy: adminId,
        actionType: 'RELEASE_ESCROW',
        targetType: 'Escrow',
        targetId: escrowId,
      },
    });

    res.json({
      message: "Escrow released to winners",
      escrow: updated,
    });
  } catch (error) {
    console.error("Release Escrow Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: Refund escrow to brand
export const refundEscrow = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
    });

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    const updated = await prisma.escrow.update({
      where: { id: escrowId },
      data: {
        status: 'REFUNDED',
        notes: `Refunded: ${reason || 'N/A'}`,
      },
    });

    await prisma.adminAction.create({
      data: {
        performedBy: adminId,
        actionType: 'REFUND_ESCROW',
        targetType: 'Escrow',
        targetId: escrowId,
        notes: reason,
      },
    });

    res.json({
      message: "Escrow refunded",
      escrow: updated,
    });
  } catch (error) {
    console.error("Refund Escrow Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get platform bank details (for campaigns without escrow or for "pay later")
export const getPlatformBankDetails = async (req, res) => {
  res.json({ bankDetails: PLATFORM_BANK_DETAILS });
};

// Get my pending escrows (brand can see their own pending payments)
export const getMyPendingEscrows = async (req, res) => {
  try {
    const escrows = await prisma.escrow.findMany({
      where: { campaign: { brandId: req.user.id }, status: { in: ['PENDING', 'PAYMENT_PENDING'] } },
      include: { campaign: { select: { id: true, title: true, budget: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ escrows });
  } catch (error) {
    console.error("Get My Pending Escrows Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
