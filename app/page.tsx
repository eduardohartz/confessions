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
      <ContentWarningDialog
        open={showWarning}
        onOpenChange={setShowWarning}
      />

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
            <h1 className="bg-clip-text bg-linear-to-b from-blue-300 to-blue-600 mb-4 font-bold text-transparent text-4xl md:text-6xl">Confessions</h1>
            <p className="mx-auto max-w-2xl text-muted-foreground text-xl">Share your thoughts, secrets, and confessions anonymously.</p>
          </div>

          <div className="space-y-12">
            <ConfessionForm onSubmit={handleNewConfession} />
            <ConfessionList refresh={refreshKey} />
          </div>
        </div>
      </div>
    </>
  )
}
