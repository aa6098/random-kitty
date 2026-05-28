"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

export default function SignInPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value

    if (!email || !password) {
      setError("Email and password are required.")
      return
    }

    setError("")
    setPending(true)

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/memberhome",
    })

    setPending(false)

    if (signInError) {
      setError(signInError.message ?? "Invalid email or password.")
      return
    }

    router.push("/memberhome")
    router.refresh()
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Sign in
        </h1>

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
              required
              className={cn(
                "w-full border bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-black dark:text-zinc-50 outline-none",
                "focus:ring-1 focus:ring-ring border-border"
              )}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={cn(
                "w-full border bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-black dark:text-zinc-50 outline-none",
                "focus:ring-1 focus:ring-ring border-border"
              )}
            />
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-zinc-700 underline underline-offset-4 dark:text-zinc-300"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
