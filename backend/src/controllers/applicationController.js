import prisma from "../config/db.js";
import crypto from "crypto";
import { sanitizeString, sanitizeHtml, isValidObjectId } from "../utils/validators.js";
import { logAuditEvent, AuditEventType, extractRequestContext } from "../utils/auditLogger.js";

export const createApplication = async (req, res) => {
  const context = extractRequestContext(req);
  
  try {
    const { campaignId, pitch, proposedContent } = req.body;
    const influencerId = req.user.id;

    if (!campaignId || !isValidObjectId(campaignId)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const sanitizedPitch = sanitizeHtml(pitch, 2000);
    if (!sanitizedPitch || sanitizedPitch.length < 50) {
      return res.status(400).json({ 
        message: "Pitch must be at least 50 characters explaining why you're a good fit" 
      });
    }
    
    const sanitizedContent = sanitizeHtml(proposedContent, 2000);

    const user = await prisma.user.findUnique({
      where: { id: influencerId },
      include: { influencerProfile: true },
    });

    if (!user.influencerProfile) {
      return res.status(400).json({ 
        message: "Complete your influencer profile before applying to campaigns",
        redirectTo: "/onboarding"
      });
    }

    if (user.verificationStatus !== 'VERIFIED') {
      return res.status(403).json({ 
        message: "Complete profile verification to participate in campaigns",
        verificationStatus: user.verificationStatus,
        action: user.verificationStatus === 'PENDING' ? 'Submit profile for verification' : 
                user.verificationStatus === 'REJECTED' ? 'Contact support to resolve verification issues' :
                'Wait for verification approval'
      });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { 
        id: true, 
        status: true, 
        title: true,
        endDate: true,
        brandId: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.status !== 'ACTIVE') {
      return res.status(400).json({ 
        message: "Campaign is not accepting applications",
        campaignStatus: campaign.status
      });
    }

    if (new Date() > new Date(campaign.endDate)) {
      return res.status(400).json({ message: "Campaign has ended" });
    }

    const application = await prisma.$transaction(async (tx) => {
      const existingApplication = await tx.application.findUnique({
        where: {
          campaignId_influencerId: {
            campaignId,
            influencerId,
          },
        },
      });

      if (existingApplication) {
        throw new Error('ALREADY_APPLIED');
      }

      return tx.application.create({
        data: {
          campaignId,
          influencerId,
          pitch: sanitizedPitch,
          proposedContent: sanitizedContent,
          status: 'PENDING',
        },
      });
    });

    await logAuditEvent({
      eventType: AuditEventType.APPLICATION_SUBMITTED,
      userId: influencerId,
      targetType: 'APPLICATION',
      targetId: application.id,
      metadata: { campaignId, campaignTitle: campaign.title },
      ...context,
    });

    res.status(201).json({
      message: "Application submitted successfully. Awaiting brand approval.",
      application,
    });
  } catch (error) {
    if (error.message === 'ALREADY_APPLIED') {
      return res.status(400).json({ message: "You have already applied to this campaign" });
    }
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

    if (status === 'APPROVED') {
      const uniqueCode = `${application.campaignId.slice(-6)}-${crypto.randomBytes(4).toString('hex')}`.toUpperCase();
      
      await prisma.referralLink.create({
        data: {
          uniqueCode,
          url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/r/${uniqueCode}`,
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

export const getPendingApplications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: { status: 'PENDING' },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              budget: true,
              brandId: true,
            },
          },
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
        orderBy: { createdAt: 'asc' }, 
        skip,
        take: parseInt(limit),
      }),
      prisma.application.count({ where: { status: 'PENDING' } }),
    ]);

    res.json({
      applications,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        perPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get Pending Applications Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const adminApproveApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const adminId = req.user.id;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { campaign: true },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== 'PENDING') {
      return res.status(400).json({ message: "Application already reviewed" });
    }

    const uniqueCode = `${application.campaignId.slice(-6)}-${crypto.randomBytes(4).toString('hex')}`.toUpperCase();

    const referralLink = await prisma.referralLink.create({
      data: {
        uniqueCode,
        url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/r/${uniqueCode}`,
        campaignId: application.campaignId,
        applicationId: application.id,
      },
    });

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'APPROVED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      include: {
        referralLink: true,
        campaign: {
          select: { title: true },
        },
        influencer: {
          select: { name: true, email: true },
        },
      },
    });

    await prisma.adminAction.create({
      data: {
        adminId,
        targetType: 'APPLICATION',
        targetId: applicationId,
        action: 'APPROVE',
        reason: 'Admin approved application',
        metadata: {
          campaignId: application.campaignId,
          influencerId: application.influencerId,
          referralCode: uniqueCode,
        },
      },
    });

    res.json({
      message: "Application approved successfully",
      application: updatedApplication,
      referralLink,
    });
  } catch (error) {
    console.error("Admin Approve Application Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const adminRejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== 'PENDING') {
      return res.status(400).json({ message: "Application already reviewed" });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      include: {
        campaign: {
          select: { title: true },
        },
        influencer: {
          select: { name: true, email: true },
        },
      },
    });

    await prisma.adminAction.create({
      data: {
        adminId,
        targetType: 'APPLICATION',
        targetId: applicationId,
        action: 'REJECT',
        reason,
        metadata: {
          campaignId: application.campaignId,
          influencerId: application.influencerId,
        },
      },
    });

    res.json({
      message: "Application rejected",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Admin Reject Application Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            description: true,
            budget: true,
            status: true,
            brandId: true,
            endDate: true,
          },
        },
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
            score: true,
          },
        },
        referralLink: true,
      },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const isOwner = application.influencerId === userId;
    const isCampaignOwner = application.campaign.brandId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isCampaignOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this application" });
    }

    res.json({ application });
  } catch (error) {
    console.error("Get Application By ID Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
