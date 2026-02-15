import { NextResponse } from "next/server"
import { getNotificationEmails, addNotificationEmail, deleteNotificationEmail } from "@/lib/data"

export async function GET() {
    try {
        const emails = await getNotificationEmails()
        return NextResponse.json(emails)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { email, label } = await request.json()
        await addNotificationEmail(email, label)
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to add email" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get("email")
        if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

        await deleteNotificationEmail(email)
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete email" }, { status: 500 })
    }
}
