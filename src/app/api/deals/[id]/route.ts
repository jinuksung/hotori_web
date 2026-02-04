import { NextResponse } from "next/server"

import { getDealDetail } from "@/lib/queries"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const dealId = Number(id)
  if (!Number.isFinite(dealId)) {
    return NextResponse.json({ error: "Invalid deal id" }, { status: 400 })
  }

  try {
    const deal = await getDealDetail(dealId)
    if (!deal) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json(deal)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
