"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { label: "Profile", segment: "profile" },
  { label: "Photos", segment: "photos" },
  { label: "Chat", segment: "messages" },
]

type Props = {
  memberId: string
  currentMemberId: string | null
}

export function MemberSideBarTabs({ memberId, currentMemberId }: Props) {
  const pathname = usePathname()

  // Don't show Video Call when viewing your own profile

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
