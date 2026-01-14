# DRK/MTTR Platform

A platform connecting brands with content creators for influencer marketing campaigns.

## Features

### Authentication
- User registration and login with JWT
- Role-based access control (BRAND, CREATOR, ADMIN)
- Secure password hashing with bcrypt
- HTTP-only cookies for session management

### Campaign Management
- Brands can create campaigns with prize pools and deadlines
- Public campaign listing with pagination
- Status-based filtering (ACTIVE, DRAFT, COMPLETED)
- Input validation and sanitization

## Tech Stack

### Backend
- **Node.js** with Express 4
- **Prisma** ORM with MongoDB
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** enabled for cross-origin requests

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
│   │   │   ├── authController.js  # Auth logic
│   │   │   └── campaignController.js
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js  # JWT verification
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── campaignRoutes.js
│   │   ├── utils/
│   │   │   ├── hash.js            # Password hashing
│   │   │   └── generateToken.js   # JWT generation
│   │   ├── app.js                 # Express app config
│   │   └── server.js              # Entry point
│   ├── .env                       # Environment variables (not in git)
│   └── package.json
└── frontend/                      # (Coming soon)
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

3. Create `.env` file in backend directory:
```env
DATABASE_URL='your-mongodb-connection-string'
JWT_SECRET='your-secret-key'
PORT=3001
NODE_ENV=development
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Start the development server:
```bash
npm run dev
```

Server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (protected)
- `GET /api/auth/me` - Get current user (protected)

### Campaigns
- `GET /api/campaigns` - Get all active campaigns (public, paginated)
- `POST /api/campaigns` - Create campaign (BRAND only)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | MongoDB connection string | mongodb+srv://... |
| JWT_SECRET | Secret key for JWT signing | your-secret-key |
| PORT | Server port | 3001 |
| NODE_ENV | Environment | development/production |

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

### Available Scripts

```bash
npm run dev    # Start development server with nodemon
npm start      # Start production server
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

Your Name
