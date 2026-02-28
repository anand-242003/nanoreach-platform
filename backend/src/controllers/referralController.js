import prisma from "../config/db.js";
import crypto from "crypto";

const parseUserAgent = (userAgent) => {
  const ua = userAgent.toLowerCase();
  
  let deviceType = 'Desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    deviceType = 'Mobile';
  }
  
  let browser = 'Unknown';
  if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';
  
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'MacOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  return { deviceType, browser, os };
};

const detectSuspiciousActivity = async (referralLinkId, ipAddress) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const recentClicks = await prisma.click.count({
    where: {
      referralLinkId,
      ipAddress,
      createdAt: { gte: oneHourAgo },
    },
  });

  return recentClicks > 10;
};

export const generateReferralCode = (campaignId) => {
  const prefix = campaignId.slice(-6).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${random}`;
};

export const trackClick = async (req, res) => {
  try {
    const { code } = req.params;

    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || req.headers['referrer'] || '';

    const { deviceType, browser, os } = parseUserAgent(userAgent);

    const referralLink = await prisma.referralLink.findUnique({
      where: { uniqueCode: code },
      include: { 
        campaign: { 
          select: { 
            id: true, 
            title: true, 
            websiteUrl: true,
            rules: true,
            status: true,
          } 
        } 
      },
    });

    if (!referralLink) {
      return res.status(404).send('<!DOCTYPE html><html><head><title>Link Not Found</title></head><body><h1>Referral Link Not Found</h1><p>This link may have expired or been removed.</p></body></html>');
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingClick = await prisma.click.findFirst({ 
      where: { 
        referralLinkId: referralLink.id, 
        ipAddress,
        createdAt: { gte: oneDayAgo },
      } 
    });
    const isUnique = !existingClick;

    const isSuspicious = await detectSuspiciousActivity(referralLink.id, ipAddress);

    await prisma.click.create({
      data: { 
        referralLinkId: referralLink.id, 
        ipAddress, 
        userAgent, 
        referer,
        deviceType,
        browser,
        os,
        isUnique,
        isSuspicious,
      },
    });

    if (!isSuspicious) {
      await prisma.referralLink.update({
        where: { id: referralLink.id },
        data: { 
          totalClicks: { increment: 1 },
          ...(isUnique && { uniqueClicks: { increment: 1 } }),
          lastClickAt: new Date(),
        },
      });
    }

    const redirectUrl = referralLink.campaign?.websiteUrl || 
                       referralLink.campaign?.rules || 
                       'https://example.com';
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Track Click Error:", error);
    res.status(500).send('<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Error</h1><p>Something went wrong. Please try again later.</p></body></html>');
  }
};

export const getMyReferralStats = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { influencerId: req.user.id, status: 'APPROVED' },
      include: {
        referralLink: { 
          include: { 
            clicks: { 
              orderBy: { createdAt: 'desc' }, 
              take: 10,
              select: {
                id: true,
                createdAt: true,
                deviceType: true,
                browser: true,
                isUnique: true,
                isSuspicious: true,
              },
            } 
          } 
        },
        campaign: { 
          select: { 
            id: true, 
            title: true, 
            status: true,
            budget: true,
          } 
        },
      },
    });

    const stats = applications.map(app => ({
      campaign: app.campaign,
      referralLink: app.referralLink ? {
        url: app.referralLink.url,
        code: app.referralLink.uniqueCode,
        totalClicks: app.referralLink.totalClicks || 0,
        uniqueClicks: app.referralLink.uniqueClicks || 0,
        conversions: app.referralLink.conversions || 0,
        revenue: app.referralLink.revenue || 0,
        lastClickAt: app.referralLink.lastClickAt,
        recentClicks: app.referralLink.clicks || [],
      } : null,
    }));

    res.json({ stats });
  } catch (error) {
    console.error("Get Referral Stats Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCampaignReferralStats = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const influencerId = req.user.id;

    const application = await prisma.application.findFirst({
      where: { 
        campaignId, 
        influencerId,
        status: 'APPROVED',
      },
      include: {
        referralLink: {
          include: {
            clicks: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
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

    if (!application) {
      return res.status(404).json({ message: "Application not found or not approved" });
    }

    if (!application.referralLink) {
      return res.status(404).json({ message: "Referral link not generated yet" });
    }

    const clicks = application.referralLink.clicks || [];
    
    const deviceStats = clicks.reduce((acc, click) => {
      const device = click.deviceType || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    const browserStats = clicks.reduce((acc, click) => {
      const browser = click.browser || 'Unknown';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {});

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentClicks = clicks.filter(c => new Date(c.createdAt) >= thirtyDaysAgo);
    
    const dailyClicks = recentClicks.reduce((acc, click) => {
      const date = new Date(click.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    res.json({
      campaign: application.campaign,
      referralLink: {
        url: application.referralLink.url,
        code: application.referralLink.uniqueCode,
        totalClicks: application.referralLink.totalClicks || 0,
        uniqueClicks: application.referralLink.uniqueClicks || 0,
        conversions: application.referralLink.conversions || 0,
        revenue: application.referralLink.revenue || 0,
        lastClickAt: application.referralLink.lastClickAt,
      },
      analytics: {
        deviceStats,
        browserStats,
        dailyClicks,
        totalSuspicious: clicks.filter(c => c.isSuspicious).length,
      },
    });
  } catch (error) {
    console.error("Get Campaign Referral Stats Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const trackConversion = async (req, res) => {
  try {
    const { code } = req.params;
    const { revenue, metadata } = req.body;
    
    const link = await prisma.referralLink.findUnique({ 
      where: { uniqueCode: code },
      include: {
        application: {
          include: {
            influencer: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
    
    if (!link) {
      return res.status(404).json({ message: "Referral link not found" });
    }

    await prisma.referralLink.update({ 
      where: { id: link.id }, 
      data: { 
        conversions: { increment: 1 },
        revenue: { increment: revenue || 0 },
      } 
    });

    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        targetType: 'REFERRAL_LINK',
        targetId: link.id,
        action: 'TRACK_CONVERSION',
        reason: `Conversion tracked for ${link.uniqueCode}`,
        metadata: {
          revenue,
          influencerId: link.application?.influencerId,
          ...metadata,
        },
      },
    });

    res.json({ 
      message: "Conversion tracked successfully",
      link: {
        code: link.uniqueCode,
        conversions: (link.conversions || 0) + 1,
        revenue: (link.revenue || 0) + (revenue || 0),
      },
    });
  } catch (error) {
    console.error("Track Conversion Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getReferralLinkInfo = async (req, res) => {
  try {
    const { code } = req.params;

    const link = await prisma.referralLink.findUnique({
      where: { uniqueCode: code },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
          },
        },
        application: {
          select: {
            influencer: {
              select: {
                name: true,
              },
            },
            influencerProfile: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!link) {
      return res.status(404).json({ message: "Referral link not found" });
    }

    res.json({
      code: link.uniqueCode,
      url: link.url,
      campaign: link.campaign,
      influencer: link.application?.influencerProfile?.displayName || 
                  link.application?.influencer?.name || 
                  'Unknown',
      stats: {
        totalClicks: link.totalClicks || 0,
        uniqueClicks: link.uniqueClicks || 0,
        conversions: link.conversions || 0,
      },
    });
  } catch (error) {
    console.error("Get Referral Link Info Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
