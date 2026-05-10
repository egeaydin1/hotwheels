import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// POST /api/portfolios/:id/series  — tüm seriyi portfolyoya ekle
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: { id: params.id, user_id: session.user.id },
    })
    if (!portfolio) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { series_id, status } = await req.json()
    if (!series_id) return NextResponse.json({ error: 'series_id required' }, { status: 400 })

    const cars = await prisma.car.findMany({
      where: { series_id },
      select: { id: true },
    })

    if (cars.length === 0) {
      return NextResponse.json({ error: 'No cars in this series' }, { status: 404 })
    }

    // Zaten portfolyoda olanları atla
    const existing = await prisma.portfolioCar.findMany({
      where: { portfolio_id: params.id, car_id: { in: cars.map(c => c.id) } },
      select: { car_id: true },
    })
    const existingIds = new Set(existing.map(e => e.car_id))
    const toAdd = cars.filter(c => !existingIds.has(c.id))

    if (toAdd.length === 0) {
      return NextResponse.json({ added: 0, message: 'All cars already in portfolio' })
    }

    await prisma.portfolioCar.createMany({
      data: toAdd.map(c => ({
        portfolio_id: params.id,
        car_id: c.id,
        status: status ?? 'owned',
      })),
      skipDuplicates: true,
    })

    await prisma.portfolio.update({
      where: { id: params.id },
      data: { updated_at: new Date() },
    })

    return NextResponse.json({ added: toAdd.length, skipped: existingIds.size })
  } catch {
    return NextResponse.json({ error: 'Failed to add series' }, { status: 500 })
  }
}
