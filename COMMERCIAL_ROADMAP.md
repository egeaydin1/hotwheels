# Commercial Roadmap — HW Vault

**Strategic vision for monetizing and scaling beyond v1**

---

## Overview

HW Vault starts as a free portfolio tool. The natural commercial evolution follows the pattern of successful collector platforms (Discogs for records, COMC for trading cards, StockX for sneakers). The Hot Wheels collector market is large, passionate, and underserved digitally.

---

## Revenue Streams

### 1. Freemium Subscription (Core Monetization)

**Free Tier:**
- 1 portfolio, max 100 cars
- No custom share URL
- Community photos only

**Collector Pro ($4.99/month or $39/year):**
- Unlimited portfolios
- Unlimited cars
- Custom share URL slug (e.g., `/share/ege-collection`)
- Portfolio analytics (views, which cars get the most attention)
- Export collection as CSV/PDF
- Priority photo upload (higher resolution)
- "Pro" badge on public profiles

**Dealer / Trader Plan ($19.99/month):**
- Everything in Pro
- Bulk import via CSV
- "For Trade" listings visible to community
- Contact form on public portfolio
- Featured listing placement (see Marketplace below)

---

### 2. Marketplace (Phase 2)

Enable peer-to-peer trading and selling directly on the platform.

**How it works:**
- User marks cars as "For Trade" or "For Sale" with asking price
- Buyers browse a marketplace feed
- Platform takes 8–12% transaction fee (like eBay)
- Escrow + shipping label generation (integrate with Shippo or EasyPost)
- Seller ratings & reputation system

**Why this works for Hot Wheels specifically:**
- Super Treasure Hunts and rare variants sell for $20–$500+
- The existing portfolio context makes listings more trustworthy (sellers show full collection, establishing credibility)
- No existing platform is Hot Wheels-specific (eBay is generic, Facebook Marketplace is chaotic)

---

### 3. Price Intelligence & Valuation

**Market data integration:**
- Scrape eBay sold listings for each car/variant
- Display average sale price, price trend chart, rarity score
- "Collection Value" dashboard: your portfolio's estimated worth

**Monetization:**
- Feature included in Pro plan
- "Price Alert" notifications (notify me when this car sells for > $X) as a Pro feature
- Dealers pay for bulk valuation exports

---

### 4. Community & Social Features

**User Profiles & Following:**
- Public collector profiles
- Follow other collectors, see their new additions in a feed
- "Most Wanted" lists — publicly shareable

**Monthly Challenges:**
- "Collect all 2026 Treasure Hunts" leaderboard
- Sponsored by Hot Wheels fan stores / resellers
- Winners get discount codes from sponsor partners

**Community Submissions:**
- Users submit missing cars / photos → reviewed by moderators
- Top contributors get Pro subscription credits

---

### 5. B2B & Partnership Revenue

**Fan Store / Reseller Integration:**
- When a user marks a car as "Wishlist," show a "Buy Now" affiliate link from partner stores
- Affiliate commission: 5–10% of sale
- Partner stores: Entertainment Earth, BBTS, local hobby shops

**Mattel Official Partnership (Long-term):**
- License official car imagery and data from Mattel
- Become the "official" collector platform
- Mattel promotional placements: new series launches, limited edition drops

**Sponsored Series:**
- Premium and Pop Culture series licensors (Ferrari, BMW, DC Comics) can sponsor their series page with official content, video, and purchase links

---

### 6. Data & Analytics (B2B)

**Collector Market Intelligence Reports:**
- Which cars are most collected?
- Which series have the highest completion rates?
- Geographic distribution of collectors
- Trend data on what's rising in value

**Sell to:**
- Mattel (their own market research)
- Secondary market resellers
- Media / toy industry analysts
- Annual report: $299–$999 per download

---

## Growth Strategy

### Phase 1 — Free Growth (0–6 months)
- Launch free, focus on catalog completeness and UX quality
- SEO: every car gets its own public page indexed by Google
- Organic growth from Hot Wheels subreddits, Facebook groups, YouTube collectors
- No monetization yet — build the user base

### Phase 2 — Soft Monetization (6–12 months)
- Launch Pro plan when >5,000 active users
- Introduce marketplace (For Trade listings only, no money yet)
- Affiliate links on Wishlist cars

### Phase 3 — Full Marketplace (12–24 months)
- Enable buying/selling with transaction fees
- Price intelligence feature launch
- B2B data partnerships

### Phase 4 — Platform (24+ months)
- Mobile apps (iOS + Android)
- Mattel partnership or acquisition discussion
- Expand to other die-cast brands (Matchbox, Majorette, Johnny Lightning)

---

## Competitive Moat

The key defensible advantages to build from day one:

1. **Data completeness** — be the most comprehensive Hot Wheels database publicly available
2. **Community trust** — user-contributed photos and corrections make the data better over time
3. **Network effect** — the more collectors join, the more valuable the marketplace becomes
4. **SEO** — 30,000+ car pages = enormous organic search footprint ("1969 Hot Wheels Deora value")

---

## Key Metrics to Track

- MAU (Monthly Active Users)
- Portfolio creates per day
- Share link click-through rate
- Catalog search volume
- Conversion: free → Pro
- Marketplace GMV (Gross Merchandise Value)
- Average cars per active user

---

## Notes for v1 Architecture

These commercial features must NOT be built in v1 but the architecture must not block them:

- **User model must support roles** (`free` | `pro` | `dealer` | `admin`) — add `role` field to users table even if unused in v1
- **Cars must have a `market_value` field** (nullable, float) — seed it as null but the column must exist
- **Portfolios must support `visibility: 'public' | 'private' | 'unlisted'`** — v1 only uses public/private but add unlisted
- **Share slugs must support custom slugs** — v1 generates random ones, but the column must accept user-defined strings too
