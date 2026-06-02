"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

export function DistanceFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const distance = searchParams.get("distance") ?? "0"

  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("distance", value)
      router.push(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="distance" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        Distance
      </label>
      <select
        id="distance"
        value={distance}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="10">10 miles</option>
        <option value="25">25 miles</option>
        <option value="50">50 miles</option>
        <option value="100">100 miles</option>
        <option value="0">Any Distance</option>
      </select>
    </div>
  )
}
