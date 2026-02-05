import Image from "next/image"
import Link from "next/link"

import { Filters } from "@/components/Filters"
import { cn } from "@/lib/utils"
import type { Category } from "@/types/hotori"

type HeaderProps = {
  categories: Category[]
  sources: string[]
  className?: string
}

export function Header({ categories, sources, className }: HeaderProps) {
  return (
    <header className={cn("sticky top-0 z-40", className)}>
      <div className="bg-navy">
        <div className="mx-auto flex h-11 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-7 w-7 overflow-hidden rounded-md bg-white/10 p-0.5">
              <Image
                src="/images/hatori.svg"
                alt="Hotori"
                fill
                className="p-0.5"
                priority
              />
            </div>
            <div className="text-sm font-semibold tracking-tight text-white">
              Hotori
            </div>
          </Link>
          <div className="hidden items-center gap-2 text-[11px] text-white/60 md:flex">
            <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1">
              읽기 전용
            </span>
            <span>데이터 연결됨</span>
          </div>
        </div>
      </div>

      <div className="border-b border-border/70 bg-card/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Filters categories={categories} sources={sources} />
        </div>
      </div>
    </header>
  )
}
