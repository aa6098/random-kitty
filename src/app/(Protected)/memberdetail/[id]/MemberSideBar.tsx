"use client"

import { useState } from "react"
import { MapPinIcon, CalendarIcon, HeartIcon, ProhibitIcon, ChatCircleIcon, VideoCameraIcon, XIcon } from "@phosphor-icons/react"
import { VideoCall } from "@/components/VideoCall"
import { Button, buttonVariants } from "@/components/ui/button"
import { useUserStore } from "@/lib/stores/userStore"
import { toggleLike, toggleBlock } from "@/app/(Protected)/dashboard/actions"

type Props = {
  member: {
    id: string
    displayName: string
    image: string | null
    location: { city: string; state: string }
    createdAt: Date
  }
  currentMemberId: string
  isLiked: boolean
  isBlocked: boolean
}

export function MemberSideBar({ member, currentMemberId, isLiked, isBlocked }: Props) {
  const openChat = useUserStore((s) => s.openChat)
  const [liked, setLiked] = useState(isLiked)
  const [blocked, setBlocked] = useState(isBlocked)
  const [likePending, setLikePending] = useState(false)
  const [blockPending, setBlockPending] = useState(false)
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)

  async function handleLike() {
    if (likePending) return
    setLikePending(true)
    setLiked((prev) => !prev)
    try {
      await toggleLike(member.id)
    } catch {
      setLiked((prev) => !prev)
    } finally {
      setLikePending(false)
    }
  }

  async function confirmBlock() {
    setBlockConfirmOpen(false)
    setBlockPending(true)
    try {
      await toggleBlock(member.id)
      setBlocked((prev) => !prev)
    } finally {
      setBlockPending(false)
    }
  }

  return (
    <>
      <aside className="flex flex-col w-full md:w-72 shrink-0 rounded-xl border border-border bg-card overflow-hidden">
        {/* Profile header — image, name, location in flex-col */}
        <div className="flex flex-col items-center gap-2 p-5 pb-3">
          <button
            type="button"
            onClick={() => setImageOpen(true)}
            className="w-[200px] h-[200px] rounded-full overflow-hidden bg-muted shrink-0 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="View full image"
          >
            <img
              src={member.image ?? "/defaultProfile.jpg"}
              alt={member.displayName}
              className="h-full w-full object-cover hover:opacity-90 transition-opacity"
            />
          </button>
          <p className="text-base font-semibold leading-tight text-card-foreground text-center">
            {member.displayName}
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPinIcon size={13} />
            {member.location.city}, {member.location.state}
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarIcon size={12} />
            Member since {member.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Action buttons — vertical stack */}
        <div className="flex flex-col gap-2 px-4 pb-4">
          <Button
            variant="default"
            size="sm"
            onClick={handleLike}
            disabled={likePending}
            className="w-full justify-center rounded-md hover:bg-muted hover:text-foreground"
          >
            <HeartIcon size={15} weight={liked ? "fill" : "regular"} className={liked ? "text-red-500" : "text-white"} />
            {liked ? "Unlike" : "Like"}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setBlockConfirmOpen(true)}
            disabled={blockPending}
            className="w-full justify-center rounded-md hover:bg-muted hover:text-foreground"
          >
            <ProhibitIcon size={15} />
            {blocked ? "Unblock" : "Block"}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => openChat(member.id, member.displayName)}
            className="w-full justify-center rounded-md hover:bg-muted hover:text-foreground"
          >
            <ChatCircleIcon size={15} />
            Message
          </Button>

          <VideoCall
            currentMemberId={currentMemberId}
            recipientId={member.id}
            recipientName={member.displayName}
            triggerClassName={buttonVariants({ variant: "default", size: "sm", className: "w-full justify-center rounded-md hover:bg-muted hover:text-foreground" })}
            triggerContent={
              <>
                <VideoCameraIcon size={15} />
                Video Call
              </>
            }
          />
        </div>
      </aside>

      {/* Full-image lightbox */}
      {imageOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setImageOpen(false)}
        >
          <button
            type="button"
            onClick={() => setImageOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            aria-label="Close"
          >
            <XIcon size={28} />
          </button>
          <img
            src={member.image ?? "/defaultProfile.jpg"}
            alt={member.displayName}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Block confirmation modal */}
      {blockConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setBlockConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-foreground mb-2">
              {blocked ? `Unblock ${member.displayName}?` : `Block ${member.displayName}?`}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {blocked
                ? "They will be able to appear in your results again."
                : "They will no longer appear in your results and will not be able to contact you."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setBlockConfirmOpen(false)}
                className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBlock}
                disabled={blockPending}
                className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 disabled:opacity-50 transition-colors"
              >
                {blockPending ? "Saving…" : blocked ? "Unblock" : "Block"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
