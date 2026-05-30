"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { MapPinIcon, HeartIcon } from "@phosphor-icons/react"
import { toggleLike } from "./actions"

type Props = {
  id: string
  displayName: string
  image: string | null
  location: { city: string; state: string }
  distanceMiles: number | null
  isOnline?: boolean
  isLiked?: boolean
}

export function MemberCard({ id, displayName, image, location, distanceMiles, isOnline, isLiked = false }: Props) {
  const [liked, setLiked] = useState(isLiked)
  const [pending, setPending] = useState(false)

  async function handleHeartClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (pending) return
    setPending(true)
    setLiked((prev) => !prev)
    try {
      await toggleLike(id)
    } catch {
      setLiked((prev) => !prev)
    } finally {
      setPending(false)
    }
  }

  return (
    <Link href={`/members/${id}`} className="group">
      <Card className="overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <img
            src={image ?? "/defaultProfile.jpg"}
            alt={displayName}
            className="size-full object-cover transition-transform group-hover:scale-105"
          />

          {/* Online indicator */}
          <div className="absolute top-2 right-2 z-10">
            <div className="relative flex items-center justify-center group/dot">
              <span
                className={[
                  "block w-[15px] h-[15px] rounded-full border-1",
                  isOnline ? "border-green-800/60" : "border-red-800/60",
                  isOnline ? "bg-green-500/60" : "bg-red-500/60",
                ].join(" ")}
              />
              {/* Tooltip */}
              <span className="pointer-events-none absolute bottom-full right-0 -mb-10 whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5 text-[10px] text-white opacity-0 group-hover/dot:opacity-100 transition-opacity">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          <CardContent className="absolute bottom-0 left-0 right-0 p-3 space-y-0.5 bg-white/5 backdrop-blur-[2px]">
            <p className="text-base font-bold leading-snug truncate text-white">{displayName}</p>
            <p className="flex items-center gap-1 text-xs truncate text-white">
              <MapPinIcon size={12} />
              {location.city}, {location.state}
            </p>
            {distanceMiles !== null && (
              <p className="text-sm font-bold text-primary text-muted">
                {distanceMiles < 1
                  ? "< 1 mi away"
                  : `${Math.round(distanceMiles).toLocaleString()} mi away`}
              </p>
            )}
          </CardContent>

          {/* Like button — sibling of CardContent to avoid backdrop-filter stacking context */}
          <button
            onClick={handleHeartClick}
            disabled={pending}
            aria-label={liked ? "Unlike" : "Like"}
            className="absolute bottom-2 right-2 z-10 p-1 rounded-full transition-transform hover:scale-110 disabled:opacity-50"
          >
            <HeartIcon
              size={22}
              weight={liked ? "fill" : "regular"}
              className={liked ? "text-rose-500" : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"}
            />
          </button>
        </div>
      </Card>
    </Link>
  )
}
