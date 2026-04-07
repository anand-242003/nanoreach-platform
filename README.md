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
NODE_ENV="production"
FRONTEND_URL="https://your-vercel-domain.vercel.app"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
YOUTUBE_API_KEY="your-youtube-api-key"

# Configure environment (frontend/.env)
VITE_API_URL="https://drkmttr-production-a4df.up.railway.app"
VITE_GOOGLE_CLIENT_ID="your-google-oauth-client-id"

# Generate Prisma client
cd backend && npx prisma generate

# Start servers
npm run dev          # Backend (port 3001)
cd ../frontend && npm run dev    # Frontend (port 5173)
```

### Data Setup

Use the backend API to create users and application data instead of local seed or setup scripts.

Common entry points:

```bash
POST /api/auth/signup
POST /api/auth/login
GET /api/admin/verifications/influencers
GET /api/admin/verifications/brands
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

## Deployment Notes (Vercel + Railway)

- For Railway backend, make sure service root directory is set to backend and start command is npm start.
- Add FRONTEND_URL in Railway exactly matching your Vercel domain, including https.
- Add VITE_API_URL in Vercel pointing to your Railway public domain.
- If signup returns Prisma P2010 with server selection timeout, fix MongoDB Atlas network access:
    - Whitelist Railway egress by allowing 0.0.0.0/0 in Atlas Network Access for testing, or set a strict allowlist if you have static IP.
    - Confirm your Atlas user and password in DATABASE_URL are URL encoded.
    - Use the Atlas SRV connection string with retryWrites=true and tls=true.


## License

MIT

## Author

Anand Mishra
