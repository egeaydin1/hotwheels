'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Portfolio, PortfolioCar } from '@/types'
import { CarCard } from '@/components/catalog/CarCard'
import { useToast } from '@/components/ui/Toast'
import { CarCardSkeleton } from '@/components/ui/Skeleton'

const STATUS_COLORS = {
  owned: 'bg-green-500/20 text-green-300',
  wishlist: 'bg-blue-500/20 text-blue-300',
  for_trade: 'bg-amber-500/20 text-amber-300',
}

export default function PortfolioDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { toast } = useToast()
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareLoading, setShareLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/portfolios/${id}`)
      .then((r) => r.json())
      .then((data) => { setPortfolio(data); setLoading(false) })
  }, [id])

  const generateShare = async () => {
    setShareLoading(true)
    try {
      const res = await fetch(`/api/portfolios/${id}/share`, { method: 'POST' })
      const data = await res.json()
      setPortfolio((prev) => prev ? { ...prev, share_slug: data.slug, is_public: true } : null)
      toast('Share link generated!')
    } finally {
      setShareLoading(false)
    }
  }

  const revokeShare = async () => {
    if (!confirm('Revoke share link? Anyone with the link will lose access.')) return
    await fetch(`/api/portfolios/${id}/share`, { method: 'DELETE' })
    setPortfolio((prev) => prev ? { ...prev, share_slug: null, is_public: false } : null)
    toast('Share link revoked')
  }

  const copyLink = () => {
    if (!portfolio?.share_slug) return
    navigator.clipboard.writeText(`${window.location.origin}/share/${portfolio.share_slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast('Link copied!')
  }

  const removeCar = async (portfolioCarId: string, carName: string) => {
    await fetch(`/api/portfolios/${id}/cars?carId=${portfolioCarId}`, { method: 'DELETE' })
    setPortfolio((prev) =>
      prev ? { ...prev, cars: prev.cars?.filter((c) => c.id !== portfolioCarId) } : null
    )
    toast(`${carName} removed`)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-48 bg-hw-border rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <CarCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-gray-400">Portfolio not found.</p>
        <Link href="/portfolios" className="btn-primary mt-4 inline-block">Back to Portfolios</Link>
      </div>
    )
  }

  const cars = (portfolio.cars ?? []) as PortfolioCar[]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-hw-card border border-hw-border rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link href="/portfolios" className="text-gray-400 hover:text-white text-sm transition-colors">
                ← Portfolios
              </Link>
            </div>
            <h1 className="text-2xl font-black text-white mb-1">{portfolio.name}</h1>
            {portfolio.description && <p className="text-gray-400 text-sm">{portfolio.description}</p>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/catalog" className="btn-secondary text-sm">+ Add Cars</Link>
            {portfolio.share_slug ? (
              <div className="flex items-center gap-2">
                <button onClick={copyLink} className="btn-secondary text-sm">
                  {copied ? '✓ Copied!' : '🔗 Copy Link'}
                </button>
                <button onClick={revokeShare} className="text-sm text-gray-500 hover:text-red-400 transition-colors">
                  Revoke
                </button>
              </div>
            ) : (
              <button
                onClick={generateShare}
                disabled={shareLoading}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {shareLoading ? 'Generating...' : '🔗 Share'}
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6 mt-4 pt-4 border-t border-hw-border">
          <div>
            <span className="font-bold text-white text-lg">{cars.length}</span>
            <span className="text-gray-500 text-sm ml-1">total</span>
          </div>
          <div>
            <span className="font-bold text-white text-lg">{cars.filter((c) => c.status === 'owned').length}</span>
            <span className="text-gray-500 text-sm ml-1">owned</span>
          </div>
          <div>
            <span className="font-bold text-white text-lg">{cars.filter((c) => c.status === 'wishlist').length}</span>
            <span className="text-gray-500 text-sm ml-1">wishlist</span>
          </div>
          <div>
            <span className="font-bold text-white text-lg">{cars.filter((c) => c.status === 'for_trade').length}</span>
            <span className="text-gray-500 text-sm ml-1">for trade</span>
          </div>
        </div>
      </div>

      {cars.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🚗</div>
          <h3 className="text-xl font-bold text-white mb-2">No cars yet</h3>
          <p className="text-gray-400 text-sm mb-6">Browse the catalog and add cars to this portfolio</p>
          <Link href="/catalog" className="btn-primary">Browse Catalog</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {cars.map((pc) => (
            <div key={pc.id} className="relative">
              <CarCard car={pc.car} />
              <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[pc.status]}`}>
                {pc.status.replace(/_/g, ' ')}
              </span>
              <button
                onClick={() => removeCar(pc.car_id, pc.car.name)}
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/70 text-gray-400 hover:text-red-400 flex items-center justify-center text-xs transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
