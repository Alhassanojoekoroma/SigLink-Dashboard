import { NextResponse } from "next/server"
import { runExpirationChecks } from "@/lib/data"

export async function POST() {
    try {
        const result = await runExpirationChecks()
        return NextResponse.json({
            message: "Expiration checks completed",
            ...result
        })
    } catch (error: any) {
        console.error("Expiration check error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
