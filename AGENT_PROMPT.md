# Agent Prompt — Hot Wheels Collector Portfolio App

> **Instructions for Cursor / AI Coding Agent**  
> Read this entire document before writing a single line of code.  
> Follow the requirements, tech stack, and architecture decisions exactly as specified.  
> Do not improvise stack choices or add libraries not listed here.

---

## Your Mission

Build a production-quality full-stack web application called **"HW Vault"** — a portfolio platform for Hot Wheels collectors. Collectors can browse a comprehensive car catalog, build named portfolios of cars they own, and share those portfolios via unique public links.

The app must run entirely via `docker-compose up` with zero manual setup steps after cloning.

---

## Read These Documents First (They Are In This Folder)

1. **`REQUIREMENTS.md`** — Complete feature list, DB schema, API spec, and non-functional requirements. This is your source of truth.
2. **`DATA_SOURCES.md`** — How to get Hot Wheels car data, where the seed data comes from, how to import it.
3. **`COMMERCIAL_ROADMAP.md`** — Context for future features (don't build these in v1, but don't make architectural decisions that block them).

---

## Tech Stack (Non-Negotiable)

- **Framework:** Next.js 14 with App Router + TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL 15
- **ORM:** Prisma
- **Auth:** Supabase Auth (or NextAuth.js with credentials provider — choose one and be consistent)
- **File Storage:** MinIO (local dev) / Supabase Storage (production)
- **Containerization:** Docker + Docker Compose
- **Package Manager:** npm

Do NOT use: Redux, class components, Pages Router, MongoDB, Firebase.

---

## Project Structure

Create this exact folder structure:

```
hotwheels-collector-app/
├── app/                          # Next.js App Router
│   ├── (public)/
│   │   ├── page.tsx              # Landing / Welcome screen
│   │   ├── catalog/
│   │   │   └── page.tsx          # Browse all cars
│   │   └── share/[slug]/
│   │       └── page.tsx          # Public portfolio view
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Auth-gated layout
│   │   ├── portfolios/
│   │   │   ├── page.tsx          # List user's portfolios
│   │   │   ├── [id]/page.tsx     # Single portfolio view
│   │   │   └── new/page.tsx      # Create portfolio form
│   │   └── cars/
│   │       └── add/page.tsx      # Manual car entry form
│   └── api/
│       ├── cars/route.ts
│       ├── cars/[id]/route.ts
│       ├── cars/manual/route.ts
│       ├── series/route.ts
│       ├── portfolios/route.ts
│       ├── portfolios/[id]/route.ts
│       ├── portfolios/[id]/cars/route.ts
│       ├── portfolios/[id]/share/route.ts
│       └── share/[slug]/route.ts
├── components/
│   ├── ui/                       # Reusable primitives (Button, Card, Modal, Input, Badge)
│   ├── catalog/                  # CarCard, CarGrid, FilterPanel, SearchBar
│   ├── portfolio/                # PortfolioCard, PortfolioGrid, AddToPortfolioModal
│   └── layout/                   # Navbar, Footer, Sidebar
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── supabase.ts               # Supabase client
│   ├── auth.ts                   # Auth helpers
│   └── storage.ts                # File upload helpers
├── prisma/
│   ├── schema.prisma             # Full DB schema (see REQUIREMENTS.md)
│   └── seed.ts                   # Data seeder (see DATA_SOURCES.md)
├── scripts/
│   └── import-hotwheels-data.ts  # One-time data import script
├── public/
│   └── placeholder-car.png       # Default car image placeholder
├── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Step-by-Step Implementation Order

Follow this order exactly. Do not skip steps or do them out of order.

### Phase 1 — Project Foundation

1. Initialize Next.js 14 project with TypeScript and Tailwind
2. Create `Dockerfile` (multi-stage, node:20-alpine)
3. Create `docker-compose.yml` with: `app`, `db` (postgres:15), `storage` (minio/minio)
4. Create `.env.example` with all required vars documented
5. Set up Prisma with the full schema from `REQUIREMENTS.md` section 4
6. Verify `docker-compose up` brings up all services and migrations run automatically

### Phase 2 — Data Import

7. Clone `https://github.com/pvwnthem/Hotwheels-Data` locally (or add as a git submodule to `data/`)
8. Write `scripts/import-hotwheels-data.ts` that:
   - Reads the JSON files from the cloned repo
   - Upserts `series` records (use `createMany` with `skipDuplicates: true`)
   - Upserts `car` records linked to series
   - Sets `source: "official"` on all imported records
   - Logs progress: `Imported 1247/12500 cars...`
9. Add `npm run import-data` to `package.json` scripts
10. Add `SEED_DATA=true` env var option to run import on container startup in dev

### Phase 3 — Backend API

11. Implement all API routes from `REQUIREMENTS.md` section 5
12. Use Prisma for all DB queries
13. Implement authentication middleware (validate JWT on all protected routes)
14. Implement share slug generation: `crypto.randomBytes(16).toString('hex')`
15. Implement file upload endpoint for manual car photos (store to MinIO/Storage)

### Phase 4 — Frontend: Public Pages

