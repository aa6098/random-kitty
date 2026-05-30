"use client"

import Link from "next/link"
import Image from "next/image"
import { BellSlashIcon, ChatCircleTextIcon, ArrowRightIcon } from "@phosphor-icons/react"

export type NotificationItem = {
  senderId: string
  senderName: string
  senderImage: string | null
  count: number
  latestMessage: string
  latestAt: string
}

type Props = {
  items: NotificationItem[]
}

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return "yesterday"
  if (days < 7) return `${days}d ago`
  return new Date(isoString).toLocaleDateString()
}

export function NotificationList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center">
          <BellSlashIcon size={28} weight="duotone" />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">No new notifications</p>
          <p className="text-sm mt-1">When someone messages you, it will appear here.</p>
        </div>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.senderId}>
          <Link
            href={`/members/${item.senderId}/messages`}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/20 hover:shadow-sm transition-all group"
          >
            {/* Avatar */}
            <div className="relative size-12 rounded-full overflow-hidden bg-muted shrink-0 ring-2 ring-primary/20">
              {item.senderImage ? (
                <Image
                  src={item.senderImage}
                  alt={item.senderName}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-base font-bold text-muted-foreground">
                  {item.senderName[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <ChatCircleTextIcon
                  size={13}
                  weight="fill"
                  className="text-primary shrink-0"
                />
                <span className="text-sm font-semibold truncate">{item.senderName}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {item.latestMessage}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {relativeTime(item.latestAt)}
              </p>
            </div>

            {/* Unread badge + arrow */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold px-1.5">
                {item.count}
              </span>
              <ArrowRightIcon
                size={16}
                className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
              />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
