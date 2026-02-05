import { headers } from "next/headers"

import { Header } from "@/components/Header"
import { DealCard } from "@/components/DealCard"
import { DealTable } from "@/components/DealTable"
import { NoResults } from "@/components/NoResults"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Category, DealListItem, DealSortKey } from "@/types/hotori"

function getString(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = searchParams[key]
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function parseSort(value: string | null): DealSortKey {
  if (value === "views" || value === "votes" || value === "comments") return value
  return "latest"
}

async function getBaseUrl() {
  const headerList = await headers()
  const host =
    headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000"
  const proto = headerList.get("x-forwarded-proto") ?? "http"
  return `${proto}://${host}`
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams

  const queryParams = new URLSearchParams()
  const query = getString(resolvedSearchParams, "q")
  const source = getString(resolvedSearchParams, "source")
  const categoryIds = getString(resolvedSearchParams, "categoryIds")
  const soldOut = getString(resolvedSearchParams, "soldOut")
  const sort = parseSort(getString(resolvedSearchParams, "sort"))

  if (query) queryParams.set("q", query)
  if (source) queryParams.set("source", source)
  if (categoryIds) queryParams.set("categoryIds", categoryIds)
  if (soldOut) queryParams.set("soldOut", soldOut)
  if (sort && sort !== "latest") queryParams.set("sort", sort)

  let categories: Category[] = []
  let deals: DealListItem[] = []
  let errorMessage: string | null = null
  try {
    const baseUrl = await getBaseUrl()
    const [categoriesRes, dealsRes] = await Promise.all([
      fetch(`${baseUrl}/api/categories`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/deals?${queryParams.toString()}`, { cache: "no-store" }),
    ])

    if (!categoriesRes.ok) {
      throw new Error(`Failed to load categories: ${categoriesRes.status}`)
    }
    if (!dealsRes.ok) {
      throw new Error(`Failed to load deals: ${dealsRes.status}`)
    }

    categories = (await categoriesRes.json()) as Category[]
    deals = (await dealsRes.json()) as DealListItem[]
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err)
  }

  const sources = Array.from(
    new Set(
      deals
        .map((d) => d.source?.source)
        .filter((v): v is string => typeof v === "string" && v.length > 0)
    )
  ).sort()

  return (
    <div className="min-h-dvh">
      <Header categories={categories} sources={sources} />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 mx-auto flex w-full max-w-[1040px] flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold tracking-tight">오늘의 도토리</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              과한 말 대신, 판단에 필요한 것만 정리했어요.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="rounded-full border bg-muted/40 px-3 py-1">
              {deals.length.toLocaleString()} items
            </span>
          </div>
        </div>

        {errorMessage ? (
          <Card className="bg-card">
            <CardHeader className="text-sm font-semibold">
              지금은 자료를 불러오지 못했어요
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div className="mb-2">
                잠시 후 다시 확인해 주세요.
              </div>
              <pre className="whitespace-pre-wrap rounded-md border bg-background/50 p-3 text-xs text-foreground/80">
                {errorMessage}
              </pre>
            </CardContent>
          </Card>
        ) : deals.length === 0 ? (
          <NoResults />
        ) : (
          <>
            <div className="hidden md:block">
              <DealTable deals={deals} />
            </div>
            <div className="md:hidden overflow-hidden rounded-md border bg-card divide-y divide-border">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
