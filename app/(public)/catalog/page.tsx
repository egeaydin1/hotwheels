'use client'

import { useState, useEffect, useCallback } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CarCard } from '@/components/catalog/CarCard'
import { SearchBar } from '@/components/catalog/SearchBar'
import { FilterPanel } from '@/components/catalog/FilterPanel'
import { AddToPortfolioModal } from '@/components/portfolio/AddToPortfolioModal'
import { CarCardSkeleton } from '@/components/ui/Skeleton'
import type { Car } from '@/types'

interface Filters {
  year: string
  seriesType: string
  color: string
}

export default function CatalogPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>({ year: '', seriesType: '', color: '' })
  const [loading, setLoading] = useState(true)
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchCars = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '48',
        ...(search && { search }),
        ...(filters.year && { year: filters.year }),
        ...(filters.seriesType && { seriesType: filters.seriesType }),
        ...(filters.color && { color: filters.color }),
      })
      const res = await fetch(`/api/cars?${params}`)
      const data = await res.json()
      setCars(data.cars ?? [])
      setTotal(data.total ?? 0)
      setPages(data.pages ?? 1)
    } finally {
      setLoading(false)
    }
  }, [page, search, filters])

  useEffect(() => { fetchCars() }, [fetchCars])

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleFilters = (f: Filters) => { setFilters(f); setPage(1) }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white mb-1">Hot Wheels Catalog</h1>
          <p className="text-gray-400 text-sm">{total.toLocaleString()} cars found</p>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <SearchBar value={search} onChange={handleSearch} />
          </div>
          <button
            className="md:hidden btn-secondary px-4"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-56 flex-shrink-0`}>
            <div className="bg-hw-card border border-hw-border rounded-xl p-4 sticky top-20">
              <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Filters</h2>
              <FilterPanel filters={filters} onChange={handleFilters} />
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 20 }).map((_, i) => <CarCardSkeleton key={i} />)}
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-xl font-bold text-white mb-2">No cars found</h3>
                <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {cars.map((car) => (
                    <CarCard key={car.id} car={car} onAddToPortfolio={setSelectedCar} />
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                    >
                      ← Prev
                    </button>
                    <span className="text-gray-400 text-sm px-4">
                      Page {page} of {pages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      disabled={page === pages}
                      className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <AddToPortfolioModal car={selectedCar} onClose={() => setSelectedCar(null)} />
    </div>
  )
}
