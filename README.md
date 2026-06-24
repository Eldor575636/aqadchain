# AqadChain — Halal Vehicle Financing Contracts

A Shariah-compliant vehicle financing contract SaaS platform for Muslim buyers and sellers in the United States. Supports Murabaha and Musawama structures with DocuSign e-signatures.

---

## Prerequisites

- Node.js v18+
- PostgreSQL 14+ (local or hosted — Railway, Supabase, etc.)
- Auth0 account (free tier works)
- DocuSign Developer account (sandbox)
- SendGrid account (free tier)
- AWS account with S3 bucket

---

## Project Structure

```
/aqadchain
  /frontend          React 18 app (Tailwind CSS, Auth0, React Router v6)
  /backend           Node.js / Express API (Prisma ORM, PostgreSQL)
  .env.example       Template for all required environment variables
  README.md
```

---

## Setup

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment variables

**Backend** — copy `.env.example` to `.env` and fill in all values:

```bash
cp ../.env.example backend/.env
```

**Frontend** — copy `.env.example` to `.env.local`:

```bash
cp frontend/.env.example frontend/.env.local
```

### 3. Database setup

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init --schema src/prisma/schema.prisma

# Optional: seed admin user
node src/prisma/seed.js
```

### 4. Auth0 configuration

1. Create an Auth0 Application (Single Page Application) for the frontend
2. Create an Auth0 API with audience matching `AUTH0_AUDIENCE` in your backend `.env`
3. Set allowed callback URLs: `http://localhost:3000/auth/callback`
4. Set allowed logout URLs: `http://localhost:3000`
5. Enable Google social connection

### 5. DocuSign configuration

1. Create a DocuSign Developer account at developer.docusign.com
2. Create an integration key (client ID) with JWT grant
3. Generate an RSA key pair; upload the public key to DocuSign, store private key in `DOCUSIGN_PRIVATE_KEY`
4. Impersonate your user ID by granting consent at: `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=YOUR_INTEGRATION_KEY&redirect_uri=https://example.com`

### 6. AWS S3 setup

1. Create an S3 bucket in your preferred region
2. Set bucket policy to private (access via pre-signed URLs only)
3. Create an IAM user with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` permissions on your bucket
4. Store the IAM credentials in your `.env`

---

## Running locally

```bash
# Terminal 1 — Backend API
cd backend
npm run dev
# API runs at http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm start
# App runs at http://localhost:3000
```

---

## Database commands

```bash
cd backend

# Apply migrations
npm run db:migrate

# Open Prisma Studio (GUI)
npm run db:studio

# Push schema without migration (dev only)
npm run db:push

# Seed database
npm run db:seed
```

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Deploy /build folder to Vercel
# Set REACT_APP_* environment variables in Vercel project settings
```

### Backend → Railway or Render

1. Push the `/backend` folder to a GitHub repo
2. Connect to Railway or Render
3. Set all environment variables from `.env.example`
4. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
5. Start command: `npm start`

---

## DocuSign webhook setup

After deploying your backend, configure a DocuSign Connect webhook:

1. In DocuSign admin → Connect → Add Configuration
2. URL: `https://your-backend.com/api/webhooks/docusign`
3. Events: `envelope-completed`, `envelope-declined`, `envelope-voided`, `recipient-completed`
4. Format: JSON

---

## API Overview

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/callback | Sync Auth0 user to database |
| GET | /api/auth/me | Get current user profile |
| PUT | /api/auth/profile | Update name/phone |
| PUT | /api/auth/onboarding | Mark onboarding complete |
| POST | /api/contracts | Create contract |
| GET | /api/contracts | List user's contracts |
| GET | /api/contracts/:id | Get contract detail |
| PUT | /api/contracts/:id | Update draft contract |
| DELETE | /api/contracts/:id | Cancel contract |
| POST | /api/contracts/:id/send | Send for DocuSign signature |
| GET | /api/contracts/:id/status | Get DocuSign status |
| POST | /api/contracts/:id/resend | Resend signature email |
| POST | /api/contracts/:id/download | Get signed PDF download URL |
| GET | /api/vehicles/lookup | Decode VIN + check recalls |
| POST | /api/calculator | Calculate payment schedule |
| POST | /api/webhooks/docusign | DocuSign Connect webhook |
| GET | /api/admin/users | (Admin) List all users |
| PUT | /api/admin/users/:id/kyc | (Admin) Update KYC status |
| GET | /api/admin/contracts | (Admin) List all contracts |
| GET | /api/admin/stats | (Admin) Platform statistics |

---

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router v6, Auth0 React SDK
- **Backend**: Node.js, Express 4, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: Auth0 (Google OAuth + email/password)
- **E-signatures**: DocuSign eSign API (JWT grant)
- **Email**: SendGrid transactional API
- **Storage**: AWS S3 (pre-signed URLs, server-side encryption)
- **Rate limiting**: express-rate-limit
- **Security**: Helmet.js, CORS, parameterized queries via Prisma
