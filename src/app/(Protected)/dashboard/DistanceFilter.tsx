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
      <label htmlFor="distance" className="text-sm hidden md:block font-medium text-muted-foreground whitespace-nowrap">
        Distance
      </label>
      <select
        id="distance"
        value={distance}
        onChange={(e) => handleChange(e.target.value)}
        className="h-8 border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring"
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
