
import { NextResponse } from "next/server"
import { getDashboardData } from "@/lib/data"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const period = (searchParams.get("period") as "all" | "month") || "all"
        const data = await getDashboardData(period)
        return NextResponse.json(data)
    } catch (error) {
        console.error("Dashboard data fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
    }
}
