import { NextResponse } from "next/server"

import { listDeals } from "@/lib/queries"
import type { DealListFilters, DealSortKey } from "@/types/hotori"

function parseSort(value: string | null): DealSortKey {
  if (value === "views" || value === "votes" || value === "comments") return value
  return "latest"
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: DealListFilters = {
      query: searchParams.get("q") ?? undefined,
      source: searchParams.get("source") ?? undefined,
      categoryId: (() => {
        const raw = searchParams.get("categoryId")
        if (!raw) return undefined
        const parsed = Number(raw)
        return Number.isFinite(parsed) ? parsed : undefined
      })(),
      soldOut: (() => {
        const raw = searchParams.get("soldOut")
        if (!raw) return undefined
        return raw === "1" || raw === "true"
      })(),
      sort: parseSort(searchParams.get("sort")),
    }

    const deals = await listDeals(filters)
    return NextResponse.json(deals)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
