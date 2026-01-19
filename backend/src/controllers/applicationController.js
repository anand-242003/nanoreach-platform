import prisma from "../config/db.js";
import crypto from "crypto";

export const createApplication = async (req, res) => {
  try {
    const { campaignId, pitch, proposedContent } = req.body;
    const influencerId = req.user.id;

    if (!campaignId || !pitch) {
      return res.status(400).json({ message: "Campaign ID and pitch are required" });
    }

    // Check if campaign exists and is active
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.status !== 'ACTIVE') {
      return res.status(400).json({ message: "Campaign is not accepting applications" });
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        campaignId_influencerId: {
          campaignId,
          influencerId,
        },
      },
    });

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied to this campaign" });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        campaignId,
        influencerId,
        pitch,
        proposedContent,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Create Application Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const { campaignId } = req.query;
    const influencerId = req.user.id;

    if (campaignId) {
      const application = await prisma.application.findUnique({
        where: {
          campaignId_influencerId: {
            campaignId,
            influencerId,
          },
        },
        include: {
          referralLink: true,
          campaign: {
            select: {
              title: true,
              status: true,
              endDate: true,
              resultsDate: true,
            },
          },
        },
      });

      return res.json({ application });
    }

    const applications = await prisma.application.findMany({
      where: { influencerId },
      include: {
        referralLink: true,
        campaign: {
          select: {
            id: true,
            title: true,
            status: true,
            budget: true,
            endDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ applications });
  } catch (error) {
    console.error("Get My Applications Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCampaignApplications = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const brandId = req.user.id;

    // Verify campaign belongs to brand
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.brandId !== brandId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const applications = await prisma.application.findMany({
      where: { campaignId },
      include: {
        influencer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        influencerProfile: {
          select: {
            displayName: true,
            profileImage: true,
            youtubeChannelUrl: true,
            subscriberCount: true,
            categoryTags: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ applications });
  } catch (error) {
    console.error("Get Campaign Applications Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const reviewApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, rejectionReason } = req.body;
    const brandId = req.user.id;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { campaign: true },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.campaign.brandId !== brandId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updateData = {
      status,
      reviewedBy: brandId,
      reviewedAt: new Date(),
    };

    if (status === 'REJECTED' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    // If approved, create referral link
    if (status === 'APPROVED') {
      const uniqueCode = `${application.campaignId.slice(-6)}-${crypto.randomBytes(4).toString('hex')}`.toUpperCase();
      
      await prisma.referralLink.create({
        data: {
          uniqueCode,
          url: `https://drkmttr.com/ref/${uniqueCode}`,
          campaignId: application.campaignId,
          applicationId: application.id,
        },
      });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: updateData,
      include: {
        referralLink: true,
      },
    });

    res.json({
      message: `Application ${status.toLowerCase()}`,
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Review Application Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
