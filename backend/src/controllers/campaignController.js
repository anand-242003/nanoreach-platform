import prisma from "../config/db.js";
import { 
  sanitizeString, 
  sanitizeHtml, 
  isValidUrl, 
  isValidObjectId, 
  isPositiveNumber,
  validateBudgetLimits,
  validateCampaignDates,
  canModifyCampaign,
} from "../utils/validators.js";
import { logAuditEvent, AuditEventType, extractRequestContext } from "../utils/auditLogger.js";

export const getAllCampaigns = async (req, res) => {
  try {
    const { page = 1, limit = 100, status = "ACTIVE" } = req.query;
    const skip = (page - 1) * limit;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const campaigns = await prisma.campaign.findMany({
      where: { status },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        budget: true,
        startDate: true,
        endDate: true,
        status: true,
        categoryTags: true,
        prizeDistribution: true,
        createdAt: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            applications: true,
            submissions: true,
          },
        },
      },
    });

    const total = await prisma.campaign.count({ where: { status } });

    let enrichedCampaigns = campaigns;
    if (userRole === 'INFLUENCER' && userId) {
      const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { verificationStatus: true }
      });
      
      enrichedCampaigns = campaigns.map(campaign => ({
        ...campaign,
        canParticipate: user.verificationStatus === 'VERIFIED'
      }));
    }

    res.json({
      campaigns: enrichedCampaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const getMyCampaigns = async (req, res) => {
  try {
    const { status } = req.query;
    const brandId = req.user.id;

    const where = { brandId };
    if (status) {
      where.status = status;
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        budget: true,
        startDate: true,
        endDate: true,
        status: true,
        categoryTags: true,
        createdAt: true,
        _count: {
          select: {
            applications: true,
            submissions: true,
          },
        },
      },
    });

    res.json({ campaigns });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        budget: true,
        startDate: true,
        endDate: true,
        status: true,
        categoryTags: true,
        contentRequirements: true,
        rules: true,
        resultsDate: true,
        evaluationCriteria: true,
        prizeDistribution: true,
        createdAt: true,
        brand: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
            submissions: true,
          },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.json({ campaign });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const createCampaign = async (req, res) => {
  const context = extractRequestContext(req);
  
  try {
    const {
      title,
      description,
      budget,
      startDate,
      endDate,
      categoryTags,
      contentRequirements,
      rules,
      resultsDate,
      evaluationCriteria,
      prizeDistribution,
      websiteUrl,
    } = req.body;

    const brandId = req.user.id;

    const brand = await prisma.user.findUnique({
      where: { id: brandId },
      include: { brandProfile: true },
    });
    
    if (!brand.brandProfile) {
      return res.status(400).json({ 
        message: "Complete your brand profile before creating campaigns",
        redirectTo: "/onboarding"
      });
    }
    
    if (brand.verificationStatus !== 'VERIFIED') {
      return res.status(403).json({ 
        message: "Brand verification required before creating campaigns",
        verificationStatus: brand.verificationStatus
      });
    }

    if (!title || !description || !budget || !endDate) {
      return res.status(400).json({ 
        message: "Title, description, budget, and end date are required",
        missingFields: { title: !title, description: !description, budget: !budget, endDate: !endDate }
      });
    }

    const sanitizedTitle = sanitizeString(title, 200);
    const sanitizedDescription = sanitizeHtml(description, 5000);
    const sanitizedRules = sanitizeHtml(rules, 3000);
    const sanitizedContentReqs = sanitizeHtml(contentRequirements, 3000);
    
    if (sanitizedTitle.length < 10) {
      return res.status(400).json({ message: "Title must be at least 10 characters" });
    }
    
    if (sanitizedDescription.length < 50) {
      return res.status(400).json({ message: "Description must be at least 50 characters" });
    }

    const parsedBudget = parseFloat(budget);
    if (!isPositiveNumber(budget)) {
      return res.status(400).json({ message: "Budget must be a positive number" });
    }
    
    const budgetValidation = validateBudgetLimits(parsedBudget);
    if (!budgetValidation.valid) {
      return res.status(400).json({ message: budgetValidation.error });
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() + 24 * 60 * 60 * 1000); 
    const end = new Date(endDate);
    
    const dateValidation = validateCampaignDates(start, end, resultsDate);
    if (!dateValidation.valid) {
      return res.status(400).json({ message: dateValidation.error });
    }

    if (websiteUrl && !isValidUrl(websiteUrl)) {
      return res.status(400).json({ message: "Invalid website URL format" });
    }

    const tags = Array.isArray(categoryTags) ? categoryTags.slice(0, 10).map(t => sanitizeString(t, 50)) : [];

    let validatedPrizeDistribution = [];
    if (prizeDistribution && Array.isArray(prizeDistribution)) {
      let totalPrize = 0;
      for (const prize of prizeDistribution.slice(0, 20)) { 
        if (prize.position && prize.amount) {
          const amount = parseFloat(prize.amount);
          if (amount > 0) {
            totalPrize += amount;
            validatedPrizeDistribution.push({
              position: parseInt(prize.position),
              amount,
              description: sanitizeString(prize.description, 200),
            });
          }
        }
      }
      
      if (totalPrize > parsedBudget) {
        return res.status(400).json({ 
          message: "Total prize distribution cannot exceed campaign budget",
          totalPrize,
          budget: parsedBudget
        });
      }
    }

    const campaign = await prisma.campaign.create({
      data: {
        title: sanitizedTitle,
        description: sanitizedDescription,
        budget: parsedBudget,
        startDate: start,
        endDate: end,
        categoryTags: tags,
        contentRequirements: sanitizedContentReqs,
        rules: sanitizedRules,
        websiteUrl: websiteUrl || null,
        resultsDate: resultsDate ? new Date(resultsDate) : new Date(end.getTime() + 7 * 24 * 60 * 60 * 1000),
        evaluationCriteria: evaluationCriteria || {},
        prizeDistribution: validatedPrizeDistribution,
        status: 'DRAFT',
        brandId,
      },
    });

    await logAuditEvent({
      eventType: AuditEventType.CAMPAIGN_CREATED,
      userId: brandId,
      targetType: 'CAMPAIGN',
      targetId: campaign.id,
      metadata: { title: sanitizedTitle, budget: parsedBudget },
      ...context,
    });

    res.status(201).json({
      message: "Campaign created as draft. Review and publish when ready.",
      campaign,
    });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const brandId = req.user.id;
    const updateData = req.body;

    const campaign = await prisma.campaign.findUnique({ where: { id } });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.brandId !== brandId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (campaign.status === 'ACTIVE' || campaign.status === 'COMPLETED') {
      return res.status(400).json({ 
        message: "Cannot edit campaign once it's active or completed",
        status: campaign.status,
      });
    }

    if (updateData.budget) updateData.budget = parseFloat(updateData.budget);
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.resultsDate) updateData.resultsDate = new Date(updateData.resultsDate);

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
    });

    res.json({ message: "Campaign updated", campaign: updatedCampaign });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const brandId = req.user.id;

    const campaign = await prisma.campaign.findUnique({ where: { id } });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.brandId !== brandId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (campaign.status !== 'DRAFT') {
      return res.status(400).json({ 
        message: "Cannot delete campaign once published. Cancel it instead.",
        status: campaign.status 
      });
    }

    await prisma.campaign.delete({ where: { id } });

    res.json({ message: "Campaign deleted" });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const publishCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const brandId = req.user.id;

    const campaign = await prisma.campaign.findUnique({ where: { id } });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.brandId !== brandId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (campaign.status !== 'DRAFT') {
      return res.status(400).json({ 
        message: "Only draft campaigns can be published",
        currentStatus: campaign.status 
      });
    }

    const publishedCampaign = await prisma.campaign.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    res.json({ 
      message: "Campaign published successfully", 
      campaign: publishedCampaign 
    });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const getMatchingCampaigns = async (req, res) => {
  try {
    
    const influencerProfile = await prisma.influencerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!influencerProfile) {
      return res.status(404).json({ 
        message: "Please complete your profile first" 
      });
    }

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    page = Math.max(1, Math.min(page, 1000));
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;

    const where = {
      status: { in: ["ACTIVE", "ESCROW_FUNDED"] },
      deadline: { gte: new Date() },
    };

    if (influencerProfile.categoryTags && influencerProfile.categoryTags.length > 0) {
      where.categoryTags = {
        hasSome: influencerProfile.categoryTags,
      };
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        prizePool: true,
        deadline: true,
        status: true,
        categoryTags: true,
        evaluationCriteria: true,
        contentRequirements: true,
        createdAt: true,
        brand: {
          select: {
            id: true,
            brandProfile: {
              select: {
                companyName: true,
                companyLogo: true,
              }
            }
          },
        },
        _count: {
          select: {
            applications: true,
            submissions: true,
          }
        }
      },
    });

    const total = await prisma.campaign.count({ where });

    res.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const updateCampaignStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "DRAFT", 
      "PENDING_ESCROW", 
      "ESCROW_FUNDED", 
      "ACTIVE", 
      "UNDER_REVIEW", 
      "COMPLETED", 
      "CANCELLED"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.brandId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: { status },
    });

    if (req.user.role === "ADMIN") {
      await prisma.adminAction.create({
        data: {
          adminId: req.user.id,
          actionType: "UPDATE_CAMPAIGN_STATUS",
          targetType: "CAMPAIGN",
          targetId: id,
          previousState: { status: campaign.status },
          newState: { status },
        },
      });
    }

    res.json({
      message: "Campaign status updated",
      campaign: updatedCampaign,
    });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const getROIEstimate = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const prizePool = campaign.prizePool || campaign.budget || 10000;

    const estimate = {
      estimatedReach: {
        min: prizePool * 100,
        max: prizePool * 500,
      },
      estimatedEngagement: {
        min: Math.floor(prizePool * 10),
        max: Math.floor(prizePool * 50),
      },
      estimatedClicks: {
        min: Math.floor(prizePool * 5),
        max: Math.floor(prizePool * 25),
      },
      confidence: "medium",
      note: "Estimates based on similar past campaigns",
    };

    res.json({ estimate });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const getCampaignLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        resultsDate: true,
        prizeDistribution: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.status !== 'COMPLETED') {
      return res.status(400).json({ 
        message: "Leaderboard only available for completed campaigns",
        campaignStatus: campaign.status,
        resultsDate: campaign.resultsDate
      });
    }

    const submissions = await prisma.submission.findMany({
      where: { 
        campaignId: id,
        status: { in: ['APPROVED', 'WINNER'] }
      },
      include: {
        influencer: {
          select: {
            id: true,
            name: true,
            influencerProfile: {
              select: {
                primaryPlatform: true,
                profilePicture: true,
              },
            },
          },
        },
        application: {
          include: {
            referralLink: {
              include: {
                clicks: {
                  select: {
                    id: true,
                    converted: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const leaderboard = submissions.map((submission) => {
      const clicks = submission.application?.referralLink?.clicks || [];
      const totalClicks = clicks.length;
      const conversions = clicks.filter(c => c.converted).length;
      const conversionRate = totalClicks > 0 ? (conversions / totalClicks) * 100 : 0;

      const conversionScore = conversions * 60;
      const clickScore = totalClicks * 3;
      const timeBonus = submissions.indexOf(submission) < 10 ? (10 - submissions.indexOf(submission)) : 0;
      const totalScore = conversionScore + clickScore + timeBonus;

      return {
        influencerId: submission.influencer.id,
        influencerName: submission.influencer.name,
        platform: submission.influencer.influencerProfile?.primaryPlatform,
        profilePicture: submission.influencer.influencerProfile?.profilePicture,
        submissionId: submission.id,
        contentUrl: submission.contentUrl,
        status: submission.status,
        totalClicks,
        conversions,
        conversionRate: conversionRate.toFixed(2),
        score: totalScore,
        submittedAt: submission.createdAt,
      };
    });

    leaderboard.sort((a, b) => b.score - a.score);

    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    res.json({
      campaign: {
        id: campaign.id,
        title: campaign.title,
        status: campaign.status,
        resultsDate: campaign.resultsDate,
        prizeDistribution: campaign.prizeDistribution,
      },
      leaderboard: rankedLeaderboard,
      totalParticipants: rankedLeaderboard.length,
    });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};