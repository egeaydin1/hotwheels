import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

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

    const body = await req.json()
    const { car_id, status, notes } = body

    if (!car_id) return NextResponse.json({ error: 'car_id required' }, { status: 400 })

    const entry = await prisma.portfolioCar.upsert({
      where: {
        portfolio_id_car_id: { portfolio_id: params.id, car_id },
      },
      update: { status, notes },
      create: { portfolio_id: params.id, car_id, status: status ?? 'owned', notes },
    })

    await prisma.portfolio.update({
      where: { id: params.id },
      data: { updated_at: new Date() },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to add car' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: { id: params.id, user_id: session.user.id },
    })
    if (!portfolio) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const car_id = searchParams.get('carId')

    if (!car_id) return NextResponse.json({ error: 'carId required' }, { status: 400 })

    await prisma.portfolioCar.delete({
      where: { portfolio_id_car_id: { portfolio_id: params.id, car_id } },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to remove car' }, { status: 500 })
  }
}
