import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CarCard } from '@/components/catalog/CarCard'

async function getStats() {
  try {
    const [totalCars, totalPortfolios, totalUsers] = await Promise.all([
      prisma.car.count(),
      prisma.portfolio.count(),
      prisma.user.count(),
    ])
    return { totalCars, totalPortfolios, totalUsers }
  } catch {
    return { totalCars: 0, totalPortfolios: 0, totalUsers: 0 }
  }
}

async function getFeaturedCars() {
  try {
    const total = await prisma.car.count()
    const skip = Math.max(0, Math.floor(Math.random() * (total - 6)))
    return await prisma.car.findMany({
      take: 6,
      skip,
      include: { series: true },
      orderBy: { year: 'desc' },
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [stats, featured] = await Promise.all([getStats(), getFeaturedCars()])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-hw-dark">
        <div className="absolute inset-0 bg-gradient-to-br from-hw-red/10 via-transparent to-hw-orange/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-hw-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-hw-orange/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-hw-red/10 border border-hw-red/20 rounded-full px-3 py-1 text-sm text-hw-red font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-hw-red animate-pulse" />
              Hot Wheels Collector Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              Build Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-hw-red to-hw-orange">
                Hot Wheels
              </span>{' '}
              Legacy
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Browse {stats.totalCars.toLocaleString()}+ cars from the complete Hot Wheels catalog.
              Build portfolios, track your collection, and share it with the world.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/catalog" className="btn-primary text-base px-6 py-3">
                Browse Catalog
              </Link>
              <Link href="/signup" className="btn-secondary text-base px-6 py-3">
                Start Collecting →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-hw-card border-y border-hw-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-black text-hw-red">{stats.totalCars.toLocaleString()}+</div>
              <div className="text-sm text-gray-400 mt-1">Cars in Catalog</div>
            </div>
            <div>
              <div className="text-3xl font-black text-hw-orange">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-1">Collectors</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white">{stats.totalPortfolios.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-1">Portfolios Created</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Featured Cars</h2>
            <Link href="/catalog" className="text-sm text-hw-red hover:text-red-400 transition-colors font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {featured.map((car) => (
              <CarCard key={car.id} car={car as never} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-hw-red/10 to-hw-orange/10 border border-hw-red/20 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to start collecting?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Join thousands of Hot Wheels collectors. Build your portfolio, share with friends, and discover rare finds.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="btn-primary px-8 py-3 text-base">
              Create Free Account
            </Link>
            <Link href="/catalog" className="btn-secondary px-8 py-3 text-base">
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
