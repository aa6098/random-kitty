"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"

type Props = {
  filter: "all" | "blocked"
}

export function CommunityFilter({ filter }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(value: "all" | "blocked") {
    const params = new URLSearchParams()
    params.set("page", "1")
    params.set("filter", value)
    const search = searchParams.get("search")
    if (search) params.set("search", search)
    router.push(`/community?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="radio"
          name="community-filter"
          value="all"
          checked={filter === "all"}
          onChange={() => handleChange("all")}
          className="accent-primary"
        />
        <Label htmlFor="filter-all" className="cursor-pointer font-normal">All Users</Label>
      </label>
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="radio"
          name="community-filter"
          value="blocked"
          checked={filter === "blocked"}
          onChange={() => handleChange("blocked")}
          className="accent-primary"
        />
        <Label htmlFor="filter-blocked" className="cursor-pointer font-normal">Blocked by me</Label>
      </label>
    </div>
  )
}
