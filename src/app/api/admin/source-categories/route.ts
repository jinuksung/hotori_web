import { NextResponse } from "next/server"

import { getSupabaseClient } from "@/lib/supabaseClient"

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("source_categories")
      .select("id,source,source_key,name,created_at")
      .order("source", { ascending: true })
      .order("name", { ascending: true })

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
