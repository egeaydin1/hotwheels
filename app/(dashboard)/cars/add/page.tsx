'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

export default function AddCarPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState({
    name: '',
    seriesName: '',
    year: String(new Date().getFullYear()),
    color: '',
    collector_number: '',
    notes: '',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast('Photo must be under 5MB', 'error'); return }
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (photo) fd.append('photo', photo)

      const res = await fetch('/api/cars/manual', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) {
        toast(data.error ?? 'Failed to add car', 'error')
        return
      }

      toast(`${form.name} added to your cars!`)
      router.push('/catalog')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">Add Custom Car</h1>
        <p className="text-gray-400 text-sm">Can&apos;t find a car in the catalog? Add it manually.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-hw-card border border-hw-border rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Car Name *</label>
            <input type="text" value={form.name} onChange={update('name')} required className="input-field" placeholder="e.g. Deora II" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Series Name *</label>
            <input type="text" value={form.seriesName} onChange={update('seriesName')} required className="input-field" placeholder="e.g. Mainline 2024" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Year *</label>
            <input type="number" value={form.year} onChange={update('year')} required min={1968} max={2030} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Color</label>
            <input type="text" value={form.color} onChange={update('color')} className="input-field" placeholder="e.g. Red" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Collector #</label>
            <input type="text" value={form.collector_number} onChange={update('collector_number')} className="input-field" placeholder="e.g. 042/250" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Notes</label>
          <textarea
            value={form.notes}
            onChange={update('notes') as React.ChangeEventHandler<HTMLTextAreaElement>}
            rows={3}
            className="input-field resize-none"
            placeholder="Mint in box, missing wheel, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Photo</label>
          {preview ? (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-hw-border mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setPhoto(null); setPreview(null) }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ) : null}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhoto}
            className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-hw-red file:text-white hover:file:bg-red-600 cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">JPEG, PNG or WebP, max 5MB</p>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {loading ? 'Adding car...' : 'Add Car'}
          </button>
        </div>
      </form>
    </div>
  )
}
