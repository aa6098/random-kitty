"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { label: "Profile", segment: "profile" },
  { label: "Photos", segment: "photos" },
  { label: "Chat", segment: "messages" },
]

export function MemberSideBarTabs({ memberId }: { memberId: string }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col w-full border-t border-border">
      {tabs.map(({ label, segment }) => {
        const href = `/members/${memberId}/${segment}`
        const isActive = pathname.startsWith(href)
        return (
          <Link
            key={segment}
            href={href}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b border-border transition-colors hover:bg-muted",
              isActive ? "bg-primary text-primary-foreground" : "text-foreground"
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
