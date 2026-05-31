"use client"

import { useState, useTransition } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { cancelAccountAction } from "./actions"

type Props = {
  open: boolean
  onClose: () => void
}

export function CancelAccountModal({ open, onClose }: Props) {
  const [option, setOption] = useState<"deactivate" | "cancel">("deactivate")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await cancelAccountAction(option)
      if (result?.error) {
        setError(result.error)
        return
      }
      if (option === "cancel") {
        await authClient.signOut()
        router.push("/signin")
      } else {
        onClose()
        router.refresh()
      }
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-lg">
          <Dialog.Title className="mb-1 text-lg font-semibold">Cancel Account</Dialog.Title>
          <Dialog.Description className="mb-6 text-sm text-muted-foreground">
            Choose how you would like to cancel your account.
          </Dialog.Description>

          <div className="mb-6 space-y-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="cancelOption"
                value="deactivate"
                checked={option === "deactivate"}
                onChange={() => setOption("deactivate")}
                className="mt-0.5 accent-primary"
              />
              <div>
                <p className="text-sm font-medium">Temporarily deactivate account</p>
                <p className="text-xs text-muted-foreground">
                  Your profile will be hidden. You can reactivate by contacting support.
                </p>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="cancelOption"
                value="cancel"
                checked={option === "cancel"}
                onChange={() => setOption("cancel")}
                className="mt-0.5 accent-primary"
              />
              <div>
                <p className="text-sm font-medium">Permanently cancel account</p>
                <p className="text-xs text-muted-foreground">
                  Your account will be permanently closed. This cannot be undone.
                </p>
              </div>
            </label>
          </div>

          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant={option === "cancel" ? "destructive" : "default"}
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
