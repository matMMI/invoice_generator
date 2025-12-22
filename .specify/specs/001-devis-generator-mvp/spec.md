# Feature Specification: Devis Generator MVP

**Feature Branch**: `001-devis-generator-mvp`  
**Created**: 2025-12-22  
**Status**: Draft  
**Input**: User description: "Create a professional quote/invoice generation SaaS application with client management, quote creation with multi-currency support, PDF generation, and cloud storage. Deployed on Vercel with serverless architecture (Next.js + FastAPI + Neon PostgreSQL)."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Client Management (Priority: P1)

As a freelance developer or agency owner, I need to manage my client information in a centralized location so that I can easily reference client details when creating quotes.

**Why this priority**: This is the foundation of the application. Without clients, there can be no quotes. It's the first data entity users will interact with and must be rock-solid.

**Independent Test**: Can be fully tested by creating, viewing, updating, and deleting a client without any other features implemented. Delivers immediate value as a lightweight CRM.

**Acceptance Scenarios**:

1. **Given** I am logged into the application, **When** I navigate to the "Clients" section and click "Add Client", **Then** I see a form to enter client details (name, email, company, address, phone, VAT number)
2. **Given** I have filled the client form with valid data, **When** I click "Save", **Then** the client is created and appears in the client list
3. **Given** I am viewing the client list, **When** I click on a client, **Then** I see the full client details with options to edit or delete
4. **Given** I am editing a client, **When** I update the information and save, **Then** the changes are persisted and reflected in the client list
5. **Given** I select a client to delete, **When** I confirm the deletion, **Then** the client is removed from the database (with confirmation prompt to prevent accidents)

---

### User Story 2 - Quote Creation with Line Items (Priority: P1)

As a service provider, I need to create detailed quotes with multiple line items, quantities, and prices so that I can present clear pricing to my clients.

**Why this priority**: This is the core value proposition of the application. Quote creation is the primary use case that differentiates this from a simple contact management tool.

**Independent Test**: Can be tested by creating a quote with multiple line items, verifying calculations, and saving the quote. Works independently if client data is pre-seeded or mocked.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I click "New Quote", **Then** I see a form to select/create a client and add line items
2. **Given** I am creating a quote, **When** I add a line item with description, quantity, and unit price, **Then** the subtotal for that line is automatically calculated
3. **Given** I have multiple line items, **When** I view the quote, **Then** I see a subtotal (sum of all line items), tax amount (configurable rate), and total amount
4. **Given** I am creating a quote, **When** I select a currency (EUR, USD, GBP, etc.), **Then** all amounts are displayed with the correct currency symbol
5. **Given** I am creating a quote, **When** I apply a discount (percentage or fixed amount), **Then** the discount is subtracted from the subtotal before calculating tax
6. **Given** I have completed a quote, **When** I click "Save", **Then** the quote is persisted with a unique quote number and status "Draft"
7. **Given** I am viewing a saved quote, **When** I click "Edit", **Then** I can modify line items, discount, or tax rate and save changes

---

### User Story 3 - Multi-Currency Support (Priority: P1)

As a freelancer working with international clients, I need to create quotes in different currencies (EUR, USD, GBP, etc.) so that clients see prices in their preferred currency.

**Why this priority**: Essential for international business. Without this, the application is limited to local markets only.

**Independent Test**: Can be tested by creating quotes with different currencies and verifying that symbols, formatting, and storage are correct.

**Acceptance Scenarios**:

1. **Given** I am creating a new quote, **When** I select a currency from a dropdown (EUR, USD, GBP, CHF, CAD), **Then** all prices are formatted with the correct symbol (€, $, £, CHF, C$)
2. **Given** I have selected a non-EUR currency, **When** I save the quote, **Then** the currency is stored with the quote and displayed correctly when viewed later
3. **Given** I am viewing the quotes list, **When** I see quotes in different currencies, **Then** each quote shows its total in its original currency (no automatic conversion)
4. **Given** I am creating a quote, **When** I switch currency mid-creation, **Then** the prices remain the same numerically (no automatic conversion; user manually adjusts if needed)

---

### User Story 4 - PDF Generation (Priority: P2)

As a user, I need to generate professional PDF documents from my quotes so that I can send them to clients via email or download them for my records.

**Why this priority**: Critical for client-facing deliverables but can be developed after quote creation is functional. Users can manually copy data to external tools temporarily.

**Independent Test**: Can be tested by generating a PDF from a saved quote and verifying that all data (client info, line items, totals) appear correctly formatted.

**Acceptance Scenarios**:

