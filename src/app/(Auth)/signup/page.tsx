"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const PASSWORD_RULES = [
  { re: /.{10,}/, label: "At least 10 characters" },
  { re: /[A-Z]/, label: "Uppercase letter" },
  { re: /[a-z]/, label: "Lowercase letter" },
  { re: /[0-9]/, label: "Number" },
  { re: /[^A-Za-z0-9]/, label: "Special character" },
] as const;

function validatePassword(password: string): string[] {
  return PASSWORD_RULES.filter((r) => !r.re.test(password)).map((r) => r.label);
}

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [isResponsible, setIsResponsible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const RESEND_COOLDOWN = 60;
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendPending, setResendPending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  const passwordErrors = validatePassword(password);
  const passwordStrong = passwordErrors.length === 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!email) errors.email = "Email is required.";
    if (!passwordStrong)
      errors.password = `Password must include: ${passwordErrors.join(", ")}.`;
    if (!confirm) errors.confirm = "Please confirm your password.";
    else if (password !== confirm) errors.confirm = "Passwords do not match.";
    if (!isAdult) errors.isAdult = "You must confirm you are at least 18 years of age.";
    if (!isResponsible) errors.isResponsible = "You must accept responsibility for your actions.";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setApiError("");
    setPending(true);

    const { error } = await authClient.signUp.email({
      email,
      password,
      name: email.split("@")[0],
      callbackURL: "/",
    });

    setPending(false);

    if (error) {
      setApiError(error.message ?? "Sign up failed. Please try again.");
      return;
    }

    setSuccess(true);
    setResendCooldown(RESEND_COOLDOWN);
  }

  async function handleResend() {
    setResendMessage("");
    setResendPending(true);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/",
    });
    setResendPending(false);
    if (error) {
      setResendMessage(error.message ?? "Failed to resend. Please try again.");
    } else {
      setResendMessage("Verification email sent.");
      setResendCooldown(RESEND_COOLDOWN);
    }
  }

  if (success) {
    return (
      <div className="flex h-screen overflow-hidden">

        <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black px-4 overflow-y-auto">
          <div className="w-full max-w-sm">
            <h1 className="text-xl font-semibold text-black dark:text-zinc-50">Check your inbox</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              We sent a verification link to{" "}
              <span className="font-medium text-black dark:text-zinc-100">{email}</span>.
              Click the link to activate your account.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Didn&apos;t receive it?</p>
              <Button
                variant="outline"
                size="sm"
                disabled={resendPending || resendCooldown > 0}
                onClick={handleResend}
              >
                {resendPending
                  ? "Sending…"
                  : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend verification email"}
              </Button>
              {resendMessage && (
                <p className={cn(
                  "text-xs",
                  resendMessage.startsWith("Verification") ? "text-zinc-500" : "text-destructive"
                )}>
                  {resendMessage}
                </p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
              Back to home
            </Button>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}

        <img
          src="/registerPage2.jpg"
          alt=""
        className="hidden md:block md:w-1/2 h-screen object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Form column */}
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black px-4 overflow-y-auto">
        <div className="w-full max-w-sm py-16">
          <h1 className="mb-8 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Create Account
          </h1>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "w-full border bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-black dark:text-zinc-50 outline-none",
                  "focus:ring-1 focus:ring-ring",
                  fieldErrors.email ? "border-destructive" : "border-border"
                )}
              />
              {fieldErrors.email && (
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "w-full border bg-white dark:bg-zinc-900 px-3 py-2 pr-16 text-sm text-black dark:text-zinc-50 outline-none",
                    "focus:ring-1 focus:ring-ring",
                    fieldErrors.password ? "border-destructive" : "border-border"
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
              {password.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {PASSWORD_RULES.map((rule) => {
                    const met = rule.re.test(password);
                    return (
                      <li key={rule.label} className={cn("text-xs", met ? "text-zinc-400 line-through" : "text-zinc-500 dark:text-zinc-400")}>
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
              {fieldErrors.password && (
                <p className="text-xs text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label htmlFor="confirm" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Confirm password
              </label>
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={cn(
                  "w-full border bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-black dark:text-zinc-50 outline-none",
                  "focus:ring-1 focus:ring-ring",
                  fieldErrors.confirm ? "border-destructive" : "border-border"
                )}
              />
              {fieldErrors.confirm && (
                <p className="text-xs text-destructive">{fieldErrors.confirm}</p>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAdult}
                  onChange={(e) => setIsAdult(e.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <span className="text-xs text-zinc-700 dark:text-zinc-300">
                  I am at least 18 years of age.
                </span>
              </label>
              {fieldErrors.isAdult && (
                <p className="text-xs text-destructive">{fieldErrors.isAdult}</p>
              )}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isResponsible}
                  onChange={(e) => setIsResponsible(e.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <span className="text-xs text-zinc-700 dark:text-zinc-300">
                  I am responsible for all my actions.
                </span>
              </label>
              {fieldErrors.isResponsible && (
                <p className="text-xs text-destructive">{fieldErrors.isResponsible}</p>
              )}
            </div>

            {apiError && (
              <p className="text-xs text-destructive">{apiError}</p>
            )}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link href="/signin" className="text-zinc-700 dark:text-zinc-300 underline underline-offset-2 hover:text-black dark:hover:text-zinc-50">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Image column — md and up */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/signuppage.jpg"
        alt=""
        className="hidden md:block md:w-1/2 h-screen object-contain"
      />
      
    </div>
  );
}
