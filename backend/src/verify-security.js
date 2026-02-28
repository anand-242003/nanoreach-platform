#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

const prisma = new PrismaClient();

const checks = {
  passed: [],
  warnings: [],
  failed: [],
};

console.log('\n NanoReach Platform - Security Verification\n');
console.log('='.repeat(60));

async function checkDatabase() {
  try {
    await prisma.$connect();
    checks.passed.push(' Database connection successful');

    const user = await prisma.user.findFirst();
    if (user && 'emailVerified' in user) {
      checks.passed.push(' Email verification fields present in User model');
    } else {
      checks.warnings.push('️  Email verification fields not found - run: npx prisma db push');
    }
  } catch (error) {
    checks.failed.push(` Database connection failed: ${error.message}`);
  }
}

function checkEnvironmentVariables() {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL'];
  const productionOnly = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD'];
  
  required.forEach(envVar => {
    if (process.env[envVar]) {
      checks.passed.push(` ${envVar} configured`);
    } else {
      checks.failed.push(` Missing required variable: ${envVar}`);
    }
  });
  
  if (process.env.NODE_ENV === 'production') {
    productionOnly.forEach(envVar => {
      if (process.env[envVar]) {
        checks.passed.push(` ${envVar} configured (production)`);
      } else {
        checks.warnings.push(`️  ${envVar} not set - emails will fail in production`);
      }
    });
  } else {
    checks.passed.push(' Running in development mode - emails logged to console');
  }
}

function checkRequiredFiles() {
  const requiredFiles = [
    'utils/emailService.js',
    'utils/validators.js',
    'utils/auditLogger.js',
    'middlewares/uploadMiddleware.js',
    'controllers/authController.js',
    'routes/authRoutes.js',
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', 'src', file);
    if (fs.existsSync(filePath)) {
      checks.passed.push(` ${file} exists`);
    } else {
      checks.failed.push(` Missing critical file: ${file}`);
    }
  });
}

function checkUploadDirectory() {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  
  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      checks.passed.push(' Upload directory created');
    } catch (error) {
      checks.failed.push(` Cannot create upload directory: ${error.message}`);
    }
  } else {
    checks.passed.push(' Upload directory exists');
  }

  try {
    const testFile = path.join(uploadDir, '.write-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    checks.passed.push(' Upload directory is writable');
  } catch (error) {
    checks.failed.push(' Upload directory is not writable');
  }
}

async function checkSecurityFeatures() {
  try {
    
    await import('./utils/emailService.js');
    checks.passed.push(' Email service module loaded');
    
    await import('./utils/validators.js');
    checks.passed.push(' Validators module loaded');
    
    await import('./utils/auditLogger.js');
    checks.passed.push(' Audit logger module loaded');
    
    await import('./middlewares/uploadMiddleware.js');
    checks.passed.push(' Upload middleware module loaded');
  } catch (error) {
    checks.failed.push(` Module import failed: ${error.message}`);
  }
}

function checkJWTSecret() {
  const secret = process.env.JWT_SECRET;
  
  if (secret && secret.length >= 64) {
    checks.passed.push(' JWT secret is strong (64+ characters)');
  } else if (secret && secret.length >= 32) {
    checks.warnings.push('️  JWT secret is weak - should be 64+ characters');
  } else {
    checks.failed.push(' JWT secret is too weak (< 32 characters)');
  }
}

async function runAllChecks() {
  console.log('\n Running verification checks...\n');
  
  checkEnvironmentVariables();
  checkRequiredFiles();
  checkUploadDirectory();
  checkJWTSecret();
  await checkSecurityFeatures();
  await checkDatabase();

  console.log('\n' + '='.repeat(60));
  console.log(' VERIFICATION RESULTS\n');
  
  if (checks.passed.length > 0) {
    console.log(' PASSED (' + checks.passed.length + '):\n');
    checks.passed.forEach(msg => console.log('  ' + msg));
    console.log('');
  }
  
  if (checks.warnings.length > 0) {
    console.log('️  WARNINGS (' + checks.warnings.length + '):\n');
    checks.warnings.forEach(msg => console.log('  ' + msg));
    console.log('');
  }
  
  if (checks.failed.length > 0) {
    console.log(' FAILED (' + checks.failed.length + '):\n');
    checks.failed.forEach(msg => console.log('  ' + msg));
    console.log('');
  }

  console.log('='.repeat(60));
  
  if (checks.failed.length > 0) {
    console.log('\n VERIFICATION FAILED');
    console.log('\nPlease fix the issues above before starting the server.');
    process.exit(1);
  } else if (checks.warnings.length > 0) {
    console.log('\n️  VERIFICATION PASSED WITH WARNINGS');
    console.log('\nThe server can start, but address warnings for production.');
  } else {
    console.log('\n ALL CHECKS PASSED');
    console.log('\nYour platform is ready to start with enterprise-grade security!');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n Documentation:');
  console.log('  • Security Audit: SECURITY_AUDIT_REPORT.md');
  console.log('  • Testing Guide: TESTING_EMAIL_VERIFICATION.md');
  console.log('  • Implementation: PRIORITY_1_FIXES_COMPLETE.md');
  console.log('\n Start server: npm run dev\n');
  
  await prisma.$disconnect();
}

runAllChecks().catch(error => {
  console.error('\n Verification script error:', error);
  process.exit(1);
});
