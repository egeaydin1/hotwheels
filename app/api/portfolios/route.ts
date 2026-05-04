import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const portfolios = await prisma.portfolio.findMany({
      where: { user_id: session.user.id },
      include: { _count: { select: { cars: true } } },
      orderBy: { updated_at: 'desc' },
    })

    return NextResponse.json(portfolios)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, is_public } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        user_id: session.user.id,
        name,
        description,
        is_public: is_public ?? false,
        visibility: is_public ? 'public' : 'private',
      },
    })

    return NextResponse.json(portfolio, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 })
  }
}
