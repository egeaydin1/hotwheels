'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { Car, Portfolio } from '@/types'
import { useToast } from '@/components/ui/Toast'

interface AddToPortfolioModalProps {
  car: Car | null
  onClose: () => void
}

export function AddToPortfolioModal({ car, onClose }: AddToPortfolioModalProps) {
  const { status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [status2, setStatus2] = useState<'owned' | 'wishlist' | 'for_trade'>('owned')

  useEffect(() => {
    if (!car) return
    if (status !== 'authenticated') return

    setLoading(true)
    setSelectedId('')
    fetch('/api/portfolios')
      .then((r) => r.json())
      .then((data) => {
        setPortfolios(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setPortfolios([])
        setLoading(false)
      })
  }, [status, car])

  if (!car) return null

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-hw-card border border-hw-border rounded-2xl p-6 max-w-sm w-full text-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-hw-card border border-hw-border rounded-2xl p-6 max-w-sm w-full">
          <h2 className="text-lg font-bold mb-4">Sign in to add cars</h2>
          <p className="text-gray-400 mb-6 text-sm">Create an account to build and share your Hot Wheels portfolio.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={() => router.push('/login')} className="flex-1 btn-primary">Sign In</button>
          </div>
        </div>
      </div>
    )
  }

  const handleAdd = async () => {
    if (!selectedId) return
    setAdding(true)
    try {
      const res = await fetch(`/api/portfolios/${selectedId}/cars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ car_id: car.id, status: status2 }),
      })
      if (res.ok) {
        toast(`${car.name} added to portfolio!`)
        onClose()
      } else {
        const data = await res.json().catch(() => ({}))
        toast(data.error ?? 'Failed to add car', 'error')
      }
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-hw-card border border-hw-border rounded-2xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Add to Portfolio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4 truncate font-medium">{car.name}</p>

        {loading ? (
          <div className="text-center py-6 text-gray-400 text-sm">Loading portfolios...</div>
        ) : portfolios.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm mb-4">No portfolios yet.</p>
            <button onClick={() => { onClose(); router.push('/portfolios') }} className="btn-primary text-sm">
              Create Portfolio
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {portfolios.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                    selectedId === p.id
                      ? 'border-hw-red bg-hw-red/10 text-white'
                      : 'border-hw-border text-gray-300 hover:border-hw-red/50'
                  }`}
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-gray-500 ml-2">({p._count?.cars ?? 0} cars)</span>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Status</label>
              <div className="flex gap-2">
                {(['owned', 'wishlist', 'for_trade'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus2(s)}
                    className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                      status2 === s ? 'bg-hw-red text-white' : 'bg-hw-dark text-gray-400 hover:text-white'
                    }`}
                  >
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 btn-secondary text-sm">Cancel</button>
              <button
                onClick={handleAdd}
                disabled={!selectedId || adding}
                className="flex-1 btn-primary text-sm disabled:opacity-50"
              >
                {adding ? 'Adding...' : 'Add Car'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
