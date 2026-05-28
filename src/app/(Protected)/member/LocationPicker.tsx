"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { searchLocationsAction } from "./actions"
import { Input } from "@/components/ui/input"
import { MagnifyingGlass } from "@phosphor-icons/react"

type LocationOption = { id: string; city: string; state: string; zip: string }

type Props = {
  initialLocation?: LocationOption | null
}

export function LocationPicker({ initialLocation }: Props) {
  const [query, setQuery] = useState(
    initialLocation ? `${initialLocation.city}, ${initialLocation.state}` : ""
  )
  const [selectedId, setSelectedId] = useState(initialLocation?.id ?? "")
  const [results, setResults] = useState<LocationOption[]>([])
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)

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
    setSelectedId("")
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
    setSelectedId(loc.id)
    setQuery(`${loc.city}, ${loc.state}`)
    setOpen(false)
    setResults([])
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name="locationId" value={selectedId} />
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
          className="pl-7"
        />
        {isPending && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            …
          </span>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 w-64 mt-0.5 bg-popover border border-border shadow-md overflow-auto">
          {results.map((loc) => (
            <button
              key={loc.id}
              type="button"
              className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted text-foreground flex items-center gap-1.5"
              onClick={() => handleSelect(loc)}
            >
              {/* <span className="truncate max-w-[2ch] shrink-0 font-medium">{loc.city.slice(0, 2)}</span> */}
              <span className="truncate flex-1 text-xs text-muted-foreground">{loc.city}, {loc.state}</span>
              <span className="text-xs text-muted-foreground shrink-0">{loc.zip}</span>
            </button>
          ))}
        </div>
      )}
      {open && results.length === 0 && !isPending && query.length >= 2 && (
        <div className="absolute z-50 w-64 mt-0.5 bg-popover border border-border shadow-md px-2 py-1.5 text-sm text-muted-foreground">
          No locations found.
        </div>
      )}
    </div>
  )
}
