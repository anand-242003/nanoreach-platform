import prisma from "../config/db.js";

export const getInfluencerAnalytics = async (req, res) => {
  try {
    const influencerId = req.user.id;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const applications = await prisma.application.findMany({
      where: {
        influencerId,
        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            status: true,
            budget: true,
          },
        },
        referralLink: {
          include: {
            clicks: {
              select: {
                id: true,
                converted: true,
                createdAt: true,
              },
            },
          },
        },
        submissions: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    let totalClicks = 0;
    let totalConversions = 0;
    let totalEarnings = 0;
    const campaignMetrics = [];

    applications.forEach((app) => {
      const clicks = app.referralLink?.clicks || [];
      const conversions = clicks.filter(c => c.converted).length;
      const clickCount = clicks.length;

      totalClicks += clickCount;
      totalConversions += conversions;

      let earnings = 0;
      if (app.campaign.status === 'COMPLETED' && app.submissions.length > 0) {
        
        earnings = conversions * 50 + clickCount * 5;
      }
      totalEarnings += earnings;

      campaignMetrics.push({
        campaignId: app.campaign.id,
        campaignTitle: app.campaign.title,
        campaignStatus: app.campaign.status,
        applicationStatus: app.status,
        clicks: clickCount,
        conversions,
        conversionRate: clickCount > 0 ? ((conversions / clickCount) * 100).toFixed(2) : '0.00',
        submissions: app.submissions.length,
        earnings,
      });
    });

    const allClicks = applications.flatMap(app => app.referralLink?.clicks || []);
    const clickTrends = allClicks.reduce((acc, click) => {
      const date = new Date(click.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const trendData = Object.entries(clickTrends)
      .map(([date, count]) => ({ date, clicks: count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      overview: {
        totalCampaigns: applications.length,
        activeCampaigns: applications.filter(a => a.campaign.status === 'ACTIVE').length,
        totalClicks,
        totalConversions,
        averageConversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00',
        totalEarnings,
      },
      campaigns: campaignMetrics,
      clickTrends: trendData,
    });
  } catch (error) {
    console.error("Get Influencer Analytics Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBrandAnalytics = async (req, res) => {
  try {
    const brandId = req.user.id;
    const { startDate, endDate, campaignId } = req.query;

    const campaignFilter = { brandId };
    if (campaignId) campaignFilter.id = campaignId;

    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    if (startDate || endDate) {
      campaignFilter.createdAt = dateFilter;
    }

    const campaigns = await prisma.campaign.findMany({
      where: campaignFilter,
      include: {
        applications: {
          include: {
            influencer: {
              select: {
                id: true,
                name: true,
                influencerProfile: {
                  select: {
                    followersCount: true,
                    primaryPlatform: true,
                  },
                },
              },
            },
            referralLink: {
              include: {
                clicks: {
                  select: {
                    id: true,
                    converted: true,
                    createdAt: true,
                  },
                },
              },
            },
            submissions: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
      },
    });

    let totalSpent = 0;
    let totalReach = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalApplications = 0;
    let totalSubmissions = 0;

    const campaignPerformance = campaigns.map((campaign) => {
      const spent = campaign.budget || 0;
      totalSpent += spent;
      totalApplications += campaign.applications.length;

      let campaignClicks = 0;
      let campaignConversions = 0;
      let campaignReach = 0;
      let approvedSubmissions = 0;

      campaign.applications.forEach((app) => {
        const clicks = app.referralLink?.clicks || [];
        campaignClicks += clicks.length;
        campaignConversions += clicks.filter(c => c.converted).length;
        
        const followersCount = app.influencer.influencerProfile?.followersCount || 0;
        campaignReach += followersCount;

        approvedSubmissions += app.submissions.filter(s => s.status === 'APPROVED' || s.status === 'WINNER').length;
      });

      totalClicks += campaignClicks;
      totalConversions += campaignConversions;
      totalReach += campaignReach;
      totalSubmissions += approvedSubmissions;

      const roi = spent > 0 ? ((campaignConversions * 100 - spent) / spent * 100).toFixed(2) : '0.00';
      const cpc = campaignClicks > 0 ? (spent / campaignClicks).toFixed(2) : '0.00';
      const cpa = campaignConversions > 0 ? (spent / campaignConversions).toFixed(2) : '0.00';

      return {
        campaignId: campaign.id,
        title: campaign.title,
        status: campaign.status,
        budget: spent,
        applications: campaign.applications.length,
        approvedSubmissions,
        reach: campaignReach,
        clicks: campaignClicks,
        conversions: campaignConversions,
        conversionRate: campaignClicks > 0 ? ((campaignConversions / campaignClicks) * 100).toFixed(2) : '0.00',
        roi,
        costPerClick: cpc,
        costPerAcquisition: cpa,
      };
    });

    const allClicks = campaigns.flatMap(c => 
      c.applications.flatMap(a => a.referralLink?.clicks || [])
    );

    const conversionTrends = allClicks.reduce((acc, click) => {
      const date = new Date(click.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, clicks: 0, conversions: 0 };
      }
      acc[date].clicks += 1;
      if (click.converted) acc[date].conversions += 1;
      return acc;
    }, {});

    const trendData = Object.values(conversionTrends)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const overallROI = totalSpent > 0 
      ? ((totalConversions * 100 - totalSpent) / totalSpent * 100).toFixed(2) 
      : '0.00';

    res.json({
      overview: {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
        completedCampaigns: campaigns.filter(c => c.status === 'COMPLETED').length,
        totalSpent,
        totalApplications,
        totalSubmissions,
        totalReach,
        totalClicks,
        totalConversions,
        averageConversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00',
        roi: overallROI,
        avgCostPerClick: totalClicks > 0 ? (totalSpent / totalClicks).toFixed(2) : '0.00',
        avgCostPerAcquisition: totalConversions > 0 ? (totalSpent / totalConversions).toFixed(2) : '0.00',
      },
      campaigns: campaignPerformance,
      conversionTrends: trendData,
    });
  } catch (error) {
    console.error("Get Brand Analytics Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