1. **Given** I am viewing a saved quote, **When** I click "Generate PDF", **Then** a professionally formatted PDF is created with the quote details
2. **Given** the PDF is generated, **When** I open it, **Then** I see:
   - My business logo and information (header)
   - Client information (name, address)
   - Quote number and date
   - Line items table (description, quantity, unit price, total)
   - Subtotal, discount, tax, and final total
   - Payment terms and notes (if provided)
3. **Given** the PDF is generated, **When** I click "Download", **Then** the PDF is downloaded to my device with filename format `quote-[number]-[client-name].pdf`
4. **Given** the PDF is generated, **When** the system saves it, **Then** it is uploaded to Vercel Blob storage and the URL is stored with the quote record

---

### User Story 5 - Quote Status Management (Priority: P2)

As a user, I need to track the status of my quotes (Draft, Sent, Accepted, Rejected) so that I know which quotes need follow-up actions.

**Why this priority**: Important for workflow management but not essential for MVP. Users can manually track status externally initially.

**Independent Test**: Can be tested by changing quote statuses and filtering the quote list by status.

**Acceptance Scenarios**:

1. **Given** I am viewing a quote, **When** I update the status to "Sent", **Then** the status is saved and a timestamp is recorded
2. **Given** I am viewing the quotes list, **When** I filter by status, **Then** only quotes matching that status are displayed
3. **Given** a quote has status "Accepted", **When** I try to edit it, **Then** I see a warning that editing will reset the status to "Draft" (to prevent accidental modifications to accepted quotes)

---

### User Story 6 - Dashboard Overview (Priority: P3)

As a user, I want to see a dashboard with key metrics (total quotes, total revenue by status, recent activity) so that I can quickly understand my business performance.

**Why this priority**: Nice-to-have for MVP. Provides business insights but not essential for core functionality.

**Independent Test**: Can be tested by viewing the dashboard and verifying that metrics are calculated correctly from existing quote data.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I navigate to the dashboard, **Then** I see:
   - Total number of quotes
   - Total value of "Accepted" quotes (by currency)
   - Number of quotes by status (Draft, Sent, Accepted, Rejected)
   - List of 5 most recent quotes
2. **Given** I am viewing the dashboard, **When** new quotes are created or statuses change, **Then** the metrics update accordingly on next page load

---

### Edge Cases

- **What happens when a user tries to delete a client that has associated quotes?**  
  System prevents deletion and displays an error message: "Cannot delete client with existing quotes. Archive or reassign quotes first."

- **How does the system handle invalid currency codes?**  
  Only predefined currencies (EUR, USD, GBP, CHF, CAD) are selectable from a dropdown. Manual entry is not allowed.

- **What happens if PDF generation fails (e.g., network issue with Vercel Blob)?**  
  Display error message to user: "PDF generation failed. Please try again." Log error for debugging. Do not save a broken PDF URL to the database.

- **How are tax rates configured?**  
  For MVP: Single global tax rate (configurable in settings, default 20% VAT). Future: Per-client or per-quote custom tax rates.

- **Can users edit a quote number manually?**  
  No. Quote numbers are auto-generated (e.g., `QUO-2025-0001`) to ensure uniqueness and prevent duplicates.

- **What happens if a user creates a quote without line items?**  
  Form validation prevents saving a quote with zero line items. At least one line item is required.

- **How does the system handle very large discount percentages (e.g., 150%)?**  
  Validation limits discounts to 0-100% for percentage-based discounts. Fixed-amount discounts cannot exceed the subtotal (warning shown if applied).

## Requirements _(mandatory)_

### Functional Requirements

#### Client Management

- **FR-001**: System MUST allow authenticated users to create client records with fields: name (required), email (required, validated format), company name (optional), address (optional), phone (optional), VAT number (optional)
- **FR-002**: System MUST display a paginated list of all clients with search functionality (by name, email, or company)
- **FR-003**: Users MUST be able to update existing client information
- **FR-004**: System MUST prevent deletion of clients with associated quotes and display a clear error message
- **FR-005**: System MUST validate email format on client creation/update

#### Quote Creation

- **FR-006**: System MUST allow users to create quotes associated with a specific client
- **FR-007**: System MUST auto-generate unique quote numbers in format `QUO-YYYY-NNNN` (e.g., `QUO-2025-0001`)
- **FR-008**: Users MUST be able to add multiple line items to a quote with fields: description (text), quantity (number > 0), unit price (number ≥ 0)
- **FR-009**: System MUST automatically calculate line item subtotals as `quantity × unit_price`
- **FR-010**: System MUST calculate quote subtotal as sum of all line item subtotals
- **FR-011**: Users MUST be able to apply a discount (percentage or fixed amount)
- **FR-012**: System MUST validate that percentage discounts are between 0-100% and fixed discounts do not exceed subtotal
- **FR-013**: System MUST calculate tax based on a configurable tax rate (default 20%) applied to `(subtotal - discount)`
- **FR-014**: System MUST display final total as `subtotal - discount + tax`
- **FR-015**: System MUST require at least one line item before allowing a quote to be saved

