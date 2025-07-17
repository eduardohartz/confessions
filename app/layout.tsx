import type { Metadata } from "next"
import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Confessions - Share Anonymously",
  description: "A safe space to share your thoughts, secrets, and confessions anonymously.",
  openGraph: {
    title: "Confessions - Share Anonymously",
    description: "A safe space to share your thoughts, secrets, and confessions anonymously.",
    url: "https://confessions.top",
    siteName: "Confessions",
    images: [
      {
        url: "https://confessions.top/logo.png",
        width: 362,
        height: 296,
        alt: "Confessions.top",
      },
    ],
    locale: "en_US",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="dark"
    >
      <body className={inter.className}>{children}</body>
    </html>
  )
}
