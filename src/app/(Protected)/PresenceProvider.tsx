"use client"

import { useEffect } from "react"
import { getPusherClient } from "@/lib/pusherClient"
import { usePresenceStore } from "@/lib/stores/presenceStore"
import type { PresenceChannel } from "pusher-js"

export function PresenceProvider() {
  const { setOnline, addOnline, removeOnline } = usePresenceStore()

  useEffect(() => {
    const pusher = getPusherClient()
    const channel = pusher.subscribe("presence-members") as PresenceChannel

    channel.bind("pusher:subscription_succeeded", (members: { each: (fn: (m: { id: string }) => void) => void }) => {
      const ids = new Set<string>()
      members.each((m) => ids.add(m.id))
      setOnline(ids)
    })

    channel.bind("pusher:member_added", (member: { id: string }) => {
      addOnline(member.id)
    })

    channel.bind("pusher:member_removed", (member: { id: string }) => {
      removeOnline(member.id)
    })

    return () => {
      pusher.unsubscribe("presence-members")
    }
  }, [setOnline, addOnline, removeOnline])

  return null
}
