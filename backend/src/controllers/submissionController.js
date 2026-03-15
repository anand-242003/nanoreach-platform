import prisma from "../config/db.js";
import { logAuditEvent, AuditEventType } from "../utils/auditLogger.js";
import { isValidUrl, sanitizeString } from "../utils/validators.js";
import { verifyYouTubeMetrics, createMetricsSnapshot } from "../services/youtubeVerificationService.js";
import { calculateFraudScore, createFraudAlert, getFraudAlerts, reviewFraudAlert } from "../services/fraudDetectionService.js";

const SUPPORTED_PLATFORMS = ['YOUTUBE'];
const SUPPORTED_CONTENT_TYPES = ['VIDEO', 'SHORT'];

const isSubmissionWindowOpen = (campaign) => {
  const now = new Date();
  const endDate = new Date(campaign.endDate);
  const windowEnd = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
  return now >= endDate && now <= windowEnd;
};

export const createSubmission = async (req, res) => {
  try {
    const { campaignId, contentUrl, socialPlatform, contentType } = req.body;
    const influencerId = req.user.id;

    if (!campaignId || !contentUrl) {
      return res.status(400).json({ message: "Campaign ID and content URL are required" });
    }

    const platform = socialPlatform?.toUpperCase() || 'YOUTUBE';
    const type = contentType?.toUpperCase() || 'VIDEO';

    if (!SUPPORTED_PLATFORMS.includes(platform)) {
      return res.status(400).json({ 
        message: "Invalid social platform",
        supportedPlatforms: SUPPORTED_PLATFORMS
      });
    }

    if (!SUPPORTED_CONTENT_TYPES.includes(type)) {
      return res.status(400).json({ 
        message: "Invalid content type",
        supportedTypes: SUPPORTED_CONTENT_TYPES
      });
    }

    if (!isValidUrl(contentUrl)) {
      return res.status(400).json({ message: "Invalid content URL format" });
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
      data: { 
        campaignId, 
        influencerId, 
        contentUrl, 
        socialPlatform: platform, 
        contentType: type, 
        validationStatus: 'PENDING' 
      },
    });

    await prisma.leaderboardEntry.create({
      data: { campaignId, submissionId: submission.id, engagementScore: 0, referralScore: 0, qualityScore: 0, totalScore: 0 },
    });

    await logAuditEvent({
      eventType: AuditEventType.SUBMISSION_CREATED,
      userId: influencerId,
      metadata: {
        submissionId: submission.id,
        campaignId,
        platform,
        contentType: type
      },
      severity: 'LOW'
    });

    let verificationResult = null;
    if (platform === 'YOUTUBE') {
      try {
        const verified = await verifyYouTubeMetrics(contentUrl);
        
        if (verified.verified) {
          
          const fraudCheck = await calculateFraudScore(
            submission, 
            verified.metrics, 
            verified.metadata.publishedAt
          );

          await createMetricsSnapshot(submission.id, verified, fraudCheck);

          await prisma.submission.update({
            where: { id: submission.id },
            data: {
              metrics: verified.metrics
            }
          });

          if (fraudCheck.fraudScore >= 30) {
            await createFraudAlert(submission.id, fraudCheck);
          }
          
          verificationResult = {
            verified: true,
            videoTitle: verified.metadata.title,
            metrics: verified.metrics,
            fraudScore: fraudCheck.fraudScore,
            riskLevel: fraudCheck.riskLevel,
            recommendation: fraudCheck.recommendation
          };
        } else {
          verificationResult = {
            verified: false,
            error: verified.error
          };
        }
      } catch (verifyError) {verificationResult = {
          verified: false,
          error: 'Verification service error'
        };
      }
    }

    res.status(201).json({ 
      message: "Submission received!", 
      submission,
      verification: verificationResult
    });
  } catch (error) {res.status(500).json({ message: "Server error", error: error.message });
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
  } catch (error) {res.status(500).json({ message: "Server error" });
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
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const scoreSubmission = async (req, res) => {
  try {
    const submissionId = req.params.id || req.params.submissionId;
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
  } catch (error) {res.status(500).json({ message: "Server error" });
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
  } catch (error) {res.status(500).json({ message: "Server error" });
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
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const revealLeaderboard = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { prizeAmounts } = req.body; 

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
  } catch (error) {res.status(500).json({ message: "Server error" });
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
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const updateSubmissionMetrics = async (req, res) => {
  try {
    const { id } = req.params;
    const { metrics } = req.body;

    if (!metrics || typeof metrics !== 'object') {
      return res.status(400).json({ message: "Valid metrics object required" });
    }

    const allowedMetrics = ['views', 'likes', 'comments', 'shares', 'watchTime', 'engagement', 'reach', 'impressions'];
    const invalidMetrics = Object.keys(metrics).filter(key => !allowedMetrics.includes(key));
    
    if (invalidMetrics.length > 0) {
      return res.status(400).json({ 
        message: "Invalid metric fields",
        invalidFields: invalidMetrics,
        allowedFields: allowedMetrics
      });
    }

    for (const [key, value] of Object.entries(metrics)) {
      if (typeof value !== 'number' || value < 0) {
        return res.status(400).json({ 
          message: `Invalid value for ${key}: must be a positive number` 
        });
      }
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
      select: { id: true, campaignId: true, influencerId: true, metrics: true }
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const updatedMetrics = {
      ...(submission.metrics || {}),
      ...metrics,
      updatedBy: req.user.id,
      updatedAt: new Date().toISOString()
    };

    await prisma.submission.update({
      where: { id },
      data: { metrics: updatedMetrics }
    });

    await logAuditEvent({
      eventType: AuditEventType.SUBMISSION_METRICS_UPDATED,
      userId: req.user.id,
      metadata: {
        submissionId: id,
        campaignId: submission.campaignId,
        metrics: metrics
      },
      severity: 'MEDIUM'
    });

    res.json({ 
      message: "Metrics updated successfully",
      metrics: updatedMetrics
    });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const validateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ 
        message: "Status must be APPROVED or REJECTED" 
      });
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { campaign: { select: { id: true, title: true } } }
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (submission.validationStatus !== 'PENDING') {
      return res.status(400).json({ 
        message: `Submission already ${submission.validationStatus.toLowerCase()}` 
      });
    }

    await prisma.submission.update({
      where: { id },
      data: {
        validationStatus: status,
        adminNotes: sanitizeString(notes || ''),
        validatedBy: req.user.id,
        validatedAt: new Date()
      }
    });

    await logAuditEvent({
      eventType: status === 'APPROVED' 
        ? AuditEventType.SUBMISSION_APPROVED 
        : AuditEventType.SUBMISSION_REJECTED,
      userId: req.user.id,
      metadata: {
        submissionId: id,
        campaignId: submission.campaignId,
        notes: notes || ''
      },
      severity: 'MEDIUM'
    });

    res.json({ 
      message: `Submission ${status.toLowerCase()} successfully`,
      status
    });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const flagSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { flags, reason } = req.body;

    if (!flags || !Array.isArray(flags) || flags.length === 0) {
      return res.status(400).json({ 
        message: "At least one fraud flag is required" 
      });
    }

    const allowedFlags = [
      'FAKE_VIEWS',
      'FAKE_ENGAGEMENT',
      'BOT_TRAFFIC',
      'DUPLICATE_CONTENT',
      'MISLEADING_METRICS',
      'POLICY_VIOLATION',
      'SUSPICIOUS_ACTIVITY',
      'OTHER'
    ];

    const invalidFlags = flags.filter(flag => !allowedFlags.includes(flag));
    if (invalidFlags.length > 0) {
      return res.status(400).json({ 
        message: "Invalid fraud flags",
        invalidFlags,
        allowedFlags
      });
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
      select: { id: true, campaignId: true, influencerId: true, fraudFlags: true }
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const existingFlags = submission.fraudFlags || [];
    const newFlags = [...new Set([...existingFlags, ...flags])];

    await prisma.submission.update({
      where: { id },
      data: {
        fraudFlags: newFlags,
        adminNotes: reason ? sanitizeString(reason) : submission.adminNotes,
        validationStatus: 'REJECTED' 
      }
    });

    await logAuditEvent({
      eventType: AuditEventType.SUBMISSION_FLAGGED,
      userId: req.user.id,
      metadata: {
        submissionId: id,
        campaignId: submission.campaignId,
        flags: newFlags,
        reason: reason || ''
      },
      severity: 'HIGH'
    });

    res.json({ 
      message: "Submission flagged successfully",
      flags: newFlags,
      status: 'REJECTED'
    });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const getPendingSubmissions = async (req, res) => {
  try {
    const { campaignId } = req.query;
    
    const where = { validationStatus: 'PENDING' };
    if (campaignId) {
      where.campaignId = campaignId;
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        campaign: {
          select: { id: true, title: true, brandId: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const result = await Promise.all(submissions.map(async (sub) => {
      const profile = await prisma.influencerProfile.findUnique({
        where: { userId: sub.influencerId },
        select: { 
          displayName: true, 
          profileImage: true, 
          youtubeChannelUrl: true,
          subscriberCount: true
        },
      });
      return { ...sub, influencer: profile };
    }));

    res.json({ 
      count: result.length,
      submissions: result 
    });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const reverifySubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      select: {
        id: true,
        contentUrl: true,
        socialPlatform: true,
        influencerId: true,
        campaignId: true
      }
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (submission.socialPlatform !== 'YOUTUBE') {
      return res.status(400).json({ 
        message: "Auto-verification only supported for YouTube",
        platform: submission.socialPlatform
      });
    }

    const verified = await verifyYouTubeMetrics(submission.contentUrl);

    if (!verified.verified) {
      return res.status(400).json({ 
        message: "Verification failed",
        error: verified.error
      });
    }

    const fraudCheck = await calculateFraudScore(
      submission,
      verified.metrics,
      verified.metadata.publishedAt
    );

    await createMetricsSnapshot(submission.id, verified, fraudCheck);

    await prisma.submission.update({
      where: { id },
      data: {
        metrics: verified.metrics
      }
    });

    if (fraudCheck.fraudScore >= 30) {
      await createFraudAlert(submission.id, fraudCheck);
    }

    await logAuditEvent({
      eventType: AuditEventType.SUBMISSION_METRICS_UPDATED,
      userId: req.user.id,
      metadata: {
        submissionId: id,
        campaignId: submission.campaignId,
        verificationType: 'MANUAL_REVERIFICATION',
        fraudScore: fraudCheck.fraudScore
      },
      severity: fraudCheck.riskLevel === 'CRITICAL' || fraudCheck.riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM'
    });

    res.json({
      message: "Verification complete",
      verified: true,
      videoTitle: verified.metadata.title,
      metrics: verified.metrics,
      fraudScore: fraudCheck.fraudScore,
      riskLevel: fraudCheck.riskLevel,
      recommendation: fraudCheck.recommendation,
      checks: fraudCheck.checks
    });

  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const getAdminFraudAlerts = async (req, res) => {
  try {
    const { status } = req.query;
    
    const alerts = await getFraudAlerts(status);

    res.json({
      count: alerts.length,
      alerts
    });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const reviewAdminFraudAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; 

    if (!['confirm', 'dismiss'].includes(action)) {
      return res.status(400).json({ 
        message: "Invalid action",
        allowedActions: ['confirm', 'dismiss']
      });
    }

    const alert = await reviewFraudAlert(id, req.user.id, action, notes);

    await logAuditEvent({
      eventType: action === 'confirm' ? AuditEventType.SUBMISSION_FLAGGED : AuditEventType.SUBMISSION_APPROVED,
      userId: req.user.id,
      metadata: {
        fraudAlertId: id,
        submissionId: alert.submissionId,
        action,
        notes
      },
      severity: action === 'confirm' ? 'HIGH' : 'LOW'
    });

    res.json({
      message: `Fraud alert ${action}ed successfully`,
      alert
    });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const getVerificationHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const snapshots = await prisma.metricsSnapshot.findMany({
      where: { submissionId: id },
      orderBy: { capturedAt: 'desc' },
      take: 30
    });

    const fraudAlerts = await prisma.fraudAlert.findMany({
      where: { submissionId: id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      submissionId: id,
      snapshotsCount: snapshots.length,
      snapshots,
      fraudAlerts
    });
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};
