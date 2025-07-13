import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    const adminPassword = await prisma.admin.findFirst()

    if (password === adminPassword?.password) {
      return NextResponse.json({ success: true }, { status: 200 })
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
}
