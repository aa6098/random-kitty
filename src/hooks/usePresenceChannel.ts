"use client"
import { useEffect, useState } from "react"
import { getPusherClient } from "@/lib/pusherClient"
import type { PresenceChannel } from "pusher-js"

export function usePresenceChannel() {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const pusher = getPusherClient()
    const channel = pusher.subscribe("presence-members") as PresenceChannel

    channel.bind("pusher:subscription_succeeded", (members: { each: (fn: (m: { id: string }) => void) => void }) => {
      const ids = new Set<string>()
      members.each((m) => ids.add(m.id))
      setOnlineIds(ids)
    })

    channel.bind("pusher:member_added", (member: { id: string }) => {
      setOnlineIds((prev) => new Set(prev).add(member.id))
    })

    channel.bind("pusher:member_removed", (member: { id: string }) => {
      setOnlineIds((prev) => {
        const next = new Set(prev)
        next.delete(member.id)
        return next
      })
    })

    return () => {
      pusher.unsubscribe("presence-members")
    }
  }, [])

  return onlineIds
}
