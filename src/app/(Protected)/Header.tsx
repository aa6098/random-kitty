"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Menu } from "@base-ui/react/menu"
import {
  ListIcon,
  XIcon,
  SquaresFourIcon,
  BellIcon,
  UsersIcon,
  UsersFourIcon,
  SignOutIcon,
  UserCircleIcon,
  ProhibitIcon,
  CaretDownIcon,
  LockKeyIcon,
} from "@phosphor-icons/react"
import logo from "@/app/logo.png"
import { useUserStore } from "@/lib/stores/userStore"
import { authClient } from "@/lib/auth-client"
import { CancelAccountModal } from "./member/CancelAccountModal"

function DesktopNav({ onSignOut, onCancelAccount }: { onSignOut: () => void; onCancelAccount: () => void }) {
  const router = useRouter()
  const unreadCount = useUserStore((s) => s.unreadCount)
  const missedCallCount = useUserStore((s) => s.missedCallCount)
  const deactivated = useUserStore((s) => s.deactivated)
  const hasMember = useUserStore((s) => s.hasMember)
  const navDisabled = !hasMember || deactivated
  const totalCount = unreadCount + missedCallCount
  const activeCls = "flex items-center gap-1.5 px-2 py-1 rounded hover:bg-primary-foreground/10 transition-colors text-sm font-medium"
  const disabledCls = "flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium opacity-40 cursor-not-allowed pointer-events-none"
  const menuItemCls = "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
  return (
    <nav className="hidden md:flex items-center gap-1 letter-spacing: 0.025em;">
      {navDisabled ? (
        <span className={disabledCls}><SquaresFourIcon size={15} /> Home</span>
      ) : (
        <Link href="/dashboard" className={activeCls}>
          <SquaresFourIcon size={15} /> Home
        </Link>
      )}
      {navDisabled ? (
        <span className={disabledCls}><BellIcon size={15} /> Notifications</span>
      ) : (
        <Link href="/notifications" className={activeCls}>
          <BellIcon size={15} /> Notifications
          {totalCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[1.125rem] h-[1.125rem] rounded-full bg-red-500 text-white text-[10px] font-bold -px-2 leading-none">
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          )}
        </Link>
      )}
      {navDisabled ? (
        <span className={disabledCls}><UsersFourIcon size={15} /> Community</span>
      ) : (
        <Link href="/community" className={activeCls}>
          <UsersFourIcon size={15} /> Community
        </Link>
      )}
      <Menu.Root>
        <Menu.Trigger className={`${activeCls} cursor-pointer focus:outline-none`}>
          <UsersIcon size={15} /> Account <CaretDownIcon size={12} />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side="bottom" align="start" sideOffset={8}>
            <Menu.Popup className="z-15 min-w-[10rem] rounded-md border border-border bg-popover text-primary shadow-md py-1 focus:outline-none">
              <Menu.Item className={menuItemCls} onClick={() => router.push("/member")}>
                <UserCircleIcon size={15} /> Profile
              </Menu.Item>
              <Menu.Item className={menuItemCls} onClick={() => router.push("/member/change-password")}>
                <LockKeyIcon size={15} /> Change password
              </Menu.Item>
              <Menu.Item className={menuItemCls} onClick={onCancelAccount}>
                <ProhibitIcon size={15} /> Cancel account
              </Menu.Item>
              <div className="my-1 border-t border-border z-15" />
              <Menu.Item className={`${menuItemCls} text-red-500`} onClick={onSignOut}>
                <SignOutIcon size={15} /> Sign out
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </nav>
  )
}

