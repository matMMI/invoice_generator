# Devis Generator Constitution

## Core Principles

### I. Serverless-First Architecture

Every component of the Devis Generator MUST be designed for serverless deployment on Vercel:

- **Backend Functions**: FastAPI endpoints must be stateless, cold-start optimized, and compatible with Vercel's Python runtime
- **Database Connections**: Use connection pooling (Neon with PgBouncer) to handle serverless connection limits
- **File Storage**: All file operations MUST use Vercel Blob; no local filesystem dependencies
- **Environment Variables**: Configuration via environment variables only; no hardcoded credentials
- **Edge Compatibility**: Consider edge runtime where beneficial (middleware, API routes)

**Rationale**: Serverless architecture provides automatic scaling, reduced operational overhead, and cost efficiency while maintaining high availability.

### II. Strong Typing (NON-NEGOTIABLE)

Type safety is mandatory across the entire stack:

- **Frontend**: TypeScript with `strict` mode enabled; no `any` types except when absolutely necessary with justification
- **Backend**: Pydantic models for all data structures; type hints required for all functions
- **API Contracts**: OpenAPI/Swagger schema generation from Pydantic models for frontend-backend contract validation
- **Database Models**: Strongly-typed ORM models (SQLModel) matching Pydantic schemas

**Rationale**: Strong typing catches bugs at compile-time, improves developer experience with autocomplete, and serves as living documentation.

### III. Test-Driven Development

TDD is mandatory for all new features:

- **Red-Green-Refactor Cycle**: Write failing test → Implement feature → Refactor
- **Test Coverage Minimums**:
  - Backend: 80% coverage for services and models
  - Frontend: 70% coverage for components and utilities
- **Test Types Required**:
  - Unit tests: Pure functions, utilities, business logic
  - Integration tests: API endpoints, database operations
  - E2E tests: Critical user journeys (quote creation, PDF generation)
- **CI/CD Integration**: Tests must pass before merge; GitHub Actions for automated testing

**Rationale**: TDD ensures code quality, prevents regressions, and provides confidence during refactoring.

### IV. Premium User Experience

The application MUST deliver a professional, polished user experience:

- **Design System**: Consistent design tokens (colors, spacing, typography) defined upfront
- **Responsive Design**: Mobile-first approach; breakpoints for tablet and desktop
- **Accessibility**: WCAG 2.1 AA compliance minimum
  - Semantic HTML
  - ARIA labels where needed
  - Keyboard navigation support
  - Screen reader compatibility
- **Performance Budgets**:
  - First Contentful Paint (FCP): < 1.5s
  - Largest Contentful Paint (LCP): < 2.5s
  - Time to Interactive (TTI): < 3.5s
- **Loading States**: Skeleton loaders, optimistic UI, clear error messages

**Rationale**: Professional appearance builds trust with clients and reflects positively on the services being invoiced.

### V. Modular Code Organization

Code MUST be organized for maintainability and reusability:

- **Separation of Concerns**: Clear boundaries between presentation, business logic, and data access
- **Component Granularity**:
  - Frontend: Atomic design principles (atoms, molecules, organisms)
  - Backend: Single Responsibility Principle for services and routers
- **Shared Code**: Common utilities in dedicated `/lib` or `/utils` directories
- **File Naming Conventions**:
  - Frontend: `kebab-case.tsx` for components, `camelCase.ts` for utilities
  - Backend: `snake_case.py` (PEP 8 compliance)
- **Import Organization**: Absolute imports preferred; configure path aliases (`@/components`, `@/lib`)

**Rationale**: Modular code is easier to test, debug, and extend; reduces cognitive load for developers.

## Technology Constraints

### Deployment Platform

- **Vercel Exclusive**: All deployment must be through Vercel
- **Preview Deployments**: Automatic preview URLs for all PRs
- **Environment Separation**:
  - Production: `main` branch
  - Staging: `develop` branch (if needed)
  - Feature branches: Preview deployments

