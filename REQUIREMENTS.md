# Hot Wheels Collector Portfolio App — Requirements Document

**Version:** 1.0  
**Date:** May 2026  
**Status:** Ready for Implementation

---

## 1. Project Overview

A web application for Hot Wheels collectors to browse the complete Hot Wheels catalog, build personal portfolios of cars they own, and share those portfolios via unique public links.

---

## 2. Tech Stack (Required)

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (or separate FastAPI service) |
| Database | PostgreSQL (via Supabase or self-hosted) |
| Auth | Supabase Auth (email/password + OAuth) |
| File Storage | Supabase Storage (user-uploaded car photos) |
| Containerization | Docker + Docker Compose |
| ORM | Prisma |

---

## 3. Application Modules

### 3.1 Welcome / Landing Screen

- Full-screen hero with Hot Wheels branding aesthetic (red/orange/black)
- Short pitch: "Build & share your Hot Wheels collection"
- CTA buttons: **Sign Up** / **Log In** / **Browse Catalog** (no login required)
- Animated car showcase (featured cars rotating/scrolling)
- Footer: about, contact, social links

### 3.2 Catalog Browser (Public, No Login Required)

- Browse ALL cars in the database
- Filter by:
  - Year (1968–present)
  - Series (Mainline, Premium, Treasure Hunt, Super Treasure Hunt, etc.)
  - Category / Segment
  - Color
  - Country of origin / manufacturer
- Search by car name (full-text)
- Each car card shows:
  - Photo (from DB or placeholder)
  - Name
  - Series + Year
  - Collector number
  - Color
  - "Add to Portfolio" button (prompts login if not authenticated)
- Pagination or infinite scroll

### 3.3 User Authentication

- Sign up with email + password
- Login / Logout
- Password reset via email
- Optional: Google / GitHub OAuth
- JWT sessions managed via Supabase Auth

### 3.4 Portfolio Management

#### 3.4.1 Multiple Portfolios
- User can create multiple named portfolios (e.g., "My Main Collection", "Wishlist", "Trade Pile")
- Each portfolio has:
  - Custom name
  - Optional description
  - Optional cover photo
  - Visibility: **Private** or **Public**
  - Creation date

#### 3.4.2 Adding Cars to Portfolio
- From the Catalog, click "Add to Portfolio" → select which portfolio
- From the car detail page
- Cars can appear in multiple portfolios
- User can add notes per car per portfolio (e.g., "Mint in box", "Missing wheel")
- User can mark a car as: **Owned** / **Wishlist** / **For Trade**

#### 3.4.3 Portfolio View
- Grid/list toggle
- Sort by: name, year, series, date added
- Car count badge
- Completion percentage if browsing a full series

### 3.5 Portfolio Sharing

- Each portfolio has a **Share** button
- Generates a unique, unguessable URL slug (e.g., `/share/abc123xyz`)
- Shared link is public — no login required to view
- Shared view is read-only
- Owner can revoke/regenerate the share link at any time
- Optional: password-protect a share link

### 3.6 Manual Car Entry

Because the database will never be 100% complete, users can add custom cars:

**Fields:**
- Car Name (required)
- Series Name (required, can be existing or new)
- Year (required)
- Color
- Collector Number
- Notes / Description
- Photo upload (JPEG/PNG/WebP, max 5MB)
- Source tag: `"user-submitted"` (to distinguish from official DB data)

**Rules:**
- Manual entries are private to the user by default
- User can optionally submit a manual entry to a "community review queue" (future feature)
- Manual entries appear in portfolios exactly like official cars

---

## 4. Database Schema

### `users`
Managed by Supabase Auth. Extended profile table:
- `id` (uuid, PK)
- `username` (unique)
- `display_name`
- `avatar_url`
- `created_at`

### `cars`
- `id` (uuid, PK)
- `name` (string)
- `series_id` (FK → series)
- `year` (int)
- `collector_number` (string, nullable)
- `color` (string, nullable)
- `category` (string, nullable)  
- `photo_url` (string, nullable)
- `source` (`official` | `user_submitted`)
- `submitted_by` (FK → users, nullable)
- `created_at`

### `series`
- `id` (uuid, PK)
- `name` (string)
- `year` (int)
- `type` (`mainline` | `premium` | `treasure_hunt` | `super_treasure_hunt` | `custom`)
- `car_count` (int, nullable)
- `photo_url` (nullable)

### `portfolios`
- `id` (uuid, PK)
- `user_id` (FK → users)
- `name` (string)
- `description` (text, nullable)
- `cover_photo_url` (nullable)
- `is_public` (boolean, default false)
- `share_slug` (string, unique, nullable)
- `created_at`
- `updated_at`

### `portfolio_cars`
- `id` (uuid, PK)
- `portfolio_id` (FK → portfolios)
- `car_id` (FK → cars)
- `status` (`owned` | `wishlist` | `for_trade`)
- `notes` (text, nullable)
- `added_at`

---

## 5. API Endpoints

### Cars
- `GET /api/cars` — list with filters & pagination
- `GET /api/cars/:id` — single car detail
- `GET /api/series` — list all series
- `GET /api/series/:id/cars` — cars in a series

### Portfolios (authenticated)
- `GET /api/portfolios` — user's portfolios
- `POST /api/portfolios` — create
- `PUT /api/portfolios/:id` — update
- `DELETE /api/portfolios/:id` — delete
- `GET /api/portfolios/:id/cars` — cars in portfolio
- `POST /api/portfolios/:id/cars` — add car
- `DELETE /api/portfolios/:id/cars/:carId` — remove car
- `POST /api/portfolios/:id/share` — generate share slug
- `DELETE /api/portfolios/:id/share` — revoke share

### Public Share
- `GET /api/share/:slug` — get public portfolio (no auth)

### Manual Entry
- `POST /api/cars/manual` — create user-submitted car

---

## 6. Docker Setup

The entire application must run via `docker-compose up`.

### Services Required:
1. **app** — Next.js application (port 3000)
2. **db** — PostgreSQL 15 (port 5432)
3. **storage** — MinIO (S3-compatible, for local photo storage in dev) (port 9000)

### Files Required:
- `Dockerfile` — multi-stage build (node:20-alpine)
- `docker-compose.yml` — all services with env vars
- `docker-compose.prod.yml` — production overrides
- `.env.example` — all required environment variables documented

### Environment Variables:
```
DATABASE_URL=postgresql://...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXTAUTH_SECRET=...
STORAGE_ENDPOINT=...
STORAGE_BUCKET=hotwheels
```

---

## 7. Non-Functional Requirements

- **Performance:** Catalog page must load < 2s with 10,000+ cars
- **Images:** Lazy loading, Next.js Image optimization
- **Mobile:** Fully responsive (mobile-first)
- **SEO:** Public share pages must be server-side rendered (SSR) for social sharing previews (Open Graph meta tags)
- **Accessibility:** WCAG 2.1 AA minimum
- **Security:** All write endpoints require valid JWT; share slugs are cryptographically random (16 bytes hex)

---

## 8. Out of Scope (v1)

- Native mobile app
- Real-time multiplayer / social feed
- Price tracking / market values
- Barcode scanning
- Community moderation UI
- Email notifications
