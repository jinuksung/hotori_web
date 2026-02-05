import { NextResponse } from "next/server"

import { getSupabaseClient } from "@/lib/supabaseClient"

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("shop_domain_mappings")
      .select("id,domain,shop_name_id,created_at,shop_name_master(id,name)")
      .order("domain", { ascending: true })

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
      domain?: string
      shopNameId?: number
    }
    const domain = body.domain?.trim().toLowerCase()
    const shopNameId = body.shopNameId

    if (!domain || !shopNameId) {
      return NextResponse.json(
        { error: "domain and shopNameId are required" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("shop_domain_mappings")
      .upsert(
        { domain, shop_name_id: shopNameId },
        { onConflict: "domain" }
      )
      .select("id,domain,shop_name_id,created_at,shop_name_master(id,name)")
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
    const domain = searchParams.get("domain") ?? ""
    if (!domain) {
      return NextResponse.json({ error: "domain is required" }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from("shop_domain_mappings")
      .delete()
      .eq("domain", domain)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
