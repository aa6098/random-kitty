"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { BellSlashIcon, ChatCircleTextIcon, EnvelopeSimpleIcon, HeartIcon, ArrowRightIcon } from "@phosphor-icons/react"
import { useUserStore } from "@/lib/stores/userStore"
import { markLikeRead } from "./actions"

export type ChatNotification = {
  kind: "chat"
  senderId: string
  senderName: string
  senderImage: string | null
  count: number
  latestMessage: string
  sortAt: string
}

export type EmailNotification = {
  kind: "email"
  senderId: string
  senderName: string
  senderImage: string | null
  count: number
  latestMessage: string
  sortAt: string
}

export type LikeNotification = {
  kind: "like"
  likeId: number
  likerId: string
  likerName: string
  likerImage: string | null
  sortAt: string
}

export type UnifiedNotification = ChatNotification | EmailNotification | LikeNotification

// kept for backwards-compat if anything still imports this name
export type MessageNotification = ChatNotification

type Props = {
  items: UnifiedNotification[]
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

function Avatar({ src, name }: { src: string | null; name: string }) {
  return (
    <div className="relative size-12 rounded-full overflow-hidden bg-muted shrink-0 ring-2 ring-primary/20">
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" sizes="48px" />
      ) : (
        <div className="flex items-center justify-center h-full text-base font-bold text-muted-foreground">
          {name[0].toUpperCase()}
        </div>
      )}
    </div>
  )
}

function ChatItem({ item }: { item: ChatNotification }) {
  const openChat = useUserStore((s) => s.openChat)

  return (
    <button
      type="button"
      onClick={() => openChat(item.senderId, item.senderName)}
      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/20 hover:shadow-sm transition-all group text-left"
    >
      <Avatar src={item.senderImage} name={item.senderName} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <ChatCircleTextIcon size={13} weight="fill" className="text-primary shrink-0" />
          <span className="text-sm font-semibold truncate">{item.senderName}</span>
        </div>
        <p className="text-sm text-muted-foreground truncate mt-0.5">{item.latestMessage}</p>
        <p className="text-xs text-muted-foreground/60 mt-1">{relativeTime(item.sortAt)}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold px-1.5">
          {item.count}
        </span>
        <ArrowRightIcon
          size={16}
          className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </button>
  )
}

function EmailItem({ item }: { item: EmailNotification }) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.push(`/memberdetail/${item.senderId}?tab=email`)}
      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/20 hover:shadow-sm transition-all group text-left"
    >
      <Avatar src={item.senderImage} name={item.senderName} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <EnvelopeSimpleIcon size={13} weight="fill" className="text-primary shrink-0" />
          <span className="text-sm font-semibold truncate">{item.senderName}</span>
        </div>
        <p className="text-sm text-muted-foreground truncate mt-0.5">{item.latestMessage}</p>
        <p className="text-xs text-muted-foreground/60 mt-1">{relativeTime(item.sortAt)}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold px-1.5">
          {item.count}
        </span>
        <ArrowRightIcon
          size={16}
          className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </button>
  )
}

function LikeItem({ item }: { item: LikeNotification }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await markLikeRead(item.likeId)
      router.push(`/members/${item.likerId}/profile`)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-rose-300/40 hover:shadow-sm transition-all group text-left disabled:opacity-60"
    >
      <Avatar src={item.likerImage} name={item.likerName} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <HeartIcon size={13} weight="fill" className="text-rose-500 shrink-0" />
          <span className="text-sm font-semibold truncate">{item.likerName}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">liked your profile</p>
        <p className="text-xs text-muted-foreground/60 mt-1">{relativeTime(item.sortAt)}</p>
      </div>

      <ArrowRightIcon
        size={16}
        className="text-muted-foreground/40 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all shrink-0"
      />
    </button>
  )
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
          <p className="text-sm mt-1">When someone messages or likes your profile, it will appear here.</p>
        </div>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.kind === "like" ? `like-${item.likeId}` : `${item.kind}-${item.senderId}`}>
          {item.kind === "chat" && <ChatItem item={item} />}
          {item.kind === "email" && <EmailItem item={item} />}
          {item.kind === "like" && <LikeItem item={item} />}
        </li>
      ))}
    </ul>
  )
}
