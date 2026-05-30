"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Props = {
  initialValue: string
  filter: "all" | "blocked"
}

export function CommunitySearch({ initialValue, filter }: Props) {
  const router = useRouter()
  const [value, setValue] = useState(initialValue)

  function handleSearch() {
    const params = new URLSearchParams()
    params.set("page", "1")
    params.set("filter", filter)
    if (value.trim()) params.set("search", value.trim())
    router.push(`/community?${params.toString()}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch()
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Search by name..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-48"
      />
      <Button onClick={handleSearch} size="default">
        Search
      </Button>
    </div>
  )
}
