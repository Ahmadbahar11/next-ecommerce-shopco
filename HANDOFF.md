# Shopco / Football Thrift Store — Project Handoff

Last updated: 2026-08-30

This file exists so a fresh Claude Code session (or you) can pick up context
after the chat history is gone. Read this top to bottom before making changes.

## What this project is

Started as a clone of `mohammadoftadeh/next-ecommerce-shopco` (a generic
clothing storefront demo). It has since been repositioned as **a thrift/new
football gear store** (boots, jerseys, balls, gloves, etc.) while **keeping
the original "SHOP.CO" branding** (that was an explicit choice — branding can
be renamed later via the admin Branding page).

Pricing is in **Pakistani Rupees (Rs)**, not USD.

## Repo layout

```
E-Commerce Store/
├── frontend/     Next.js 14 app (storefront + admin panel)
└── backend/      Express + Prisma + PostgreSQL API
```

This was originally a single Next.js app at the repo root; it was split into
`frontend/` + `backend/` mid-project (per explicit user request for this
layout, as opposed to a full turborepo/workspaces monorepo — these are two
independent projects, each with their own `package.json`, run separately).

## Running it

Two terminals, both from a **fresh clone or after `npm install` in each folder**:

```bash
# Terminal 1 — backend (Postgres must already be running locally)
cd backend
npm install        # first time only
npm run dev         # http://localhost:4000

# Terminal 2 — frontend
cd frontend
npm install        # first time only
npm run dev         # http://localhost:3000
```

- Storefront: http://localhost:3000
- Admin panel: http://localhost:3000/admin (redirects to `/admin/login` if not authenticated)
- Backend health check: http://localhost:4000/health

### Database

- PostgreSQL, assumed running locally with default creds `postgres/postgres`
  on `localhost:5432` (that's what worked on this machine — see
  `backend/.env`). Database name: `shopco`.
- Prisma schema: `backend/prisma/schema.prisma`
- Seed script: `backend/prisma/seed.ts` — wipes and reseeds Products,
  Categories, SubCategories, and upserts the one admin user. Run with
  `npm run seed` (from `backend/`).
