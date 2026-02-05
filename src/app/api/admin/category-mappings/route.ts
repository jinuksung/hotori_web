import { NextResponse } from "next/server"

import { getSupabaseClient } from "@/lib/supabaseClient"

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("category_mappings")
      .select(
        "source_category_id,category_id,created_at,source_categories(id,source,source_key,name),categories(id,name)"
      )
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sourceCategoryId?: number
      categoryId?: number
    }
    const sourceCategoryId = body.sourceCategoryId
    const categoryId = body.categoryId
    if (!sourceCategoryId || !categoryId) {
      return NextResponse.json(
        { error: "sourceCategoryId and categoryId are required" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("category_mappings")
      .upsert(
        { source_category_id: sourceCategoryId, category_id: categoryId },
        { onConflict: "source_category_id" }
      )
      .select(
        "source_category_id,category_id,created_at,source_categories(id,source,source_key,name),categories(id,name)"
      )
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sourceCategoryId = Number(searchParams.get("sourceCategoryId"))
    if (!Number.isFinite(sourceCategoryId)) {
      return NextResponse.json(
        { error: "sourceCategoryId is required" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from("category_mappings")
      .delete()
      .eq("source_category_id", sourceCategoryId)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
