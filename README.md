# NanoReach Platform

An influencer marketing platform connecting brands with YouTube creators through performance-based campaigns.

## Overview

NanoReach enables brands to launch campaigns, influencers to apply and submit content, and admins to verify authenticity. Built with automated fraud detection and referral tracking.

## Tech Stack

**Backend:** Node.js, Express, Prisma, MongoDB, JWT  
**Frontend:** React, Redux Toolkit, Tailwind CSS, shadcn/ui  
**Features:** YouTube API verification, click tracking, escrow management, fraud detection

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account

### Installation

```bash
# Clone repository
git clone <repository-url>
cd nanoreach-platform

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Configure environment (backend/.env)
DATABASE_URL="mongodb+srv://..."
JWT_SECRET="your-128-char-secret"
PORT=3001
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
YOUTUBE_API_KEY="your-youtube-api-key"

# Generate Prisma client
cd backend && npx prisma generate

# Start servers
npm run dev          # Backend (port 3001)
cd ../frontend && npm run dev    # Frontend (port 5173)
```

### Admin Setup

```bash
cd backend
node scripts/setupAdmin.js

# Login credentials:
# Email: admin@drkmttr.com
# Password: Admin@123
```

## Project Structure

```
nanoreach-platform/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middlewares/
│   └── scripts/setupAdmin.js
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        └── store/
```

## Key Features

- **Role-based Access:** Admin, Brand, and Influencer roles
- **Campaign Management:** Create, manage, and fund campaigns with escrow
- **Application System:** Influencers apply with their profiles
- **Referral Tracking:** Generate unique links with click analytics
- **YouTube Verification:** Automated metrics validation via YouTube API
- **Fraud Detection:** Multi-layer fraud scoring algorithms
- **Secure Authentication:** JWT with email verification
- **File Uploads:** Document verification with security checks

## API Endpoints

All endpoints are prefixed with `/api`

- **Auth:** `/auth/signup`, `/auth/login`, `/auth/logout`
- **Campaigns:** `/campaigns`, `/campaigns/:id`, `/campaigns/my`
- **Applications:** `/applications`, `/applications/my`
- **Submissions:** `/submissions`, `/submissions/my`
- **Referrals:** `/referral/generate/:id`, `/r/:code`
- **Admin:** `/admin/verifications/influencers`, `/admin/verifications/brands`

## Security

- bcrypt password hashing
- JWT tokens (HTTP-only cookies)
- Email verification flow
- Rate limiting on authentication
- Input validation and sanitization
- File upload security (magic number validation)
- Audit logging for compliance

## Development

```bash
# Backend
npm run dev          # Development with nodemon
npm start            # Production server

# Frontend  
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build

# Database
npx prisma studio    # Open database GUI
npx prisma db push   # Push schema changes
```

## License

MIT

## Author

Anand Mishra