#### Multi-Currency

- **FR-016**: System MUST support the following currencies: EUR (default), USD, GBP, CHF, CAD
- **FR-017**: Users MUST be able to select a currency when creating a quote from a dropdown menu
- **FR-018**: System MUST store the selected currency with each quote
- **FR-019**: System MUST display amounts with the correct currency symbol and formatting (e.g., €1,234.56 for EUR, $1,234.56 for USD)
- **FR-020**: System MUST NOT perform automatic currency conversion; each quote is stored and displayed in its original currency

#### PDF Generation

- **FR-021**: System MUST generate PDF documents from saved quotes
- **FR-022**: PDF MUST include: business logo/header, client information, quote number and date, line items table, financial summary (subtotal, discount, tax, total), payment terms/notes (if provided)
- **FR-023**: System MUST upload generated PDFs to Vercel Blob storage
- **FR-024**: System MUST store the Vercel Blob URL with the quote record
- **FR-025**: Users MUST be able to download the generated PDF
- **FR-026**: System MUST handle PDF generation errors gracefully and display user-friendly error messages

#### Quote Status

- **FR-027**: Quotes MUST have one of the following statuses: Draft, Sent, Accepted, Rejected
- **FR-028**: New quotes MUST default to "Draft" status
- **FR-029**: Users MUST be able to update quote status
- **FR-030**: System MUST record a timestamp when status changes to "Sent"

#### Authentication

- **FR-031**: System MUST authenticate users using Better Auth (https://www.better-auth.com/)
- **FR-032**: Users MUST be able to sign up with email/password
- **FR-033**: Users MUST be able to log in with email/password
- **FR-034**: System MUST support OAuth providers (Google, GitHub) for authentication [NEEDS CLARIFICATION: Which OAuth providers required for MVP?]
- **FR-035**: Unauthenticated users MUST be redirected to login page when accessing protected routes

### Key Entities _(include if feature involves data)_

- **User**: Represents an authenticated user of the system. Attributes: email, hashed password, name, business logo URL, created_at, updated_at
- **Client**: Represents a customer/client. Attributes: name, email, company, address, phone, VAT number, created_by (FK to User), created_at, updated_at
- **Quote**: Represents a quote/invoice. Attributes: quote_number (unique), client_id (FK to Client), user_id (FK to User), currency (enum), status (enum), subtotal, discount_type (percentage/fixed), discount_value, tax_rate, tax_amount, total, pdf_url (Vercel Blob), notes, payment_terms, created_at, updated_at, sent_at (nullable)
- **QuoteItem**: Represents a line item in a quote. Attributes: quote_id (FK to Quote), description, quantity, unit_price, total (calculated), order (for sorting), created_at, updated_at

**Relationships**:

- User → Clients (one-to-many): A user can have many clients
- User → Quotes (one-to-many): A user can have many quotes
- Client → Quotes (one-to-many): A client can have many quotes
- Quote → QuoteItems (one-to-many): A quote can have many line items

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create a complete quote (client selection, line items, calculations, PDF generation) in under 3 minutes
- **SC-002**: System accurately calculates quote totals with 100% accuracy (no rounding errors beyond 2 decimal places)
- **SC-003**: PDF generation completes within 5 seconds for quotes with up to 20 line items
- **SC-004**: Dashboard loads within 2 seconds showing metrics for up to 1000 quotes
- **SC-005**: 90% of users successfully create their first quote without external help or documentation
- **SC-006**: Zero data loss: All quote edits are persisted correctly to the database with no failed saves
- **SC-007**: Multi-currency quotes display correctly with proper symbols and formatting for all supported currencies (EUR, USD, GBP, CHF, CAD)

### Review & Acceptance Checklist

- [ ] All functional requirements (FR-001 to FR-035) are clearly defined and unambiguous
- [ ] User stories are prioritized (P1, P2, P3) and can be tested independently
- [ ] Edge cases are documented with clear handling strategies
- [ ] Key entities and relationships are defined
- [ ] Success criteria are measurable and technology-agnostic
- [ ] Multi-currency support is clearly specified with no automatic conversion
- [ ] Authentication approach (Better Auth) is documented
- [ ] PDF generation workflow is defined (backend generation → Vercel Blob storage)
- [ ] Database schema entities are sufficient for MVP
- [ ] Ambiguous requirements are marked with [NEEDS CLARIFICATION]
