"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import Head from "next/head"
import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { countries } from "@/lib/countries"

declare global {
  interface Window {
    cb: () => void
    turnstile: any
  }
}

export default function ConfessionForm({ onSubmit }: { onSubmit: () => void }) {
  const [content, setContent] = useState("")
  const [nickname, setNickname] = useState("")
  const [country, setCountry] = useState("")
  const [isNicknameAnonymous, setIsNicknameAnonymous] = useState(false)
  const [isCountryAnonymous, setIsCountryAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [token, setToken] = useState("")

  const containerRef = useRef<HTMLDivElement>(null)
  const turnstileWidgetId = useRef<any>(null)

  useEffect(() => {
    window.cb = () => {
      if (window.turnstile && containerRef.current) {
        turnstileWidgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: "0x4AAAAAABlbfoKowNjfojZ3",
          size: "invisible",
          callback: (token: string) => {
            setToken(token)
          },
          "error-callback": () => {
            setError("Error, please try again later.")
          },
        })

        window.turnstile.execute(turnstileWidgetId.current)
      }
    }
  }, [])

  const submitForm = async () => {
    try {
      const response = await fetch("/api/confessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          nickname: isNicknameAnonymous ? "" : nickname,
          country: isCountryAnonymous ? "" : country,
          isNicknameAnonymous,
          isCountryAnonymous,
          token: token,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error, please try again later.")
      }

      setContent("")
      setNickname("")
      setCountry("")
      setIsNicknameAnonymous(false)
      setIsCountryAnonymous(false)
      setToken("")
      onSubmit()

      window.turnstile.reset(turnstileWidgetId.current)
      window.turnstile.execute(turnstileWidgetId.current)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error, please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    if (!token || token == "") {
      setError("Error, please try again later.")
      setIsSubmitting(false)
      return
    }

    submitForm()
  }

  return (
    <>
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-bold text-2xl text-center">Share Your Confession</CardTitle>
          <CardDescription className="text-center">Obviously, your confession will be visible to others.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="content">Your Confession</Label>
              <Textarea
                id="content"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-32 resize-none"
                maxLength={1000}
                minLength={20}
                required
              />
              <div className="text-muted-foreground text-sm text-right">
                {content.length < 20 ? <span className="text-red-400">{content.length}</span> : content.length}
                /1000 characters
              </div>
            </div>

            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  placeholder="Enter a nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={isNicknameAnonymous}
                  maxLength={50}
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous-nickname"
                    checked={isNicknameAnonymous}
                    onCheckedChange={(checked) => setIsNicknameAnonymous(checked as boolean)}
                  />
                  <Label
                    htmlFor="anonymous-nickname"
                    className="text-sm"
                  >
                    Post anonymously
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={country}
                  onValueChange={setCountry}
                  disabled={isCountryAnonymous}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="p-2 max-w-60">
                    {countries.map((c) => (
                      <SelectItem
                        key={c.code}
                        value={c.name}
                      >
                        <span className="flex items-center gap-2">
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous-country"
                    checked={isCountryAnonymous}
                    onCheckedChange={(checked) => setIsCountryAnonymous(checked as boolean)}
                  />
                  <Label
                    htmlFor="anonymous-country"
                    className="text-sm"
                  >
                    Hide country
                  </Label>
                </div>
              </div>
            </div>

            {error && <div className="bg-red-500/10 p-3 rounded-md text-red-500 text-sm">{error}</div>}

            <div ref={containerRef} />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 w-4 h-4" />
                  Submit Confession
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
