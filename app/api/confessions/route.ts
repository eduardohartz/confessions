import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getClientIP, hashIP, verifyConfession } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const totalCount = await prisma.confession.count()

    const confessions = await prisma.confession.findMany({
      select: {
        id: true,
        content: true,
        nickname: true,
        country: true,
        isNicknameAnonymous: true,
        isCountryAnonymous: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    const transformedConfessions = confessions.map((confession) => ({
      id: confession.id,
      content: confession.content,
      nickname: confession.isNicknameAnonymous ? "Anonymous" : confession.nickname,
      country: confession.isCountryAnonymous ? null : confession.country,
      created_at: confession.createdAt.toISOString(),
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      confessions: transformedConfessions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch confessions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, nickname, country, isNicknameAnonymous, isCountryAnonymous } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    if (!verifyConfession(content)) {
      return NextResponse.json({ error: "Confession does not meet the requirements" }, { status: 400 })
    }

    const clientIP = getClientIP(request)
    const ipHash = hashIP(clientIP)

    const blockedIP = await prisma.blockedIP.findUnique({
      where: { ipHash },
    })

    if (blockedIP && blockedIP.ipHash === ipHash) {
      return NextResponse.json({ error: "You are blocked from submitting confessions" }, { status: 403 })
    }

    const lastRateLimit = await prisma.rateLimit.findFirst({
      where: { ipHash },
      orderBy: { lastSubmission: "desc" },
    })

    if (lastRateLimit) {
      const now = new Date()
      const timeDiff = now.getTime() - lastRateLimit.lastSubmission.getTime()
      const minutesDiff = timeDiff / (1000 * 60)

      if (minutesDiff < 5) {
        const remainingTime = Math.ceil(5 - minutesDiff)
        return NextResponse.json({ error: `Please wait ${remainingTime} more minute(s) before submitting again` }, { status: 429 })
      }
    }

    await prisma.confession.create({
      data: {
        content: content.trim(),
        nickname: nickname || null,
        country: country || null,
        isNicknameAnonymous: isNicknameAnonymous || false,
        isCountryAnonymous: isCountryAnonymous || false,
        ipHash,
      },
    })

    await prisma.rateLimit.upsert({
      where: { ipHash },
      update: { lastSubmission: new Date() },
      create: { ipHash, lastSubmission: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to submit confession" }, { status: 500 })
  }
}
