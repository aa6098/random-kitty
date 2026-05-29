"use client"

import { usePresenceChannel } from "@/hooks/usePresenceChannel"
import { VideoCall } from "./VideoCall"

type Props = {
  currentMemberId: string
  recipientId: string
  recipientName: string
  triggerClassName?: string
}

export function VideoCallPresence({ currentMemberId, recipientId, recipientName, triggerClassName }: Props) {
  const onlineIds = usePresenceChannel()

  if (!onlineIds.has(recipientId)) return null

  return (
    <VideoCall
      currentMemberId={currentMemberId}
      recipientId={recipientId}
      recipientName={recipientName}
      triggerClassName={triggerClassName}
    />
  )
}
