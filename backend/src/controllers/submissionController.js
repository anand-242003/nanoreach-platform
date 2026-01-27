import prisma from "../config/db.js";

const isSubmissionWindowOpen = (campaign) => {
  const now = new Date();
  const endDate = new Date(campaign.endDate);
  const windowEnd = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
  return now >= endDate && now <= windowEnd;
};

export const createSubmission = async (req, res) => {
  try {
    const { campaignId, contentUrl } = req.body;
    const influencerId = req.user.id;

    if (!campaignId || !contentUrl) {
      return res.status(400).json({ message: "Campaign ID and content URL are required" });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    if (!isSubmissionWindowOpen(campaign)) {
      const endDate = new Date(campaign.endDate);
      const windowEnd = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
      const now = new Date();
      
      if (now < endDate) {
        return res.status(400).json({ 
          message: `Submission window opens on ${endDate.toLocaleString()}`,
          windowOpens: endDate,
          windowCloses: windowEnd,
        });
      }
      return res.status(400).json({ message: "Submission window has closed" });
    }

    const application = await prisma.application.findUnique({
      where: { campaignId_influencerId: { campaignId, influencerId } },
    });

    if (!application || application.status !== 'APPROVED') {
      return res.status(403).json({ message: "You must have an approved application" });
    }

    const existing = await prisma.submission.findFirst({ where: { campaignId, influencerId } });
    if (existing) {
      return res.status(400).json({ message: "You have already submitted" });
    }

    const submission = await prisma.submission.create({
      data: { campaignId, influencerId, contentUrl, socialPlatform: 'YOUTUBE', contentType: 'VIDEO', validationStatus: 'PENDING' },
    });

    await prisma.leaderboardEntry.create({
      data: { campaignId, submissionId: submission.id, engagementScore: 0, referralScore: 0, qualityScore: 0, totalScore: 0 },
    });

    res.status(201).json({ message: "Submission received!", submission });
  } catch (error) {
    console.error("Create Submission Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { influencerId: req.user.id },
      include: {
        campaign: { select: { id: true, title: true, endDate: true, status: true, resultsDate: true } },
        leaderboardEntry: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ submissions });
  } catch (error) {
    console.error("Get My Submissions Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCampaignSubmissions = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const submissions = await prisma.submission.findMany({
      where: { campaignId },
      include: { leaderboardEntry: true },
      orderBy: { createdAt: 'desc' },
    });

    const result = await Promise.all(submissions.map(async (sub) => {
      const profile = await prisma.influencerProfile.findUnique({
        where: { userId: sub.influencerId },
        select: { displayName: true, profileImage: true, youtubeChannelUrl: true },
      });
      return { ...sub, influencer: profile };
    }));

    res.json({ submissions: result });
  } catch (error) {
    console.error("Get Campaign Submissions Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const scoreSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { engagementScore, referralScore, qualityScore, metrics, feedback } = req.body;

    const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    const totalScore = (engagementScore || 0) * 0.4 + (referralScore || 0) * 0.3 + (qualityScore || 0) * 0.3;

    await prisma.submission.update({
      where: { id: submissionId },
      data: { metrics, score: totalScore, validationStatus: 'APPROVED', adminNotes: feedback },
    });

    await prisma.leaderboardEntry.update({
      where: { submissionId },
      data: {
        engagementScore: engagementScore || 0,
        referralScore: referralScore || 0,
        qualityScore: qualityScore || 0,
        totalScore,
        scoreBreakdown: { engagement: engagementScore, referral: referralScore, quality: qualityScore, feedback },
      },
    });

    await updateCampaignRankings(submission.campaignId);
    res.json({ message: "Submission scored", totalScore });
  } catch (error) {
    console.error("Score Submission Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateCampaignRankings = async (campaignId) => {
  const entries = await prisma.leaderboardEntry.findMany({
    where: { campaignId },
    orderBy: { totalScore: 'desc' },
  });
  for (let i = 0; i < entries.length; i++) {
    await prisma.leaderboardEntry.update({ where: { id: entries[i].id }, data: { rank: i + 1 } });
  }
};

export const getCampaignLeaderboard = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    const isAdmin = req.user.role === 'ADMIN';
    const isBrand = req.user.role === 'BRAND' && campaign.brandId === req.user.id;

    // Only admin can see leaderboard before results, or after reveal
    if (!isAdmin && campaign.status !== 'COMPLETED') {
      return res.json({ 
        leaderboard: [],
        campaign: { title: campaign.title, status: campaign.status },
        message: "Leaderboard available after results announcement"
      });
    }

    const entries = await prisma.leaderboardEntry.findMany({
      where: { campaignId, ...(isAdmin ? {} : { isRevealed: true }) },
      orderBy: { rank: 'asc' },
      include: { submission: { select: { contentUrl: true, influencerId: true, adminNotes: true } } },
    });

    const leaderboard = await Promise.all(entries.map(async (e) => {
      const profile = await prisma.influencerProfile.findUnique({
        where: { userId: e.submission.influencerId },
        select: { displayName: true, profileImage: true },
      });
      return { ...e, influencer: profile };
    }));

    res.json({ leaderboard, campaign: { title: campaign.title, status: campaign.status, prizeDistribution: campaign.prizeDistribution } });
  } catch (error) {
    console.error("Get Leaderboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSubmissionWindowStatus = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const influencerId = req.user.id;

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    const application = await prisma.application.findUnique({
      where: { campaignId_influencerId: { campaignId, influencerId } },
      include: { referralLink: true },
    });

    const submission = await prisma.submission.findFirst({ where: { campaignId, influencerId } });

    const now = new Date();
    const endDate = new Date(campaign.endDate);
    const windowEnd = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);

    let status = 'NOT_STARTED';
    if (now >= endDate && now <= windowEnd) status = 'OPEN';
    else if (now > windowEnd) status = 'CLOSED';

    res.json({
      isApproved: application?.status === 'APPROVED',
      hasSubmitted: !!submission,
      submission,
      referralLink: application?.referralLink,
      window: { status, opensAt: endDate, closesAt: windowEnd },
    });
  } catch (error) {
    console.error("Get Submission Window Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const revealLeaderboard = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { prizeAmounts } = req.body; // { 1: 100000, 2: 50000, 3: 25000 }

    await prisma.leaderboardEntry.updateMany({ where: { campaignId }, data: { isRevealed: true } });

    if (prizeAmounts) {
      for (const [rank, amount] of Object.entries(prizeAmounts)) {
        await prisma.leaderboardEntry.updateMany({
          where: { campaignId, rank: parseInt(rank) },
          data: { prizeAmount: amount },
        });
      }
    }

    await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'COMPLETED' } });

    res.json({ message: "Leaderboard revealed" });
  } catch (error) {
    console.error("Reveal Leaderboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInfluencerFeedback = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { leaderboardEntry: true, campaign: { select: { title: true, prizeDistribution: true } } },
    });

    if (!submission) return res.status(404).json({ message: "Submission not found" });
    if (submission.influencerId !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    res.json({
      feedback: submission.adminNotes,
      score: submission.score,
      rank: submission.leaderboardEntry?.rank,
      breakdown: submission.leaderboardEntry?.scoreBreakdown,
      prizeAmount: submission.leaderboardEntry?.prizeAmount,
    });
  } catch (error) {
    console.error("Get Feedback Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