function MobileNav({ open, onClose, onSignOut, onCancelAccount }: { open: boolean; onClose: () => void; onSignOut: () => void; onCancelAccount: () => void }) {
  const router = useRouter()
  const unreadCount = useUserStore((s) => s.unreadCount)
  const missedCallCount = useUserStore((s) => s.missedCallCount)
  const deactivated = useUserStore((s) => s.deactivated)
  const hasMember = useUserStore((s) => s.hasMember)
  const navDisabled = !hasMember || deactivated
  const totalCount = unreadCount + missedCallCount
  const activeCls = "flex items-center gap-2 px-4 py-1 text-sm font-medium hover:font-bold hover:bg-primary/10 transition-colors"
  const disabledCls = "flex items-center gap-2 px-4 py-1 text-sm font-medium opacity-40 cursor-not-allowed pointer-events-none"
  if (!open) return null
  return (
    <div className="md:hidden absolute top-14 left-0 right-0 z-40 bg-popover text-primary border-t border-primary-foreground/10 shadow-lg">
      <nav className="flex flex-col py-2">
        {navDisabled ? (
          <span className={disabledCls}><SquaresFourIcon size={16} /> Home</span>
        ) : (
          <Link href="/dashboard" onClick={onClose} className={activeCls}>
            <SquaresFourIcon size={16} /> Home
          </Link>
        )}
        {navDisabled ? (
          <span className={disabledCls}><BellIcon size={16} /> Notifications</span>
        ) : (
          <Link href="/notifications" onClick={onClose} className={activeCls}>
            <BellIcon size={16} /> Notifications
            {totalCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.125rem] h-[1.125rem] rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
                {totalCount > 99 ? "99+" : totalCount}
              </span>
            )}
          </Link>
        )}
        {navDisabled ? (
          <span className={disabledCls}><UsersFourIcon size={16} /> Community</span>
        ) : (
          <Link href="/community" onClick={onClose} className={activeCls}>
            <UsersFourIcon size={16} /> Community
          </Link>
        )}
        <div className="my-1 border-t border-primary/10" />
        <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Account</p>
        <Link href="/member" onClick={onClose} className={activeCls}>
          <UserCircleIcon size={16} /> Profile
        </Link>
        <Link href="/member/change-password" onClick={onClose} className={activeCls}>
          <LockKeyIcon size={16} /> Change password
        </Link>
        <button
          onClick={() => { onClose(); onCancelAccount() }}
          className={`${activeCls} text-left w-full`}
        >
          <ProhibitIcon size={16} /> Cancel account
        </button>
        <button
          onClick={onSignOut}
          className={`${activeCls} text-left w-full text-red-500`}
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
  const [cancelModalOpen, setCancelModalOpen] = useState(false)

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
            href="/dashboard"
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
          >
            <Image src={logo} alt="Random Kitty" width={75} height={75} />
            <span className="text-base hidden md:block font-semibold tracking-tight">Random Kitty</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <DesktopNav onSignOut={handleSignOut} onCancelAccount={() => setCancelModalOpen(true)} />

        {/* Right side: avatar dropdown */}
        <Menu.Root>
          <Menu.Trigger className="flex items-center gap-2 rounded-full focus:outline-none hover:opacity-85 transition-opacity cursor-pointer">
            <div className="flex flex-col items-center">
              <div className="relative size-8 rounded-full overflow-hidden bg-primary-foreground/20 flex items-center justify-center shrink-0 ring-2 ring-transparent hover:ring-primary-foreground/30 transition-all">
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
              <Menu.Popup className="z-50 min-w-[10rem] rounded-md border border-border bg-popover text-primary shadow-md py-1 focus:outline-none">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-medium truncate">{name}</p>
                </div>
                <Menu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                  onClick={() => router.push("/member")}
                >
                  <UserCircleIcon size={15} /> Profile
                </Menu.Item>
                <Menu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                  onClick={() => setCancelModalOpen(true)}
                >
                  <ProhibitIcon size={15} /> Cancel account
                </Menu.Item>
                <div className="my-1 border-t border-border" />
                <Menu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer text-red-500 hover:bg-accent focus:bg-accent focus:outline-none"
                  onClick={handleSignOut}
                >
                  <SignOutIcon size={15} /> Sign out
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>

      {/* Mobile nav panel */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} onSignOut={handleSignOut} onCancelAccount={() => setCancelModalOpen(true)} />
      <CancelAccountModal open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} />
    </header>
  )
}
