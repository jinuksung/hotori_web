import { NextResponse } from "next/server"

import { listCategories } from "@/lib/queries"

export async function GET() {
  try {
    const categories = await listCategories()
    return NextResponse.json(categories)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
