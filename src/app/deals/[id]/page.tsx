import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import {
  ArrowLeft,
  ExternalLink,
  Link as LinkIcon,
  MessageSquare,
  ShoppingBag,
  ThumbsUp,
  Eye,
} from "lucide-react"

import { DealThumbnail } from "@/components/DealThumbnail"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getDealDetail } from "@/lib/queries"

const FALLBACK_THUMB = "/images/noImage.svg"

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return format(date, "yyyy-MM-dd HH:mm")
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "-"
  return value.toLocaleString()
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dealId = Number(id)
  if (!Number.isFinite(dealId)) notFound()

  const deal = await getDealDetail(dealId)
  if (!deal) notFound()

  const primarySource = deal.sources[0] ?? null
  const thumb = deal.thumbnail_url ?? primarySource?.thumb_url ?? FALLBACK_THUMB
  const bestBuy = deal.links.find((l) => l.is_affiliate) ?? deal.links[0] ?? null

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-badge-bg text-xs text-badge-fg">
              {deal.category_name}
            </Badge>
            {deal.sold_out ? (
              <Badge variant="secondary" className="bg-muted text-xs text-muted-foreground">
                Sold out
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="bg-card">
            <CardHeader className="space-y-3">
              <h1 className="text-xl font-semibold leading-7 tracking-tight">
                {deal.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {deal.shop_name ? (
                  <span className="text-foreground/80">{deal.shop_name}</span>
                ) : null}
                {deal.price ? <span>{String(deal.price)}</span> : null}
                <span>{deal.shipping_type}</span>
                <span className="opacity-70">{formatDate(deal.created_at)}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <DealThumbnail
                src={thumb}
                alt={deal.title}
                soldOut={deal.sold_out}
                className="h-[320px] w-full"
              />

              <div className="grid gap-2">
                <div className="text-sm font-semibold">링크</div>
                <div className="flex flex-col gap-2">
                  <Button
                    asChild
                    className={
                      bestBuy
                        ? "bg-brand-accent text-white hover:bg-brand-accent-hover"
                        : "bg-muted text-muted-foreground"
                    }
                    disabled={!bestBuy}
                  >
                    <a
                      href={bestBuy?.url ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={!bestBuy}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Buy
                      {bestBuy?.domain ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {bestBuy.domain}
                        </span>
                      ) : null}
                    </a>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="border-border text-muted-foreground hover:text-foreground"
                    disabled={!primarySource?.post_url}
                  >
                    <a
                      href={primarySource?.post_url ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={!primarySource?.post_url}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Original
                      {primarySource?.source ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {primarySource.source}
                        </span>
                      ) : null}
                    </a>
                  </Button>
                </div>
              </div>

              {deal.links.length > 1 ? (
                <>
                  <Separator />
                  <div className="grid gap-2">
                    <div className="text-sm font-semibold">추가 링크</div>
                    <ul className="grid gap-2">
                      {deal.links.map((l) => (
                        <li key={`${l.domain}:${l.url}`} className="text-sm">
                          <a
                            href={l.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground hover:underline"
                          >
                            <LinkIcon className="h-4 w-4" />
                            <span className="truncate">{l.domain}</span>
                            {l.is_affiliate ? (
                              <Badge variant="secondary" className="ml-1 bg-muted text-xs text-muted-foreground">
                                affiliate
                              </Badge>
                            ) : null}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : null}
            </CardContent>
            <CardFooter />
          </Card>

          <Card className="bg-card">
            <CardHeader className="space-y-1">
              <div className="text-sm font-semibold">메트릭 (최근 10개)</div>
              <div className="text-xs text-muted-foreground">
                차트는 2차 범위 (지금은 리스트)
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {deal.metrics_history.length === 0 ? (
                <div className="text-sm text-muted-foreground">-</div>
              ) : (
                <div className="grid gap-2">
                  {deal.metrics_history.map((m) => (
                    <div
                      key={`${m.source}:${m.captured_at}`}
                      className="rounded-lg border bg-muted/40 px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Badge variant="secondary" className="bg-muted text-xs text-muted-foreground">
                          {m.source}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(m.captured_at)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          <span className="tabular-nums">{formatNumber(m.views)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span className="tabular-nums">{formatNumber(m.votes)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span className="tabular-nums">{formatNumber(m.comments)}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
