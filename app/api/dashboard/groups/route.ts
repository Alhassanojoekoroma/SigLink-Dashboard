import { NextResponse } from "next/server"
import { getCompanyGroups } from "@/lib/data"

export async function GET() {
  return NextResponse.json({ groups: await getCompanyGroups() })
}
