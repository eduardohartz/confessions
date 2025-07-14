"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import ConfessionForm from "@/components/confession-form"
import ConfessionList from "@/components/confession-list"
import ContentWarningDialog from "@/components/warning"

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    const warningDismissed = localStorage.getItem("confessions-warning-dismissed")
    if (!warningDismissed) {
      setShowWarning(true)
    }
  }, [])

  const handleNewConfession = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <>
      <div className="bg-background min-h-screen">
        <div className="mx-auto px-4 py-8 max-w-4xl container">
          <div className="mb-12 text-center">
            <Image
              src="/logo.png"
              alt="Confessions Logo"
              width={100}
              height={100}
              className="mx-auto mb-4"
            />
            <h1 className="bg-clip-text bg-linear-to-b from-blue-300 to-blue-600 mb-2 font-bold text-transparent text-9xl">
              4<span className="text-white">0</span>4
            </h1>
            <h1 className="bg-clip-text bg-linear-to-b from-blue-300 to-blue-600 font-bold text-transparent text-4xl">Page Not Found</h1>
            <p className="mx-auto mt-10 max-w-2xl text-muted-foreground text-xl">How did you get here? Stop snooping around.</p>
          </div>
        </div>
      </div>
    </>
  )
}
