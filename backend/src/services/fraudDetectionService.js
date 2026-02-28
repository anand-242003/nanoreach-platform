import prisma from '../config/db.js';

const YOUTUBE_ENGAGEMENT_BENCHMARK = {
  min: 2,   
  max: 5    
};

const calculateEngagementRate = (metrics) => {
  const { views, likes, comments, shares } = metrics;
  if (!views || views === 0) return 0;

  const totalEngagement = (likes || 0) + (comments || 0) + (shares || 0);
  return (totalEngagement / views) * 100;
};

export const detectEngagementFraud = (platform, metrics) => {
  const { views, likes, comments } = metrics;

  const totalEngagement = (likes || 0) + (comments || 0);
  const engagementRate = calculateEngagementRate(metrics);

  const benchmark = YOUTUBE_ENGAGEMENT_BENCHMARK;

  if (engagementRate > benchmark.max * 3) {
    return {
      fraudulent: true,
      reason: 'ABNORMALLY_HIGH_ENGAGEMENT',
      engagementRate: engagementRate.toFixed(2) + '%',
      expected: `${benchmark.min}-${benchmark.max}%`,
      severity: 'HIGH',
      explanation: 'Engagement rate is 3x higher than normal - likely bot likes'
    };
  }

  if (views > 10000 && engagementRate < benchmark.min * 0.3) {
    return {
      fraudulent: true,
      reason: 'ABNORMALLY_LOW_ENGAGEMENT',
      engagementRate: engagementRate.toFixed(2) + '%',
      expected: `${benchmark.min}-${benchmark.max}%`,
      severity: 'MEDIUM',
      explanation: 'High views but very low engagement - possible view botting'
    };
  }

  if (views > 5000 && totalEngagement === 0) {
    return {
      fraudulent: true,
      reason: 'ZERO_ENGAGEMENT',
      engagementRate: '0%',
      severity: 'HIGH',
      explanation: 'Significant views but zero engagement - highly suspicious'
    };
  }

  return { 
    fraudulent: false, 
    engagementRate: engagementRate.toFixed(2) + '%',
    severity: 'NONE'
  };
};

export const detectAbnormalGrowth = async (submissionId, currentMetrics) => {
  try {
    
    const history = await prisma.metricsSnapshot.findMany({
      where: { submissionId },
      orderBy: { capturedAt: 'desc' },
      take: 7,
      select: {
        views: true,
        likes: true,
        comments: true,
        capturedAt: true
      }
    });

    if (history.length < 2) {
      return { 
        fraudulent: false, 
        reason: 'Insufficient historical data',
        severity: 'NONE'
      };
    }

    const latest = history[0];
    const previous = history[1];

    const viewGrowth = previous.views > 0 
      ? ((currentMetrics.views - previous.views) / previous.views) * 100 
      : 0;
    
    const likeGrowth = previous.likes > 0 
      ? ((currentMetrics.likes - previous.likes) / previous.likes) * 100 
      : 0;

    const commentGrowth = previous.comments > 0 
      ? ((currentMetrics.comments - previous.comments) / previous.comments) * 100 
      : 0;

    const timeDiff = (new Date() - new Date(latest.capturedAt)) / (1000 * 60 * 60); 

    if (timeDiff < 24 && (viewGrowth > 1000 || likeGrowth > 1000)) {
      return {
        fraudulent: true,
        reason: 'SUDDEN_SPIKE_DETECTED',
        viewGrowth: `${viewGrowth.toFixed(0)}%`,
        likeGrowth: `${likeGrowth.toFixed(0)}%`,
        timePeriod: `${timeDiff.toFixed(1)} hours`,
        severity: 'CRITICAL',
        explanation: '1000%+ growth in 24 hours - likely purchased bot engagement'
      };
    }

    if (viewGrowth > 50 && likeGrowth < -20 && commentGrowth < -20) {
      return {
        fraudulent: true,
        reason: 'DECOUPLED_METRICS',
        viewGrowth: `${viewGrowth.toFixed(0)}%`,
        likeGrowth: `${likeGrowth.toFixed(0)}%`,
        commentGrowth: `${commentGrowth.toFixed(0)}%`,
        severity: 'HIGH',
        explanation: 'Views increasing while engagement decreasing - purchased views without real engagement'
      };
    }

    if (Math.abs(viewGrowth - likeGrowth) > 500) {
      return {
        fraudulent: true,
        reason: 'UNNATURAL_SINGLE_METRIC_SPIKE',
        viewGrowth: `${viewGrowth.toFixed(0)}%`,
        likeGrowth: `${likeGrowth.toFixed(0)}%`,
        severity: 'MEDIUM',
        explanation: 'One metric spiked while others remained normal - selective botting'
      };
    }

    return { 
      fraudulent: false,
      viewGrowth: `${viewGrowth.toFixed(1)}%`,
      likeGrowth: `${likeGrowth.toFixed(1)}%`,
      severity: 'NONE'
    };

  } catch (error) {
    console.error('Growth Pattern Analysis Error:', error);
    return { 
      fraudulent: false, 
      error: error.message,
      severity: 'NONE'
    };
  }
};

