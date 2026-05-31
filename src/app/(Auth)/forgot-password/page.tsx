"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const captcha = useMemo(() => {
    const a = Math.floor(Math.random() * 9) + 1
    const b = Math.floor(Math.random() * 9) + 1
    return { a, b, answer: a + b }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Email is required.")
      return
    }

    if (parseInt(captchaAnswer, 10) !== captcha.answer) {
      setError("Incorrect answer to the security question. Please try again.")
      setCaptchaAnswer("")
      return
    }

    setPending(true)
    await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    })
    // Always show success to avoid email enumeration
    setSubmitted(true)
    setPending(false)
  }

  if (submitted) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
        <div className="w-full max-w-sm">
          <h1 className="mb-4 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Check your email
          </h1>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            If an account exists for{" "}
            <strong className="text-zinc-700 dark:text-zinc-300">{email}</strong>, you will
            receive a password reset link shortly.
          </p>
          <Link
            href="/signin"
            className="text-xs text-zinc-700 underline underline-offset-4 dark:text-zinc-300"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Forgot your password?
        </h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={cn(
                "w-full border bg-white px-3 py-2 text-sm text-black outline-none dark:bg-zinc-900 dark:text-zinc-50",
                "border-border focus:ring-1 focus:ring-ring"
              )}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="captcha"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              Security check &mdash; what is {captcha.a} + {captcha.b}?
            </label>
            <input
              id="captcha"
              name="captcha"
              type="number"
              inputMode="numeric"
              placeholder="Your answer"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              required
              className={cn(
                "w-full border bg-white px-3 py-2 text-sm text-black outline-none dark:bg-zinc-900 dark:text-zinc-50",
                "border-border focus:ring-1 focus:ring-ring"
              )}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Sending…" : "Send reset link"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Remember your password?{" "}
          <Link
            href="/signin"
            className="text-zinc-700 underline underline-offset-4 dark:text-zinc-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
