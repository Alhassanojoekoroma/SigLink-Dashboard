import { NextResponse } from "next/server"
import { getMetrics } from "@/lib/data"

export async function GET() {
  const metrics = await getMetrics()
  return NextResponse.json(metrics)
}
