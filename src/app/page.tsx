import { Header } from "@/components/Header"
import { DealCard } from "@/components/DealCard"
import { DealTable } from "@/components/DealTable"
import { NoResults } from "@/components/NoResults"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { listCategories, listDeals } from "@/lib/queries"
import type { Category, DealListFilters, DealListItem, DealSortKey } from "@/types/hotori"

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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams

  const filters: DealListFilters = {
    query: getString(resolvedSearchParams, "q") ?? undefined,
    source: getString(resolvedSearchParams, "source") ?? undefined,
    categoryId: (() => {
      const raw = getString(resolvedSearchParams, "categoryId")
      if (!raw) return undefined
      const parsed = Number(raw)
      return Number.isFinite(parsed) ? parsed : undefined
    })(),
    soldOut: (() => {
      const raw = getString(resolvedSearchParams, "soldOut")
      if (!raw) return undefined
      return raw === "1" || raw === "true"
    })(),
    sort: parseSort(getString(resolvedSearchParams, "sort")),
  }

  let categories: Category[] = []
  let deals: DealListItem[] = []
  let errorMessage: string | null = null
  try {
    ;[categories, deals] = await Promise.all([listCategories(), listDeals(filters)])
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
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold tracking-tight">핫딜 목록</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              데스크탑은 테이블, 모바일은 카드로 보여줘요.
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
              데이터를 불러오지 못했어요
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div className="mb-2">
                `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정을
                확인해 주세요.
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
