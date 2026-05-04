import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CarCard } from '@/components/catalog/CarCard'
import Link from 'next/link'

interface Props {
  params: { slug: string }
}

async function getPortfolio(slug: string) {
  return prisma.portfolio.findUnique({
    where: { share_slug: slug },
    include: {
      user: { select: { username: true, display_name: true, avatar_url: true } },
      cars: {
        include: { car: { include: { series: true } } },
        orderBy: { added_at: 'desc' },
      },
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const portfolio = await getPortfolio(params.slug)
  if (!portfolio) return { title: 'Portfolio not found' }

  return {
    title: `${portfolio.name} — ${portfolio.user.display_name ?? portfolio.user.username}'s Hot Wheels`,
    description: portfolio.description ?? `${portfolio.cars.length} Hot Wheels cars in this collection`,
    openGraph: {
      title: portfolio.name,
      description: portfolio.description ?? `${portfolio.cars.length} cars`,
      type: 'website',
    },
  }
}

export default async function SharePage({ params }: Props) {
  const portfolio = await getPortfolio(params.slug)
  if (!portfolio) notFound()

  const owner = portfolio.user.display_name ?? portfolio.user.username
  const statusGroups = {
    owned: portfolio.cars.filter((c) => c.status === 'owned'),
    wishlist: portfolio.cars.filter((c) => c.status === 'wishlist'),
    for_trade: portfolio.cars.filter((c) => c.status === 'for_trade'),
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Portfolio header */}
        <div className="bg-hw-card border border-hw-border rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Collection by</div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-hw-red flex items-center justify-center text-white font-bold text-sm">
                  {portfolio.user.username[0].toUpperCase()}
                </div>
                <span className="font-semibold text-white">{owner}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-2">{portfolio.name}</h1>
              {portfolio.description && (
                <p className="text-gray-400">{portfolio.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-hw-red">{portfolio.cars.length}</div>
              <div className="text-sm text-gray-400">total cars</div>
            </div>
          </div>

          <div className="flex gap-4 mt-4 pt-4 border-t border-hw-border">
            <div className="text-center">
              <div className="font-bold text-white">{statusGroups.owned.length}</div>
              <div className="text-xs text-gray-500">Owned</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-white">{statusGroups.wishlist.length}</div>
              <div className="text-xs text-gray-500">Wishlist</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-white">{statusGroups.for_trade.length}</div>
              <div className="text-xs text-gray-500">For Trade</div>
            </div>
          </div>
        </div>

        {/* Cars grid */}
        {portfolio.cars.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🚗</div>
            <p className="text-gray-400">No cars in this portfolio yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {portfolio.cars.map((pc) => (
              <div key={pc.id} className="relative">
                <CarCard car={pc.car as never} />
                <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                  pc.status === 'owned' ? 'bg-green-500/20 text-green-300' :
                  pc.status === 'wishlist' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-amber-500/20 text-amber-300'
                }`}>
                  {pc.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="border-t border-hw-border bg-hw-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-gray-400 mb-4">Want to build your own Hot Wheels portfolio?</p>
          <Link href="/signup" className="btn-primary px-8 py-3 text-base inline-block">
            Create Your Free Collection
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
