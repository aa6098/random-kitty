"use client"

import { useState } from "react"
import { HeartIcon } from "@phosphor-icons/react"
import { Spinner } from "@/components/ui/spinner"
import { toggleLike } from "@/app/(Protected)/memberhome/actions"

type Props = {
  memberId: string
  isLiked: boolean
}

export function LikeButton({ memberId, isLiked: initialLiked }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [pending, setPending] = useState(false)

  async function handleClick() {
    if (pending) return
    setPending(true)
    setLiked((prev) => !prev)
    try {
      await toggleLike(memberId)
    } catch {
      setLiked((prev) => !prev)
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      aria-label={liked ? "Unlike" : "Like"}
      className="p-1.5 rounded-full transition-transform hover:scale-110 disabled:opacity-50 hover:bg-muted"
    >
      {pending ? (
        <Spinner size="default" className="text-muted-foreground" />
      ) : (
        <HeartIcon
          size={22}
          weight={liked ? "fill" : "regular"}
          className={liked ? "text-rose-500" : "text-muted-foreground"}
        />
      )}
    </button>
  )
}
