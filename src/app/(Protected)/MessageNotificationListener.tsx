"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { ChatCircleTextIcon } from "@phosphor-icons/react"
import { getPusherClient } from "@/lib/pusherClient"
import { getUserChannel } from "@/lib/pusherUtils"
import { useUserStore } from "@/lib/stores/userStore"

type MessageNotification = {
  senderId: string
  senderName: string
  senderImage: string | null
  messageText: string
  messageId: string
}

type Props = {
  currentMemberId: string
}

export function MessageNotificationListener({ currentMemberId }: Props) {
  const pathname = usePathname()
  const incrementUnread = useUserStore((s) => s.incrementUnread)
  const openChat = useUserStore((s) => s.openChat)
  const pathnameRef = useRef(pathname)
  useEffect(() => { pathnameRef.current = pathname }, [pathname])

  useEffect(() => {
    const channel = getPusherClient().subscribe(getUserChannel(currentMemberId))

    channel.bind("new-message-notification", (notification: MessageNotification) => {
      incrementUnread()

      toast.custom(
        (id) => (
          <button
            onClick={() => {
              toast.dismiss(id)
              openChat(notification.senderId, notification.senderName)
            }}
            className="flex items-start gap-3 w-full max-w-sm rounded-xl border border-primary bg-popover text-foreground shadow-lg px-4 py-3 text-left hover:bg-accent transition-colors"
          >
            {/* Avatar */}
            <div className="relative size-10 rounded-full overflow-hidden bg-muted shrink-0 ring-2 ring-primary/20 mt-0.5">
              {notification.senderImage ? (
                <Image
                  src={notification.senderImage}
                  alt={notification.senderName}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-sm font-bold text-muted-foreground">
                  {notification.senderName[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <ChatCircleTextIcon size={13} weight="fill" className="text-primary shrink-0" />
                <span className="text-sm font-semibold truncate">{notification.senderName}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{notification.messageText}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Click to open chat</p>
            </div>
          </button>
        ),
        { duration: 15000, id: `msg-${notification.messageId}` }
      )
    })

    return () => {
      channel.unbind("new-message-notification")
    }
  }, [currentMemberId])

  return null
}
