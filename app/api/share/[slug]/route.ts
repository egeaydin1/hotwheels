import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { share_slug: params.slug },
      include: {
        user: { select: { username: true, display_name: true, avatar_url: true } },
        cars: {
          include: { car: { include: { series: true } } },
          orderBy: { added_at: 'desc' },
        },
      },
    })

    if (!portfolio) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(portfolio)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
  }
}
