import Image from "next/image"

import { cn } from "@/lib/utils"

type NoResultsProps = {
  title?: string
  description?: string
  className?: string
}

export function NoResults({
  title = "지금은 고를 도토리가 없어요",
  description = "필터를 조금 풀어보면 숨은 딜이 보일 수 있어요.",
  className,
}: NoResultsProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 py-14 text-center",
        className
      )}
    >
      <div className="relative h-16 w-16">
        <Image src="/images/noResultIcon.svg" alt="" fill className="opacity-90" />
      </div>
      <div className="mt-4 text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{description}</div>
    </div>
  )
}
