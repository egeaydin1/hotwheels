'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { Car, Portfolio, Series } from '@/types'
import { useToast } from '@/components/ui/Toast'

interface AddToPortfolioModalProps {
  car: Car | null
  onClose: () => void
}

type Tab = 'car' | 'series'

export function AddToPortfolioModal({ car, onClose }: AddToPortfolioModalProps) {
  const { status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [tab, setTab] = useState<Tab>('car')
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [carStatus, setCarStatus] = useState<'owned' | 'wishlist' | 'for_trade'>('owned')

  // Seri arama state
  const [seriesQuery, setSeriesQuery] = useState('')
  const [seriesResults, setSeriesResults] = useState<(Series & { _count: { cars: number } })[]>([])
  const [seriesLoading, setSeriesLoading] = useState(false)
  const [selectedSeries, setSelectedSeries] = useState<(Series & { _count: { cars: number } }) | null>(null)
  const seriesTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!car) return
    if (status !== 'authenticated') return
    setLoading(true)
    setSelectedId('')
    setTab('car')
    setSelectedSeries(null)
    setSeriesQuery('')
    fetch('/api/portfolios')
      .then(r => r.json())
      .then(data => { setPortfolios(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => { setPortfolios([]); setLoading(false) })
  }, [status, car])

  const searchSeries = useCallback((q: string) => {
    clearTimeout(seriesTimer.current)
    if (!q.trim()) { setSeriesResults([]); return }
    seriesTimer.current = setTimeout(async () => {
      setSeriesLoading(true)
      try {
        const res = await fetch(`/api/series?search=${encodeURIComponent(q)}`)
        const data = await res.json()
        setSeriesResults(Array.isArray(data) ? data.slice(0, 8) : [])
      } finally {
        setSeriesLoading(false)
      }
    }, 300)
  }, [])

  if (!car) return null

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-hw-card border border-hw-border rounded-2xl p-6 max-w-sm w-full text-center text-gray-400 text-sm">
          Yükleniyor...
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-hw-card border border-hw-border rounded-2xl p-6 max-w-sm w-full">
          <h2 className="text-lg font-bold mb-4">Giriş yapın</h2>
          <p className="text-gray-400 mb-6 text-sm">Koleksiyonunuzu oluşturmak için giriş yapın.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 btn-secondary">İptal</button>
            <button onClick={() => router.push('/login')} className="flex-1 btn-primary">Giriş Yap</button>
          </div>
        </div>
      </div>
    )
  }

  const handleAddCar = async () => {
    if (!selectedId) return
    setAdding(true)
    try {
      const res = await fetch(`/api/portfolios/${selectedId}/cars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ car_id: car.id, status: carStatus }),
      })
      if (res.ok) { toast(`${car.name} portfolyoya eklendi!`); onClose() }
      else { const d = await res.json().catch(() => ({})); toast(d.error ?? 'Hata', 'error') }
    } finally { setAdding(false) }
  }

  const handleAddSeries = async () => {
    if (!selectedId || !selectedSeries) return
    setAdding(true)
    try {
      const res = await fetch(`/api/portfolios/${selectedId}/series`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ series_id: selectedSeries.id, status: carStatus }),
      })
      const data = await res.json()
      if (res.ok) {
        toast(`${data.added} araç portfolyoya eklendi! (${data.skipped ?? 0} zaten vardı)`)
        onClose()
      } else {
        toast(data.error ?? 'Hata', 'error')
      }
    } finally { setAdding(false) }
  }

  const PortfolioList = () => (
    <div className="space-y-1.5 mb-4 max-h-36 overflow-y-auto pr-1">
      {portfolios.map(p => (
        <button
          key={p.id}
          onClick={() => setSelectedId(p.id)}
          className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
            selectedId === p.id
              ? 'border-hw-red bg-hw-red/10 text-white'
              : 'border-hw-border text-gray-300 hover:border-hw-red/40'
          }`}
        >
          <span className="font-medium">{p.name}</span>
          <span className="text-gray-500 ml-2 text-xs">({p._count?.cars ?? 0} araç)</span>
        </button>
      ))}
    </div>
  )

  const StatusPicker = () => (
    <div className="mb-4">
      <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Durum</label>
      <div className="flex gap-2">
        {(['owned', 'wishlist', 'for_trade'] as const).map(s => (
          <button
            key={s}
            onClick={() => setCarStatus(s)}
            className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
              carStatus === s ? 'bg-hw-red text-white' : 'bg-hw-dark text-gray-400 hover:text-white'
            }`}
          >
            {s === 'owned' ? 'Sahibim' : s === 'wishlist' ? 'İstiyorum' : 'Takas'}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-hw-card border border-hw-border rounded-2xl p-5 max-w-sm w-full">
        {/* Başlık */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">Portfolyoya Ekle</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab seçici */}
        <div className="flex gap-1 p-1 bg-hw-dark rounded-lg mb-4">
          <button
            onClick={() => setTab('car')}
            className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
              tab === 'car' ? 'bg-hw-red text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            🚗 Bu Arabayı Ekle
          </button>
          <button
            onClick={() => setTab('series')}
            className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
              tab === 'series' ? 'bg-hw-red text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            📦 Seriyi Ekle
          </button>
        </div>

        {loading ? (
          <div className="text-center py-6 text-gray-400 text-sm">Yükleniyor...</div>
        ) : portfolios.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm mb-3">Henüz portfolyo yok.</p>
            <button onClick={() => { onClose(); router.push('/portfolios') }} className="btn-primary text-sm">
              Portfolyo Oluştur
            </button>
          </div>
        ) : (
          <>
            {tab === 'car' ? (
              /* ─── Tekil araç ekleme ─── */
              <>
                <p className="text-xs text-gray-400 mb-3 truncate font-medium">{car.name}</p>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Portfolyo</label>
                <PortfolioList />
                <StatusPicker />
                <div className="flex gap-3">
                  <button onClick={onClose} className="flex-1 btn-secondary text-sm">İptal</button>
                  <button
                    onClick={handleAddCar}
                    disabled={!selectedId || adding}
                    className="flex-1 btn-primary text-sm disabled:opacity-50"
                  >
                    {adding ? 'Ekleniyor...' : 'Ekle'}
                  </button>
                </div>
              </>
            ) : (
              /* ─── Seri bazlı ekleme ─── */
              <>
                <div className="mb-3">
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Seri Ara</label>
                  <input
                    type="text"
                    value={seriesQuery}
                    onChange={e => { setSeriesQuery(e.target.value); searchSeries(e.target.value); setSelectedSeries(null) }}
                    placeholder="Örn: Mainline 2023, Car Culture..."
                    className="input-field text-sm"
                  />
                </div>

                {/* Seri sonuçları */}
                {seriesLoading && (
                  <div className="text-xs text-gray-500 text-center py-2">Aranıyor...</div>
                )}
                {!seriesLoading && seriesResults.length > 0 && !selectedSeries && (
                  <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
                    {seriesResults.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedSeries(s); setSeriesResults([]) }}
                        className="w-full text-left px-3 py-2 rounded-lg bg-hw-dark hover:bg-hw-border/50 transition-colors"
                      >
                        <span className="text-sm text-white font-medium">{s.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{s.year} · {s._count.cars} araç</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Seçili seri */}
                {selectedSeries && (
                  <div className="flex items-center justify-between bg-hw-red/10 border border-hw-red/30 rounded-lg px-3 py-2 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{selectedSeries.name}</p>
                      <p className="text-xs text-gray-400">{selectedSeries.year} · {selectedSeries._count.cars} araç</p>
                    </div>
                    <button onClick={() => { setSelectedSeries(null); setSeriesQuery('') }} className="text-gray-400 hover:text-white ml-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {selectedSeries && (
                  <>
                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Portfolyo</label>
                    <PortfolioList />
                    <StatusPicker />
                    <div className="flex gap-3">
                      <button onClick={onClose} className="flex-1 btn-secondary text-sm">İptal</button>
                      <button
                        onClick={handleAddSeries}
                        disabled={!selectedId || adding}
                        className="flex-1 btn-primary text-sm disabled:opacity-50"
                      >
                        {adding ? 'Ekleniyor...' : `Tüm Seriyi Ekle (${selectedSeries._count.cars})`}
                      </button>
                    </div>
                  </>
                )}

                {!selectedSeries && !seriesLoading && !seriesResults.length && seriesQuery && (
                  <p className="text-xs text-gray-500 text-center py-2">Sonuç bulunamadı</p>
                )}

                {!selectedSeries && !seriesQuery && (
                  <p className="text-xs text-gray-500 text-center py-2">Seri adını yazmaya başlayın</p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
