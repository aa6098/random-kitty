"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react"

const PASSWORD_RULES = [
  { label: "At least 10 characters", test: (p: string) => p.length >= 10 },
  { label: "Uppercase letter (A–Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter (a–z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number (0–9)",           test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character (!@#…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

function isPasswordValid(p: string) {
  return PASSWORD_RULES.every((r) => r.test(p))
}

export default function ChangePasswordPage() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>({})
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const [newPassword, setNewPassword] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const currentPassword = (form.elements.namedItem("currentPassword") as HTMLInputElement).value
    const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value

    const errors: typeof fieldErrors = {}
    if (!currentPassword) errors.currentPassword = "Current password is required."
    if (!newPassword) {
      errors.newPassword = "New password is required."
    } else if (!isPasswordValid(newPassword)) {
      errors.newPassword = "Password does not meet the requirements below."
    }
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
            onChange={setNewPassword}
            error={fieldErrors.newPassword}
          />
          {/* Password requirements checklist */}
          <ul className="space-y-1 -mt-2">
            {PASSWORD_RULES.map((rule) => {
              const met = newPassword.length > 0 && rule.test(newPassword)
              return (
                <li key={rule.label} className={cn("flex items-center gap-1.5 text-xs", met ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>
                  {met
                    ? <CheckCircleIcon size={13} weight="fill" />
                    : <XCircleIcon size={13} weight="fill" className="opacity-40" />}
                  {rule.label}
                </li>
              )
            })}
          </ul>

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
  onChange,
  error,
}: {
  id: string
  label: string
  autoComplete: string
  show: boolean
  onToggle: () => void
  onChange?: (value: string) => void
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
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
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
