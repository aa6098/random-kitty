"use client"

import { useEffect, useRef } from "react"
import { useUserStore } from "@/lib/stores/userStore"

type Props = {
  name: string | null
  image: string | null
  unreadCount: number
  deactivated: boolean
  hasMember: boolean
}

export function UserStoreInitializer({ name, image, unreadCount, deactivated, hasMember }: Props) {
  const setUser = useUserStore((s) => s.setUser)
  const setUnreadCount = useUserStore((s) => s.setUnreadCount)
  const setDeactivated = useUserStore((s) => s.setDeactivated)
  const setHasMember = useUserStore((s) => s.setHasMember)
  const initialized = useRef(false)

  // Set user info once on first render (synchronous so Header has it on first paint)
  if (!initialized.current) {
    initialized.current = true
    setUser(name, image)
    setUnreadCount(unreadCount)
    setDeactivated(deactivated)
    setHasMember(hasMember)
  }

  // Re-sync all fields whenever the server sends new values (e.g. after router.refresh())
  useEffect(() => {
    setUser(name, image)
  }, [name, image, setUser])

  useEffect(() => {
    setUnreadCount(unreadCount)
  }, [unreadCount, setUnreadCount])

  useEffect(() => {
    setDeactivated(deactivated)
  }, [deactivated, setDeactivated])

  useEffect(() => {
    setHasMember(hasMember)
  }, [hasMember, setHasMember])

  return null
}
