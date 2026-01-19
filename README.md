# DRK/MTTR Platform

A platform connecting brands with content creators for influencer marketing campaigns.

## Features

### Authentication
- User registration and login with JWT
- Role-based access control (BRAND, CREATOR, ADMIN)
- Secure password hashing with bcrypt
- HTTP-only cookies for session management

### Campaign Management
- Brands can create and manage campaigns
- Set prize pools and deadlines
- Public campaign listing with pagination
- Status-based filtering (ACTIVE, DRAFT, COMPLETED)
- Campaign editing and updates

### Submission System
- Creators can submit work to campaigns
- File upload support (images, videos, PDFs up to 100MB)
- Social media link integration
- Brands can approve/reject submissions
- Real-time submission status tracking

## Tech Stack

### Backend
- **Node.js** with Express 4
- **Prisma** ORM with MongoDB
- **JWT** for authentication
- **bcrypt** for password hashing
- **Multer** for file uploads
- **CORS** enabled for cross-origin requests

### Frontend
- **React 18** with Vite
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Framer Motion** for animations
- **Axios** for API requests

## Project Structure

```
drkmttr-platform/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Prisma client
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── campaignController.js
│   │   │   └── submissionController.js
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js  # JWT verification
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── campaignRoutes.js
│   │   │   └── submissionRoutes.js
│   │   ├── utils/
│   │   │   ├── hash.js            # Password hashing
│   │   │   └── generateToken.js   # JWT generation
│   │   ├── app.js                 # Express app config
│   │   └── server.js              # Entry point
│   ├── uploads/                   # File uploads directory
│   ├── .env                       # Environment variables
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/            # Reusable components
    │   ├── pages/                 # Page components
    │   ├── store/                 # Redux store
    │   ├── lib/                   # Utilities
    │   └── hooks/                 # Custom hooks
    ├── public/                    # Static assets
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd drkmttr-platform
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create `.env` file in backend directory:
```env
DATABASE_URL='your-mongodb-connection-string'
JWT_SECRET='your-secret-key'
PORT=3001
NODE_ENV=development
FRONTEND_URL='http://localhost:5173'
```

5. Generate Prisma client:
```bash
cd backend
npx prisma generate
```

6. Start the backend server:
```bash
npm run dev
```

7. In a new terminal, start the frontend:
```bash
cd frontend
npm run dev
```

Backend runs on `http://localhost:3001`
Frontend runs on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (protected)
- `GET /api/auth/me` - Get current user (protected)

### Campaigns
- `GET /api/campaigns` - Get all active campaigns (public, paginated)
- `GET /api/campaigns/my` - Get user's campaigns (BRAND only)
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns` - Create campaign (BRAND only)
- `PUT /api/campaigns/:id` - Update campaign (BRAND only)
- `GET /api/campaigns/:id/submissions` - Get campaign submissions (BRAND only)

### Submissions
- `POST /api/submissions` - Create submission with file upload (CREATOR only)
- `GET /api/submissions/my` - Get user's submissions (CREATOR only)
- `PUT /api/submissions/:id/approve` - Approve submission (BRAND only)
- `PUT /api/submissions/:id/reject` - Reject submission (BRAND only)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | MongoDB connection string | mongodb+srv://... |
| JWT_SECRET | Secret key for JWT signing | your-secret-key |
| PORT | Server port | 3001 |
| NODE_ENV | Environment | development/production |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiration
- HTTP-only cookies (XSS protection)
- CSRF protection with SameSite cookies
- Input validation and sanitization
- Request size limits (10MB)
- Role-based access control
- Cascade deletes for data integrity

## Development

### Backend Scripts

```bash
npm run dev    # Start development server with nodemon
npm start      # Start production server
```

### Frontend Scripts

```bash
npm run dev    # Start Vite development server
npm run build  # Build for production
npm run preview # Preview production build
```

### Database

To push schema changes to database:
```bash
npx prisma db push
```

To open Prisma Studio (database GUI):
```bash
npx prisma studio
```

## License

MIT

## Author

Anand Mishra
