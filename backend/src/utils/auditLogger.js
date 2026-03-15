import prisma from "../config/db.js";

export const AuditEventType = {
  
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',

  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  PROFILE_CREATED: 'PROFILE_CREATED',
  PROFILE_UPDATED: 'PROFILE_UPDATED',

  VERIFICATION_SUBMITTED: 'VERIFICATION_SUBMITTED',
  VERIFICATION_APPROVED: 'VERIFICATION_APPROVED',
  VERIFICATION_REJECTED: 'VERIFICATION_REJECTED',

  CAMPAIGN_CREATED: 'CAMPAIGN_CREATED',
  CAMPAIGN_UPDATED: 'CAMPAIGN_UPDATED',
  CAMPAIGN_PUBLISHED: 'CAMPAIGN_PUBLISHED',
  CAMPAIGN_CANCELLED: 'CAMPAIGN_CANCELLED',
  CAMPAIGN_COMPLETED: 'CAMPAIGN_COMPLETED',
  CAMPAIGN_DELETED: 'CAMPAIGN_DELETED',

  APPLICATION_SUBMITTED: 'APPLICATION_SUBMITTED',
  APPLICATION_APPROVED: 'APPLICATION_APPROVED',
  APPLICATION_REJECTED: 'APPLICATION_REJECTED',

  SUBMISSION_CREATED: 'SUBMISSION_CREATED',
  SUBMISSION_METRICS_UPDATED: 'SUBMISSION_METRICS_UPDATED',
  SUBMISSION_APPROVED: 'SUBMISSION_APPROVED',
  SUBMISSION_REJECTED: 'SUBMISSION_REJECTED',
  SUBMISSION_FLAGGED: 'SUBMISSION_FLAGGED',

  REFERRAL_LINK_GENERATED: 'REFERRAL_LINK_GENERATED',
  REFERRAL_CLICK_TRACKED: 'REFERRAL_CLICK_TRACKED',
  REFERRAL_CONVERSION: 'REFERRAL_CONVERSION',

  ESCROW_CREATED: 'ESCROW_CREATED',
  PAYMENT_SUBMITTED: 'PAYMENT_SUBMITTED',
  PAYMENT_VERIFIED: 'PAYMENT_VERIFIED',
  PAYMENT_REJECTED: 'PAYMENT_REJECTED',
  ESCROW_RELEASED: 'ESCROW_RELEASED',
  ESCROW_REFUNDED: 'ESCROW_REFUNDED',

  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',

  ADMIN_ACTION: 'ADMIN_ACTION',
};

export const logAuditEvent = async ({
  eventType,
  userId,
  targetType,
  targetId,
  metadata = {},
  ipAddress,
  userAgent,
  severity = 'INFO', 
}) => {
  try {

    const auditEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      userId,
      targetType,
      targetId,
      metadata,
      ipAddress,
      userAgent,
      severity,
    };

    if (severity === 'CRITICAL' || severity === 'ERROR') {} else if (severity === 'WARNING') {} else {}

    if (['CRITICAL', 'ERROR'].includes(severity) || eventType.includes('PAYMENT') || eventType.includes('ESCROW')) {
      await prisma.adminAction.create({
        data: {
          performedBy: userId || 'SYSTEM',
          actionType: eventType,
          targetType: targetType || 'SYSTEM',
          targetId: targetId || 'N/A',
          notes: JSON.stringify(metadata),
        },
      }).catch(err => {});
    }
    
    return auditEntry;
  } catch (error) {return null;
  }
};

export const extractRequestContext = (req) => {
  return {
    ipAddress: req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    origin: req.headers['origin'] || req.headers['referer'] || 'unknown',
    method: req.method,
    path: req.path,
    userId: req.user?.id || null,
    userRole: req.user?.role || null,
  };
};

export default {
  AuditEventType,
  logAuditEvent,
  extractRequestContext,
};
