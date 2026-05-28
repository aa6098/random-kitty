"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu } from "@base-ui/react/menu"
import logo from "@/app/logo.png"
import { useUserStore } from "@/lib/stores/userStore"
import { authClient } from "@/lib/auth-client"

export function Header() {
  const name = useUserStore((s) => s.name)
  const image = useUserStore((s) => s.image)
  const router = useRouter()

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
              <Menu.Popup className="z-50 min-w-[8rem] rounded-md border border-border bg-popover text-primary  shadow-md py-1 focus:outline-none">
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
    </header>
  )
}
