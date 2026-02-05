export type DealSortKey = "latest" | "views" | "votes" | "comments"

export type ShippingType = "FREE" | "PAID" | "UNKNOWN" | string

export type DealListFilters = {
  query?: string
  source?: string
  categoryIds?: number[]
  soldOut?: boolean
  sort?: DealSortKey
}

export type DealMetricSnapshot = {
  views: number | null
  votes: number | null
  comments: number | null
  captured_at: string
  source: string
}

export type DealSource = {
  source: string
  post_url: string
  title: string
  thumb_url: string | null
}

export type DealLink = {
  url: string
  domain: string
  is_affiliate: boolean
}

export type DealListItem = {
  id: number
  title: string
  shop_name: string | null
  subcategory: string | null
  price: string | number | null
  shipping_type: ShippingType
  sold_out: boolean
  thumbnail_url: string | null
  created_at: string
  category_id: number
  category_name: string
  source: DealSource | null
  buy_link: DealLink | null
  metrics: DealMetricSnapshot | null
}

export type DealDetail = {
  id: number
  title: string
  shop_name: string | null
  subcategory: string | null
  price: string | number | null
  shipping_type: ShippingType
  sold_out: boolean
  thumbnail_url: string | null
  created_at: string
  category_id: number
  category_name: string
  sources: DealSource[]
  links: DealLink[]
  metrics_history: DealMetricSnapshot[]
}

export type Category = {
  id: number
  name: string
}
