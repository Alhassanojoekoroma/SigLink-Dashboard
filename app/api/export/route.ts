import { NextResponse } from "next/server"
import { getSubscriptions } from "@/lib/data"

export async function GET() {
  const subs = await getSubscriptions()

  const headers = [
    "Subscription ID",
    "Organization",
    "Station Nickname",
    "Service Location",
    "Customer Name",
    "Phone Number",
    "GPS Coordinates",
    "Package",
    "Amount Paid (NLe)",
    "Start Date",
    "End Date",
    "Status",
    "Customer Type",
    "Created At",
  ]

  const rows = subs.map((s) =>
    [
      s.subscription_id,
      `"${s.organization_name}"`,
      `"${s.station_nickname}"`,
      `"${s.service_location}"`,
      `"${s.customer_name}"`,
      s.phone_number,
      s.gps_coordinates || "",
      `"${s.package_name}"`,
      s.amount_paid.toString(),
      new Date(s.start_date).toLocaleDateString(),
      new Date(s.end_date).toLocaleDateString(),
      s.status,
      s.customer_type || "individual",
      new Date(s.created_at).toLocaleDateString(),
    ].join(",")
  )

  const csv = [headers.join(","), ...rows].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="siglink-subscriptions.csv"',
    },
  })
}
