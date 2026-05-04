import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: { id: params.id, user_id: session.user.id },
    })
    if (!portfolio) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const slug = randomBytes(16).toString('hex')

    const updated = await prisma.portfolio.update({
      where: { id: params.id },
      data: { share_slug: slug, is_public: true, visibility: 'public' },
    })

    return NextResponse.json({ slug: updated.share_slug })
  } catch {
    return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 })
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

    await prisma.portfolio.update({
      where: { id: params.id },
      data: { share_slug: null },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to revoke share link' }, { status: 500 })
  }
}
