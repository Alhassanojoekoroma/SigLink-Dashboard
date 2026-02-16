import { NextRequest, NextResponse } from "next/server"
import { deleteSubscription, updateSubscription } from "@/lib/data"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 })
    }

    const updated = await updateSubscription(id, body)
    if (updated) {
      return NextResponse.json(updated)
    } else {
      return NextResponse.json({ error: "Failed to update" }, { status: 404 })
    }
  } catch (error: any) {
    console.error("PUT API Error:", error)
    return NextResponse.json({ error: error.message || "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 })
    }

    const success = await deleteSubscription(id)
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("DELETE API Error:", error)
    return NextResponse.json({ error: error.message || "Invalid request" }, { status: 400 })
  }
}