- **Migration note**: `prisma migrate dev` refuses to run in this shell
  because it's non-interactive and drift-detection wants a confirmation
  prompt. When the schema changes, the workflow used so far was:
  ```bash
  npx prisma db push --force-reset --accept-data-loss   # wipes + syncs schema
  npm run seed                                            # repopulate data
  ```
  A clean migration baseline was manually created once (see
  `backend/prisma/migrations/20260830000000_init/`) via `prisma migrate diff`
  + `prisma migrate resolve --applied`, so `prisma migrate status` reports
  clean. If you add new schema changes and want a real migration file
  instead of just `db push`, you'll likely need the same manual-diff
  workaround, or run `prisma migrate dev` from an interactive terminal
  (outside this agent's shell) where it can prompt normally.

### Admin login

```
Email:    admin@shopco.com
Password: ChangeMe123!
```

Defined in `backend/.env` as `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`,
applied by the seed script. **Change this before any real deployment.**

`backend/.env` (gitignored) also holds `DATABASE_URL`, `JWT_SECRET`,
`JWT_EXPIRES_IN`. `.env.example` has the same keys with placeholder values.

## Backend — what's built

Express + TypeScript + Prisma + PostgreSQL, in `backend/src/`.

**Data model** (`backend/prisma/schema.prisma`):
- `User` — `role` enum (`admin` / `editor` / `viewer`), bcrypt `passwordHash`.
  Only `admin` role is actually seeded/used right now; RBAC middleware
  supports the other roles for later.
- `Category` — flat, top-level. Has many `SubCategory` and many `Product`.
- `SubCategory` — belongs to exactly one `Category` (`categoryId` FK). This
  is a **two-level model, not a tree** — a SubCategory cannot have its own
  subcategories. (An earlier version used a self-referential unlimited-depth
  Category tree; that was explicitly replaced with this simpler two-table
  design.)
- `Product` — belongs to one `Category` (required) and optionally one
  `SubCategory` (`subCategoryId` nullable). If both are set, the API
  validates that the subcategory actually belongs to that category and
  rejects mismatches with a 400.

**Auth**: JWT-based. `POST /api/auth/login` (email+password → token),
`GET /api/auth/me` (bearer token → current user). `authenticate` +
`authorize(...roles)` middleware in `backend/src/middleware/auth.ts`.

**Routes** (`backend/src/routes/`):
- `auth.ts` — login, me
- `categories.ts` — GET is public; POST/PUT/DELETE require `admin` role
- `subcategories.ts` — same pattern, supports `?categoryId=` filter
- `products.ts` — GET is public (filters: `categoryId`, `subCategoryId`,
  `brand`, `condition`, `status`, `search`, `minPrice`, `maxPrice`);
  POST/PUT/DELETE require `admin` role

**Why GET is public**: so the storefront can eventually read the catalog
without needing a login. Only mutations are gated. Don't accidentally lock
down GET when refactoring — that will break the (currently unwired)
storefront integration path.

## Frontend — what's built

Next.js 14 App Router, in `frontend/src/`.

### Storefront (`src/app/(storefront)/`) — **UNTOUCHED, still all mock data**

Per explicit instruction, the storefront was **not** wired to the backend.
It still uses hardcoded arrays in `src/app/(storefront)/page.tsx`
(`newArrivalsData`, `topSellingData`, `relatedProductData`, `reviewsData`).
Content was reskinned to football gear (boots, jerseys, balls, etc.) with
Rs pricing and placeholder SVG product images at
`frontend/public/images/football/*.svg` (simple emoji-on-background
placeholders — swap for real product photography before any real launch).

**This is the biggest open task**: wiring the storefront's product listing,
shop page, and product detail page to `GET /api/products` and
`GET /api/categories` instead of the static arrays. The API client
(`frontend/src/lib/api.ts`) and a `toProduct()` mapper already exist for
this — they're just not called from storefront pages yet.

### Admin panel (`src/app/admin/`)

Route structure:
```
admin/
├── layout.tsx              bare html/body root layout
├── login/page.tsx          login form, NOT wrapped in the dashboard shell
└── (dashboard)/            route group — sidebar+header shell lives in its layout.tsx
    ├── layout.tsx          AppSidebar + SiteHeader + SidebarProvider
    ├── page.tsx            dashboard (mock data)
    ├── products/page.tsx   ✅ WIRED to real backend
    ├── categories/page.tsx ✅ WIRED to real backend (2 tabs: Category / Sub-category)
    ├── orders/page.tsx     mock data only
    ├── customers/page.tsx  mock data only
    ├── reviews/page.tsx    mock data only
    ├── navigation/page.tsx mock data only (storefront navbar link editor)
    ├── banner/page.tsx     mock data only (storefront announcement bar editor)
    ├── appearance/page.tsx ✅ Branding (store name/tagline/logo) — persisted via
    │                       a cookie/localStorage-backed hook (see below), NOT
    │                       the backend database. Actually reflects on the live
    │                       storefront navbar/footer.
    └── store-details/page.tsx  mock data only
```

**Auth protection**: `frontend/src/middleware.ts` guards `/admin/:path*`.
It checks for an `admin_token` cookie (redirects to `/admin/login` if
missing, redirects away from `/admin/login` if present). This is a **UX-level
gate only** — it just checks cookie presence, not signature validity. The
backend re-verifies the JWT signature on every actual API call, which is the
real security boundary. The cookie is set client-side (non-httpOnly) by
`frontend/src/lib/admin-auth.ts` after a successful login — it's on the
frontend's own origin (`localhost:3000`) so Next.js middleware can read it,
even though the login request itself goes to the backend on port 4000.

**Known security gap to close before any real deployment**: httpOnly
cookies + refresh tokens instead of a JS-readable cookie holding a long-lived
JWT. Fine for local dev, not fine for production.

**Branding persistence** (`frontend/src/lib/store-branding.ts`,
`useStoreBranding()` hook): stores `{storeName, tagline, logoUrl}` in
`localStorage` under key `shopco:branding`. Used by
`src/components/common/StoreLogo.tsx` / `StoreTagline.tsx` (rendered in both
the storefront navbar/footer and consumable elsewhere) and by the admin
Appearance page. This is the **only** piece of admin data that both persists
and actually reflects on the live storefront — everything else in the admin
panel is either backend-real (Products/Categories) or still fully mock
(Orders/Customers/Reviews/Navigation/Banner/StoreDetails/Dashboard stats).

### API client (`frontend/src/lib/api.ts`)

Typed fetch wrapper (`api.getProducts()`, `api.getCategories()`,
`api.createProduct()`, etc.) pointed at `NEXT_PUBLIC_API_URL`
(`frontend/.env.local`, defaults to `http://localhost:4000`). Automatically
attaches `Authorization: Bearer <token>` when a token exists (reads it via
`getToken()` from `admin-auth.ts`), so it works for both authenticated admin
calls and — once wired — unauthenticated public storefront calls.

## What's mock vs. real — quick reference

| Area | Status |
|---|---|
| Products (admin) | ✅ Real backend (Postgres via Prisma) |
| Categories & Subcategories (admin) | ✅ Real backend |
| Branding / store name / logo | ✅ Persisted (localStorage), reflects on storefront |
| Admin auth (login/logout/route protection) | ✅ Real (JWT + middleware) |
| Orders, Customers, Reviews (admin) | ❌ Mock data in `frontend/src/lib/admin/mock-data.ts`, resets on reload |
| Navigation menu editor, Banner editor, Store details (admin) | ❌ Mock data, same file, resets on reload |
| Dashboard stats/chart (admin) | ❌ Mock data |
| Storefront (everything) | ❌ Fully mock/hardcoded, not connected to backend at all |

## Suggested next steps (in rough priority order)

1. Wire the storefront to the real Products/Categories API (biggest gap —
   see "Storefront" section above).
2. Decide whether Orders/Customers need real backend models too (would
   require an actual checkout/order-creation flow on the storefront, which
   doesn't exist yet — there's no cart→order submission wired anywhere).
3. Harden auth for anything beyond local dev (httpOnly cookies, refresh
   tokens, rate limiting on `/api/auth/login`).
4. If you want subcategories to nest further (subcategory-of-subcategory),
   that was explicitly ruled out in favor of the simpler two-table model —
   revisit only if actually needed.
5. Real product photography to replace the emoji-placeholder SVGs in
   `frontend/public/images/football/`.

## Git status note

There is a large amount of uncommitted work in this repo (the whole
admin-panel build, football re-theme, and backend build happened without
commits — user confirmed they have their own copy/backup and declined a
safety commit before the frontend/backend restructure). If picking this back
up, check `git status` first; you may want to make an initial commit before
continuing.
