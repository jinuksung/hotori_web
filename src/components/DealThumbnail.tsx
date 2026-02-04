import { cn } from "@/lib/utils"

type DealThumbnailProps = {
  src: string
  alt: string
  soldOut: boolean
  className?: string
}

export function DealThumbnail({ src, alt, soldOut, className }: DealThumbnailProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border bg-muted/30",
        className
      )}
    >
      {/* Use <img> to avoid Next remotePatterns friction for external thumbnails in early MVP. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "h-full w-full object-cover",
          soldOut ? "scale-[1.02] saturate-50" : "saturate-110"
        )}
        loading="lazy"
      />

      {soldOut ? (
        <>
          <div className="absolute inset-0 bg-navy/55 backdrop-blur-[1px]" />
          <div className="pointer-events-none absolute left-2 top-2 -rotate-6 rounded-sm border-2 border-hot-gold/70 bg-background/80 px-2 py-0.5 text-[9px] font-bold tracking-[0.2em] text-hot-gold-text shadow-sm">
            SOLD&nbsp;OUT
          </div>
        </>
      ) : null}
    </div>
  )
}
