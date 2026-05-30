"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function getDesiredPageSize(): number {
  if (window.innerWidth >= 1024) return 24
  if (window.innerWidth >= 768) return 18
  return 12
}

export function PageSizeSync() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const desired = String(getDesiredPageSize())
    if (searchParams.get("size") !== desired) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("size", desired)
      params.set("page", "1")
      router.replace(`/community?${params.toString()}`)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