### Technology Stack (Locked)

- **Frontend Framework**: Next.js 14+ (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS (design system implementation)
- **Backend Framework**: FastAPI (Python 3.14)
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: SQLModel (combines SQLAlchemy + Pydantic)
- **File Storage**: Vercel Blob
- **Authentication**: Better Auth (https://www.better-auth.com/) - TypeScript-first auth library
- **PDF Generation**:
  - Backend: ReportLab or WeasyPrint
  - Frontend: react-pdf (for preview)

### Database Standards

- **Connection Management**: Use `@vercel/postgres` or Neon's serverless driver with pooling
- **Migrations**: Alembic for schema versioning
- **Query Optimization**: Indexes on foreign keys and frequently queried fields
- **Data Validation**: Database constraints (NOT NULL, UNIQUE, CHECK) in addition to application-level validation

### Security Requirements

- **Environment Variables**: Never commit `.env` files; use Vercel environment variables
- **API Security**:
  - CORS configuration for allowed origins
  - Rate limiting on public endpoints
  - JWT tokens for authentication with short expiry (15 min access, 7 day refresh)
- **SQL Injection Prevention**: Parameterized queries only (ORM handles this)
- **XSS Prevention**: React escapes by default; validate user input server-side
- **Sensitive Data**: Hash passwords with bcrypt; encrypt API keys at rest

## Development Workflow

### Spec-Driven Development Process

1. **Constitution** (this document) → guides all decisions
2. **Specification** (`.specify/specs/[feature]/spec.md`) → defines WHAT to build
3. **Technical Plan** (`.specify/specs/[feature]/plan.md`) → defines HOW to build
4. **Task Breakdown** (`.specify/specs/[feature]/tasks.md`) → actionable checklist
5. **Implementation** → execute tasks with TDD
6. **Verification** → manual testing + automated tests pass

### Git Workflow

- **Branch Naming**: `###-feature-name` (e.g., `001-client-management`)
- **Commit Messages**: Conventional Commits format
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `refactor:` for code improvements
  - `test:` for test additions
- **Pull Requests**:
  - Link to spec document
  - Include screenshots for UI changes
  - All CI checks must pass
  - Require at least 1 approval (for team projects)

### Code Review Standards

- **Review Checklist**:
  - ✅ Follows constitution principles
  - ✅ Tests included and passing
  - ✅ TypeScript/Pydantic types present
  - ✅ No hardcoded values (use env vars or constants)
  - ✅ Accessibility considerations addressed
  - ✅ Performance implications considered
- **Review Timeline**: Within 24 hours for urgent, 48 hours otherwise

### Quality Gates

Before merging to `main`:

1. All tests pass (unit, integration, E2E)
2. Linting passes (`eslint`, `ruff` or `flake8`)
3. Type checking passes (`tsc --noEmit`, `mypy`)
4. Build succeeds locally and in CI
5. Manual testing completed for user-facing changes

## Governance

### Constitutional Authority

- This constitution **supersedes all other practices** and ad-hoc decisions
- When trade-offs arise, reference these principles to guide decisions
- Amendments to this constitution require:
  1. Written justification
  2. Documentation update
  3. Team consensus (or project owner approval for solo projects)

### Complexity Justification

- Adding new dependencies requires justification:
  - What problem does it solve?
  - Why can't it be solved with existing tools?
  - What is the maintenance cost (bundle size, security updates)?
- **Prohibited**: Premature optimization, over-engineering, "kitchen sink" libraries

### Exception Handling

- Exceptions to these principles MUST be documented in decision logs (ADR format recommended)
- Temporary violations (technical debt) must include:
  - Reason for exception
  - Plan for resolution
  - Tracking issue/ticket

---

**Version**: 1.0.0 | **Ratified**: 2025-12-22 | **Last Amended**: 2025-12-22
