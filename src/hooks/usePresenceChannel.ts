"use client"

import { usePresenceStore } from "@/lib/stores/presenceStore"

export function usePresenceChannel() {
  return usePresenceStore((s) => s.onlineIds)
}
