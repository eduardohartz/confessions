import type { ClassValue } from "clsx"
import crypto from "crypto"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hashIP(ip: string): string {
  return crypto
    .createHash("sha256")
    .update(ip + process.env.IP_SALT || "default-salt")
    .digest("hex")
}

export function getClientIP(request: Request): string {
  return request.headers.get("cf-connecting-ip") ?? "127.0.0.1"
}

export function verifyConfession(confession: string): boolean {
  const maxLength = 1000
  const minLength = 20
  const trimmedConfession = confession.trim()

  if (trimmedConfession.length < minLength || trimmedConfession.length > maxLength) {
    return false
  }

  if (/([^\s])\1{10,}/.test(trimmedConfession)) return false
  if ((trimmedConfession.match(/[\p{Emoji}]/gu)?.length ?? 0) > 10) return false
  if (/\b\d{6,}\b/.test(trimmedConfession)) return false

  const forbiddenWords = [
    "https://",
    "http://",
    "www.",
    ".com",
    ".net",
    ".org",
    ".io",
    ".co",
    ".ru",
    ".xyz",
    ".tk",
    ".cn",
    ".top",
    ".biz",
    ".info",
    ".live",
    ".store",
    "discord.gg",
    "discord gg",
    "t.me",
    "joinchat",
    "onlyfans",
    "cashapp",
    "venmo",
    "paypal",
    "@gmail.com",
    "@yahoo.com",
    "@hotmail.com",
    "@outlook.com",
    "@protonmail.com",
    "raided by",
    "@icloud.com",
    "<",
    ">",
    "dm me",
    "add me",
    "snapchat",
    "snap:",
    "tiktok.com",
    "instagram.com",
    "follow me",
    "subscribe",
    "link in bio",
    "click here",
    "check out",
    "promo",
    "promotion",
    "ad",
    "advertisement",
    "sponsored",
    "buy now",
    "visit my",
    "earn money",
    "work from home",
    "investment",
    "crypto",
    "bitcoin",
    "nft",
    "only 18+",
    "18+",
    "make money",
    "cash prize",
    "free trial",
    "referral",
    "code:",
    "giveaway",
    "contest",
    "prize",
    "winner",
  ]

  const lower = trimmedConfession.toLowerCase()
  for (const word of forbiddenWords) {
    if (lower.includes(word)) {
      return false
    }
  }

  return true
}
