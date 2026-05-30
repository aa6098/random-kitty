"use client"

import { useRouter, useSearchParams } from "next/navigation"

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
    const size = searchParams.get("size")
    if (size) params.set("size", size)
    router.push(`/community?${params.toString()}`)
  }

  return (
    <select
      value={filter}
      onChange={(e) => handleChange(e.target.value as "all" | "blocked")}
      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
    >
      <option value="all">All Users</option>
      <option value="blocked">Blocked by me</option>
    </select>
  )
}
