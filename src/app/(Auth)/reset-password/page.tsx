"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="w-full max-w-sm">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Invalid link
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="text-xs text-zinc-700 underline underline-offset-4 dark:text-zinc-300"
        >
          Request a new link
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="w-full max-w-sm">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Password updated
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Your password has been reset. You can now sign in with your new password.
        </p>
        <Link
          href="/signin"
          className="text-xs text-zinc-700 underline underline-offset-4 dark:text-zinc-300"
        >
          Sign in
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value

    if (password.length < 10) {
      setError("Password must be at least 10 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setError("")
    setPending(true)

    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    })

    if (resetError) {
      setPending(false)
      setError(resetError.message ?? "Failed to reset password. The link may have expired.")
      return
    }

    setSuccess(true)
    setPending(false)
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Choose a new password
      </h1>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
        Must be at least 10 characters.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              className={cn(
                "w-full border bg-white px-3 py-2 pr-16 text-sm text-black outline-none dark:bg-zinc-900 dark:text-zinc-50",
                "border-border focus:ring-1 focus:ring-ring"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              {showPassword ? "hide" : "show"}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="confirm"
            className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="confirm"
              name="confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              required
              className={cn(
                "w-full border bg-white px-3 py-2 pr-16 text-sm text-black outline-none dark:bg-zinc-900 dark:text-zinc-50",
                "border-border focus:ring-1 focus:ring-ring"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              {showConfirm ? "hide" : "show"}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Resetting…" : "Reset password"}
        </Button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <Suspense fallback={<div className="text-sm text-zinc-500">Loading…</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  )
}
