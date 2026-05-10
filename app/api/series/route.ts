import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type   = searchParams.get('type')
    const year   = searchParams.get('year')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (year) where.year = parseInt(year)
    if (search) where.name = { contains: search, mode: 'insensitive' }

    const series = await prisma.series.findMany({
      where,
      orderBy: [{ year: 'desc' }, { name: 'asc' }],
      include: { _count: { select: { cars: true } } },
      take: search ? 10 : undefined,
    })

    return NextResponse.json(series)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 })
  }
}
