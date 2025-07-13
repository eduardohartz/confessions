"use client"

import { useState } from "react"
import ConfessionListAdmin from "@/components/confession-list-admin"

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [admin, setAdmin] = useState(false)
  const [password, setPassword] = useState("")

  if (admin === false) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="font-bold text-2xl">Enter Password</h1>
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
          className="mt-4"
        >
          <input
            type="password"
            name="password"
            placeholder="Enter admin password"
            className="p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 ml-2 p-2 rounded text-white"
          >
            Submit
          </button>
        </form>
      </div>
    )
  }

  return (
    <>
      <ConfessionListAdmin
        refresh={refreshKey}
        password={password}
      />
    </>
  )
}
