'use client'

interface FilterPanelProps {
  filters: {
    year: string
    seriesType: string
    color: string
  }
  onChange: (filters: { year: string; seriesType: string; color: string }) => void
}

const SERIES_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'mainline', label: 'Mainline' },
  { value: 'premium', label: 'Premium' },
  { value: 'treasure_hunt', label: 'Treasure Hunt' },
  { value: 'super_treasure_hunt', label: 'Super TH' },
  { value: 'pop_culture', label: 'Pop Culture' },
  { value: 'id_car', label: 'ID Car' },
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 1967 }, (_, i) => String(currentYear - i))

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const update = (key: keyof typeof filters, value: string) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Series Type</label>
        <div className="space-y-1">
          {SERIES_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => update('seriesType', t.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.seriesType === t.value
                  ? 'bg-hw-red text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-hw-border/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Year</label>
        <select
          value={filters.year}
          onChange={(e) => update('year', e.target.value)}
          className="input-field text-sm"
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Color</label>
        <input
          type="text"
          value={filters.color}
          onChange={(e) => update('color', e.target.value)}
          placeholder="e.g. Red, Blue..."
          className="input-field text-sm"
        />
      </div>

      {(filters.year || filters.seriesType || filters.color) && (
        <button
          onClick={() => onChange({ year: '', seriesType: '', color: '' })}
          className="w-full text-sm text-gray-400 hover:text-white border border-hw-border hover:border-hw-border rounded-lg py-2 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}
