import Link from "next/link"
import { format } from "date-fns"
import { ExternalLink, MessageSquare, ThumbsUp, Eye, Flame } from "lucide-react"

import { DealThumbnail } from "@/components/DealThumbnail"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DealListItem } from "@/types/hotori"

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

type DealCardProps = {
  deal: DealListItem
}

export function DealCard({ deal }: DealCardProps) {
  const source = deal.source
  const thumb = deal.thumbnail_url ?? source?.thumb_url ?? FALLBACK_THUMB
  const buy = deal.buy_link?.url ?? null
  const original = source?.post_url ?? null
  const isHot = (deal.metrics?.votes ?? 0) >= 100

  return (
    <article
      className={cn(
        "flex items-center gap-3 bg-card px-4 py-3 transition-colors",
        deal.sold_out && "opacity-70"
      )}
    >
      <DealThumbnail
        src={thumb}
        alt={deal.title}
        soldOut={deal.sold_out}
        className="h-16 w-20 shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {isHot ? (
            <span className="inline-flex items-center gap-0.5 rounded bg-hot-gold px-1.5 py-0.5 text-[9px] font-bold text-hot-gold-text">
              <Flame className="h-2.5 w-2.5" />
              HOT
            </span>
          ) : null}
          <Link
            href={`/deals/${deal.id}`}
            className={cn(
              "line-clamp-1 text-[13px] font-medium leading-tight text-foreground hover:underline",
              deal.sold_out && "line-through decoration-muted-foreground"
            )}
          >
            {deal.title}
          </Link>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          {deal.price ? (
            <span className="text-[12px] font-semibold text-brand-accent">
              {String(deal.price)}
            </span>
          ) : null}
          {deal.shipping_type ? <span>{deal.shipping_type}</span> : null}
          {deal.shop_name ? (
            <span className="text-muted-foreground">{deal.shop_name}</span>
          ) : null}
          <span className="text-border">|</span>
          <span className="rounded-full bg-badge-bg px-2 py-0.5 text-[9px] font-medium text-badge-fg">
            {deal.category_name}
          </span>
          {source ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
              {source.source}
            </span>
          ) : null}
          {deal.sold_out ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
              Sold out
            </span>
          ) : null}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span className="tabular-nums">{formatNumber(deal.metrics?.views)}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            <span className="tabular-nums">{formatNumber(deal.metrics?.votes)}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span className="tabular-nums">
              {formatNumber(deal.metrics?.comments)}
            </span>
          </span>
          <span className="opacity-70">{formatDate(deal.created_at)}</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-1.5">
        <Button
          asChild
          size="xs"
          variant="outline"
          className="h-7 border-border bg-transparent px-2 text-[10px] text-muted-foreground hover:text-foreground"
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
            "h-7 px-2 text-[10px] font-medium",
            buy
              ? "bg-brand-accent text-white hover:bg-brand-accent-hover"
              : "bg-muted text-muted-foreground"
          )}
          disabled={!buy}
        >
          <a href={buy ?? "#"} target="_blank" rel="noreferrer" aria-disabled={!buy}>
            Buy
          </a>
        </Button>
      </div>
    </article>
  )
}
