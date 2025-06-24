import type { ClassValue } from "clsx"
import crypto from "node:crypto"
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
  const cloudflareIP = request.headers.get("cf-connecting-ip")
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (cloudflareIP) {
    return cloudflareIP
  }

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return "127.0.0.1"
}