16. **Landing Page (`/`):**
    - Full-viewport hero section, dark theme with red/orange accents
    - Animated headline: "Build Your Hot Wheels Legacy"
    - Stats strip: total cars in DB, total collectors, total portfolios
    - Featured cars grid (random selection of 6 cars with photos)
    - CTA: Sign Up / Browse Catalog
    - Footer with links

17. **Catalog Page (`/catalog`):**
    - Left sidebar: filter panel (year range slider, series type checkboxes, color picker)
    - Main area: car grid (responsive, 2–5 cols)
    - Each `CarCard`: photo, name, series, year, color badge, "Add to Portfolio" button
    - Search bar at top: debounced, searches `car.name`
    - Pagination: 48 cars per page
    - Empty state with illustration

18. **Car Detail Modal or Page:**
    - Large photo, full metadata, which series it belongs to
    - "Add to Portfolio" button → opens portfolio selector modal

19. **Public Share Page (`/share/[slug]`):**
    - SSR (use `generateMetadata` for Open Graph)
    - Read-only portfolio view
    - Show: portfolio name, owner username, car count, car grid
    - "Create Your Own" CTA at bottom

### Phase 5 — Frontend: Auth

20. Login page: email + password form, link to signup
21. Signup page: email + password + username
22. Protected route wrapper: redirect to `/login` if not authenticated
23. Navbar: shows user avatar + dropdown when logged in

### Phase 6 — Frontend: Dashboard

24. **My Portfolios (`/portfolios`):**
    - Grid of portfolio cards
    - Each card: name, car count, visibility badge, last updated
    - "New Portfolio" button → inline form or modal

25. **Portfolio Detail (`/portfolios/[id]`):**
    - Header: portfolio name, description, edit button, share button, delete button
    - Car grid with status badges (Owned / Wishlist / For Trade)
    - "Add Cars" button → opens catalog search modal
    - Share button: shows current share link + copy button + revoke option

26. **Manual Car Entry (`/cars/add`):**
    - Form fields: Name, Series (autocomplete from existing + "Create New"), Year, Color, Collector #, Notes
    - Photo upload with preview
    - "Add to Portfolio" checkbox after submission

### Phase 7 — Polish

27. Loading skeletons on all data-fetching components
28. Error boundaries on all pages
29. Toast notifications for: car added, portfolio created, link copied, errors
30. Mobile responsive check — test all pages at 375px width
31. `next/image` on all car photos with blur placeholder

---

## Docker Implementation Details

### `Dockerfile`
```dockerfile
# Stage 1: deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### `docker-compose.yml`
```yaml
version: '3.9'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: hotwheels
      POSTGRES_USER: hw_user
      POSTGRES_PASSWORD: hw_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hw_user -d hotwheels"]
      interval: 5s
      timeout: 5s
      retries: 5

  storage:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://hw_user:hw_password@db:5432/hotwheels
      STORAGE_ENDPOINT: http://storage:9000
      STORAGE_BUCKET: hotwheels
      STORAGE_ACCESS_KEY: minioadmin
      STORAGE_SECRET_KEY: minioadmin
    depends_on:
      db:
        condition: service_healthy
    command: >
      sh -c "npx prisma migrate deploy && node server.js"

volumes:
  postgres_data:
  minio_data:
```

---

## Design System

### Colors
```
Primary:    #E8001C  (Hot Wheels red)
Secondary:  #FF6B00  (orange accent)
Dark BG:    #0F0F0F
Card BG:    #1A1A1A
Border:     #2A2A2A
Text:       #FFFFFF / #A0A0A0
```

### Typography
- Font: `Inter` (Google Fonts)
- Headings: bold, tight tracking
- Code/numbers: `font-mono`

### Component Style
- Dark theme throughout
- Cards with subtle border + hover glow (red/orange)
- Buttons: solid red primary, ghost secondary
- Badges: small, rounded-full, color-coded by series type

---

## Critical Rules

1. **No placeholder text** — every page must show real data from the database
2. **All API routes must handle errors** — return proper HTTP status codes (400, 401, 403, 404, 500)
3. **Never expose service role keys to the client** — all sensitive operations via API routes only
4. **Images must always have a fallback** — if `photo_url` is null, show `placeholder-car.png`
5. **Share slugs must be unguessable** — use `crypto.randomBytes(16).toString('hex')`, never sequential IDs
6. **The seed script must be idempotent** — running it twice must not create duplicates
7. **docker-compose up must work on a fresh machine** — no manual steps, no assumptions about local env

---

## Definition of Done

The implementation is complete when:
- [ ] `docker-compose up` starts all services with no errors
- [ ] `npm run import-data` seeds the database with real Hot Wheels cars
- [ ] A visitor can browse the catalog without logging in
- [ ] A user can sign up, create a portfolio, add cars, and share it via a link
- [ ] The shared link works without login and shows the correct portfolio
- [ ] A user can manually add a car with a custom photo
- [ ] All pages are mobile responsive
- [ ] No TypeScript errors (`npm run type-check` passes)
- [ ] No console errors in production build
