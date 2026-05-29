"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Menu } from "@base-ui/react/menu"
import {
  ListIcon,
  XIcon,
  House,
  Envelope,
  User,
  SignOutIcon,
} from "@phosphor-icons/react"
import logo from "@/app/logo.png"
import { useUserStore } from "@/lib/stores/userStore"
import { authClient } from "@/lib/auth-client"

function DesktopNav() {
  return (
    <nav className="hidden md:flex items-center gap-1">
      <Link
        href="/memberhome"
        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-primary-foreground/10 transition-colors text-sm font-medium"
      >
        <House size={15} /> Home
      </Link>
      <Link
        href="/messages"
        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-primary-foreground/10 transition-colors text-sm font-medium"
      >
        <Envelope size={15} /> Messages
      </Link>
      <Link
        href="/member"
        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-primary-foreground/10 transition-colors text-sm font-medium"
      >
        <User size={15} /> Profile
      </Link>
    </nav>
  )
}

function MobileNav({ open, onClose, onSignOut }: { open: boolean; onClose: () => void; onSignOut: () => void }) {
  if (!open) return null
  return (
    <div className="md:hidden absolute top-14 left-0 right-0 z-40 bg-primary text-primary-foreground border-t border-primary-foreground/10 shadow-lg">
      <nav className="flex flex-col py-2">
        <Link
          href="/memberhome"
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
        >
          <House size={16} /> Home
        </Link>
        <Link
          href="/messages"
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
        >
          <Envelope size={16} /> Messages
        </Link>
        <Link
          href="/member"
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
        >
          <User size={16} /> Profile
        </Link>
        <div className="my-1 border-t border-primary-foreground/10" />
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-primary-foreground/10 transition-colors text-left"
        >
          <SignOutIcon size={16} /> Sign out
        </button>
      </nav>
    </div>
  )
}

export function Header() {
  const name = useUserStore((s) => s.name)
  const image = useUserStore((s) => s.image)
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?"

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/signin")
  }

  return (
    <header className="bg-primary text-primary-foreground relative">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        {/* Left side: hamburger (mobile) + branding */}
        <div className="flex items-center gap-2">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-1.5 rounded hover:bg-primary-foreground/10 transition-colors focus:outline-none"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <XIcon size={20} /> : <ListIcon size={20} />}
          </button>

          {/* Branding */}
          <Link
            href="/memberhome"
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
          >
            <Image src={logo} alt="Random Kitty" width={75} height={75} />
            <span className="text-base hidden md:block font-semibold tracking-tight">Random Kitty</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <DesktopNav />

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Avatar menu */}
          <Menu.Root>
            <Menu.Trigger className="flex items-center gap-2.5 hover:opacity-85 transition-opacity cursor-pointer focus:outline-none">
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
            </Menu.Trigger>

            <Menu.Portal>
              <Menu.Positioner side="bottom" align="end" sideOffset={8}>
                <Menu.Popup className="z-50 min-w-[8rem] rounded-md border border-border bg-popover text-primary shadow-md py-1 focus:outline-none">
                  <Menu.Item
                    className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                    onClick={() => router.push("/member")}
                  >
                    Profile
                  </Menu.Item>
                  <Menu.Item
                    className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </div>

      {/* Mobile nav panel */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} onSignOut={handleSignOut} />
    </header>
  )
}
