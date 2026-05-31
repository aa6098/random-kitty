"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>({})
  const [show, setShow] = useState({ current: false, next: false, confirm: false })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const currentPassword = (form.elements.namedItem("currentPassword") as HTMLInputElement).value
    const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value

    const errors: typeof fieldErrors = {}
    if (!currentPassword) errors.currentPassword = "Current password is required."
    if (!newPassword) errors.newPassword = "New password is required."
    if (newPassword && newPassword.length < 8) errors.newPassword = "Password must be at least 8 characters."
    if (!confirmPassword) errors.confirmPassword = "Please confirm your new password."
    if (newPassword && confirmPassword && newPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match."

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setError("")
    setPending(true)

    const { error: changeError } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: false,
    })

    setPending(false)

    if (changeError) {
      setError(changeError.message ?? "Failed to change password. Please check your current password.")
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm text-center space-y-4">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Password updated successfully.</p>
          <Button variant="outline" onClick={() => router.push("/member")}>Back to profile</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight">Change password</h1>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <PasswordField
            id="currentPassword"
            label="Current password"
            autoComplete="current-password"
            show={show.current}
            onToggle={() => setShow((s) => ({ ...s, current: !s.current }))}
            error={fieldErrors.currentPassword}
          />

          <PasswordField
            id="newPassword"
            label="New password"
            autoComplete="new-password"
            show={show.next}
            onToggle={() => setShow((s) => ({ ...s, next: !s.next }))}
            error={fieldErrors.newPassword}
          />

          <PasswordField
            id="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            show={show.confirm}
            onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
            error={fieldErrors.confirmPassword}
          />

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Update password"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PasswordField({
  id,
  label,
  autoComplete,
  show,
  onToggle,
  error,
}: {
  id: string
  label: string
  autoComplete: string
  show: boolean
  onToggle: () => void
  error?: string
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          className={cn(
            "w-full border bg-white dark:bg-zinc-900 px-3 py-2 pr-16 text-sm text-black dark:text-zinc-50 outline-none",
            "focus:ring-1 focus:ring-ring",
            error ? "border-destructive" : "border-border"
          )}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          {show ? "hide" : "show"}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
