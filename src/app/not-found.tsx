import Link from "next/link"

import { NoResults } from "@/components/NoResults"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center px-6 py-16">
      <NoResults
        title="길을 잃었어요"
        description="딜은 많은데, 이 경로는 없어요."
      />
      <div className="mt-6">
        <Button asChild className="bg-brand-accent text-white hover:bg-brand-accent-hover">
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </div>
  )
}
