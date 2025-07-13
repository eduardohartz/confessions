"use client"

import { Ban, Loader2, RefreshCw, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { countries } from "@/lib/countries"
import Pagination from "./pagination"

type Confession = {
  id: number
  content: string
  nickname: string | null
  country: string | null
  created_at: string
}

type PaginationInfo = {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export default function ConfessionListAdmin({ refresh, password }: { refresh: number; password: string }) {
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pageSize, setPageSize] = useState(10)
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [blockingIds, setBlockingIds] = useState<Set<number>>(new Set())

  const fetchConfessions = async (page = 1, limit = pageSize, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await fetch(`/api/confessions?page=${page}&limit=${limit}`)
      const data = await response.json()
      setConfessions(data.confessions || [])
      setPagination(
        data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      )
    } catch (error) {
      console.error("Failed to fetch confessions:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchConfessions(1, pageSize)
  }, [refresh, pageSize])

  const handlePageChange = (page: number) => {
    fetchConfessions(page, pageSize)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePageSizeChange = (newPageSize: string) => {
    const size = Number.parseInt(newPageSize)
    setPageSize(size)
    fetchConfessions(1, size)
  }

  const handleDelete = async (confessionId: number) => {
    if (!confirm("Are you sure you want to delete this confession?")) {
      return
    }

    setDeletingIds((prev) => new Set(prev).add(confessionId))

    try {
      const response = await fetch(`/api/admin/delete?id=${confessionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
      })

      if (response.ok) {
        // Refresh the list after successful deletion
        fetchConfessions(pagination.currentPage, pageSize, true)
      } else {
        const error = await response.json()
        alert(`Failed to delete confession: ${error.error}`)
      }
    } catch (error) {
      console.error("Failed to delete confession:", error)
      alert("Failed to delete confession. Please try again.")
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(confessionId)
        return newSet
      })
    }
  }

  const handleBlock = async (confessionId: number) => {
    if (!confirm("Are you sure you want to block the IP address associated with this confession?")) {
      return
    }

    setBlockingIds((prev) => new Set(prev).add(confessionId))

    try {
      const response = await fetch("/api/admin/block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ id: confessionId }),
      })

      if (response.ok) {
        alert("IP address blocked successfully")
      } else {
        const error = await response.json()
        alert(`Failed to block IP: ${error.error}`)
      }
    } catch (error) {
      console.error("Failed to block IP:", error)
      alert("Failed to block IP. Please try again.")
    } finally {
      setBlockingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(confessionId)
        return newSet
      })
    }
  }

  const getCountryFlag = (countryName: string | null) => {
    if (!countryName) {
      return null
    }
    const country = countries.find((c) => c.name === countryName)
    return country?.flag || null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-muted-foreground text-sm">
            Showing {(pagination.currentPage - 1) * pageSize + 1} to {Math.min(pagination.currentPage * pageSize, pagination.totalCount)} of {pagination.totalCount} confessions
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Show:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchConfessions(pagination.currentPage, pageSize, true)}
            disabled={refreshing}
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {confessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No confessions yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {confessions.map((confession) => (
              <Card
                key={confession.id}
                className="hover:bg-accent/50 transition-colors"
              >
                <CardContent className="pt-6">
                  <p className="mb-3 text-foreground leading-relaxed">{confession.content}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <span>
                        by <span className="font-bold underline">{confession.nickname || "Anonymous"}</span>
                      </span>
                      {confession.country && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          {getCountryFlag(confession.country)} {confession.country}
                        </Badge>
                      )}
                      <span>{formatDate(confession.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBlock(confession.id)}
                        disabled={blockingIds.has(confession.id)}
                        className="hover:bg-orange-50 border-orange-200 text-orange-600 hover:text-orange-700"
                      >
                        {blockingIds.has(confession.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                        Block IP
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(confession.id)}
                        disabled={deletingIds.has(confession.id)}
                        className="hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700"
                      >
                        {deletingIds.has(confession.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
          />
        </>
      )}
    </div>
  )
}