export const detectImbalancedEngagement = (metrics) => {
  const { likes, comments, views } = metrics;

  if (likes === 0 && comments === 0) {
    return { fraudulent: false, severity: 'NONE' };
  }

  const likesToCommentsRatio = comments > 0 ? likes / comments : likes;

  if (likesToCommentsRatio > 200 && likes > 100) {
    return {
      fraudulent: true,
      reason: 'EXCESSIVE_LIKES_TO_COMMENTS_RATIO',
      ratio: `${likesToCommentsRatio.toFixed(0)}:1`,
      expected: '10-50:1',
      severity: 'HIGH',
      explanation: 'Abnormally high likes compared to comments - likely bot likes'
    };
  }

  if (comments > likes && comments > 20) {
    return {
      fraudulent: true,
      reason: 'MORE_COMMENTS_THAN_LIKES',
      ratio: `1:${(comments / likes).toFixed(1)}`,
      severity: 'MEDIUM',
      explanation: 'More comments than likes - possible comment spam or highly controversial content'
    };
  }

  return { 
    fraudulent: false, 
    ratio: `${likesToCommentsRatio.toFixed(0)}:1`,
    severity: 'NONE'
  };
};

export const detectViewVelocity = (publishedAt, currentViews) => {
  const now = new Date();
  const published = new Date(publishedAt);
  const hoursSincePublish = (now - published) / (1000 * 60 * 60);

  if (hoursSincePublish < 1) {
    return { fraudulent: false, severity: 'NONE', reason: 'Too early to analyze' };
  }

  const viewsPerHour = currentViews / hoursSincePublish;

  if (viewsPerHour > 50000 && hoursSincePublish < 24) {
    return {
      fraudulent: true,
      reason: 'UNREALISTIC_VIEW_VELOCITY',
      viewsPerHour: Math.round(viewsPerHour),
      hoursSincePublish: hoursSincePublish.toFixed(1),
      severity: 'HIGH',
      explanation: 'View velocity too high for organic growth - likely bot views'
    };
  }

  return { 
    fraudulent: false, 
    viewsPerHour: Math.round(viewsPerHour),
    severity: 'NONE'
  };
};

