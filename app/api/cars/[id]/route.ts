import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const car = await prisma.car.findUnique({
      where: { id: params.id },
      include: { series: true },
    })
    if (!car) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(car)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch car' }, { status: 500 })
  }
}
