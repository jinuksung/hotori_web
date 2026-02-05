"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category, DealSortKey } from "@/types/hotori"

type FiltersProps = {
  categories: Category[]
  sources: string[]
  className?: string
}

function setOrDelete(params: URLSearchParams, key: string, value: string | null) {
  if (!value) {
    params.delete(key)
    return
  }
  params.set(key, value)
}

export function Filters({ categories, sources, className }: FiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = React.useTransition()
  const paramsString = searchParams.toString()

  const initialQuery = searchParams.get("q") ?? ""
  const [query, setQuery] = React.useState(initialQuery)

  // Keep input in sync when user navigates back/forward.
  React.useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  React.useEffect(() => {
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(paramsString)
      setOrDelete(params, "q", query.trim() ? query.trim() : null)
      const next = params.toString()

      if (next === paramsString) return

      startTransition(() => {
        router.replace(`${pathname}?${next}`)
      })
    }, 350)

    return () => window.clearTimeout(handle)
  }, [query, pathname, router, paramsString])

  const sort = (searchParams.get("sort") as DealSortKey | null) ?? "latest"
  const source = searchParams.get("source") ?? "all"
  const categoryIdsParam = searchParams.get("categoryIds") ?? ""
  const selectedCategoryIds = categoryIdsParam
    .split(",")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
  const soldOut = searchParams.get("soldOut") === "1"

  function update(
    next: Partial<{
      sort: DealSortKey
      source: string
      categoryIds: number[]
      soldOut: boolean
    }>
  ) {
    const params = new URLSearchParams(paramsString)

    if (next.sort) setOrDelete(params, "sort", next.sort === "latest" ? null : next.sort)
    if (typeof next.source === "string") setOrDelete(params, "source", next.source === "all" ? null : next.source)
    if (Array.isArray(next.categoryIds)) {
      if (next.categoryIds.length === 0) {
        params.delete("categoryIds")
      } else {
        params.set("categoryIds", next.categoryIds.join(","))
      }
    }
    if (typeof next.soldOut === "boolean") setOrDelete(params, "soldOut", next.soldOut ? "1" : null)

    const nextParams = params.toString()
    if (nextParams === paramsString) return

    startTransition(() => {
      router.replace(`${pathname}?${nextParams}`)
    })
  }

  function clear() {
    setQuery("")
    startTransition(() => {
      router.replace(pathname)
    })
  }

  return (
    <div className={cn("mx-auto flex w-full max-w-[1040px] flex-wrap items-center gap-2 text-xs", className)}>
      <div className="relative w-full md:w-[240px]">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="딜 제목 검색"
          className="h-8 bg-background/80 pl-8 text-xs"
        />
      </div>

      <Select value={sort} onValueChange={(v) => update({ sort: v as DealSortKey })}>
        <SelectTrigger className="h-8 w-full bg-background/80 text-xs md:w-[140px]">
          <SelectValue placeholder="정렬" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">최신</SelectItem>
          <SelectItem value="views">조회수</SelectItem>
          <SelectItem value="votes">추천수</SelectItem>
          <SelectItem value="comments">댓글수</SelectItem>
        </SelectContent>
      </Select>

      <Select value={source} onValueChange={(v) => update({ source: v })}>
        <SelectTrigger className="h-8 w-full bg-background/80 text-xs md:w-[130px]">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 출처</SelectItem>
          {sources.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-8 w-full justify-between bg-background/80 text-xs font-normal md:w-[180px]"
          >
            <span className="truncate">
              {selectedCategoryIds.length === 0
                ? "전체 카테고리"
                : (() => {
                    const selected = categories.filter((c) =>
                      selectedCategoryIds.includes(c.id)
                    )
                    if (selected.length === 0) return "전체 카테고리"
                    if (selected.length === 1) return selected[0]?.name ?? "전체 카테고리"
                    return `${selected[0]?.name ?? "카테고리"} 외 ${selected.length - 1}`
                  })()}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[220px] p-2">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
              onClick={() => update({ categoryIds: [] })}
            >
              <Checkbox checked={selectedCategoryIds.length === 0} />
              <span>ALL</span>
            </button>
            <div className="h-px bg-border" />
            <div className="max-h-64 overflow-auto">
              {categories.map((c) => {
                const checked = selectedCategoryIds.includes(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
                    onClick={() => {
                      const nextIds = checked
                        ? selectedCategoryIds.filter((id) => id !== c.id)
                        : [...selectedCategoryIds, c.id]
                      update({ categoryIds: nextIds })
                    }}
                  >
                    <Checkbox checked={checked} />
                    <span>{c.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <label className="inline-flex select-none items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-1.5 text-xs">
        <Checkbox
          checked={soldOut}
          onCheckedChange={(checked) => update({ soldOut: Boolean(checked) })}
        />
        <span>품절 제외</span>
      </label>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
        onClick={clear}
        disabled={isPending && query.length === 0 && !searchParams.toString()}
      >
        초기화
      </Button>

      {isPending ? (
        <span className="text-[11px] text-muted-foreground">Updating…</span>
      ) : null}
    </div>
  )
}