export const calculateFraudScore = async (submission, verifiedMetrics, publishedAt) => {
  const checks = [];

  const engagementCheck = detectEngagementFraud(
    'YOUTUBE',
    verifiedMetrics
  );
  checks.push({
    name: 'Engagement Rate',
    fraudulent: engagementCheck.fraudulent,
    weight: 30,
    severity: engagementCheck.severity,
    details: engagementCheck
  });

  const growthCheck = await detectAbnormalGrowth(
    submission.id,
    verifiedMetrics
  );
  checks.push({
    name: 'Growth Pattern',
    fraudulent: growthCheck.fraudulent,
    weight: 25,
    severity: growthCheck.severity,
    details: growthCheck
  });

  const ratioCheck = detectImbalancedEngagement(verifiedMetrics);
  checks.push({
    name: 'Engagement Balance',
    fraudulent: ratioCheck.fraudulent,
    weight: 20,
    severity: ratioCheck.severity,
    details: ratioCheck
  });

  const velocityCheck = detectViewVelocity(publishedAt, verifiedMetrics.views);
  checks.push({
    name: 'View Velocity',
    fraudulent: velocityCheck.fraudulent,
    weight: 25,
    severity: velocityCheck.severity,
    details: velocityCheck
  });

  let fraudScore = 0;
  let totalWeight = 0;

  checks.forEach(check => {
    if (check.fraudulent) {
      fraudScore += check.weight;
    }
    totalWeight += check.weight;
  });

  const fraudPercentage = (fraudScore / totalWeight) * 100;

  let riskLevel = 'LOW';
  if (fraudPercentage > 70) riskLevel = 'CRITICAL';
  else if (fraudPercentage > 50) riskLevel = 'HIGH';
  else if (fraudPercentage > 30) riskLevel = 'MEDIUM';

  let recommendation = 'APPROVE';
  if (fraudPercentage > 70) recommendation = 'AUTO_REJECT';
  else if (fraudPercentage > 50) recommendation = 'MANUAL_REVIEW';
  else if (fraudPercentage > 30) recommendation = 'MONITOR';

  return {
    fraudScore: parseFloat(fraudPercentage.toFixed(1)),
    riskLevel,
    recommendation,
    checks,
    verifiedAt: new Date().toISOString()
  };
};

export const createFraudAlert = async (submissionId, fraudResults) => {
  try {
    
    if (fraudResults.fraudScore < 30) {
      return null;
    }

    const fraudulentChecks = fraudResults.checks.filter(c => c.fraudulent);
    const primaryCheck = fraudulentChecks.sort((a, b) => {
      const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    })[0];

    const alert = await prisma.fraudAlert.create({
      data: {
        submissionId,
        alertType: primaryCheck?.details?.reason || 'GENERAL_FRAUD_DETECTED',
        severity: fraudResults.riskLevel,
        description: primaryCheck?.details?.explanation || 'Multiple fraud indicators detected',
        evidence: {
          fraudScore: fraudResults.fraudScore,
          recommendation: fraudResults.recommendation,
          checks: fraudResults.checks
        },
        status: 'PENDING'
      }
    });

    return alert;
  } catch (error) {
    console.error('Create Fraud Alert Error:', error);
    return null;
  }
};

export const getFraudAlerts = async (status = 'PENDING') => {
  try {
    const alerts = await prisma.fraudAlert.findMany({
      where: status ? { status } : {},
      include: {
        submission: {
          include: {
            campaign: {
              select: { id: true, title: true }
            }
          }
        }
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    const enrichedAlerts = await Promise.all(alerts.map(async (alert) => {
      const profile = await prisma.influencerProfile.findUnique({
        where: { userId: alert.submission.influencerId },
        select: {
          displayName: true,
          profileImage: true,
          subscriberCount: true
        }
      });

      return {
        ...alert,
        influencer: profile
      };
    }));

    return enrichedAlerts;
  } catch (error) {
    console.error('Get Fraud Alerts Error:', error);
    return [];
  }
};

export const reviewFraudAlert = async (alertId, adminId, action, notes) => {
  try {
    const status = action === 'confirm' ? 'CONFIRMED' : 'DISMISSED';

    const alert = await prisma.fraudAlert.update({
      where: { id: alertId },
      data: {
        status,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: notes
      }
    });

    if (status === 'CONFIRMED') {
      await prisma.submission.update({
        where: { id: alert.submissionId },
        data: {
          fraudFlags: { push: alert.alertType },
          validationStatus: 'REJECTED',
          adminNotes: notes || 'Automatically rejected due to confirmed fraud alert'
        }
      });
    }

    return alert;
  } catch (error) {
    console.error('Review Fraud Alert Error:', error);
    throw error;
  }
};
