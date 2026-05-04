import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { uploadFile } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const name = formData.get('name') as string
    const seriesName = formData.get('seriesName') as string
    const year = parseInt(formData.get('year') as string)
    const color = formData.get('color') as string | null
    const collector_number = formData.get('collector_number') as string | null
    const photo = formData.get('photo') as File | null

    if (!name || !seriesName || !year) {
      return NextResponse.json({ error: 'Name, series and year are required' }, { status: 400 })
    }

    let series = await prisma.series.findFirst({
      where: { name: { equals: seriesName, mode: 'insensitive' }, year },
    })

    if (!series) {
      series = await prisma.series.create({
        data: { name: seriesName, year, type: 'custom' },
      })
    }

    let photo_url: string | null = null
    if (photo) {
      const buffer = Buffer.from(await photo.arrayBuffer())
      photo_url = await uploadFile(buffer, photo.type, 'user-cars')
    }

    const car = await prisma.car.create({
      data: {
        name,
        series_id: series.id,
        year,
        color,
        collector_number,
        photo_url,
        source: 'user_submitted',
        submitted_by: session.user.id,
      },
      include: { series: true },
    })

    return NextResponse.json(car, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create car' }, { status: 500 })
  }
}
