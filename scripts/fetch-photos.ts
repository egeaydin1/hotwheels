import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3'
import * as https from 'https'
import * as http from 'http'

const prisma = new PrismaClient()

const s3 = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT ?? 'http://localhost:9000',
  region: process.env.STORAGE_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY ?? 'minioadmin',
    secretAccessKey: process.env.STORAGE_SECRET_KEY ?? 'minioadmin',
  },
  forcePathStyle: true,
})

const BUCKET = process.env.STORAGE_BUCKET ?? 'hotwheels'
const WIKI_API = 'https://hotwheels.fandom.com/api.php'
const DELAY_MS = 400
const BATCH_LIMIT = parseInt(process.env.PHOTO_BATCH_LIMIT ?? '0') // 0 = all

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function fetchURL(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, { headers: { 'User-Agent': 'HWVault/1.0' } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchURL(res.headers.location!).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`))
      }
      const chunks: Buffer[] = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')) })
  })
}

async function fetchJSON(url: string): Promise<Record<string, unknown>> {
  const buf = await fetchURL(url)
  return JSON.parse(buf.toString('utf-8'))
}

async function getWikiImageUrl(carName: string): Promise<string | null> {
  const encoded = encodeURIComponent(carName)
  const url = `${WIKI_API}?action=query&titles=${encoded}&prop=pageimages&pithumbsize=500&format=json&pilicense=any`
  try {
    const data = await fetchJSON(url) as { query: { pages: Record<string, { thumbnail?: { source: string }, missing?: string }> } }
    const pages = data.query?.pages ?? {}
    const page = Object.values(pages)[0]
    if (!page || 'missing' in page) return null
    return page.thumbnail?.source ?? null
  } catch {
    return null
  }
}

async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }))
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET }))
  }
}

async function uploadImage(buffer: Buffer, carId: string): Promise<string> {
  const key = `cars/${carId}.jpg`
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    ACL: 'public-read',
  }))
  const endpoint = (process.env.STORAGE_ENDPOINT ?? 'http://localhost:9000').replace('storage', 'localhost')
  return `${endpoint}/${BUCKET}/${key}`
}

async function main() {
  console.log('📸 HW Vault — Photo Fetcher')
  console.log(`   Source : Hot Wheels Fandom Wiki`)
  console.log(`   Storage: ${process.env.STORAGE_ENDPOINT}/${BUCKET}`)

  await ensureBucket()

  const where = { photo_url: null }
  const total = await prisma.car.count({ where })
  console.log(`\n🔍 ${total} cars without photos\n`)

  if (total === 0) {
    console.log('✅ All cars already have photos.')
    await prisma.$disconnect()
    return
  }

  const limit = BATCH_LIMIT > 0 ? BATCH_LIMIT : total
  const cars = await prisma.car.findMany({
    where,
    select: { id: true, name: true, year: true },
    orderBy: { year: 'desc' },
    take: limit,
  })

  let found = 0, notFound = 0, errors = 0

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i]

    if ((i + 1) % 50 === 0 || i === 0) {
      const pct = Math.round(((i + 1) / cars.length) * 100)
      console.log(`[${i + 1}/${cars.length}] ${pct}% — found: ${found}, not found: ${notFound}, errors: ${errors}`)
    }

    try {
      const imageUrl = await getWikiImageUrl(car.name)
      if (!imageUrl) { notFound++; await sleep(DELAY_MS); continue }

      const buffer = await fetchURL(imageUrl)
      const storedUrl = await uploadImage(buffer, car.id)

      await prisma.car.update({ where: { id: car.id }, data: { photo_url: storedUrl } })
      found++
    } catch (e) {
      errors++
      if (process.env.VERBOSE === '1') console.error(`  ✗ ${car.name}: ${(e as Error).message}`)
    }

    await sleep(DELAY_MS)
  }

  console.log(`\n✅ Done! Found: ${found} | Not on wiki: ${notFound} | Errors: ${errors}`)
  console.log(`   Remaining: ${total - found} cars still need photos`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
