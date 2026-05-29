"use client"

import { useEffect } from "react"
import { WarningCircleIcon } from "@phosphor-icons/react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full rounded-xl border border-border bg-card shadow-md p-8 flex flex-col items-center text-center gap-5">
        <div className="flex items-center justify-center size-16 rounded-full bg-destructive/10">
          <WarningCircleIcon size={36} className="text-destructive" weight="duotone" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-card-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. Please try again, or go back to the home page if the problem persists.
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <button
            onClick={() => { window.location.href = "/memberhome" }}
            className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  )
}
