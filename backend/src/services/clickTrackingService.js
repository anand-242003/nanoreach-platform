

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp;
  }
  
  return req.ip || req.connection?.remoteAddress || 'unknown';
};

export const parseUserAgent = (userAgentString) => {
  if (!userAgentString) {
    return {
      browser: 'unknown',
      os: 'unknown',
      device: 'unknown',
      isBot: false
    };
  }

  const ua = userAgentString.toLowerCase();

  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 
    'python', 'java', 'headless', 'phantom', 'selenium'
  ];
  const isBot = botPatterns.some(pattern => ua.includes(pattern));

  let browser = 'other';
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'safari';
  else if (ua.includes('firefox')) browser = 'firefox';
  else if (ua.includes('edg')) browser = 'edge';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'opera';

  let os = 'other';
  if (ua.includes('windows')) os = 'windows';
  else if (ua.includes('mac')) os = 'macos';
  else if (ua.includes('linux')) os = 'linux';
  else if (ua.includes('android')) os = 'android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'ios';

  let device = 'desktop';
  if (ua.includes('mobile')) device = 'mobile';
  else if (ua.includes('tablet') || ua.includes('ipad')) device = 'tablet';

  return {
    browser,
    os,
    device,
    isBot,
    raw: userAgentString
  };
};

export const getGeoLocation = async (ipAddress) => {
  
  if (process.env.NODE_ENV !== 'production') {
    
    if (ipAddress === 'unknown' || 
        ipAddress.startsWith('127.') || 
        ipAddress.startsWith('192.168.') ||
        ipAddress.startsWith('10.') ||
        ipAddress === '::1') {
      return {
        country: 'IN',
        city: 'Mumbai',
        isLocal: true
      };
    }
  }

  try {

    if (process.env.GEOIP_SERVICE === 'ipapi') {
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      if (response.ok) {
        const data = await response.json();
        return {
          country: data.country_code || 'UNKNOWN',
          city: data.city || 'UNKNOWN',
          region: data.region,
          timezone: data.timezone,
          isLocal: false
        };
      }
    }

    return {
      country: 'UNKNOWN',
      city: 'UNKNOWN',
      isLocal: false
    };
  } catch (error) {
    console.error('Geo lookup error:', error);
    return {
      country: 'UNKNOWN',
      city: 'UNKNOWN',
      isLocal: false
    };
  }
};

export const isDuplicateClick = async (referralLinkId, ipAddress) => {
  const timeWindow = new Date(Date.now() - 24 * 60 * 60 * 1000); 
  
  const existingClick = await prisma.click.findFirst({
    where: {
      referralLinkId,
      ipAddress,
      createdAt: { gte: timeWindow }
    }
  });
  
  return existingClick !== null;
};

export const detectSuspiciousPatterns = async (referralLinkId, ipAddress, userAgent) => {
  const suspiciousFlags = [];

  const uaInfo = parseUserAgent(userAgent);
  if (uaInfo.isBot) {
    suspiciousFlags.push('bot_detected');
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentClicks = await prisma.click.count({
    where: {
      referralLinkId,
      ipAddress,
      createdAt: { gte: oneHourAgo }
    }
  });
  
  if (recentClicks >= 10) {
    suspiciousFlags.push('rapid_clicks');
  }

  const referralLink = await prisma.referralLink.findUnique({
    where: { id: referralLinkId },
    select: { campaignId: true }
  });
  
  if (referralLink) {
    const clicksOnCampaign = await prisma.click.count({
      where: {
        ipAddress,
        referralLink: {
          campaignId: referralLink.campaignId
        },
        createdAt: { gte: oneHourAgo }
      }
    });
    
    if (clicksOnCampaign >= 5) {
      suspiciousFlags.push('multiple_referral_links');
    }
  }

  if (!userAgent || userAgent.length < 10) {
    suspiciousFlags.push('missing_user_agent');
  }
  
  return {
    isSuspicious: suspiciousFlags.length > 0,
    flags: suspiciousFlags
  };
};

export const trackClick = async ({
  referralLinkId,
  ipAddress,
  userAgent,
  referer
}) => {
  try {
    
    const isDuplicate = await isDuplicateClick(referralLinkId, ipAddress);

    const geoData = await getGeoLocation(ipAddress);

    const { isSuspicious, flags } = await detectSuspiciousPatterns(
      referralLinkId, 
      ipAddress, 
      userAgent
    );

    const click = await prisma.click.create({
      data: {
        referralLinkId,
        ipAddress,
        userAgent: userAgent || 'unknown',
        referer: referer || null,
        country: geoData.country,
        city: geoData.city,
        isUnique: !isDuplicate,
        isSuspicious
      }
    });

    const updateData = {
      totalClicks: { increment: 1 }
    };
    
    if (!isDuplicate) {
      updateData.uniqueClicks = { increment: 1 };
    }
    
    await prisma.referralLink.update({
      where: { id: referralLinkId },
      data: updateData
    });
    
    return {
      success: true,
      click,
      isDuplicate,
      isSuspicious,
      flags,
      geoData
    };
  } catch (error) {
    console.error('Track click error:', error);
    throw error;
  }
};

export const getClickAnalytics = async (referralLinkId) => {
  try {
    const [
      totalStats,
      last24Hours,
      last7Days,
      topCountries,
      deviceBreakdown
    ] = await Promise.all([
      
      prisma.click.aggregate({
        where: { referralLinkId },
        _count: { id: true }
      }),

      prisma.click.count({
        where: {
          referralLinkId,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      }),

      prisma.click.count({
        where: {
          referralLinkId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),

      prisma.click.groupBy({
        by: ['country'],
        where: { referralLinkId },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5
      }),

      prisma.click.findMany({
        where: { referralLinkId },
        select: { userAgent: true }
      })
    ]);

    const devices = { mobile: 0, desktop: 0, tablet: 0, bot: 0 };
    deviceBreakdown.forEach(({ userAgent }) => {
      const uaInfo = parseUserAgent(userAgent);
      if (uaInfo.isBot) devices.bot++;
      else devices[uaInfo.device]++;
    });
    
    return {
      total: totalStats._count.id,
      last24Hours,
      last7Days,
      topCountries: topCountries.map(c => ({
        country: c.country,
        count: c._count.id
      })),
      devices
    };
  } catch (error) {
    console.error('Get click analytics error:', error);
    throw error;
  }
};

export const getSuspiciousClicks = async (referralLinkId) => {
  try {
    const suspiciousClicks = await prisma.click.findMany({
      where: {
        referralLinkId,
        isSuspicious: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    return suspiciousClicks;
  } catch (error) {
    console.error('Get suspicious clicks error:', error);
    throw error;
  }
};
