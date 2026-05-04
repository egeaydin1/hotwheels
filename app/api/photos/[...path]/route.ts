import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const key = params.path.join('/')
  const storageUrl = `${process.env.STORAGE_ENDPOINT ?? 'http://storage:9000'}/${process.env.STORAGE_BUCKET ?? 'hotwheels'}/${key}`

  try {
    const res = await fetch(storageUrl)
    if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const buffer = await res.arrayBuffer()
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Storage unavailable' }, { status: 502 })
  }
}
