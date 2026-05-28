"use client"

import Image from "next/image"
import Link from "next/link"
import logo from "@/app/logo.png"
import { useUserStore } from "@/lib/stores/userStore"

export function Header() {
  const name = useUserStore((s) => s.name)
  const image = useUserStore((s) => s.image)

  const initials = name
    ? name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "?"

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        {/* Branding */}
        <Link
          href="/memberhome"
          className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
        >
          <Image src={logo} alt="Random Kitty" width={75} height={75} />
          <span className="text-base font-semibold tracking-tight">Random Kitty</span>
        </Link>

        {/* Avatar */}
        <Link
          href="/member"
          className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
        >
          <div className="flex flex-col items-center">
            <div className="relative size-8 rounded-full overflow-hidden bg-primary-foreground/20 flex items-center justify-center shrink-0">
              {image ? (
                <Image
                  src={image}
                  alt={name ?? "Profile"}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              ) : (
                <span className="text-xs font-semibold leading-none">{initials}</span>
              )}
            </div>
            <span className="text-sm font-medium text-xs hidden md:block">{name}</span>
          </div>
        </Link>
      </div>
    </header>
  )
}
