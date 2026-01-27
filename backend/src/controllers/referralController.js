import prisma from "../config/db.js";

export const trackClick = async (req, res) => {
  try {
    const { code } = req.params;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';

    const referralLink = await prisma.referralLink.findUnique({
      where: { uniqueCode: code },
      include: { campaign: true },
    });

    if (!referralLink) return res.status(404).send('Link not found');

    const existing = await prisma.click.findFirst({ where: { referralLinkId: referralLink.id, ipAddress } });
    const isUnique = !existing;

    await prisma.click.create({
      data: { referralLinkId: referralLink.id, ipAddress, userAgent, referer, isUnique },
    });

    await prisma.referralLink.update({
      where: { id: referralLink.id },
      data: { totalClicks: { increment: 1 }, ...(isUnique && { uniqueClicks: { increment: 1 } }) },
    });

    res.redirect(referralLink.campaign?.rules || 'https://drkmttr.com');
  } catch (error) {
    console.error("Track Click Error:", error);
    res.status(500).send('Error');
  }
};

export const getMyReferralStats = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { influencerId: req.user.id, status: 'APPROVED' },
      include: {
        referralLink: { include: { clicks: { orderBy: { createdAt: 'desc' }, take: 10 } } },
        campaign: { select: { id: true, title: true, status: true } },
      },
    });

    const stats = applications.map(app => ({
      campaign: app.campaign,
      referralLink: app.referralLink ? {
        url: app.referralLink.url,
        code: app.referralLink.uniqueCode,
        totalClicks: app.referralLink.totalClicks,
        uniqueClicks: app.referralLink.uniqueClicks,
        conversions: app.referralLink.conversions,
      } : null,
    }));

    res.json({ stats });
  } catch (error) {
    console.error("Get Referral Stats Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const trackConversion = async (req, res) => {
  try {
    const { code } = req.params;
    const link = await prisma.referralLink.findUnique({ where: { uniqueCode: code } });
    if (!link) return res.status(404).json({ message: "Not found" });

    await prisma.referralLink.update({ where: { id: link.id }, data: { conversions: { increment: 1 } } });
    res.json({ message: "Conversion tracked" });
  } catch (error) {
    console.error("Track Conversion Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
