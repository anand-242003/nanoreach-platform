import prisma from "../config/db.js";
import { isValidObjectId, isPositiveNumber } from "../utils/validators.js";
import { logAuditEvent, AuditEventType, extractRequestContext } from "../utils/auditLogger.js";

const SECURITY_DEPOSIT_PERCENTAGE = 0.25;
const MIN_SECURITY_DEPOSIT = 250; 

const PLATFORM_BANK_DETAILS = {
  bankName: "HDFC Bank",
  accountNumber: "50100259376412",
  ifsc: "HDFC0001234",
  accountName: "DRK MTTR Private Limited",
  branch: "Mumbai Main Branch",
};

export const createEscrow = async (req, res) => {
  const context = extractRequestContext(req);
  
  try {
    const { campaignId } = req.params;
    const brandId = req.user.id;

    if (!isValidObjectId(campaignId)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const campaign = await tx.campaign.findUnique({
        where: { id: campaignId },
        include: { escrow: true },
      });

      if (!campaign) {
        throw { status: 404, message: "Campaign not found" };
      }

      if (campaign.brandId !== brandId) {
        throw { status: 403, message: "Not authorized" };
      }

      if (campaign.escrow) {
        throw { status: 400, message: "Escrow already exists for this campaign" };
      }

      if (campaign.status !== 'DRAFT') {
        throw { status: 400, message: "Escrow can only be created for draft campaigns" };
      }

      const securityDeposit = Math.max(
        Math.round(campaign.budget * SECURITY_DEPOSIT_PERCENTAGE),
        MIN_SECURITY_DEPOSIT
      );

      const escrow = await tx.escrow.create({
        data: {
          campaignId,
          amount: securityDeposit,
          totalPrizePool: campaign.budget,
          status: 'PENDING',
        },
      });
      
      return { escrow, campaign };
    });

    await logAuditEvent({
      eventType: AuditEventType.ESCROW_CREATED,
      userId: brandId,
      targetType: 'ESCROW',
      targetId: result.escrow.id,
      metadata: { 
        campaignId, 
        amount: result.escrow.amount,
        totalPrizePool: result.escrow.totalPrizePool 
      },
      ...context,
      severity: 'INFO',
    });

    res.status(201).json({
      message: "Escrow created. Please pay the security deposit to activate your campaign.",
      escrow: result.escrow,
      paymentInstructions: {
        securityDeposit: result.escrow.amount,
        totalPrizePool: result.campaign.budget,
        depositPercentage: '25%',
        ...PLATFORM_BANK_DETAILS,
        reference: `ESC-${result.escrow.id.slice(-8).toUpperCase()}`,
        note: "Include reference number in payment remarks for faster verification",
      },
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }res.status(500).json({ message: "Server error", error: error.message });
  }
};

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
  } catch (error) {res.status(500).json({ message: "Server error", error: error.message });
  }
};

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
  } catch (error) {res.status(500).json({ message: "Server error", error: error.message });
  }
};

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
  } catch (error) {res.status(500).json({ message: "Server error", error: error.message });
  }
};

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
  } catch (error) {res.status(500).json({ message: "Server error", error: error.message });
  }
};

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
  } catch (error) {res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const releaseEscrow = async (req, res) => {
  const context = extractRequestContext(req);
  
  try {
    const { escrowId } = req.params;
    const { distributions } = req.body;
    const adminId = req.user.id;

    if (!isValidObjectId(escrowId)) {
      return res.status(400).json({ message: "Invalid escrow ID" });
    }

    if (!distributions || !Array.isArray(distributions) || distributions.length === 0) {
      return res.status(400).json({ message: "Prize distributions are required" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const escrow = await tx.escrow.findUnique({
        where: { id: escrowId },
        include: { 
          campaign: {
            include: {
              submissions: {
                where: { validationStatus: 'APPROVED' },
                select: { influencerId: true },
              },
            },
          },
        },
      });

      if (!escrow) {
        throw { status: 404, message: "Escrow not found" };
      }

      if (escrow.status !== 'FUNDED') {
        throw { status: 400, message: `Cannot release escrow in ${escrow.status} status` };
      }

      if (escrow.campaign.status !== 'COMPLETED' && escrow.campaign.status !== 'ACTIVE') {
        throw { status: 400, message: "Campaign must be active or completed to release funds" };
      }

      let totalDistribution = 0;
      const validDistributions = [];
      const validInfluencerIds = new Set(escrow.campaign.submissions.map(s => s.influencerId));
      
      for (const dist of distributions) {
        if (!dist.influencerId || !isPositiveNumber(dist.amount)) {
          continue;
        }

        if (!validInfluencerIds.has(dist.influencerId)) {
          throw { 
            status: 400, 
            message: `Influencer ${dist.influencerId} does not have an approved submission` 
          };
        }
        
        const amount = parseFloat(dist.amount);
        totalDistribution += amount;
        validDistributions.push({
          influencerId: dist.influencerId,
          amount,
          rank: dist.rank || null,
        });
      }
      
      if (totalDistribution > escrow.totalPrizePool) {
        throw { 
          status: 400, 
          message: `Total distribution (₹${totalDistribution}) exceeds prize pool (₹${escrow.totalPrizePool})` 
        };
      }

      const updated = await tx.escrow.update({
        where: { id: escrowId },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
          releaseDetails: validDistributions,
          notes: `Released ₹${totalDistribution} to ${validDistributions.length} winners`,
        },
      });

      await tx.campaign.update({
        where: { id: escrow.campaignId },
        data: { status: 'COMPLETED' },
      });

      await tx.adminAction.create({
        data: {
          performedBy: adminId,
          actionType: 'RELEASE_ESCROW',
          targetType: 'Escrow',
          targetId: escrowId,
          previousState: { status: 'FUNDED' },
          newState: { 
            status: 'RELEASED', 
            totalDistributed: totalDistribution,
            winners: validDistributions.length 
          },
        },
      });
      
      return { escrow: updated, totalDistribution, winners: validDistributions.length };
    });

    await logAuditEvent({
      eventType: AuditEventType.ESCROW_RELEASED,
      userId: adminId,
      targetType: 'ESCROW',
      targetId: escrowId,
      metadata: { 
        totalDistribution: result.totalDistribution, 
        winners: result.winners 
      },
      ...context,
      severity: 'CRITICAL',
    });

    res.json({
      message: `Escrow released to ${result.winners} winners`,
      escrow: result.escrow,
      totalDistributed: result.totalDistribution,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }res.status(500).json({ message: "Server error", error: error.message });
  }
};

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
  } catch (error) {res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPlatformBankDetails = async (req, res) => {
  res.json({ bankDetails: PLATFORM_BANK_DETAILS });
};

export const getMyPendingEscrows = async (req, res) => {
  try {
    const escrows = await prisma.escrow.findMany({
      where: { campaign: { brandId: req.user.id }, status: { in: ['PENDING', 'PAYMENT_PENDING'] } },
      include: { campaign: { select: { id: true, title: true, budget: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ escrows });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};
