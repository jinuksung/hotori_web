import Link from "next/link"
import { format } from "date-fns"
import { ExternalLink, MessageSquare, ThumbsUp, Eye, Flame } from "lucide-react"

import { DealThumbnail } from "@/components/DealThumbnail"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { DealListItem } from "@/types/hotori"

const FALLBACK_THUMB = "/images/noImage.svg"

function formatDate(value: string) {
  // Supabase timestamptz -> ISO string.
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return format(date, "yyyy-MM-dd HH:mm")
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "-"
  return value.toLocaleString()
}

type DealTableProps = {
  deals: DealListItem[]
}

export function DealTable({ deals }: DealTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <Table className="w-full table-fixed text-xs">
        <TableCaption className="sr-only">
          Hotori deals table
        </TableCaption>
        <TableHeader className="bg-muted/60">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[72px] px-2 text-[11px] font-medium text-muted-foreground">
              Thumb
            </TableHead>
            <TableHead className="px-2 text-[11px] font-medium text-muted-foreground">
              Deal
            </TableHead>
            <TableHead className="w-[104px] px-2 text-[11px] font-medium text-muted-foreground">
              Category
            </TableHead>
            <TableHead className="w-[92px] px-2 text-[11px] font-medium text-muted-foreground">
              Source
            </TableHead>
            <TableHead className="w-[160px] px-2 text-right text-[11px] font-medium text-muted-foreground">
              Metrics
            </TableHead>
            <TableHead className="w-[150px] px-2 text-right text-[11px] font-medium text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((deal) => {
            const source = deal.source
            const thumb = deal.thumbnail_url ?? source?.thumb_url ?? FALLBACK_THUMB
            const buy = deal.buy_link?.url ?? null
            const original = source?.post_url ?? null
            const isHot = (deal.metrics?.votes ?? 0) >= 100

            return (
              <TableRow
                key={deal.id}
                className={cn(
                  "align-top hover:bg-muted/40",
                  deal.sold_out && "bg-muted/30 opacity-70"
                )}
              >
                <TableCell className="px-2 py-2.5">
                  <DealThumbnail
                    src={thumb}
                    alt={deal.title}
                    soldOut={deal.sold_out}
                    className="h-[52px] w-[64px]"
                  />
                </TableCell>
                <TableCell className="px-2 py-2.5 align-top whitespace-normal">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-start gap-2">
                      {isHot ? (
                        <span className="inline-flex items-center gap-0.5 rounded bg-hot-gold px-1.5 py-0.5 text-[9px] font-bold text-hot-gold-text">
                          <Flame className="h-2.5 w-2.5" />
                          HOT
                        </span>
                      ) : null}
                        <Link
                          href={`/deals/${deal.id}`}
                          className={cn(
                            "line-clamp-2 text-[13px] font-medium leading-5 text-foreground hover:underline",
                            deal.sold_out && "line-through decoration-muted-foreground"
                          )}
                        >
                          {deal.title}
                        </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      {deal.shop_name ? (
                        <span className="text-foreground/80">{deal.shop_name}</span>
                      ) : null}
                      {deal.price ? (
                        <span className="text-[12px] font-semibold text-brand-accent">
                          {String(deal.price)}
                        </span>
                      ) : null}
                      <span>{deal.shipping_type}</span>
                      <span className="opacity-70">{formatDate(deal.created_at)}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-2 py-2.5">
                  <Badge
                    variant="secondary"
                    className="bg-badge-bg text-[10px] text-badge-fg"
                  >
                    {deal.category_name}
                  </Badge>
                </TableCell>
                <TableCell className="px-2 py-2.5">
                  {source ? (
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant="secondary"
                        className="w-fit bg-muted text-[10px] text-muted-foreground"
                      >
                        {source.source}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">post</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="px-2 py-2.5 text-right whitespace-normal">
                  <div className="flex flex-col items-end gap-1 text-[11px]">
                    <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span className="tabular-nums">
                          {formatNumber(deal.metrics?.views)}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span className="tabular-nums">
                          {formatNumber(deal.metrics?.votes)}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="tabular-nums">
                          {formatNumber(deal.metrics?.comments)}
                        </span>
                      </span>
                    </div>
                    {deal.metrics?.captured_at ? (
                      <div className="text-[10px] text-muted-foreground/80">
                        as of {formatDate(deal.metrics.captured_at)}
                      </div>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="px-2 py-2.5 text-right whitespace-normal">
                  <div className="inline-flex flex-wrap justify-end gap-2">
                    <Button
                      asChild
                      size="xs"
                      variant="outline"
                      className="h-6 border-border bg-transparent px-2 text-[10px] text-muted-foreground hover:text-foreground"
                      disabled={!original}
                    >
                      <a
                        href={original ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        aria-disabled={!original}
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Original
                      </a>
                    </Button>
                    <Button
                      asChild
                      size="xs"
                      className={cn(
                        "h-6 px-2.5 text-[10px] font-medium",
                        buy
                          ? "bg-brand-accent text-white hover:bg-brand-accent-hover"
                          : "bg-muted text-muted-foreground"
                      )}
                      disabled={!buy}
                    >
                      <a
                        href={buy ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        aria-disabled={!buy}
                      >
                        Buy
                      </a>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
