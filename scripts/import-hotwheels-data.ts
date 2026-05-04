import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface HWRecord {
  [key: string]: unknown
}

function getField(r: HWRecord, ...keys: string[]): string {
  for (const k of keys) {
    const v = r[k]
    if (v && String(v).trim()) return String(v).trim()
  }
  return ''
}

function normalizeSeriesType(series: string): string {
  const s = series.toLowerCase()
  if (s.includes('super treasure') || s.includes('sth')) return 'super_treasure_hunt'
  if (s.includes('treasure hunt') || / th\b/.test(s) || s.endsWith(' th')) return 'treasure_hunt'
  if (s.includes('car culture') || s.includes('fast & furious') || s.includes('fast and furious') || s.includes('premium')) return 'premium'
  if (s.includes('pop culture') || s.includes('entertainment')) return 'pop_culture'
  if (s.includes('hw id') || s.includes('hot wheels id')) return 'id_car'
  return 'mainline'
}

function extractYear(seriesName: string, fallback = 2000): number {
  const match = seriesName.match(/\b(19[6-9]\d|20[0-3]\d)\b/)
  return match ? parseInt(match[0]) : fallback
}

function parseNDJSON(filePath: string): HWRecord[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const records: HWRecord[] = []
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      records.push(JSON.parse(trimmed))
    } catch { /* skip */ }
  }
  return records
}

function parseRegularJSON(filePath: string): HWRecord[] {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return Array.isArray(data) ? data : [data]
  } catch {
    return []
  }
}

async function importFile(filePath: string): Promise<{ cars: number; series: number }> {
  let records = parseNDJSON(filePath)
  if (records.length === 0) records = parseRegularJSON(filePath)

  const seriesCache = new Map<string, string>()
  let carCount = 0
  let seriesCount = 0

  for (const record of records) {
    // Car name — all known field variants
    const name = getField(record,
      'Casting', 'Car Name', 'Car name', 'Name', 'name'
    )
    if (!name || name.startsWith('By Year:') || name.startsWith('Col')) continue

    // Series name — all known field variants
    const rawSeries = getField(record,
      'Series Name / #', 'Series', 'Series #', 'series'
    )
    if (!rawSeries) continue

    // Strip collector number suffix like "#42" or "(#1/76)"
    const seriesName = rawSeries.replace(/\s*#\s*\d+.*$/, '').replace(/\s*\(\d+.*\)$/, '').trim()
    const year = extractYear(seriesName)
    const seriesKey = `${seriesName}:${year}`

    if (!seriesCache.has(seriesKey)) {
      const existing = await prisma.series.findFirst({
        where: { name: seriesName, year },
        select: { id: true },
      })
      if (existing) {
        seriesCache.set(seriesKey, existing.id)
      } else {
        const created = await prisma.series.create({
          data: { name: seriesName, year, type: normalizeSeriesType(seriesName) as never },
        })
        seriesCache.set(seriesKey, created.id)
        seriesCount++
      }
    }

    const seriesId = seriesCache.get(seriesKey)!

    // Color — multiple field variants
    const rawColor = getField(record, 'Color', 'Photo / Color', 'Photo')
    const color = rawColor && rawColor.length < 80 ? rawColor : null

    // Collector number
    const collectorNum = getField(record, 'Col. #', 'Col #', 'cast #', 'id') || null

    // Notes
    const notes = getField(record, 'Notes', 'Versions / Notes', 'Tampo') || null

    // Deterministic stable ID
    const stableId = `hw_${name}_${seriesName}_${year}`
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .slice(0, 36)
      .padEnd(36, '0')

    await prisma.car.upsert({
      where: { id: stableId },
      update: {},
      create: {
        id: stableId,
        name,
        series_id: seriesId,
        year,
        color,
        collector_number: collectorNum,
        category: notes,
        source: 'official',
      },
    }).catch(() => {})

    carCount++
    if (carCount % 500 === 0) process.stdout.write(`\rImported ${carCount} cars...`)
  }

  return { cars: carCount, series: seriesCount }
}

async function main() {
  console.log('🚗 Starting Hot Wheels data import...')

  const dataDirs = [
    path.join(process.cwd(), 'data', 'Hotwheels-Data'),
    path.join(process.cwd(), 'data'),
  ]

  let totalCars = 0
  let totalSeries = 0
  let imported = false

  for (const dir of dataDirs) {
    if (!fs.existsSync(dir)) continue
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
    if (files.length === 0) continue

    console.log(`\nImporting from: ${dir}`)
    console.log(`Found ${files.length} JSON file(s)`)

    for (const file of files) {
      process.stdout.write(`  Processing ${file}...`)
      const { cars, series } = await importFile(path.join(dir, file))
      totalCars += cars
      totalSeries += series
      console.log(` → ${cars} cars, ${series} new series`)
    }
    imported = true
    break
  }

  if (imported) {
    console.log(`\n✅ Import complete: ${totalCars.toLocaleString()} cars, ${totalSeries} series`)
  } else {
    console.log('\n⚠️  No data directory found. Creating sample data...')
    await createSampleData()
  }

  await prisma.$disconnect()
}

async function createSampleData() {
  const sampleSeries = [
    { name: 'Mainline 2024', year: 2024, type: 'mainline' as const },
    { name: 'Car Culture 2024', year: 2024, type: 'premium' as const },
    { name: 'Treasure Hunt 2024', year: 2024, type: 'treasure_hunt' as const },
    { name: 'Mainline 2023', year: 2023, type: 'mainline' as const },
    { name: 'Fast & Furious 2023', year: 2023, type: 'premium' as const },
  ]
  const sampleCars = [
    { name: 'Deora III', series: 0, year: 2024, color: 'Blue' },
    { name: 'Twin Mill', series: 0, year: 2024, color: 'Red' },
    { name: '1969 Camaro', series: 0, year: 2024, color: 'Green' },
    { name: 'Bone Shaker', series: 0, year: 2024, color: 'Black' },
    { name: 'Ferrari 488 GTB', series: 1, year: 2024, color: 'Red' },
    { name: 'Porsche 911 GT3 RS', series: 1, year: 2024, color: 'White' },
    { name: 'Lamborghini Huracán', series: 1, year: 2024, color: 'Orange' },
    { name: '1971 Datsun Bluebird U', series: 2, year: 2024, color: 'Yellow' },
    { name: 'Custom 1969 Chevy', series: 3, year: 2023, color: 'Purple' },
    { name: 'Nissan Skyline GT-R', series: 4, year: 2023, color: 'Silver' },
    { name: 'Toyota Supra', series: 4, year: 2023, color: 'White' },
    { name: '1967 Pontiac Firebird 400', series: 3, year: 2023, color: 'Blue' },
  ]
  const createdSeries: { id: string }[] = []
  for (const s of sampleSeries) {
    const series = await prisma.series.upsert({
      where: { name_year: { name: s.name, year: s.year } },
      update: {},
      create: s,
    })
    createdSeries.push(series)
  }
  for (let i = 0; i < sampleCars.length; i++) {
    const c = sampleCars[i]
    await prisma.car.create({
      data: {
        name: c.name,
        series_id: createdSeries[c.series].id,
        year: c.year,
        color: c.color,
        source: 'official',
        collector_number: String(i + 1).padStart(3, '0'),
      },
    }).catch(() => {})
  }
  console.log(`✅ Created ${sampleCars.length} sample cars`)
}

main().catch((e) => { console.error(e); process.exit(1) })
