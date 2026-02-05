"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

type Category = {
  id: number
  name: string
}

type SourceCategory = {
  id: number
  source: string
  source_key: string
  name: string
}

type CategoryMappingRow = {
  source_category_id: number
  category_id: number
  source_categories: SourceCategory | null
  categories: Category | null
}

type ShopName = {
  id: number
  name: string
}

type ShopNameMapping = {
  id: number
  source: string
  raw_name: string
  shop_name_id: number
  shop_name_master: ShopName | null
}

type RawShopName = {
  source: string
  shop_name_raw: string | null
}

type ShopDomainMapping = {
  id: number
  domain: string
  shop_name_id: number
  shop_name_master: ShopName | null
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init)
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`)
  }
  return (await res.json()) as T
}

export default function AdminPage() {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [categories, setCategories] = React.useState<Category[]>([])
  const [sourceCategories, setSourceCategories] = React.useState<SourceCategory[]>([])
  const [categoryMappings, setCategoryMappings] = React.useState<CategoryMappingRow[]>([])

  const [shopNames, setShopNames] = React.useState<ShopName[]>([])
  const [shopNameMappings, setShopNameMappings] = React.useState<ShopNameMapping[]>([])
  const [rawShopNames, setRawShopNames] = React.useState<RawShopName[]>([])
  const [shopDomainMappings, setShopDomainMappings] = React.useState<ShopDomainMapping[]>([])

  const [categorySearch, setCategorySearch] = React.useState("")
  const [onlyUnmapped, setOnlyUnmapped] = React.useState(false)
  const [newCategoryName, setNewCategoryName] = React.useState("")

  const [rawShopSearch, setRawShopSearch] = React.useState("")
  const [newShopName, setNewShopName] = React.useState("")
  const [newDomain, setNewDomain] = React.useState("")
  const [newDomainShopId, setNewDomainShopId] = React.useState<string>("")

  const mappingBySourceCategoryId = React.useMemo(() => {
    return new Map(categoryMappings.map((m) => [m.source_category_id, m]))
  }, [categoryMappings])

  const mappingByRawKey = React.useMemo(() => {
    const map = new Map<string, ShopNameMapping>()
    shopNameMappings.forEach((m) => {
      map.set(`${m.source}::${m.raw_name}`, m)
    })
    return map
  }, [shopNameMappings])

  const filteredSourceCategories = React.useMemo(() => {
    const term = categorySearch.trim().toLowerCase()
    return sourceCategories.filter((sc) => {
      const mapped = mappingBySourceCategoryId.has(sc.id)
      if (onlyUnmapped && mapped) return false
      if (!term) return true
      return (
        sc.name.toLowerCase().includes(term) ||
        sc.source.toLowerCase().includes(term) ||
        sc.source_key.toLowerCase().includes(term)
      )
    })
  }, [sourceCategories, categorySearch, onlyUnmapped, mappingBySourceCategoryId])

  const filteredRawShopNames = React.useMemo(() => {
    const term = rawShopSearch.trim().toLowerCase()
    return rawShopNames.filter((row) => {
      const raw = row.shop_name_raw ?? ""
      if (!term) return true
      return raw.toLowerCase().includes(term) || row.source.toLowerCase().includes(term)
    })
  }, [rawShopNames, rawShopSearch])

  async function loadAll() {
    try {
      setLoading(true)
      setError(null)
      const [
        categoriesData,
        sourceCategoriesData,
        categoryMappingsData,
        shopNamesData,
        shopNameMappingsData,
        rawShopNamesData,
        shopDomainMappingsData,
      ] = await Promise.all([
        fetchJson<Category[]>("/api/admin/categories"),
        fetchJson<SourceCategory[]>("/api/admin/source-categories"),
        fetchJson<CategoryMappingRow[]>("/api/admin/category-mappings"),
        fetchJson<ShopName[]>("/api/admin/shop-names"),
        fetchJson<ShopNameMapping[]>("/api/admin/shop-name-mappings"),
        fetchJson<RawShopName[]>("/api/admin/raw-shop-names"),
        fetchJson<ShopDomainMapping[]>("/api/admin/shop-domain-mappings"),
      ])

      setCategories(categoriesData)
      setSourceCategories(sourceCategoriesData)
      setCategoryMappings(categoryMappingsData)
      setShopNames(shopNamesData)
      setShopNameMappings(shopNameMappingsData)
      setRawShopNames(rawShopNamesData)
      setShopDomainMappings(shopDomainMappingsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    void loadAll()
  }, [])

  async function handleCategoryCreate() {
    const name = newCategoryName.trim()
    if (!name) return
    const created = await fetchJson<Category>("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
    setNewCategoryName("")
  }

  async function handleCategoryMapping(sourceCategoryId: number, value: string) {
    if (value === "none") {
      await fetchJson("/api/admin/category-mappings?sourceCategoryId=" + sourceCategoryId, {
        method: "DELETE",
      })
      setCategoryMappings((prev) => prev.filter((m) => m.source_category_id !== sourceCategoryId))
      return
    }

    const categoryId = Number(value)
    const updated = await fetchJson<CategoryMappingRow>("/api/admin/category-mappings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceCategoryId, categoryId }),
    })
    setCategoryMappings((prev) => {
      const next = prev.filter((m) => m.source_category_id !== sourceCategoryId)
      return [updated, ...next]
    })
  }

  async function handleShopNameCreate() {
    const name = newShopName.trim()
    if (!name) return
    const created = await fetchJson<ShopName>("/api/admin/shop-names", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    setShopNames((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
    setNewShopName("")
  }

  async function handleShopNameMapping(source: string, rawName: string, value: string) {
    if (value === "none") {
      await fetchJson(
        `/api/admin/shop-name-mappings?source=${encodeURIComponent(source)}&rawName=${encodeURIComponent(rawName)}`,
        { method: "DELETE" }
      )
      setShopNameMappings((prev) =>
        prev.filter((m) => !(m.source === source && m.raw_name === rawName))
      )
      return
    }

    const shopNameId = Number(value)
    const updated = await fetchJson<ShopNameMapping>("/api/admin/shop-name-mappings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, rawName, shopNameId }),
    })
    setShopNameMappings((prev) => {
      const next = prev.filter((m) => !(m.source === source && m.raw_name === rawName))
      return [updated, ...next]
    })
  }

  async function handleDomainMappingCreate() {
    const domain = newDomain.trim().toLowerCase()
    if (!domain || !newDomainShopId) return
    const shopNameId = Number(newDomainShopId)
    const updated = await fetchJson<ShopDomainMapping>("/api/admin/shop-domain-mappings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, shopNameId }),
    })
    setShopDomainMappings((prev) => {
      const next = prev.filter((m) => m.domain !== updated.domain)
      return [...next, updated].sort((a, b) => a.domain.localeCompare(b.domain))
    })
    setNewDomain("")
    setNewDomainShopId("")
  }

  async function handleDomainMappingDelete(domain: string) {
    await fetchJson(`/api/admin/shop-domain-mappings?domain=${encodeURIComponent(domain)}`, {
      method: "DELETE",
    })
    setShopDomainMappings((prev) => prev.filter((m) => m.domain !== domain))
  }

  return (
    <div className="min-h-dvh">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">핫토리 관리자</h1>
            <p className="text-xs text-muted-foreground">
              카테고리와 쇼핑몰명 매핑을 관리합니다.
            </p>
          </div>
          <Button variant="secondary" onClick={loadAll} disabled={loading}>
            새로고침
          </Button>
        </div>

        {error ? (
          <Card>
            <CardHeader className="text-sm font-semibold">불러오기 실패</CardHeader>
            <CardContent className="text-sm text-muted-foreground">{error}</CardContent>
          </Card>
        ) : null}

        <section className="grid gap-4">
          <Card>
            <CardHeader className="flex flex-col gap-2 text-sm font-semibold">
              카테고리 매핑
              <span className="text-xs text-muted-foreground">
                원본 카테고리를 핫토리 표준 카테고리로 연결합니다.
              </span>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="새 카테고리 추가"
                  className="h-8 w-[220px] text-xs"
                />
                <Button size="sm" onClick={handleCategoryCreate}>
                  추가
                </Button>
                <Separator orientation="vertical" className="mx-2 h-6" />
                <Input
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="원본 카테고리 검색"
                  className="h-8 w-[240px] text-xs"
                />
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={onlyUnmapped}
                    onChange={(e) => setOnlyUnmapped(e.target.checked)}
                  />
                  미매핑만
                </label>
                <div className="text-xs text-muted-foreground">
                  {filteredSourceCategories.length}개 표시
                </div>
              </div>

              <div className="grid gap-2">
                {filteredSourceCategories.map((sc) => {
                  const mapping = mappingBySourceCategoryId.get(sc.id)
                  return (
                    <div
                      key={sc.id}
                      className="flex flex-wrap items-center gap-2 rounded-md border px-3 py-2"
                    >
                      <Badge variant="secondary" className="bg-muted text-[10px] text-muted-foreground">
                        {sc.source}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {sc.source_key}
                      </span>
                      <span className="text-sm font-medium">{sc.name}</span>
                      <div className="ml-auto flex items-center gap-2">
                        <Select
                          value={mapping?.category_id ? String(mapping.category_id) : "none"}
                          onValueChange={(value) => handleCategoryMapping(sc.id, value)}
                        >
                          <SelectTrigger className="h-8 w-[200px] text-xs">
                            <SelectValue placeholder="카테고리 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">미매핑</SelectItem>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-2 text-sm font-semibold">
              쇼핑몰명 정규화
              <span className="text-xs text-muted-foreground">
                원문 쇼핑몰명을 마스터 쇼핑몰명으로 연결합니다.
              </span>
            </CardHeader>
            <CardContent className="grid gap-6 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                  placeholder="마스터 쇼핑몰명 추가"
                  className="h-8 w-[240px] text-xs"
                />
                <Button size="sm" onClick={handleShopNameCreate}>
                  추가
                </Button>
                <Separator orientation="vertical" className="mx-2 h-6" />
                <Input
                  value={rawShopSearch}
                  onChange={(e) => setRawShopSearch(e.target.value)}
                  placeholder="원문 쇼핑몰명 검색"
                  className="h-8 w-[240px] text-xs"
                />
                <div className="text-xs text-muted-foreground">
                  {filteredRawShopNames.length}개 표시
                </div>
              </div>

              <div className="grid gap-2">
                {filteredRawShopNames.map((row) => {
                  if (!row.shop_name_raw) return null
                  const key = `${row.source}::${row.shop_name_raw}`
                  const mapping = mappingByRawKey.get(key)
                  return (
                    <div
                      key={key}
                      className="flex flex-wrap items-center gap-2 rounded-md border px-3 py-2"
                    >
                      <Badge variant="secondary" className="bg-muted text-[10px] text-muted-foreground">
                        {row.source}
                      </Badge>
                      <span className="text-sm font-medium">{row.shop_name_raw}</span>
                      <div className="ml-auto flex items-center gap-2">
                        <Select
                          value={mapping?.shop_name_id ? String(mapping.shop_name_id) : "none"}
                          onValueChange={(value) =>
                            handleShopNameMapping(row.source, row.shop_name_raw ?? "", value)
                          }
                        >
                          <SelectTrigger className="h-8 w-[220px] text-xs">
                            <SelectValue placeholder="마스터 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">미매핑</SelectItem>
                            {shopNames.map((s) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-3">
                <div className="text-xs font-semibold text-muted-foreground">도메인 매핑</div>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="도메인 (예: coupang.com)"
                    className="h-8 w-[240px] text-xs"
                  />
                  <Select value={newDomainShopId} onValueChange={setNewDomainShopId}>
                    <SelectTrigger className="h-8 w-[220px] text-xs">
                      <SelectValue placeholder="마스터 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {shopNames.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleDomainMappingCreate}>
                    추가
                  </Button>
                </div>

                <div className="grid gap-2">
                  {shopDomainMappings.map((m) => (
                    <div
                      key={m.domain}
                      className="flex flex-wrap items-center gap-2 rounded-md border px-3 py-2"
                    >
                      <span className="font-medium">{m.domain}</span>
                      <span className="text-xs text-muted-foreground">
                        → {m.shop_name_master?.name ?? "미지정"}
                      </span>
                      <Button
                        size="xs"
                        variant="ghost"
                        className="ml-auto text-xs"
                        onClick={() => handleDomainMappingDelete(m.domain)}
                      >
                        삭제
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
