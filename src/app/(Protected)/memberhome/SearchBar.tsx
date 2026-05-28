"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const distance = searchParams.get("distance") ?? "0"
  const sortBy = searchParams.get("sort") ?? "U"

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(key, value)
      params.set("page", "1")
      router.push(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div className="flex flex-row items-center gap-4">
      <div className="flex flex-row items-center gap-2">
        <label htmlFor="distance" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          Distance
        </label>
        <select
          id="distance"
          value={distance}
          onChange={(e) => update("distance", e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="10">10 miles</option>
          <option value="25">25 miles</option>
          <option value="50">50 miles</option>
          <option value="100">100 miles</option>
          <option value="0">Any miles</option>
        </select>
      </div>

      <div className="flex flex-row items-center gap-2">
        <label htmlFor="sortBy" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          Sort by
        </label>
        <select
          id="sortBy"
          value={sortBy}
          onChange={(e) => update("sort", e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="U">By Date</option>
          <option value="D">By Distance</option>
        </select>
      </div>
    </div>
  )
}
