# Technical Implementation Plan: Devis Generator MVP

**Feature**: Devis Generator MVP  
**Spec Reference**: [spec.md](./spec.md)  
**Created**: 2025-12-22  
**Status**: Draft

## Overview

This plan details the technical implementation of the Devis Generator MVP, a serverless quote management application deployed on Vercel. The architecture follows a monorepo structure with Next.js (frontend) and FastAPI (backend) sharing a single repository.

## Technology Stack

### Frontend

- **Framework**: Next.js 14+ (App Router, React Server Components)
- **UI**: React 19
- **Styling**: Tailwind CSS
- **State Management**: React Context + SWR for data fetching
- **Forms**: React Hook Form + Zod validation
- **Authentication**: Better Auth (https://www.better-auth.com/)
- **PDF Preview**: @react-pdf/renderer or react-pdf

### Backend

- **Framework**: FastAPI (Python 3.14)
- **ORM**: SQLModel (combines SQLAlchemy + Pydantic)
- **Database**: Neon PostgreSQL (serverless, PgBouncer connection pooling)
- **Migrations**: Alembic
- **PDF Generation**: ReportLab or WeasyPrint (HTML/CSS to PDF)
- **File Storage**: Vercel Blob (for PDFs)
- **Authentication**: Better Auth backend integration

### DevOps & Deployment

- **Platform**: Vercel
- **CI/CD**: GitHub Actions (linting, testing)
- **Environment Management**: Vercel environment variables

## Architecture

### Monorepo Structure

```
devis_generator/
├── .specify/                    # Spec-kit artifacts
│   ├── memory/
│   │   └── constitution.md
│   ├── specs/
│   │   └── 001-devis-generator-mvp/
│   │       ├── spec.md
│   │       ├── plan.md (this file)
│   │       └── tasks.md (to be generated)
│   └── templates/
├── frontend/                    # Next.js application
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx      # Dashboard layout with nav
│   │   │   ├── page.tsx        # Dashboard home (P3)
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx    # Client list (P1)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx # Client details
│   │   │   │   └── new/
│   │   │   │       └── page.tsx # Create client
│   │   │   └── quotes/
│   │   │       ├── page.tsx    # Quote list
│   │   │       ├── [id]/
│   │   │       │   └── page.tsx # Quote details
│   │   │       └── new/
│   │   │           └── page.tsx # Create quote (P1)
│   │   ├── api/                # Next.js API routes (Better Auth endpoints)
│   │   │   └── auth/
│   │   │       └── [...all]/route.ts
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── ui/                 # Reusable UI components (buttons, inputs, cards)
│   │   ├── clients/            # Client-specific components
│   │   │   ├── ClientForm.tsx
│   │   │   └── ClientList.tsx
│   │   └── quotes/             # Quote-specific components
│   │       ├── QuoteForm.tsx
│   │       ├── QuoteItemEditor.tsx
│   │       └── QuoteSummary.tsx
│   ├── lib/
│   │   ├── api.ts              # API client (fetch wrapper)
│   │   ├── auth.ts             # Better Auth client config
│   │   ├── utils.ts            # Utility functions
│   │   └── validations/        # Zod schemas
│   │       ├── client.ts
│   │       └── quote.ts
│   ├── public/
│   │   └── logo.png
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.js
├── api/                        # FastAPI backend (Vercel Serverless Functions)
│   ├── main.py                 # Entry point for Vercel
│   ├── routers/
│   │   ├── clients.py          # Client CRUD endpoints
│   │   ├── quotes.py           # Quote CRUD endpoints
│   │   ├── pdf.py              # PDF generation endpoint
│   │   └── auth.py             # Better Auth backend hooks (if needed)
│   ├── models/
│   │   ├── user.py             # User SQLModel
│   │   ├── client.py           # Client SQLModel
│   │   ├── quote.py            # Quote & QuoteItem SQLModel
│   │   └── enums.py            # Currency, QuoteStatus enums
│   ├── schemas/
│   │   ├── client.py           # Pydantic request/response schemas
│   │   └── quote.py
│   ├── services/
│   │   ├── client_service.py   # Business logic for clients
│   │   ├── quote_service.py    # Business logic for quotes
│   │   └── pdf_service.py      # PDF generation logic
│   ├── db/
│   │   ├── session.py          # Database session management (Neon)
│   │   └── migrations/         # Alembic migrations
│   │       └── versions/
│   ├── core/
│   │   ├── config.py           # Settings (env vars)
│   │   ├── security.py         # Better Auth integration
│   │   └── exceptions.py       # Custom exceptions
│   ├── tests/
│   │   ├── test_clients.py
│   │   ├── test_quotes.py
│   │   └── test_pdf.py
│   ├── requirements.txt
│   └── pyproject.toml
├── vercel.json                 # Vercel deployment config
├── .gitignore
├── README.md
└── package.json                # Root package.json (workspace config)
```

### Deployment Configuration (`vercel.json`)

```json
{
  "buildCommand": "cd frontend && npm run build",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "npm install --prefix frontend && pip install -r api/requirements.txt",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/v1/:path*",
      "destination": "/api/main.py"
    }
  ],
  "functions": {
    "api/main.py": {
      "runtime": "python3.12",
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database_url",
    "BLOB_READ_WRITE_TOKEN": "@blob_read_write_token",
    "BETTER_AUTH_SECRET": "@better_auth_secret"
  }
}
```

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ CLIENT : "owns"
    USER ||--o{ QUOTE : "creates"
    CLIENT ||--o{ QUOTE : "receives"
    QUOTE ||--|{ QUOTE_ITEM : "contains"

    USER {
        uuid id PK
        string email UK
        string password_hash
        string name
        string business_name
        string logo_url
        timestamp created_at
        timestamp updated_at
    }

    CLIENT {
        uuid id PK
        uuid user_id FK
        string name
        string email
        string company
        text address
        string phone
        string vat_number
        timestamp created_at
        timestamp updated_at
    }

    QUOTE {
        uuid id PK
        string quote_number UK
        uuid user_id FK
        uuid client_id FK
        string currency
        string status
        decimal subtotal
        string discount_type
        decimal discount_value
        decimal tax_rate
        decimal tax_amount
        decimal total
        string pdf_url
        text notes
        text payment_terms
        timestamp created_at
        timestamp updated_at
        timestamp sent_at
    }

    QUOTE_ITEM {
        uuid id PK
        uuid quote_id FK
        text description
        decimal quantity
        decimal unit_price
        decimal total
        int order
        timestamp created_at
        timestamp updated_at
    }
```

### SQLModel Definitions

**`api/models/user.py`**

```python
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime

class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    name: str
    business_name: str | None = None
    logo_url: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**`api/models/client.py`**

```python
from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime

class Client(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    name: str
    email: str
    company: str | None = None
    address: str | None = None
    phone: str | None = None
    vat_number: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**`api/models/quote.py`**

```python
from sqlmodel import SQLModel, Field, Relationship
from decimal import Decimal
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum

class Currency(str, Enum):
    EUR = "EUR"
    USD = "USD"
    GBP = "GBP"
    CHF = "CHF"
    CAD = "CAD"

class QuoteStatus(str, Enum):
    DRAFT = "Draft"
    SENT = "Sent"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"

class DiscountType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"

class Quote(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quote_number: str = Field(unique=True, index=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    client_id: UUID = Field(foreign_key="client.id", index=True)
    currency: Currency = Field(default=Currency.EUR)
    status: QuoteStatus = Field(default=QuoteStatus.DRAFT)
    subtotal: Decimal = Field(default=Decimal("0.00"), max_digits=12, decimal_places=2)
    discount_type: DiscountType | None = None
    discount_value: Decimal | None = Field(default=None, max_digits=12, decimal_places=2)
    tax_rate: Decimal = Field(default=Decimal("20.00"), max_digits=5, decimal_places=2)
    tax_amount: Decimal = Field(default=Decimal("0.00"), max_digits=12, decimal_places=2)
    total: Decimal = Field(default=Decimal("0.00"), max_digits=12, decimal_places=2)
    pdf_url: str | None = None
    notes: str | None = None
    payment_terms: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    sent_at: datetime | None = None

    items: list["QuoteItem"] = Relationship(back_populates="quote")

class QuoteItem(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quote_id: UUID = Field(foreign_key="quote.id", index=True)
    description: str
    quantity: Decimal = Field(max_digits=10, decimal_places=2)
    unit_price: Decimal = Field(max_digits=12, decimal_places=2)
    total: Decimal = Field(max_digits=12, decimal_places=2)
    order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    quote: Quote = Relationship(back_populates="items")
```

## API Design

### Base URL

- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://yourdomain.vercel.app/api/v1`

### Endpoints

#### Clients

| Method | Path            | Description                  | Auth Required |
| ------ | --------------- | ---------------------------- | ------------- |
| GET    | `/clients`      | List all clients (paginated) | ✅            |
| GET    | `/clients/{id}` | Get client by ID             | ✅            |
| POST   | `/clients`      | Create new client            | ✅            |
| PUT    | `/clients/{id}` | Update client                | ✅            |
| DELETE | `/clients/{id}` | Delete client                | ✅            |

#### Quotes

| Method | Path                           | Description                                       | Auth Required |
| ------ | ------------------------------ | ------------------------------------------------- | ------------- |
| GET    | `/quotes`                      | List all quotes (paginated, filterable by status) | ✅            |
| GET    | `/quotes/{id}`                 | Get quote by ID (includes items)                  | ✅            |
| POST   | `/quotes`                      | Create new quote                                  | ✅            |
| PUT    | `/quotes/{id}`                 | Update quote                                      | ✅            |
| DELETE | `/quotes/{id}`                 | Delete quote                                      | ✅            |
| POST   | `/quotes/{id}/items`           | Add item to quote                                 | ✅            |
| PUT    | `/quotes/{id}/items/{item_id}` | Update quote item                                 | ✅            |
| DELETE | `/quotes/{id}/items/{item_id}` | Delete quote item                                 | ✅            |
| POST   | `/quotes/{id}/generate-pdf`    | Generate PDF for quote                            | ✅            |
| GET    | `/quotes/{id}/pdf`             | Get PDF URL                                       | ✅            |
| PATCH  | `/quotes/{id}/status`          | Update quote status                               | ✅            |

### Example Request/Response

**POST `/api/v1/quotes`**

Request body:

```json
{
  "client_id": "uuid",
  "currency": "EUR",
  "items": [
    {
      "description": "Website development",
      "quantity": 1,
      "unit_price": 5000
    },
    { "description": "SEO optimization", "quantity": 10, "unit_price": 150 }
  ],
  "discount_type": "percentage",
  "discount_value": 10,
  "tax_rate": 20,
  "notes": "Payment due within 30 days",
  "payment_terms": "Bank transfer to IBAN: ..."
}
```

Response (201 Created):

```json
{
  "id": "uuid",
  "quote_number": "QUO-2025-0001",
  "client_id": "uuid",
  "currency": "EUR",
  "status": "Draft",
  "subtotal": 6500.00,
  "discount_type": "percentage",
  "discount_value": 10,
  "tax_rate": 20,
  "tax_amount": 1170.00,
  "total": 7020.00,
  "items": [...],
  "created_at": "2025-12-22T12:00:00Z",
  "updated_at": "2025-12-22T12:00:00Z"
}
```

## Authentication Flow (Better Auth)

### Setup

1. Install Better Auth in `frontend/`:

   ```bash
   npm install better-auth
   ```

2. Configure Better Auth in `frontend/lib/auth.ts`:

   ```typescript
   import { betterAuth } from "better-auth";

   export const auth = betterAuth({
     database: {
       provider: "pg",
       url: process.env.DATABASE_URL,
     },
     socialProviders: {
       google: {
         clientId: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
       },
     },
   });
   ```

3. Create API route handler in `frontend/app/api/auth/[...all]/route.ts`:
   ```typescript
   import { auth } from "@/lib/auth";
   ```

export const { GET, POST } = auth.handler

````

### Frontend Integration

Use Better Auth React hooks:
```typescript
import { useSession, signIn, signOut } from "better-auth/react"

function LoginPage() {
const { session, loading } = useSession()

if (loading) return <div>Loading...</div>
if (session) return <Redirect to="/dashboard" />

return (
 <button onClick={() => signIn("credentials", { email, password })}>
   Sign In
 </button>
)
}
````

### Backend Integration

Protect FastAPI routes with Better Auth middleware:

```python
from fastapi import Depends, HTTPException
from api.core.security import get_current_user

@router.get("/clients")
async def list_clients(user: User = Depends(get_current_user)):
    # Only return clients owned by this user
    return client_service.list_by_user(user.id)
```

## PDF Generation

### Approach: Server-Side with ReportLab

**Pros**:

- Full control over PDF layout
- No browser dependencies
- Works in serverless environment

**Implementation**:

```python
# api/services/pdf_service.py
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO
import httpx  # For uploading to Vercel Blob

async def generate_quote_pdf(quote: Quote) -> str:
    """Generate PDF and upload to Vercel Blob. Returns Blob URL."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []

    # Add company header, client info, quote details, line items table
    # ... (ReportLab code)

    doc.build(elements)
    buffer.seek(0)

    # Upload to Vercel Blob
    async with httpx.AsyncClient() as client:
        response = await client.put(
            f"https://blob.vercel-storage.com/{quote.quote_number}.pdf",
            headers={"Authorization": f"Bearer {settings.BLOB_TOKEN}"},
            content=buffer.read()
        )

    return response.json()["url"]
```

## Neon PostgreSQL Connection Pooling

### Configuration

Use `@vercel/postgres` for automatic connection pooling:

```python
# api/db/session.py
from sqlmodel import create_engine, Session
from api.core.config import settings

# Neon serverless driver with pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,         # Small pool for serverless
    max_overflow=0       # No overflow in serverless
)

def get_session():
    with Session(engine) as session:
        yield session
```

### Environment Variable

```
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/devis_generator?sslmode=require&pgbouncer=true
```

The `pgbouncer=true` parameter enables Neon's built-in connection pooler.

## Testing Strategy

### Backend Tests (pytest)

```python
# api/tests/test_quotes.py
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_create_quote():
    response = client.post("/api/v1/quotes", json={
        "client_id": "test-uuid",
        "currency": "EUR",
        "items": [{"description": "Test", "quantity": 1, "unit_price": 100}]
    })
    assert response.status_code == 201
    data = response.json()
    assert data["subtotal"] == 100
    assert data["total"] == 120  # With 20% tax
```

### Frontend Tests (Jest + React Testing Library)

```typescript
// frontend/components/quotes/__tests__/QuoteForm.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import QuoteForm from "../QuoteForm";

test("calculates quote total correctly", () => {
  render(<QuoteForm />);

  fireEvent.change(screen.getByLabelText("Unit Price"), {
    target: { value: "100" },
  });
  fireEvent.change(screen.getByLabelText("Quantity"), {
    target: { value: "2" },
  });

  expect(screen.getByText("Total: €240.00")).toBeInTheDocument(); // 200 + 20% tax
});
```

## Migration Strategy

### Initial Migration (Alembic)

```bash
cd api
alembic init migrations
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

### Migration Files

```python
# api/db/migrations/versions/001_initial_schema.py
def upgrade():
    op.create_table(
        'user',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        # ... other columns
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    # ... other tables
```

## Environment Variables

### Required Variables

| Variable                | Description                       | Example                               |
| ----------------------- | --------------------------------- | ------------------------------------- |
| `DATABASE_URL`          | Neon PostgreSQL connection string | `postgresql://...?pgbouncer=true`     |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob API token             | `vercel_blob_rw_...`                  |
| `BETTER_AUTH_SECRET`    | Secret for Better Auth sessions   | Random 32-char string                 |
| `NEXT_PUBLIC_API_URL`   | API base URL                      | `/api/v1` (dev), `https://...` (prod) |
| `GOOGLE_CLIENT_ID`      | OAuth Google client ID (optional) | `...apps.googleusercontent.com`       |
| `GOOGLE_CLIENT_SECRET`  | OAuth Google secret (optional)    | `GOCSPX-...`                          |

### Setting Variables in Vercel

```bash
vercel env add DATABASE_URL production
vercel env add BLOB_READ_WRITE_TOKEN production
vercel env add BETTER_AUTH_SECRET production
```

## Performance Considerations

### Frontend Optimizations

- Use Next.js Image component for logo/images
- Implement React.lazy() for heavy components (PDF preview)
- Use SWR for client-side caching of API responses
- Enable Next.js incremental static regeneration (ISR) for dashboard stats

### Backend Optimizations

- Use SQLModel eager loading for quote.items relationships
- Add database indexes on frequently queried fields (user_id, client_id, quote_number)
- Cache quote totals calculations (or compute on save)
- Implement pagination for all list endpoints (default: 20 items per page)

### Database Optimizations

- Index foreign keys (user_id, client_id)
- Index quote_number (unique constraint already creates index)
- Add composite index on (user_id, status) for filtered queries

## Verification Plan

### Phase 1: Database & Backend API Testing

1. Run Alembic migrations locally with Docker Postgres first
2. Seed test data (2 users, 5 clients, 10 quotes)
3. Test all API endpoints with curl/Postman:
   - Create client → verify in DB
   - Create quote with 3 items → verify calculations
   - Generate PDF → verify Blob upload
4. Run pytest suite: `pytest api/tests/ --cov`
5. Verify 80%+ code coverage

### Phase 2: Frontend Testing

1. Build Next.js app: `npm run build`
2. Start dev server: `npm run dev`
3. Manual testing:
   - Sign up → create account
   - Create client → verify form validation
   - Create quote → verify line item editor
   - Generate PDF → verify download
4. Run frontend tests: `npm test`
5. Verify 70%+ component coverage

### Phase 3: Integration Testing

1. Deploy to Vercel preview branch
2. Verify environment variables are set
3. Test full user journey:
   - Sign up → Verify email → Login
   - Create 2 clients
   - Create 3 quotes (different currencies)
   - Generate PDFs for all quotes
   - Verify PDFs are accessible via Blob URLs
4. Test error scenarios:
   - Create quote with > 100% discount → verify validation error
   - Delete client with quotes → verify error message
   - Generate PDF with network timeout → verify error handling

### Phase 4: Performance Testing

1. Use Lighthouse to test dashboard:
   - FCP < 1.5s
   - LCP < 2.5s
   - TTI < 3.5s
2. Load test API endpoints (100 concurrent requests):
   - GET /quotes < 200ms response time
   - POST /quotes < 500ms response time
3. Verify Neon connection pooling handles concurrent requests without errors

---

**Review Checklist**:

- [ ] Monorepo structure is clearly defined
- [ ] Database schema matches functional requirements
- [ ] API endpoints cover all user stories
- [ ] Better Auth integration is documented
- [ ] PDF generation approach is feasible in serverless environment
- [ ] Neon connection pooling is configured correctly
- [ ] Environment variables are documented
- [ ] Testing strategy covers unit, integration, and E2E tests
- [ ] Performance budgets are defined
- [ ] Migration strategy is in place (Alembic)
