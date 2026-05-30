"use client"

import { useRef, useTransition, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  PaperPlaneTiltIcon,
  EnvelopeSimpleOpenIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import { sendMessage, deleteMessage } from "./actions"
import { getPusherClient } from "@/lib/pusherClient"
import { getChatChannel } from "@/lib/pusherUtils"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  text: string
  createdAt: string
  senderId: string | null
  recipientId: string | null
  dateRead: string | null
}

type Props = {
  messages: Message[]
  currentMemberId: string
  recipientId: string
  recipientName: string
  hadUnread?: boolean
}

export function MessageThread({ messages, currentMemberId, recipientId, recipientName, hadUnread = false }: Props) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [localMessages, setLocalMessages] = useState<Message[]>(messages)
  const [isPending, startTransition] = useTransition()

  // Refresh server components (layout badge) once after unread messages are marked read
  useEffect(() => {
    if (hadUnread) router.refresh()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [localMessages])

  // Subscribe to Pusher channel for real-time messages
  useEffect(() => {
    const channel = getChatChannel(currentMemberId, recipientId)
    const pusherChannel = getPusherClient().subscribe(channel)

    pusherChannel.bind("new-message", (message: Message) => {
      setLocalMessages(prev =>
        prev.some(m => m.id === message.id) ? prev : [...prev, message]
      )
    })

    return () => {
      pusherChannel.unbind("new-message")
    }
  }, [currentMemberId, recipientId])

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const text = (data.get("text") as string).trim()
    if (!text) return
    startTransition(async () => {
      await sendMessage(recipientId, text)
      formRef.current?.reset()
    })
  }

  function handleDelete(messageId: string) {
    // Optimistically remove from local state
    setLocalMessages(prev => prev.filter(m => m.id !== messageId))
    startTransition(async () => {
      await deleteMessage(messageId, recipientId)
    })
  }

  return (
    <div className="flex flex-col gap-4 h-[70vh]">
      <h2 className="text-xl font-semibold tracking-tight">
        Chat with {recipientName}
      </h2>

      {/* Message list */}
      <div ref={listRef} className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
        {localMessages.length === 0 && (
          <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
        )}
        {localMessages.map(message => {
          const isSender = message.senderId === currentMemberId
          return (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-2",
                isSender ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Direction icon */}
              <div
                className={cn(
                  "mt-2 shrink-0",
                  isSender ? "text-primary" : "text-muted-foreground"
                )}
                title={isSender ? "Sent" : "Received"}
              >
                {isSender ? (
                  <PaperPlaneTiltIcon size={16} weight="fill" />
                ) : (
                  <EnvelopeSimpleOpenIcon size={16} weight="fill" />
                )}
              </div>

              {/* Message bubble */}
              <div className="relative group max-w-[75%]">
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm",
                    isSender
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="break-words">{message.text}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      isSender
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground"
                    )}
                  >
                    {new Date(message.createdAt).toLocaleString()}
                    {isSender && message.dateRead && (
                      <span className="ml-1.5">· Read</span>
                    )}
                  </p>
                </div>

                {/* Delete button — appears on hover */}
                <button
                  onClick={() => handleDelete(message.id)}
                  disabled={isPending}
                  title="Delete"
                  className={cn(
                    "absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity",
                    "text-destructive hover:text-destructive/80 disabled:opacity-30",
                    isSender ? "-left-6" : "-right-6"
                  )}
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Send form */}
      <form
        ref={formRef}
        onSubmit={handleSend}
        className="flex gap-2 pt-3 border-t border-border"
      >
        <input
          name="text"
          placeholder={`Message ${recipientName}…`}
          autoComplete="off"
          required
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <PaperPlaneTiltIcon size={14} weight="fill" />
          Send
        </button>
      </form>
    </div>
  )
}
