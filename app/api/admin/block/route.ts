import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
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

    const confession = await prisma.confession.findUnique({
      where: { id: confessionId },
      select: { ipHash: true },
    })

    if (!confession) {
      return NextResponse.json({ error: "Confession not found" }, { status: 404 })
    }

    const existingBlock = await prisma.blockedIP.findUnique({
      where: { ipHash: confession.ipHash },
    })

    if (existingBlock) {
      return NextResponse.json({ error: "IP is already blocked" }, { status: 400 })
    }

    await prisma.blockedIP.create({
      data: {
        ipHash: confession.ipHash,
      },
    })

    await prisma.confession.deleteMany({
      where: { ipHash: confession.ipHash },
    })

    return NextResponse.json({ success: true, message: "IP blocked successfully" })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to block IP" }, { status: 500 })
  }
}
