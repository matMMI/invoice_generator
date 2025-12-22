# Implementation Tasks: Devis Generator MVP

**Feature**: Devis Generator MVP  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)  
**Created**: 2025-12-22

> [!IMPORTANT] > **Free Tier Constraints:**
>
> - Vercel Free: 10s max execution time for serverless functions
> - Neon Free: 0.5 GB storage, limited compute
> - Optimize for performance and minimal resource usage

## Phase 1: Project Foundation & Database Setup

### 1.1 Initialize Monorepo Structure

- [ ] Create `frontend/` directory
- [ ] Create `api/` directory
- [ ] Create root `package.json` with workspace config
- [ ] Initialize Next.js in `frontend/` with TypeScript and Tailwind CSS
- [ ] Initialize Python project in `api/` with `pyproject.toml`
- [ ] Create `vercel.json` with routing configuration
- [ ] Test local dev server startup (frontend + API)

**Files**: `/package.json`, `/vercel.json`, `/frontend/`, `/api/`

---

### 1.2 Setup Database (Neon PostgreSQL)

- [ ] Create Neon project (free tier)
- [ ] Copy connection string with `?pgbouncer=true` parameter
- [ ] Create `api/core/config.py` with settings (DATABASE_URL from env)
- [ ] Create `api/db/session.py` with SQLModel engine setup
- [ ] Install dependencies: `sqlmodel`, `psycopg2-binary`, `alembic`
- [ ] Initialize Alembic: `alembic init api/db/migrations`
- [ ] Configure `alembic.ini` to use DATABASE_URL from config

**Files**: `api/core/config.py`, `api/db/session.py`, `api/db/migrations/`

**Checkpoint**: Can connect to Neon database locally

---

### 1.3 Define Database Models (SQLModel)

- [ ] Create `api/models/enums.py` (Currency, QuoteStatus, DiscountType)
- [ ] Create `api/models/user.py` (User model)
- [ ] Create `api/models/client.py` (Client model)
- [ ] Create `api/models/quote.py` (Quote and QuoteItem models)
- [ ] Write tests for model validation (`api/tests/test_models.py`)
- [ ] Generate Alembic migration: `alembic revision --autogenerate -m "Initial schema"`
- [ ] Review migration file for correctness (indexes, constraints)
- [ ] Apply migration: `alembic upgrade head`

**Files**: `api/models/*.py`, `api/db/migrations/versions/001_initial_schema.py`

**Checkpoint**: Database tables created in Neon, schema matches ERD

---

## Phase 2: Authentication (Better Auth) - P1

### 2.1 Setup Better Auth Backend

- [ ] Install Better Auth in `frontend/`: `npm install better-auth`
- [ ] Create `frontend/lib/auth.ts` with Better Auth config
- [ ] Create `frontend/app/api/auth/[...all]/route.ts` handler
- [ ] Configure email/password provider
- [ ] Add `BETTER_AUTH_SECRET` to `.env.local`
- [ ] Test signup endpoint: `POST /api/auth/signup`
- [ ] Test login endpoint: `POST /api/auth/login`

**Files**: `frontend/lib/auth.ts`, `frontend/app/api/auth/[...all]/route.ts`

**Checkpoint**: Can create account and login via API

---

### 2.2 Create Auth UI Components

- [ ] Create `frontend/app/(auth)/layout.tsx` (centered auth layout)
- [ ] Create `frontend/app/(auth)/signup/page.tsx` (signup form)
- [ ] Create `frontend/app/(auth)/login/page.tsx` (login form)
- [ ] Create `frontend/components/ui/Input.tsx` (reusable input component)
- [ ] Create `frontend/components/ui/Button.tsx` (reusable button component)
- [ ] Add form validation with Zod (`frontend/lib/validations/auth.ts`)
- [ ] Implement error handling and display
- [ ] Add loading states

**Files**: `frontend/app/(auth)/*.tsx`, `frontend/components/ui/*.tsx`

**Checkpoint**: Can sign up and login via UI, redirects to dashboard

---

### 2.3 Protect Routes and Get Current User

- [ ] Create `frontend/lib/auth-client.ts` with `useSession()` hook
- [ ] Create `frontend/app/(dashboard)/layout.tsx` with auth check
- [ ] Redirect unauthenticated users to `/login`
- [ ] Create `api/core/security.py` with `get_current_user()` dependency
- [ ] Integrate Better Auth JWT validation in FastAPI
- [ ] Test protected API endpoint requires valid JWT

