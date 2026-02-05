import { getSupabaseClient } from "@/lib/supabaseClient"
import type {
  Category,
  DealDetail,
  DealListFilters,
  DealListItem,
  DealLink,
  DealMetricSnapshot,
  DealSource,
} from "@/types/hotori"

type DealListRow = {
  id: number
  category_id: number
  title: string
  shop_name: string | null
  subcategory: string | null
  price: string | number | null
  shipping_type: string
  sold_out: boolean
  thumbnail_url: string | null
  created_at: string
  categories: { name: string } | null
  deal_sources: DealSource[] | null
  deal_links: DealLink[] | null
  deal_metrics_history: DealMetricSnapshot[] | null
}

type DealDetailRow = DealListRow

function first<T>(value: T[] | null | undefined): T | null {
  if (!value || value.length === 0) return null
  return value[0] ?? null
}

function pickBuyLink(links: DealLink[] | null | undefined): DealLink | null {
  const link = first(links)
  return link ?? null
}

function pickSource(sources: DealSource[] | null | undefined): DealSource | null {
  const source = first(sources)
  return source ?? null
}

function pickMetric(
  snapshots: DealMetricSnapshot[] | null | undefined
): DealMetricSnapshot | null {
  const snap = first(snapshots)
  return snap ?? null
}

export async function listCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("categories")
    .select("id,name")
    .order("name", { ascending: true })

  if (error) throw error
  return (data ?? []) as Category[]
}

export async function listDeals(filters: DealListFilters): Promise<DealListItem[]> {
  const supabase = getSupabaseClient()

  const shouldFilterBySource = Boolean(filters.source)
  const sourceJoin = shouldFilterBySource ? "deal_sources!inner" : "deal_sources"

  const select = [
    "id",
    "category_id",
    "title",
    "shop_name",
    "subcategory",
    "price",
    "shipping_type",
    "sold_out",
    "thumbnail_url",
    "created_at",
    "categories(name)",
    `${sourceJoin}(source,post_url,title,thumb_url,created_at)`,
    "deal_links(url,domain,is_affiliate,created_at)",
    "deal_metrics_history(views,votes,comments,captured_at,source)",
  ].join(",")

  let query = supabase.from("deals").select(select)

  if (filters.query) {
    query = query.ilike("title", `%${filters.query}%`)
  }

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    query = query.in("category_id", filters.categoryIds)
  }

  if (typeof filters.soldOut === "boolean") {
    if (filters.soldOut) {
      query = query.eq("sold_out", false)
    }
  }

  if (filters.source) {
    query = query.eq("deal_sources.source", filters.source)
  }

  // Always fetch a bounded window for MVP and sort in-memory if needed.
  // (Ordering by "latest metric" is easier/safer in a view; we can add that later.)
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .order("created_at", { referencedTable: "deal_sources", ascending: false })
    .limit(1, { referencedTable: "deal_sources" })
    .order("is_affiliate", { referencedTable: "deal_links", ascending: false })
    .order("created_at", { referencedTable: "deal_links", ascending: false })
    .limit(1, { referencedTable: "deal_links" })
    .order("captured_at", {
      referencedTable: "deal_metrics_history",
      ascending: false,
    })
    .limit(1, { referencedTable: "deal_metrics_history" })
    .limit(200)

  if (error) throw error

  const rows = (data ?? []) as unknown as DealListRow[]
  const items: DealListItem[] = rows.map((row) => {
    const categoryName = row.categories?.name ?? "UNKNOWN"

    const sources = row.deal_sources ?? []
    const links = row.deal_links ?? []
    const metricsHistory = row.deal_metrics_history ?? []

    return {
      id: row.id,
      category_id: row.category_id,
      category_name: categoryName,
      title: row.title,
      shop_name: row.shop_name ?? null,
      subcategory: row.subcategory ?? null,
      price: row.price ?? null,
      shipping_type: row.shipping_type,
      sold_out: Boolean(row.sold_out),
      thumbnail_url: row.thumbnail_url ?? null,
      created_at: row.created_at,
      source: pickSource(sources),
      buy_link: pickBuyLink(links),
      metrics: pickMetric(metricsHistory),
    }
  })

  const sort = filters.sort ?? "latest"
  if (sort === "latest") return items

  const metricKey: keyof Pick<
    DealMetricSnapshot,
    "views" | "votes" | "comments"
  > = sort

  return items
    .slice()
    .sort((a, b) => {
      const av = a.metrics?.[metricKey] ?? null
      const bv = b.metrics?.[metricKey] ?? null
      if (av === null && bv === null) return 0
      if (av === null) return 1
      if (bv === null) return -1
      return bv - av
    })
}

export async function getDealDetail(dealId: number): Promise<DealDetail | null> {
  const supabase = getSupabaseClient()

  const select = [
    "id",
    "category_id",
    "title",
    "shop_name",
    "subcategory",
    "price",
    "shipping_type",
    "sold_out",
    "thumbnail_url",
    "created_at",
    "categories(name)",
    "deal_sources(source,post_url,title,thumb_url,created_at)",
    "deal_links(url,domain,is_affiliate,created_at)",
    "deal_metrics_history(views,votes,comments,captured_at,source)",
  ].join(",")

  const { data, error } = await supabase
    .from("deals")
    .select(select)
    .eq("id", dealId)
    .order("created_at", { referencedTable: "deal_sources", ascending: false })
    .order("is_affiliate", { referencedTable: "deal_links", ascending: false })
    .order("created_at", { referencedTable: "deal_links", ascending: false })
    .order("captured_at", {
      referencedTable: "deal_metrics_history",
      ascending: false,
    })
    .limit(10, { referencedTable: "deal_metrics_history" })
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const row = data as unknown as DealDetailRow
  const categoryName = row.categories?.name ?? "UNKNOWN"

  return {
    id: row.id,
    category_id: row.category_id,
    category_name: categoryName,
    title: row.title,
    shop_name: row.shop_name ?? null,
    subcategory: row.subcategory ?? null,
    price: row.price ?? null,
    shipping_type: row.shipping_type,
    sold_out: Boolean(row.sold_out),
    thumbnail_url: row.thumbnail_url ?? null,
    created_at: row.created_at,
    sources: row.deal_sources ?? [],
    links: row.deal_links ?? [],
    metrics_history: row.deal_metrics_history ?? [],
  }
}
