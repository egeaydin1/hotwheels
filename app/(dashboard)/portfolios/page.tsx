'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Portfolio } from '@/types'
import { PortfolioCardSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'

function PortfolioCard({ portfolio, onDelete }: { portfolio: Portfolio; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm('Delete this portfolio?')) return
    setDeleting(true)
    try {
      await fetch(`/api/portfolios/${portfolio.id}`, { method: 'DELETE' })
      onDelete(portfolio.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Link href={`/portfolios/${portfolio.id}`} className="block">
      <div className="bg-hw-card border border-hw-border rounded-xl p-5 card-hover h-full">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-white truncate flex-1 pr-2">{portfolio.name}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              portfolio.is_public
                ? 'bg-green-500/20 text-green-300'
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {portfolio.is_public ? 'Public' : 'Private'}
            </span>
          </div>
        </div>
        {portfolio.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{portfolio.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-hw-border">
          <span className="text-sm text-gray-400">
            <span className="text-white font-semibold">{portfolio._count?.cars ?? 0}</span> cars
          </span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            {deleting ? '...' : 'Delete'}
          </button>
        </div>
      </div>
    </Link>
  )
}

export default function PortfoliosPage() {
  const { toast } = useToast()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  useEffect(() => {
    fetch('/api/portfolios')
      .then((r) => r.json())
      .then((data) => { setPortfolios(data); setLoading(false) })
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc }),
      })
      const data = await res.json()
      setPortfolios((prev) => [data, ...prev])
      setNewName('')
      setNewDesc('')
      setShowForm(false)
      toast('Portfolio created!')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">My Portfolios</h1>
          <p className="text-gray-400 text-sm mt-1">{portfolios.length} portfolios</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          + New Portfolio
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-hw-card border border-hw-border rounded-xl p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">New Portfolio</h2>
          <div className="space-y-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Portfolio name *"
              required
              className="input-field"
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              className="input-field"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary flex-1 disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Portfolio'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <PortfolioCardSkeleton key={i} />)}
        </div>
      ) : portfolios.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-white mb-2">No portfolios yet</h3>
          <p className="text-gray-400 text-sm mb-6">Create your first portfolio to start collecting</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Create Portfolio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((p) => (
            <PortfolioCard
              key={p.id}
              portfolio={p}
              onDelete={(id) => setPortfolios((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
