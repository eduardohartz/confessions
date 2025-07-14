"use client"

import { useState } from "react"
import ConfessionListAdmin from "@/components/confession-list-admin"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [admin, setAdmin] = useState(false)
  const [password, setPassword] = useState("")

  if (admin === false) {
    if (password) {
      setPassword("")
    }
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
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
                C<span className="text-white">ON</span>F
              </h1>
              <h1 className="bg-clip-text bg-linear-to-b from-blue-300 to-blue-600 font-bold text-transparent text-4xl">Management</h1>
              <p className="mx-auto mt-10 max-w-2xl text-muted-foreground text-xl">Log in with the master password to continue</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target as HTMLFormElement)
                  const password = formData.get("password") as string

                  fetch("/api/auth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password }),
                  })
                    .then((response) => response.json())
                    .then((data) => {
                      if (data.success) {
                        setAdmin(true)
                        setPassword(password)
                      } else {
                        alert(data.error || "Unauthorized")
                      }
                    })
                    .catch((error) => {
                      console.error("Error:", error)
                      alert("An error occurred while verifying the password")
                    })
                }}
                className="flex flex-col justify-center items-center gap-4 mt-4"
              >
                <Input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  className="w-70"
                  required
                />
                <Button
                  type="submit"
                  className="w-70"
                >
                  Submit
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-background min-h-screen">
        <div className="mx-auto px-4 py-8 max-w-4xl container">
          <div className="mb-12">
            <Button
              variant="outline"
              onClick={() => setAdmin(false)}
            >
              Log Out
            </Button>
            <ConfessionListAdmin
              refresh={refreshKey}
              password={password}
            />
          </div>
        </div>
      </div>
    </>
  )
}
