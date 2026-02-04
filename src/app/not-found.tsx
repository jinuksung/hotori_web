import Link from "next/link"

import { NoResults } from "@/components/NoResults"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center px-6 py-16">
      <NoResults title="페이지를 찾을 수 없어요" description="링크가 잘못됐을 수 있어요." />
      <div className="mt-6">
        <Button asChild className="bg-brand-accent text-white hover:bg-brand-accent-hover">
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </div>
  )
}
