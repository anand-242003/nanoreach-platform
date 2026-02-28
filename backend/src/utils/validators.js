import prisma from "../config/db.js";

export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const isValidPAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan?.toUpperCase());
};

export const isValidGST = (gst) => {
  if (!gst) return true; 
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst?.toUpperCase());
};

export const sanitizeString = (str, maxLength = 1000) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') 
    .replace(/\0/g, ''); 
};

export const sanitizeHtml = (html, maxLength = 5000) => {
  if (!html || typeof html !== 'string') return '';
  return html
    .trim()
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') 
    .replace(/on\w+\s*=/gi, '') 
    .replace(/javascript:/gi, ''); 
};

export const isValidObjectId = (id) => {
  return /^[a-f\d]{24}$/i.test(id);
};

export const isPositiveNumber = (num) => {
  const parsed = parseFloat(num);
  return !isNaN(parsed) && parsed > 0 && isFinite(parsed);
};

export const isValidDate = (dateStr) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

export const isFutureDate = (dateStr) => {
  if (!isValidDate(dateStr)) return false;
  return new Date(dateStr) > new Date();
};

export const checkRateLimit = async (userId, action, maxAttempts, windowMinutes) => {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  
  const recentActions = await prisma.adminAction.count({
    where: {
      performedBy: userId,
      actionType: action,
      createdAt: { gte: windowStart },
    },
  });
  
  return recentActions < maxAttempts;
};

export const verifyResourceOwnership = async (resourceType, resourceId, userId, role) => {
  switch (resourceType) {
    case 'CAMPAIGN': {
      const campaign = await prisma.campaign.findUnique({ where: { id: resourceId } });
      if (!campaign) return { valid: false, error: 'Campaign not found', status: 404 };
      if (campaign.brandId !== userId) return { valid: false, error: 'Not authorized', status: 403 };
      return { valid: true, resource: campaign };
    }
    case 'APPLICATION': {
      const application = await prisma.application.findUnique({ 
        where: { id: resourceId },
        include: { campaign: true }
      });
      if (!application) return { valid: false, error: 'Application not found', status: 404 };
      if (role === 'BRAND' && application.campaign.brandId !== userId) {
        return { valid: false, error: 'Not authorized', status: 403 };
      }
      if (role === 'INFLUENCER' && application.influencerId !== userId) {
        return { valid: false, error: 'Not authorized', status: 403 };
      }
      return { valid: true, resource: application };
    }
    case 'SUBMISSION': {
      const submission = await prisma.submission.findUnique({ 
        where: { id: resourceId },
        include: { campaign: true }
      });
      if (!submission) return { valid: false, error: 'Submission not found', status: 404 };
      if (role === 'BRAND' && submission.campaign.brandId !== userId) {
        return { valid: false, error: 'Not authorized', status: 403 };
      }
      if (role === 'INFLUENCER' && submission.influencerId !== userId) {
        return { valid: false, error: 'Not authorized', status: 403 };
      }
      return { valid: true, resource: submission };
    }
    default:
      return { valid: false, error: 'Unknown resource type', status: 400 };
  }
};

export const canModifyCampaign = (campaign) => {
  const unmodifiableStatuses = ['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'];
  if (unmodifiableStatuses.includes(campaign.status)) {
    return {
      valid: false,
      error: `Cannot modify campaign in ${campaign.status} status`,
      status: 400,
    };
  }
  return { valid: true };
};

export const requireVerificationStatus = async (userId, requiredStatus = 'VERIFIED') => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { verificationStatus: true },
  });
  
  if (!user) {
    return { valid: false, error: 'User not found', status: 404 };
  }
  
  if (user.verificationStatus !== requiredStatus) {
    return {
      valid: false,
      error: `Account verification required. Current status: ${user.verificationStatus}`,
      status: 403,
      verificationStatus: user.verificationStatus,
    };
  }
  
  return { valid: true };
};

export const validateBudgetLimits = (budget) => {
  const MIN_BUDGET = 1000; 
  const MAX_BUDGET = 10000000; 
  
  if (budget < MIN_BUDGET) {
    return { valid: false, error: `Minimum campaign budget is ₹${MIN_BUDGET}` };
  }
  if (budget > MAX_BUDGET) {
    return { valid: false, error: `Maximum campaign budget is ₹${MAX_BUDGET.toLocaleString()}` };
  }
  return { valid: true };
};

export const validateCampaignDates = (startDate, endDate, resultsDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start < now) {
    return { valid: false, error: 'Start date must be in the future' };
  }
  
  if (end <= start) {
    return { valid: false, error: 'End date must be after start date' };
  }
  
  const minDuration = 24 * 60 * 60 * 1000; 
  const maxDuration = 90 * 24 * 60 * 60 * 1000; 
  const duration = end - start;
  
  if (duration < minDuration) {
    return { valid: false, error: 'Campaign must run for at least 1 day' };
  }
  
  if (duration > maxDuration) {
    return { valid: false, error: 'Campaign cannot exceed 90 days' };
  }
  
  if (resultsDate) {
    const results = new Date(resultsDate);
    if (results <= end) {
      return { valid: false, error: 'Results date must be after end date' };
    }
    
    const maxResultsDelay = 30 * 24 * 60 * 60 * 1000; 
    if (results - end > maxResultsDelay) {
      return { valid: false, error: 'Results must be announced within 30 days of campaign end' };
    }
  }
  
  return { valid: true };
};

export default {
  isValidEmail,
  isValidUrl,
  isValidPAN,
  isValidGST,
  sanitizeString,
  sanitizeHtml,
  isValidObjectId,
  isPositiveNumber,
  isValidDate,
  isFutureDate,
  checkRateLimit,
  verifyResourceOwnership,
  canModifyCampaign,
  requireVerificationStatus,
  validateBudgetLimits,
  validateCampaignDates,
};
