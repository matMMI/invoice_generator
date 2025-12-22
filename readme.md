# Devis Generator - Setup and Run Guide

## Quick Start (Local Development)

### Prerequisites

- Python 3.14+
- Node.js 22+
- PostgreSQL (or Neon account for cloud database)

### 1. Setup Database (Neon)

1. Create a free Neon project at https://neon.tech
2. Copy your connection string (should include `?pgbouncer=true`)
3. Create `api/.env` file:

```bash
cp api/.env.example api/.env
```

4. Edit `api/.env` and paste your Neon connection string:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/devis_generator?sslmode=require&pgbouncer=true
BETTER_AUTH_SECRET=your-secret-key-here
BLOB_READ_WRITE_TOKEN=  # Optional for local dev
```

### 2. Initialize Database

```bash
cd api
source .venv/bin/activate
alembic upgrade head
```

### 3. Run Development Servers

**Terminal 1 - Backend (FastAPI)**:

```bash
cd api
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend (Next.js with Turbopack)**:

```bash
cd frontend
npm run dev --turbopack
```

Frontend: http://localhost:3000  
API Docs: http://localhost:8000/docs

## Project Structure

**⚠️ Note: This project uses a microservices architecture with two separate deployments**

```
invoice-generator/
├── Frontend (Next.js) - Deployed separately
│   ├── app/              # Next.js App Router
│   │   ├── auth/        # Better Auth routes (/auth/*)
│   │   ├── clients/     # Client management UI
│   │   └── quotes/      # Quote management UI
│   ├── components/      # React components
│   └── lib/             # API client, utilities
│
└── Backend (FastAPI) - Deployed separately
    ├── models/          # SQLModel database models
    ├── routers/         # API endpoints (/api/*)
    ├── services/        # Business logic
    ├── core/            # Config, security
    └── db/              # Database session, migrations
```

**Production URLs:**

- Frontend: `https://invoice-generator-frontend-three.vercel.app`
- Backend API: `https://invoice-generator-api.vercel.app`
- API Docs: `https://invoice-generator-api.vercel.app/api/docs`

**Local Development:**

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/api/docs`

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + Tailwind CSS + React Compiler
- **Backend**: FastAPI + SQLModel
- **Database**: Neon PostgreSQL (serverless)
- **Auth**: Better Auth
- **Storage**: Vercel Blob
- **Deployment**: Vercel (free tier)

## Available Commands

```bash
# Install dependencies
npm install                    # Root + frontend
cd api && pip install -r requirements.txt  # Backend

# Development
npm run dev                    # Start Next.js (from root)
cd api && uvicorn main:app --reload  # Start FastAPI

# Database
cd api && alembic revision --autogenerate -m "message"  # Create migration
cd api && alembic upgrade head   # Run migrations
cd api && alembic downgrade -1   # Rollback one migration

# Testing
npm test                       # Frontend tests
cd api && pytest              # Backend tests

# Deployment
vercel                        # Deploy to Vercel
```

## Next Steps

1. ✅ Project initialized with spec-kit methodology
2. ✅ Database models created (User, Client, Quote, QuoteItem)
3. ✅ Alembic migrations configured
4. ⏳ Create Neon database and run initial migration
5. ⏳ Implement Better Auth authentication
6. ⏳ Build Client Management CRUD
7. ⏳ Build Quote Creation with calculations
8. ⏳ Implement PDF generation with Vercel Blob

## Documentation

- [Constitution](/.specify/memory/constitution.md) - Project principles
- [Specification](/.specify/specs/001-devis-generator-mvp/spec.md) - Functional requirements
- [Technical Plan](/.specify/specs/001-devis-generator-mvp/plan.md) - Architecture
- [Tasks](/.specify/specs/001-devis-generator-mvp/tasks.md) - Implementation checklist

## Support

For issues or questions, refer to the spec-kit documentation in `.specify/`.
