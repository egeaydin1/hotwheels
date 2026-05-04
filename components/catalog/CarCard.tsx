'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Car } from '@/types'

const SERIES_COLORS: Record<string, string> = {
  mainline: 'bg-blue-500/20 text-blue-300',
  premium: 'bg-purple-500/20 text-purple-300',
  treasure_hunt: 'bg-yellow-500/20 text-yellow-300',
  super_treasure_hunt: 'bg-amber-500/20 text-amber-300',
  pop_culture: 'bg-pink-500/20 text-pink-300',
  id_car: 'bg-green-500/20 text-green-300',
  custom: 'bg-gray-500/20 text-gray-300',
}

interface CarCardProps {
  car: Car
  onAddToPortfolio?: (car: Car) => void
}

export function CarCard({ car, onAddToPortfolio }: CarCardProps) {
  const [imgError, setImgError] = useState(false)
  const seriesType = car.series?.type ?? 'mainline'
  const badge = SERIES_COLORS[seriesType] ?? SERIES_COLORS.mainline

  return (
    <div className="bg-hw-card border border-hw-border rounded-xl overflow-hidden card-hover group cursor-pointer">
      <div className="relative aspect-square bg-[#111]">
        {car.photo_url && !imgError ? (
          <Image
            src={car.photo_url}
            alt={car.name}
            fill
            className="object-contain p-4"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <svg
              className="w-12 h-12 text-gray-600"
              viewBox="0 0 64 32"
              fill="currentColor"
            >
              <path d="M60 16H57L52 6H12L7 16H4C2.9 16 2 16.9 2 18v4c0 1.1.9 2 2 2h2a6 6 0 0012 0h28a6 6 0 0012 0h2c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zm-44 9a3 3 0 110-6 3 3 0 010 6zm32 0a3 3 0 110-6 3 3 0 010 6zM14 14l4-6h28l4 6H14z" />
            </svg>
            <span className="text-xs text-gray-600 font-medium">No Photo</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-white truncate mb-1">{car.name}</h3>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}>
            {seriesType.replace(/_/g, ' ')}
          </span>
          <span className="text-xs text-gray-500">{car.year}</span>
        </div>
        {car.color && (
          <p className="text-xs text-gray-400 truncate mb-2">{car.color}</p>
        )}
        {onAddToPortfolio && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddToPortfolio(car) }}
            className="w-full btn-primary text-xs py-1.5 mt-1"
          >
            + Add to Portfolio
          </button>
        )}
      </div>
    </div>
  )
}
