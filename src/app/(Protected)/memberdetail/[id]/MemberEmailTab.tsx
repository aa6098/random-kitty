"use client"

import { useEffect, useState } from "react"
import {
  PaperPlaneTiltIcon,
  EnvelopeSimpleIcon,
  EnvelopeSimpleOpenIcon,
  ArrowBendUpLeftIcon,
  XIcon,
  PencilSimpleLineIcon,
  CheckCircleIcon,
  CaretDoubleLeftIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretDoubleRightIcon,
} from "@phosphor-icons/react"
import { fetchEmailMessages, markEmailRead, type EmailMessage } from "@/app/(Protected)/dashboard/actions"
import { EmailComposeDialog } from "@/components/custom/EmailComposeDialog"

type Props = {
  currentMemberId: string
  otherMember: { id: string; displayName: string }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const PAGE_SIZE = 5

export function MemberEmailTab({ currentMemberId, otherMember }: Props) {
  const [messages, setMessages] = useState<EmailMessage[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [selected, setSelected] = useState<EmailMessage | null>(null)
  const [replyOpen, setReplyOpen] = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  async function loadPage(p: number) {
    setFetching(true)
    const { messages, total } = await fetchEmailMessages(otherMember.id, p)
    setMessages(messages)
    setTotal(total)
    setPage(p)
    setFetching(false)
  }

  useEffect(() => {
    fetchEmailMessages(otherMember.id, 0)
      .then(({ messages, total }) => {
        setMessages(messages)
        setTotal(total)
      })
      .finally(() => setLoading(false))
  }, [otherMember.id])

  async function handleSelect(msg: EmailMessage) {
    setSelected(msg)
    const isReceived = msg.recipientId === currentMemberId && !msg.dateRead
    if (isReceived) {
      await markEmailRead(msg.id)
      setMessages((prev) =>
        prev.map((m) => m.id === msg.id ? { ...m, dateRead: new Date().toISOString() } : m)
      )
    }
  }

  function handleClose() {
    setSelected(null)
    setReplyOpen(false)
  }

  function handleReplySent() {
    loadPage(0)
  }

  const navBtnCls = (disabled: boolean) =>
    [
      "p-1.5 rounded-md border border-input transition-colors",
      disabled
        ? "opacity-40 cursor-not-allowed bg-background"
        : "hover:bg-muted cursor-pointer bg-background",
    ].join(" ")

  if (loading) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
  }

  if (total === 0) {
    return (
      <>
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <PencilSimpleLineIcon size={15} />
            Compose
          </button>
        </div>
        <div className="py-10 text-center text-sm text-muted-foreground">
          No email messages yet.
        </div>
        <EmailComposeDialog
          recipient={otherMember}
          open={composeOpen}
          onOpenChange={(open) => { setComposeOpen(open); if (!open) handleReplySent() }}
        />
      </>
    )
  }

  const isSent = selected ? selected.senderId === currentMemberId : false
  const replySubject = selected?.subject
    ? (selected.subject.startsWith("Re: ") ? selected.subject : `Re: ${selected.subject}`)
    : ""
  const rangeStart = page * PAGE_SIZE + 1
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, total)

  return (
    <>
      {/* Toolbar */}
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={() => setComposeOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <PencilSimpleLineIcon size={15} />
          Compose
        </button>
      </div>

      {/* Message list */}
      <div className={["overflow-y-auto max-h-[420px] divide-y divide-border transition-opacity", fetching ? "opacity-50 pointer-events-none" : ""].join(" ")}>
        {messages.map((msg) => {
          const sent = msg.senderId === currentMemberId
          return (
            <button
              key={msg.id}
              type="button"
              onClick={() => handleSelect(msg)}
              className="w-full flex items-center gap-3 py-3 px-2 text-left hover:bg-muted/50 transition-colors rounded-md"
            >
              <div className="shrink-0">
                {sent
                  ? <PaperPlaneTiltIcon size={16} className="text-primary" />
                  : msg.dateRead
                    ? <EnvelopeSimpleOpenIcon size={16} className="text-muted-foreground" />
                    : <EnvelopeSimpleIcon size={16} className="text-foreground" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs text-muted-foreground font-medium">
                  {sent ? `To: ${otherMember.displayName}` : `From: ${otherMember.displayName}`}
                </p>
                <p className={[
                  "truncate text-sm",
                  !sent && !msg.dateRead ? "font-semibold text-foreground" : "font-medium text-card-foreground",
                ].join(" ")}>
                  {msg.subject ?? "(no subject)"}
                </p>
                <p className="truncate text-xs text-muted-foreground">{msg.text}</p>
                {sent && (
                  <p className={["flex items-center gap-0.5 text-xs mt-0.5", msg.dateRead ? "text-primary" : "text-muted-foreground/50"].join(" ")}>
                    <CheckCircleIcon size={11} weight={msg.dateRead ? "fill" : "regular"} />
                    {msg.dateRead ? `Read ${formatShort(msg.dateRead)}` : "Unread"}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{formatShort(msg.createdAt)}</span>
            </button>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-3 border-t border-border mt-1">
        <span className="text-xs text-muted-foreground">
          {rangeStart}–{rangeEnd} of {total}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => loadPage(0)}
            disabled={page === 0 || fetching}
            className={navBtnCls(page === 0 || fetching)}
            aria-label="First page"
          >
            <CaretDoubleLeftIcon size={14} />
          </button>
          <button
            type="button"
            onClick={() => loadPage(page - 1)}
            disabled={page === 0 || fetching}
            className={navBtnCls(page === 0 || fetching)}
            aria-label="Previous page"
          >
            <CaretLeftIcon size={14} />
          </button>
          <span className="px-2 text-xs text-muted-foreground tabular-nums">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => loadPage(page + 1)}
            disabled={page >= totalPages - 1 || fetching}
            className={navBtnCls(page >= totalPages - 1 || fetching)}
            aria-label="Next page"
          >
            <CaretRightIcon size={14} />
          </button>
          <button
            type="button"
            onClick={() => loadPage(totalPages - 1)}
            disabled={page >= totalPages - 1 || fetching}
            className={navBtnCls(page >= totalPages - 1 || fetching)}
            aria-label="Last page"
          >
            <CaretDoubleRightIcon size={14} />
          </button>
        </div>
      </div>

      {/* Email detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-border bg-background shadow-xl flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-base leading-snug truncate">
                  {selected.subject ?? "(no subject)"}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {isSent
                    ? <><PaperPlaneTiltIcon size={12} /> To: {otherMember.displayName}</>
                    : selected.dateRead
                      ? <><EnvelopeSimpleOpenIcon size={12} /> From: {otherMember.displayName}</>
                      : <><EnvelopeSimpleIcon size={12} /> From: {otherMember.displayName}</>
                  }
                  <span className="mx-1">·</span>
                  {formatDate(selected.createdAt)}
                </p>
                {isSent && (
                  <p className={["mt-1 flex items-center gap-1 text-xs", selected.dateRead ? "text-primary" : "text-muted-foreground/50"].join(" ")}>
                    <CheckCircleIcon size={12} weight={selected.dateRead ? "fill" : "regular"} />
                    {selected.dateRead ? `Read on ${formatDate(selected.dateRead)}` : "Not yet read"}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 text-sm text-card-foreground whitespace-pre-wrap leading-relaxed flex-1">
              {selected.text}
            </div>

            <div className="border-t border-border px-5 py-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setReplyOpen(true)}
                className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <ArrowBendUpLeftIcon size={15} />
                Reply
              </button>
            </div>
          </div>
        </div>
      )}

      <EmailComposeDialog
        recipient={otherMember}
        open={replyOpen}
        onOpenChange={(open) => { setReplyOpen(open); if (!open) handleReplySent() }}
        initialSubject={replySubject}
      />

      <EmailComposeDialog
        recipient={otherMember}
        open={composeOpen}
        onOpenChange={(open) => { setComposeOpen(open); if (!open) handleReplySent() }}
      />
    </>
  )
}
