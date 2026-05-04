import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: { id: params.id, user_id: session.user.id },
      include: {
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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, is_public } = body

    const portfolio = await prisma.portfolio.findFirst({
      where: { id: params.id, user_id: session.user.id },
    })
    if (!portfolio) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await prisma.portfolio.update({
      where: { id: params.id },
      data: {
        name,
        description,
        is_public,
        visibility: is_public ? 'public' : 'private',
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: { id: params.id, user_id: session.user.id },
    })
    if (!portfolio) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.portfolio.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 })
  }
}
