"use client"

import { useEffect, useRef } from "react"
import { useUserStore } from "@/lib/stores/userStore"

type Props = {
  name: string | null
  image: string | null
  unreadCount: number
}

export function UserStoreInitializer({ name, image, unreadCount }: Props) {
  const setUser = useUserStore((s) => s.setUser)
  const setUnreadCount = useUserStore((s) => s.setUnreadCount)
  const initialized = useRef(false)

  // Set user info once on first render (synchronous so Header has it on first paint)
  if (!initialized.current) {
    initialized.current = true
    setUser(name, image)
    setUnreadCount(unreadCount)
  }

  // Re-sync unreadCount whenever the server sends a new value (e.g. after router.refresh())
  useEffect(() => {
    setUnreadCount(unreadCount)
  }, [unreadCount, setUnreadCount])

  return null
}
