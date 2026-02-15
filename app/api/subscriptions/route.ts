import { NextRequest, NextResponse } from "next/server"
import { filterAndSortSubscriptions, addSubscription } from "@/lib/data"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const search = searchParams.get("search") || undefined
  const status = searchParams.get("status") || undefined
  const sort = searchParams.get("sort") || undefined
  const sortDirection = (searchParams.get("sortDirection") as "asc" | "desc") || "desc"
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "14", 10)

  const result = await filterAndSortSubscriptions({
    search,
    status,
    sort,
    sortDirection,
    page,
    limit,
  })

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const required = [
      "organization_name",
      "service_location",
      "customer_name",
      "phone_number",
      "package_name",
      "amount_paid",
      "start_date",
      "end_date",
      "status",
    ]

    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const newSub = await addSubscription({
      organization_name: body.organization_name,
      station_nickname: body.station_nickname || `${body.organization_name?.slice(0, 3).toUpperCase()}-NEW-01`,
      service_location: body.service_location,
      customer_name: body.customer_name,
      email: body.email || "",
      phone_number: body.phone_number,
      gps_coordinates: body.gps_coordinates || null,
      package_name: body.package_name,
      amount_paid: Number(body.amount_paid),
      start_date: body.start_date,
      end_date: body.end_date,
      status: body.status,
      customer_type: body.customer_type || "individual",
    })

    return NextResponse.json(newSub, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
