export interface Car {
  id: string
  name: string
  series_id: string | null
  year: number
  collector_number: string | null
  color: string | null
  category: string | null
  photo_url: string | null
  market_value: number | null
  source: 'official' | 'user_submitted'
  submitted_by: string | null
  created_at: string
  series?: Series | null
}

export interface Series {
  id: string
  name: string
  year: number
  type: SeriesType
  car_count: number | null
  photo_url: string | null
  _count?: { cars: number }
}

export type SeriesType =
  | 'mainline'
  | 'premium'
  | 'treasure_hunt'
  | 'super_treasure_hunt'
  | 'pop_culture'
  | 'id_car'
  | 'custom'

export interface Portfolio {
  id: string
  user_id: string
  name: string
  description: string | null
  cover_photo_url: string | null
  visibility: 'public' | 'private' | 'unlisted'
  is_public: boolean
  share_slug: string | null
  created_at: string
  updated_at: string
  user?: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  cars?: PortfolioCar[]
  _count?: { cars: number }
}

export interface PortfolioCar {
  id: string
  portfolio_id: string
  car_id: string
  status: 'owned' | 'wishlist' | 'for_trade'
  notes: string | null
  added_at: string
  car: Car
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      username: string
    }
  }
}