**Files**: `frontend/lib/auth-client.ts`, `api/core/security.py`

**Checkpoint**: Dashboard routes protected, API validates JWT tokens

---

## Phase 3: Client Management (CRUD) - P1

### 3.1 Backend: Client API Endpoints

- [ ] Create `api/schemas/client.py` (Pydantic request/response schemas)
- [ ] Create `api/services/client_service.py` (business logic)
- [ ] Create `api/routers/clients.py` with endpoints:
  - [ ] `GET /clients` (list, paginated, filtered by user)
  - [ ] `GET /clients/{id}` (get single client)
  - [ ] `POST /clients` (create client)
  - [ ] `PUT /clients/{id}` (update client)
  - [ ] `DELETE /clients/{id}` (prevent if has quotes)
- [ ] Write unit tests: `api/tests/test_clients.py`
- [ ] Register router in `api/main.py`

**Files**: `api/schemas/client.py`, `api/services/client_service.py`, `api/routers/clients.py`

**Checkpoint**: All client endpoints tested and working

---

### 3.2 Frontend: Client List Page

- [ ] Create `frontend/app/(dashboard)/clients/page.tsx`
- [ ] Create `frontend/components/clients/ClientList.tsx`
- [ ] Create `frontend/components/clients/ClientCard.tsx`
- [ ] Fetch clients from API using SWR
- [ ] Implement search functionality (filter by name/email)
- [ ] Add "New Client" button linking to `/clients/new`
- [ ] Style with Tailwind CSS (responsive grid)

**Files**: `frontend/app/(dashboard)/clients/page.tsx`, `frontend/components/clients/*.tsx`

**Checkpoint**: Can view list of clients with search

---

### 3.3 Frontend: Create/Edit Client Form

- [ ] Create `frontend/app/(dashboard)/clients/new/page.tsx`
- [ ] Create `frontend/app/(dashboard)/clients/[id]/page.tsx` (view/edit)
- [ ] Create `frontend/components/clients/ClientForm.tsx`
- [ ] Add form validation with Zod (`frontend/lib/validations/client.ts`)
- [ ] Use React Hook Form for form state
- [ ] Implement create client (POST)
- [ ] Implement update client (PUT)
- [ ] Implement delete client with confirmation modal
- [ ] Handle API errors (e.g., delete client with quotes)
- [ ] Add success notifications

**Files**: `frontend/app/(dashboard)/clients/[id]/page.tsx`, `frontend/components/clients/ClientForm.tsx`

**Checkpoint**: Can create, edit, and delete clients via UI

---

## Phase 4: Quote Creation with Line Items - P1

### 4.1 Backend: Quote API Endpoints

- [ ] Create `api/schemas/quote.py` (Quote, QuoteItem schemas)
- [ ] Create `api/services/quote_service.py` with business logic:
  - [ ] Auto-generate quote number (`QUO-YYYY-NNNN`)
  - [ ] Calculate subtotal, discount, tax, total
  - [ ] Validate discount (0-100% or ≤ subtotal for fixed)
- [ ] Create `api/routers/quotes.py` with endpoints:
  - [ ] `GET /quotes` (list, paginated, filterable by status)
  - [ ] `GET /quotes/{id}` (get quote with items)
  - [ ] `POST /quotes` (create quote with items)
  - [ ] `PUT /quotes/{id}` (update quote)
  - [ ] `DELETE /quotes/{id}`
  - [ ] `POST /quotes/{id}/items` (add item)
  - [ ] `PUT /quotes/{id}/items/{item_id}` (update item)
  - [ ] `DELETE /quotes/{id}/items/{item_id}` (delete item)
  - [ ] `PATCH /quotes/{id}/status` (update status)
- [ ] Write tests: `api/tests/test_quotes.py` (test calculations!)
- [ ] Register router in `api/main.py`

**Files**: `api/schemas/quote.py`, `api/services/quote_service.py`, `api/routers/quotes.py`

**Checkpoint**: Quote endpoints working, calculations accurate

---

### 4.2 Frontend: Quote List Page

- [ ] Create `frontend/app/(dashboard)/quotes/page.tsx`
- [ ] Create `frontend/components/quotes/QuoteList.tsx`
- [ ] Create `frontend/components/quotes/QuoteCard.tsx`
- [ ] Display quote number, client, total, currency, status
- [ ] Add filters (by status: Draft, Sent, Accepted, Rejected)
- [ ] Add "New Quote" button
- [ ] Style status badges with colors

