import nodemailer from 'nodemailer';
import crypto from 'crypto';

const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.SMTP_USER || 'test@example.com',
        pass: process.env.SMTP_PASS || 'testpass',
      },
    });
  }
};

const templates = {
  emailVerification: (name, verificationUrl) => ({
    subject: 'Verify Your Email - DRK/MTTR',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to DRK/MTTR! </h1>
          <p>Hi ${name},</p>
          <p>Thank you for signing up! Please verify your email address to activate your account.</p>
          <p style="margin: 30px 0;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
          <p><strong>This link will expire in 24 hours.</strong></p>
          <div class="footer">
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} DRK/MTTR. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${name},\n\nThank you for signing up! Please verify your email address by clicking this link:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.`,
  }),

  passwordReset: (name, resetUrl) => ({
    subject: 'Reset Your Password - DRK/MTTR',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background: #DC2626; color: white; text-decoration: none; border-radius: 6px; }
          .warning { background: #FEF3C7; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Password Reset Request </h1>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p style="margin: 30px 0;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #DC2626;">${resetUrl}</p>
          <div class="warning">
            <strong>️ Security Notice:</strong> This link will expire in 1 hour for your security.
          </div>
          <div class="footer">
            <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
            <p>&copy; ${new Date().getFullYear()} DRK/MTTR. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${name},\n\nWe received a request to reset your password. Click this link to create a new password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
  }),

  welcomeEmail: (name, role) => ({
    subject: 'Welcome to DRK/MTTR! ',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to DRK/MTTR! </h1>
          <p>Hi ${name},</p>
          <p>Your email has been verified successfully! You're all set to get started as a ${role}.</p>
          ${role === 'BRAND' ? `
            <h3>Next Steps:</h3>
            <ol>
              <li>Complete your brand profile</li>
              <li>Submit verification documents</li>
              <li>Create your first campaign</li>
            </ol>
          ` : `
            <h3>Next Steps:</h3>
            <ol>
              <li>Complete your influencer profile</li>
              <li>Submit verification documents</li>
              <li>Browse active campaigns</li>
            </ol>
          `}
          <p style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">Get Started</a>
          </p>
          <div class="footer">
            <p>Need help? Contact us at support@drkmttr.com</p>
            <p>&copy; ${new Date().getFullYear()} DRK/MTTR. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${name},\n\nYour email has been verified! You're all set to get started as a ${role}.\n\nVisit ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login to get started.\n\nWelcome aboard!`,
  }),
};

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const sendVerificationEmail = async (email, name, token) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    const { subject, html, text } = templates.emailVerification(name, verificationUrl);

    if (process.env.NODE_ENV === 'development') {return { success: true, devMode: true, verificationUrl };
    }

    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"DRK/MTTR" <${process.env.SMTP_FROM || 'noreply@drkmttr.com'}>`,
      to: email,
      subject,
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {return { success: false, error: error.message };
  }
};

export const sendPasswordResetEmail = async (email, name, token) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    const { subject, html, text } = templates.passwordReset(name, resetUrl);

    if (process.env.NODE_ENV === 'development') {return { success: true, devMode: true, resetUrl };
    }

    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"DRK/MTTR" <${process.env.SMTP_FROM || 'noreply@drkmttr.com'}>`,
      to: email,
      subject,
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (email, name, role) => {
  try {
    const { subject, html, text } = templates.welcomeEmail(name, role);

    if (process.env.NODE_ENV === 'development') {return { success: true, devMode: true };
    }

    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"DRK/MTTR" <${process.env.SMTP_FROM || 'noreply@drkmttr.com'}>`,
      to: email,
      subject,
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {return { success: false, error: error.message };
  }
};

export default {
  generateVerificationToken,
  generatePasswordResetToken,
  hashToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
