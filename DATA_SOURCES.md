# Hot Wheels Data Sources — Research & Implementation Guide

**Version:** 1.0  
**Date:** May 2026

---

## Summary

There is no single official public API from Mattel for Hot Wheels data. The best available strategy is a **layered approach**: start with the best open dataset, enrich with wiki scraping, and allow users to fill the gaps via manual entry.

---

## 1. Primary Data Source — Fandom Wiki Dataset (GitHub)

### Repository
**`pvwnthem/Hotwheels-Data`**  
🔗 https://github.com/pvwnthem/Hotwheels-Data

### What It Contains
- Scraped from the Hot Wheels Fandom Wiki
- Covers **most/all cars from 1974–2023**
- JSON format, ready to import
- Fields typically include: car name, year, series, color variants, collector number

### How to Use It
1. Clone the repository: `git clone https://github.com/pvwnthem/Hotwheels-Data`
2. Parse the JSON files and run a **seed script** to populate the `cars` and `series` tables in PostgreSQL
3. Write a `scripts/seed.ts` (or `seed.py`) that:
   - Reads each JSON file
   - Upserts `series` records first
   - Upserts `car` records with FK to series
   - Skips duplicates (use `ON CONFLICT DO NOTHING`)
4. Mark all seeded records as `source: "official"`

### Data Gaps to Expect
- Photos: the dataset may not include photo URLs or images may be dead links → use placeholder images
- 2024–2026 cars: not yet in the dataset → must be added manually or via wiki scraping
- Some series may have incomplete car lists

---

## 2. Secondary Source — Hot Wheels Fandom Wiki (Live Scraping)

### URL
🔗 https://hotwheels.fandom.com/wiki/Hot_Wheels

### What It Offers
- Comprehensive wiki with pages for nearly every car
- Lists organized by year: https://hotwheels.fandom.com/wiki/Category:Lists_of_Hot_Wheels_by_year
- Each car page often has: photo, designer, collector number, color variants, series

### Scraping Strategy
Use the **Fandom MediaWiki API** (not raw HTML scraping) — it's more stable:

```
https://hotwheels.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:2024_Hot_Wheels&cmlimit=500&format=json
```

For each car page, fetch structured data:
```
https://hotwheels.fandom.com/api.php?action=parse&page=<CAR_NAME>&prop=wikitext&format=json
```

Parse the wikitext infobox to extract fields.

### Existing Scraper Projects
- **`joedots1/fast_wheels`** — FastAPI + MongoDB + Docker, data from wiki 2010–2020  
  🔗 https://github.com/joedots1/fast_wheels  
  → Can use as reference for parsing logic

- **`rfaita/hwcollection`** — Full collection app with wiki crawler  
  🔗 https://github.com/rfaita/hwcollection

### Rate Limiting
- Fandom allows ~200 req/min without auth
- Add 300ms delay between requests
- Cache all responses locally before processing
- Run scraper as a one-time offline job, not on every app startup

---

## 3. Tertiary Source — CollectHW.com

### URL
🔗 https://collecthw.com

### What It Offers
- Treasure Hunt and Super Treasure Hunt lists
- Organized by year
- Good for verifying TH/STH status of cars

### Usage
- No public API — manual reference only
- Cross-reference TH/STH tags when seeding data
- Use to validate treasure hunt fields in the database

---

## 4. Car Photos

This is the **hardest part** of the data problem. Options:

### Option A: Fandom Wiki Images (Recommended for Seed)
- Each car wiki page usually has an infobox image
- Fandom image URLs follow pattern: `https://static.wikia.nocookie.net/hotwheels/images/...`
- Fetch during scraping, store in your own Supabase/MinIO bucket
- **Legal note:** Fandom wiki images are user-uploaded and may have mixed licensing. For a personal/demo project this is acceptable; for commercial use, obtain proper licenses.

### Option B: User-Contributed Photos
- Build a photo contribution flow from day one
- Users who own a car can upload photos
- Community-sourced images fill gaps over time
- Store in Supabase Storage with public read access

### Option C: Placeholder System
- For cars with no photo: use a branded placeholder image
- Categorize by series type for contextual placeholders (e.g., silhouette of a muscle car for muscle car series)

---

## 5. Recommended Seeding Workflow

```
Step 1: Clone pvwnthem/Hotwheels-Data
         → Import JSON → PostgreSQL (seed script)
         
Step 2: Run Fandom scraper for 2024–2026 gaps
         → Append new records to DB
         
Step 3: Fetch & store car photos
         → Download wiki images → Upload to MinIO/Supabase Storage
         → Update photo_url in DB
         
Step 4: Verify TH/STH tags
         → Cross-reference collecthw.com lists
         
Step 5: Deploy app with seeded data
```

The seed script should be idempotent — safe to run multiple times.

---

## 6. Data Update Strategy (Ongoing)

Hot Wheels releases new cars every year in batches (Factory Cases A–H).

- Run the Fandom scraper quarterly (or trigger manually via admin panel)
- New mainline releases appear on the wiki within weeks of retail release
- Use a `last_scraped_at` timestamp on series records to track freshness

---

## 7. Series Categories Reference

For correctly categorizing imported data:

| Type | Description |
|---|---|
| `mainline` | Standard $1–$2 retail cars, ~250/year |
| `premium` | Higher price point, better detail (Car Culture, Fast & Furious, etc.) |
| `treasure_hunt` | Hidden within mainline, "TH" stamp, 15/year |
| `super_treasure_hunt` | Spectraflame paint + Real Rider wheels, rarest |
| `pop_culture` | Licensed entertainment brands |
| `id_car` | Interactive series with app integration |
| `custom` | User-created (manual entry) |

---

## 8. Legal Considerations

- **Hot Wheels** is a registered trademark of Mattel, Inc.
- Do not use the official Hot Wheels logo without permission
- Community wiki data is generally permissible for personal/educational use
- For commercial deployment, consult an IP attorney regarding data usage and branding
- User-uploaded photos of physical cars they own: generally permissible (fair use / personal property)
