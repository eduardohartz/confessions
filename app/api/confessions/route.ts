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
    const body = await request.json()
    const { content, nickname, country, isNicknameAnonymous, isCountryAnonymous, token } = body

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    const cfVerifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY || "",
        response: token,
        remoteip: request.headers.get("x-forwarded-for") || "",
      }),
    })

    const cfData = await cfVerifyRes.json()

    if (!cfData.success) {
      return NextResponse.json({ error: "Failed Turnstile verification" }, { status: 403 })
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    if (!verifyConfession(content, country, nickname)) {
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
