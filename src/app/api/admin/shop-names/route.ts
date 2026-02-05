import { NextResponse } from "next/server"

import { getSupabaseClient } from "@/lib/supabaseClient"

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("shop_name_master")
      .select("id,name,created_at")
      .order("name", { ascending: true })

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string }
    const name = body.name?.trim()
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("shop_name_master")
      .insert({ name })
      .select("id,name,created_at")
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
