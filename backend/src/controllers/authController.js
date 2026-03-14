import prisma from "../config/db.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateToken } from "../utils/generateToken.js";
import { isValidEmail, sanitizeString } from "../utils/validators.js";
import { logAuditEvent, AuditEventType, extractRequestContext } from "../utils/auditLogger.js";
import { 
  generateVerificationToken, 
  generatePasswordResetToken,
  hashToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
} from "../utils/emailService.js";

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('one number');
  return errors;
};

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

export const signup = async (req, res) => {
    try {
        let { name, email, password, role } = req.body;

        name = sanitizeString(name, 100);
        email = email?.trim()?.toLowerCase();
        
        if (!email || !password || !name) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        if (name.length < 2 || name.length > 100) {
            return res.status(400).json({ message: "Name must be 2-100 characters" });
        }
        
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({ 
                message: `Password must contain: ${passwordErrors.join(', ')}`,
                requirements: passwordErrors
            });
        }

        const validRoles = ["BRAND", "INFLUENCER"];
        const userRole = role && validRoles.includes(role) ? role : "INFLUENCER";

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await hashPassword(password);

        const verificationToken = generateVerificationToken();
        const hashedToken = hashToken(verificationToken);
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); 
        
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: userRole,
                verificationStatus: "PENDING",
                emailVerified: false,
                emailVerificationToken: hashedToken,
                emailVerificationExpiry: tokenExpiry,
            },
        });

        await sendVerificationEmail(email, name, verificationToken);

        await logAuditEvent({
            eventType: AuditEventType.USER_CREATED,
            userId: user.id,
            targetType: 'USER',
            targetId: user.id,
            metadata: { role: userRole },
            ...extractRequestContext(req),
        });
        
        const token = generateToken(user.id, user.role);

        res.cookie("token", token, getCookieOptions());
        return res.status(201).json({
            message: "User registered successfully. Please check your email to verify your account.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                verificationStatus: user.verificationStatus,
                emailVerified: user.emailVerified,
            },
            redirectTo: "/onboarding",
            requiresEmailVerification: true,
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const login = async (req, res) => {
    const context = extractRequestContext(req);
    
    try {
        let { email, password } = req.body;
        
        email = email?.trim()?.toLowerCase();

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const recentFailures = await prisma.adminAction.count({
            where: {
                actionType: 'LOGIN_FAILURE',
                notes: { contains: email },
                createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
            },
        }).catch(() => 0);
        
        if (recentFailures >= 5) {
            await logAuditEvent({
                eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
                metadata: { email, attempts: recentFailures },
                ...context,
                severity: 'WARNING',
            });
            return res.status(429).json({ 
                message: "Too many login attempts. Please try again in 15 minutes.",
                retryAfter: 900
            });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                influencerProfile: true,
                brandProfile: true,
            }
        });

        if (!user) {
            await logAuditEvent({
                eventType: AuditEventType.LOGIN_FAILURE,
                metadata: { email, reason: 'user_not_found' },
                ...context,
                severity: 'WARNING',
            });
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            await logAuditEvent({
                eventType: AuditEventType.LOGIN_FAILURE,
                userId: user.id,
                metadata: { email, reason: 'invalid_password' },
                ...context,
                severity: 'WARNING',
            });
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const skipVerificationForAdmin = process.env.NODE_ENV === 'development' && user.role === 'ADMIN';
        
        if (!user.emailVerified && !skipVerificationForAdmin) {
            await logAuditEvent({
                eventType: AuditEventType.LOGIN_FAILURE,
                userId: user.id,
                metadata: { email, reason: 'email_not_verified' },
                ...context,
                severity: 'LOW',
            });
            return res.status(403).json({ 
                message: "Please verify your email before logging in. Check your inbox for the verification link.",
                requiresEmailVerification: true,
                email: user.email
            });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });

        await logAuditEvent({
            eventType: AuditEventType.LOGIN_SUCCESS,
            userId: user.id,
            metadata: { email, role: user.role },
            ...context,
            severity: 'LOW',
        });

        const token = generateToken(user.id, user.role);

        res.cookie("token", token, getCookieOptions());

        const hasProfile = user.role === 'INFLUENCER' 
            ? user.influencerProfile !== null 
            : user.brandProfile !== null;

        res.json({
            message: "Login successful",
            user: { 
                id: user.id,
                name: user.name,
                email: user.email, 
                role: user.role,
                verificationStatus: user.verificationStatus,
                emailVerified: user.emailVerified,
                hasProfile,
            },
            redirectTo: !hasProfile ? "/onboarding" : "/dashboard",
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const logout = (_req, res) => {
  const { maxAge, ...cookieOptions } = getCookieOptions();

  res.clearCookie("token", {
    ...cookieOptions,
  });

  return res.json({ message: "Logout successful" });
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        verificationStatus: true,
        createdAt: true,
        influencerProfile: {
          select: {
            displayName: true,
            bio: true,
            profileImage: true,
            youtubeChannelUrl: true,
            youtubeChannelId: true,
            subscriberCount: true,
            categoryTags: true,
            verifiedAt: true,
          }
        },
        brandProfile: {
          select: {
            companyName: true,
            logo: true,
            website: true,
            industry: true,
            verifiedAt: true,
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVerificationStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        role: true,
        verificationStatus: true,
        influencerProfile: {
          select: {
            displayName: true,
            categoryTags: true,
            youtubeChannelUrl: true,
            pastWorkLinks: true,
            identityDocument: true,
            verificationNotes: true,
            verifiedAt: true,
            verifiedBy: true,
          }
        },
        brandProfile: {
          select: {
            companyName: true,
            website: true,
            industry: true,
            gstNumber: true,
            panNumber: true,
            businessDocument: true,
            verificationNotes: true,
            verifiedAt: true,
            verifiedBy: true,
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      verificationStatus: user.verificationStatus,
      profile: user.role === 'INFLUENCER' ? user.influencerProfile : user.brandProfile,
      role: user.role
    });
  } catch (error) {
    console.error("Get Verification Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const hashedToken = hashToken(token);

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      await logAuditEvent({
        eventType: 'EMAIL_VERIFICATION_FAILED',
        userId: null,
        severity: 'medium',
        metadata: { reason: 'Invalid or expired token' }
      });
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null
      }
    });

    await logAuditEvent({
      eventType: 'EMAIL_VERIFIED',
      userId: user.id,
      severity: 'low',
      metadata: { email: user.email }
    });

    res.json({ 
      message: "Email verified successfully! You can now log in.",
      verified: true
    });
  } catch (error) {
    console.error("Email Verification Error:", error);
    res.status(500).json({ message: "Server error during email verification" });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      
      return res.json({ 
        message: "If that email is registered and unverified, a verification email will be sent." 
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const verificationToken = generateVerificationToken();
    const hashedToken = hashToken(verificationToken);
    const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: expiryDate
      }
    });

    await sendVerificationEmail(user.email, user.name, verificationToken);

    await logAuditEvent({
      eventType: 'VERIFICATION_EMAIL_RESENT',
      userId: user.id,
      severity: 'low',
      metadata: { email: user.email }
    });

    res.json({ 
      message: "Verification email sent! Please check your inbox." 
    });
  } catch (error) {
    console.error("Resend Verification Error:", error);
    res.status(500).json({ message: "Server error while resending verification email" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.json({ 
        message: "If that email is registered, a password reset link will be sent." 
      });
    }

    const resetToken = generatePasswordResetToken();
    const hashedToken = hashToken(resetToken);
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000); 

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiry: expiryDate
      }
    });

    await sendPasswordResetEmail(user.email, user.name, resetToken);

    await logAuditEvent({
      eventType: 'PASSWORD_RESET_REQUESTED',
      userId: user.id,
      severity: 'medium',
      metadata: { email: user.email }
    });

    res.json({ 
      message: "If that email is registered, a password reset link will be sent." 
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error while processing password reset request" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long" 
      });
    }

    const hashedToken = hashToken(token);

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      await logAuditEvent({
        eventType: 'PASSWORD_RESET_FAILED',
        userId: null,
        severity: 'high',
        metadata: { reason: 'Invalid or expired token' }
      });
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null
      }
    });

    await logAuditEvent({
      eventType: 'PASSWORD_RESET_COMPLETED',
      userId: user.id,
      severity: 'medium',
      metadata: { email: user.email }
    });

    res.json({ 
      message: "Password reset successfully! You can now log in with your new password.",
      success: true
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error during password reset" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() },
      select: { id: true, name: true, email: true, role: true, verificationStatus: true },
    });

    res.json({ message: 'Profile updated', user: updated });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: hashed } });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};