"use client"

import { useState, useTransition } from "react"
import { XIcon, PaperPlaneTiltIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react"
import { sendEmailMessage } from "@/app/(Protected)/dashboard/actions"

type Props = {
  recipient: { id: string; displayName: string }
  open: boolean
  onOpenChange: (open: boolean) => void
  initialSubject?: string
}

export function EmailComposeDialog({ recipient, open, onOpenChange, initialSubject }: Props) {
  const [subject, setSubject] = useState(initialSubject ?? "")
  const [text, setText] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!open) return null

  function handleClose() {
    onOpenChange(false)
    setSubject(initialSubject ?? "")
    setText("")
    setSent(false)
    setError(null)
  }

  function handleSend() {
    if (!subject.trim() || !text.trim() || isPending) return
    setError(null)
    startTransition(async () => {
      try {
        await sendEmailMessage(recipient.id, subject, text.trim())
        setSent(true)
        setSubject("")
        setText("")
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send message")
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <EnvelopeSimpleIcon size={18} className="text-primary" />
            <span className="text-sm font-semibold">Message to {recipient.displayName}</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="p-5">
          {sent ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-sm font-medium text-foreground">Message sent!</p>
              <p className="text-xs text-muted-foreground">
                Your message has been delivered to {recipient.displayName}.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 text-xs text-primary underline-offset-2 hover:underline"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Subject <span className="text-destructive">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value.slice(0, 50))}
                  placeholder="Subject"
                  maxLength={50}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Message</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Write a message to ${recipient.displayName}…`}
                  rows={5}
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!subject.trim() || !text.trim() || isPending}
                  className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <PaperPlaneTiltIcon size={15} />
                  {isPending ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
