import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const password = request.headers.get("Authorization")?.replace("Bearer ", "")

    const admin = await prisma.admin.findFirst()

    if (!admin || admin.password !== password) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: "Confession ID is required" }, { status: 400 })
    }

    const confessionId = Number.parseInt(id)
    if (Number.isNaN(confessionId)) {
      return NextResponse.json({ error: "Invalid confession ID" }, { status: 400 })
    }

    // Check if confession exists
    const confession = await prisma.confession.findUnique({
      where: { id: confessionId },
    })

    if (!confession) {
      return NextResponse.json({ error: "Confession not found" }, { status: 404 })
    }

    // Delete the confession
    await prisma.confession.delete({
      where: { id: confessionId },
    })

    return NextResponse.json({ success: true, message: "Confession deleted successfully" })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete confession" }, { status: 500 })
  }
}
