import type { ClassValue } from "clsx"
import crypto from "crypto"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { forbiddenWords } from "./words"
import { countries } from "./countries"

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

export function verifyConfession(confession: string, country?: string, nickname?: string): boolean {
  const maxLength = 1000
  const minLength = 20
  const trimmedConfession = confession.trim()

  if (trimmedConfession.length < minLength || trimmedConfession.length > maxLength) return false
  if (/([^\s])\1{8,}/.test(trimmedConfession)) return false
  if ((trimmedConfession.match(/[\p{Emoji}]/gu)?.length ?? 0) > 8) return false
  if (/\b\d{6,}\b/.test(trimmedConfession)) return false

  const lowerConfession = trimmedConfession.toLowerCase()
  for (const word of forbiddenWords) {
    if (lowerConfession.includes(word)) return false
  }

  if (nickname) {
    const lowerNickname = nickname.toLowerCase()
    for (const word of forbiddenWords) {
      if (lowerNickname.includes(word)) return false
    }
  }

  // If country is provided, check that it's valid
  if (country) {
    const normalized = country.toLowerCase()
    const valid = countries.some((place) => place.name.toLowerCase() === normalized)
    return valid
  }

  // If no country is provided, that's allowed
  return true
}
