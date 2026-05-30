"use client"

import { useTransition } from "react"
import { toggleBlockMember } from "./actions"
import {ProhibitIcon , FlagBannerIcon } from "@phosphor-icons/react"
type Props = {
  memberId: string
  isBlocked: boolean
}

export function BlockMemberButton({ memberId, isBlocked }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(() => toggleBlockMember(memberId))
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="w-full px-4 py-2.5  text-sm font-medium border-1 border-destructive transition-colors 
      hover:bg-muted text-foreground text-left disabled:opacity-50"
    >
      {/* { isBlocked ? <FlagBannerIcon size={16} weight="fill" /> : <ProhibitIcon size={16} weight="fill" /> } */}
      {isPending ? "..." : isBlocked ? "Unblock Member" : "Block Member"}


    </button>
  )
}
