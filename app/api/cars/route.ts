import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '48')
    const search = searchParams.get('search') ?? ''
    const year = searchParams.get('year')
    const seriesType = searchParams.get('seriesType')
    const color = searchParams.get('color')
    const seriesId = searchParams.get('seriesId')

    const where: Record<string, unknown> = {}

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }
    if (year) {
      where.year = parseInt(year)
    }
    if (color) {
      where.color = { contains: color, mode: 'insensitive' }
    }
    if (seriesId) {
      where.series_id = seriesId
    }
    if (seriesType) {
      where.series = { type: seriesType }
    }

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        include: { series: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ year: 'desc' }, { name: 'asc' }],
      }),
      prisma.car.count({ where }),
    ])

    return NextResponse.json({ cars, total, page, pages: Math.ceil(total / limit) })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 })
  }
}
