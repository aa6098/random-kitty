"use server"

import { auth } from "@/lib/auth"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

export type SignInState = { error: string } | null

export async function signInAction(
  _: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  let response: Response
  try {
    response = (await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
      asResponse: true,
    })) as Response
  } catch {
    return { error: "Sign in failed. Please try again." }
  }

  if (!response.ok) {
    try {
      const data = (await response.json()) as { message?: string }
      return { error: data.message ?? "Invalid email or password." }
    } catch {
      return { error: "Invalid email or password." }
    }
  }

  // Forward session cookies set by better-auth to the browser
  const cookieStore = await cookies()
  for (const setCookie of response.headers.getSetCookie()) {
    const parts = setCookie.split("; ")
    const [name, ...rest] = (parts[0] ?? "").split("=")
    const value = rest.join("=")
    const attrs: Record<string, string> = {}
    for (const part of parts.slice(1)) {
      const [k, v = ""] = part.split("=")
      attrs[k.toLowerCase()] = v
    }
    cookieStore.set(name, value, {
      httpOnly: "httponly" in attrs,
      secure: "secure" in attrs,
      sameSite: ((attrs["samesite"] ?? "lax").toLowerCase() as "lax" | "strict" | "none"),
      path: attrs["path"] || "/",
      maxAge: attrs["max-age"] ? Number(attrs["max-age"]) : undefined,
    })
  }

  redirect("/post-signin")
}