**Files**: `frontend/app/(dashboard)/quotes/page.tsx`, `frontend/components/quotes/*.tsx`

**Checkpoint**: Can view list of quotes with filters

---

### 4.3 Frontend: Quote Creation Form (Complex!)

- [ ] Create `frontend/app/(dashboard)/quotes/new/page.tsx`
- [ ] Create `frontend/components/quotes/QuoteForm.tsx` (main form)
- [ ] Create `frontend/components/quotes/QuoteItemEditor.tsx` (line items)
- [ ] Create `frontend/components/quotes/QuoteSummary.tsx` (totals display)
- [ ] Add client selector dropdown (autocomplete)
- [ ] Add currency selector (EUR, USD, GBP, CHF, CAD)
- [ ] Implement dynamic line item add/remove
- [ ] Calculate subtotal in real-time (client-side)
- [ ] Add discount type selector (percentage/fixed)
- [ ] Calculate tax and total in real-time
- [ ] Add form validation with Zod
- [ ] Handle form submission (POST /quotes)
- [ ] Redirect to quote details on success

**Files**: `frontend/app/(dashboard)/quotes/new/page.tsx`, `frontend/components/quotes/*.tsx`

**Checkpoint**: Can create quote with multiple line items, calculations accurate

---

### 4.4 Frontend: Quote Details & Edit

- [ ] Create `frontend/app/(dashboard)/quotes/[id]/page.tsx`
- [ ] Display full quote details (read-only view)
- [ ] Display line items table
- [ ] Show formatted totals with currency symbol
- [ ] Add "Edit" button (reuse QuoteForm component)
- [ ] Add "Delete" button with confirmation
- [ ] Add status update dropdown
- [ ] Add "Generate PDF" button (placeholder for Phase 5)

**Files**: `frontend/app/(dashboard)/quotes/[id]/page.tsx`

**Checkpoint**: Can view and edit existing quotes

---

## Phase 5: PDF Generation & Vercel Blob - P2

### 5.1 Setup Vercel Blob Storage

- [ ] Create Vercel Blob store (via Vercel dashboard)
- [ ] Copy `BLOB_READ_WRITE_TOKEN` to environment variables
- [ ] Install `@vercel/blob` in `frontend/`: `npm install @vercel/blob`
- [ ] Install `httpx` in `api/`: `pip install httpx`
- [ ] Create `api/core/blob.py` with upload helper function
- [ ] Test blob upload with dummy file

**Files**: `api/core/blob.py`

**Checkpoint**: Can upload files to Vercel Blob

---

### 5.2 Backend: PDF Generation Service

- [ ] Install ReportLab: `pip install reportlab`
- [ ] Create `api/services/pdf_service.py`
- [ ] Implement `generate_quote_pdf(quote_id)`:
  - [ ] Fetch quote with client and items
  - [ ] Create PDF with ReportLab (A4, professional layout)
  - [ ] Add business header (logo placeholder)
  - [ ] Add client info block
  - [ ] Add quote number and date
  - [ ] Add line items table
  - [ ] Add totals section (subtotal, discount, tax, total)
  - [ ] Add notes and payment terms
- [ ] Upload PDF to Vercel Blob
- [ ] Return Blob URL
- [ ] **Optimize for < 10s execution** (Vercel free tier limit!)
- [ ] Write tests: `api/tests/test_pdf.py`

**Files**: `api/services/pdf_service.py`

**Checkpoint**: PDF generated successfully within 10s

---

### 5.3 Backend: PDF Generation Endpoint

- [ ] Create `api/routers/pdf.py`
- [ ] Add endpoint: `POST /quotes/{id}/generate-pdf`
- [ ] Call `pdf_service.generate_quote_pdf()`
- [ ] Update quote record with `pdf_url`
- [ ] Return PDF URL in response
- [ ] Handle errors (e.g., Blob upload fails)
- [ ] Register router in `api/main.py`

**Files**: `api/routers/pdf.py`

**Checkpoint**: Can generate PDF via API endpoint

---

### 5.4 Frontend: PDF Generation & Download

- [ ] Update `frontend/app/(dashboard)/quotes/[id]/page.tsx`
- [ ] Implement "Generate PDF" button click handler
- [ ] Call `POST /quotes/{id}/generate-pdf`
- [ ] Show loading spinner during generation
- [ ] Display PDF preview (optional: use `react-pdf`)
- [ ] Add "Download PDF" button (link to Blob URL)
- [ ] Handle errors (network issues, timeout)

