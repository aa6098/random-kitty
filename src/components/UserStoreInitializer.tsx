"use client"

import { useRef } from "react"
import { useUserStore } from "@/lib/stores/userStore"

type Props = {
  name: string | null
  image: string | null
}

export function UserStoreInitializer({ name, image }: Props) {
  const setUser = useUserStore((s) => s.setUser)
  const initialized = useRef(false)

  if (!initialized.current) {
    initialized.current = true
    setUser(name, image)
  }

  return null
}
