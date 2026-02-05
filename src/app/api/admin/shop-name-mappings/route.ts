import { NextResponse } from "next/server"

import { getSupabaseClient } from "@/lib/supabaseClient"

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("shop_name_mappings")
      .select("id,source,raw_name,shop_name_id,created_at,shop_name_master(id,name)")
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
      source?: string
      rawName?: string
      shopNameId?: number
    }
    const source = body.source?.trim()
    const rawName = body.rawName?.trim()
    const shopNameId = body.shopNameId

    if (!source || !rawName || !shopNameId) {
      return NextResponse.json(
        { error: "source, rawName, shopNameId are required" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("shop_name_mappings")
      .upsert(
        { source, raw_name: rawName, shop_name_id: shopNameId },
        { onConflict: "source,raw_name" }
      )
      .select("id,source,raw_name,shop_name_id,created_at,shop_name_master(id,name)")
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
    const id = Number(searchParams.get("id"))
    const source = searchParams.get("source") ?? ""
    const rawName = searchParams.get("rawName") ?? ""

    const supabase = getSupabaseClient()

    if (Number.isFinite(id)) {
      const { error } = await supabase
        .from("shop_name_mappings")
        .delete()
        .eq("id", id)
      if (error) throw error
      return NextResponse.json({ ok: true })
    }

    if (!source || !rawName) {
      return NextResponse.json(
        { error: "id or (source, rawName) is required" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("shop_name_mappings")
      .delete()
      .eq("source", source)
      .eq("raw_name", rawName)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
