import { NextResponse } from "next/server"
import { getAlerts } from "@/lib/data"

export async function GET() {
  const alerts = await getAlerts()
  return NextResponse.json({
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    subscriptions: alerts,
  })
}
