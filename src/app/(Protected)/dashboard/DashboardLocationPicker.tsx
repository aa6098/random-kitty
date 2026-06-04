"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MagnifyingGlass, XIcon } from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"
import { searchLocationsAction } from "@/app/(Protected)/member/actions"

type LocationOption = { id: string; city: string; state: string; zip: string }

type Props = {
  initialLocation?: LocationOption | null
  memberLocation?: LocationOption | null
}

export function DashboardLocationPicker({ initialLocation, memberLocation }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(
    initialLocation ? `${initialLocation.city}, ${initialLocation.state}` : ""
  )
  const [results, setResults] = useState<LocationOption[]>([])
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync displayed text when the resolved location changes after navigation
  useEffect(() => {
    setQuery(initialLocation ? `${initialLocation.city}, ${initialLocation.state}` : "")
  }, [initialLocation?.id])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (val.length >= 2) {
      startTransition(async () => {
        const locations = await searchLocationsAction(val)
        setResults(locations)
        setOpen(true)
      })
    } else {
      setResults([])
      setOpen(false)
    }
  }

  function handleSelect(loc: LocationOption) {
    setQuery(`${loc.city}, ${loc.state}`)
    setOpen(false)
    setResults([])
    const params = new URLSearchParams(searchParams.toString())
    params.set("location", loc.id)
    router.push(`?${params.toString()}`)
  }

  function handleClear() {
    setQuery(memberLocation ? `${memberLocation.city}, ${memberLocation.state}` : "")
    setResults([])
    setOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete("location")
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        Location
      </label>
      <div ref={containerRef} className="relative">
        <div className="relative">
          <MagnifyingGlass
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            value={query}
            onChange={handleChange}
            placeholder="Search city…"
            autoComplete="off"
            className="w-45 pl-7 pr-7"
          />
          {isPending && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">…</span>
          )}
          {!isPending && query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear location"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>

        {open && results.length > 0 && (
          <div className="absolute z-50 mt-0.5 w-64 overflow-auto border border-border bg-popover shadow-md">
            {results.map((loc) => (
              <button
                key={loc.id}
                type="button"
                className="flex w-full items-center gap-1.5 px-2 py-1.5 text-left text-sm text-foreground hover:bg-muted"
                onClick={() => handleSelect(loc)}
              >
                <span className="flex-1 truncate text-xs text-muted-foreground">{loc.city}, {loc.state}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{loc.zip}</span>
              </button>
            ))}
          </div>
        )}

        {open && results.length === 0 && !isPending && query.length >= 2 && (
          <div className="absolute z-50 mt-0.5 w-64 border border-border bg-popover px-2 py-1.5 text-sm text-muted-foreground shadow-md">
            No locations found.
          </div>
        )}
      </div>
    </div>
  )
}
