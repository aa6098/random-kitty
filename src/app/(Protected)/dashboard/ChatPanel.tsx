"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import {
  XIcon,
  PaperPlaneTiltIcon,
  EnvelopeSimpleOpenIcon,
  TrashIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react"
import { getPusherClient } from "@/lib/pusherClient"
import { getChatChannel } from "@/lib/pusherUtils"
import { cn } from "@/lib/utils"
import { fetchMessages, sendChatMessage, type ChatMessage } from "./actions"

type Props = {
  isOpen: boolean
  onClose: () => void
  currentMemberId: string
  recipientId: string
  recipientName: string
}

export function ChatPanel({ isOpen, onClose, currentMemberId, recipientId, recipientName }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState("")
  const [isPending, startTransition] = useTransition()
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load messages when panel opens
  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    fetchMessages(recipientId)
      .then(setMessages)
      .finally(() => setLoading(false))
  }, [isOpen, recipientId])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150)
  }, [isOpen])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  // Real-time Pusher subscription
  useEffect(() => {
    if (!isOpen) return
    const channel = getChatChannel(currentMemberId, recipientId)
    const pusherChannel = getPusherClient().subscribe(channel)

    pusherChannel.bind("new-message", (msg: ChatMessage) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
    })

    return () => {
      pusherChannel.unbind("new-message")
      getPusherClient().unsubscribe(channel)
    }
  }, [isOpen, currentMemberId, recipientId])

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || isPending) return
    setText("")
    startTransition(async () => {
      const sent = await sendChatMessage(recipientId, trimmed)
      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]))
    })
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-in panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[400px] flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label={`Chat with ${recipientName}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
          <p className="text-base font-semibold leading-tight truncate">{recipientName}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="text-muted-foreground hover:text-foreground transition-colors ml-2 shrink-0"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Message list */}
        <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {loading && (
            <div className="flex flex-1 items-center justify-center">
              <SpinnerGapIcon size={24} className="animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-8">
              No messages yet. Say hello!
            </p>
          )}

          {!loading &&
            messages.map((msg) => {
              const isSender = msg.senderId === currentMemberId
              return (
                <div
                  key={msg.id}
                  className={cn("flex items-start gap-2", isSender ? "flex-row-reverse" : "flex-row")}
                >
                  <div
                    className={cn("mt-2 shrink-0", isSender ? "text-primary" : "text-muted-foreground")}
                    title={isSender ? "Sent" : "Received"}
                  >
                    {isSender ? (
                      <PaperPlaneTiltIcon size={14} weight="fill" />
                    ) : (
                      <EnvelopeSimpleOpenIcon size={14} weight="fill" />
                    )}
                  </div>

                  <div className="relative group max-w-[75%]">
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        isSender
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      <p className="break-words">{msg.text}</p>
                      <p
                        className={cn(
                          "mt-1 text-xs",
                          isSender ? "text-primary-foreground/60" : "text-muted-foreground",
                        )}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {isSender && msg.dateRead && <span className="ml-1.5">· Read</span>}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setMessages((prev) => prev.filter((m) => m.id !== msg.id))
                      }
                      title="Delete"
                      className={cn(
                        "absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity",
                        "text-destructive hover:text-destructive/80",
                        isSender ? "-left-5" : "-right-5",
                      )}
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
        </div>

        {/* Send form */}
        <form
          onSubmit={handleSend}
          className="flex gap-2 border-t border-border p-3 shrink-0"
        >
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${recipientName}…`}
            autoComplete="off"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={isPending || !text.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <PaperPlaneTiltIcon size={14} weight="fill" />
          </button>
        </form>
      </div>
    </>
  )
}
