import { NextResponse } from "next/server"

import { getSupabaseClient } from "@/lib/supabaseClient"

type RawShopNameRow = {
  source: string
  shop_name_raw: string | null
  created_at: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit") ?? "200")
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 50), 500) : 200

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("deal_sources")
      .select("source,shop_name_raw,created_at")
      .not("shop_name_raw", "is", null)
      .order("created_at", { ascending: false })
      .limit(safeLimit)

    if (error) throw error

    const rows = (data ?? []) as RawShopNameRow[]
    const seen = new Set<string>()
    const unique = rows.filter((row) => {
      if (!row.shop_name_raw) return false
      const key = `${row.source}::${row.shop_name_raw}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    return NextResponse.json(unique)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