**Files**: `frontend/app/(dashboard)/quotes/[id]/page.tsx`

**Checkpoint**: Can generate and download PDFs from UI

---

## Phase 6: Dashboard & Polish - P3

### 6.1 Dashboard Overview Page

- [ ] Create `frontend/app/(dashboard)/page.tsx`
- [ ] Create `frontend/components/dashboard/MetricsCard.tsx`
- [ ] Fetch dashboard data from API (new endpoint: `GET /dashboard/metrics`)
- [ ] Display metrics:
  - [ ] Total quotes count
  - [ ] Total value by status (grouped by currency)
  - [ ] Quotes by status (pie chart or counts)
  - [ ] Recent quotes list (last 5)
- [ ] Add charts (optional: use Recharts or Chart.js)

**Files**: `frontend/app/(dashboard)/page.tsx`, `api/routers/dashboard.py`

**Checkpoint**: Dashboard displays accurate metrics

---

### 6.2 Navigation & Layout

- [ ] Create `frontend/components/layout/Sidebar.tsx`
- [ ] Create `frontend/components/layout/Header.tsx`
- [ ] Add navigation links (Dashboard, Clients, Quotes)
- [ ] Add user menu (profile, logout)
- [ ] Highlight active route
- [ ] Make responsive (mobile hamburger menu)

**Files**: `frontend/components/layout/*.tsx`

**Checkpoint**: Clean navigation between pages

---

### 6.3 Final Polish & Optimization

- [ ] Add loading skeletons for all data fetching
- [ ] Add empty states (no clients, no quotes)
- [ ] Implement pagination for clients and quotes (20 per page)
- [ ] Add toast notifications for success/error messages
- [ ] Optimize images with Next.js Image component
- [ ] Run Lighthouse audit (target scores: Performance > 80, Accessibility > 90)
- [ ] Fix any accessibility issues (ARIA labels, keyboard navigation)
- [ ] Test on mobile devices (responsive design)

**Files**: Various

**Checkpoint**: App is polished and performs well

---

## Phase 7: Testing & Deployment

### 7.1 Backend Testing

- [ ] Ensure 80%+ test coverage: `pytest --cov=api`
- [ ] Fix any failing tests
- [ ] Test edge cases (discount validation, client deletion with quotes)
- [ ] Performance test: Quote creation < 500ms
- [ ] Performance test: PDF generation < 10s (critical for Vercel free tier!)

**Checkpoint**: All backend tests passing, coverage ≥ 80%

---

### 7.2 Frontend Testing

- [ ] Write component tests for key components (QuoteForm, ClientForm)
- [ ] Test form validation logic
- [ ] Test calculation logic (quote totals)
- [ ] Ensure 70%+ coverage: `npm test -- --coverage`
- [ ] Fix any failing tests

**Checkpoint**: All frontend tests passing, coverage ≥ 70%

---

### 7.3 Deploy to Vercel

- [ ] Connect GitHub repo to Vercel
- [ ] Configure environment variables in Vercel dashboard:
  - [ ] `DATABASE_URL` (Neon connection string)
  - [ ] `BLOB_READ_WRITE_TOKEN`
  - [ ] `BETTER_AUTH_SECRET`
  - [ ] `NEXT_PUBLIC_API_URL`
- [ ] Trigger deployment
- [ ] Verify build succeeds
- [ ] Test deployed app (full user journey)
- [ ] Verify PDF generation works in production (< 10s)
- [ ] Check Neon database connections (pooling working correctly)

**Checkpoint**: App deployed and functional on Vercel

---

### 7.4 Final Verification

- [ ] Create test account on production
- [ ] Create 2 test clients
- [ ] Create 3 test quotes (different currencies)
- [ ] Generate PDFs for all quotes
- [ ] Download PDFs and verify content
- [ ] Test status updates
- [ ] Test delete validations
- [ ] Run Lighthouse on production URL
- [ ] Document any known issues or limitations

**Checkpoint**: Production app verified and ready for use

---

## Summary

**Total Tasks**: ~90 tasks across 7 phases  
**Estimated Duration**: 3-5 days for experienced developer  
**Critical Path**: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

**Free Tier Considerations**:

- Keep PDF generation optimized (< 10s for Vercel)
- Monitor Neon storage (< 0.5 GB for free tier)
- Use efficient queries and indexes
- Consider pagination to reduce data transfer

**Next Step**: Run `/speckit.implement` to execute these tasks systematically.
