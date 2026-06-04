"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  MapPinIcon, CalendarIcon, InfoIcon, MagnifyingGlassIcon,
  XIcon, ArrowLeftIcon, ArrowRightIcon,
  HeartIcon, ProhibitIcon, ChatCircleIcon, VideoCameraIcon,
} from "@phosphor-icons/react"
import { toggleLike, toggleBlock } from "./actions"
import { VideoCall } from "@/components/VideoCall"
import { ChatPanel } from "./ChatPanel"
import { usePresenceChannel } from "@/hooks/usePresenceChannel"

type Photo = { id: string; url: string; thumburl: string }

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function ExpandableText({ label, text }: { label: string; text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [clamped, setClamped] = useState(false)
  const [open, setOpen] = useState(false)
  const plain = stripHtml(text)

  useEffect(() => {
    const el = ref.current
    if (el) setClamped(el.scrollHeight > el.clientHeight)
  }, [plain])

  return (
    <>
      {clamped ? (
        <p
          ref={ref}
          onClick={(e) => { e.stopPropagation(); setOpen(true) }}
          className="text-sm text-card-foreground line-clamp-2 cursor-pointer hover:underline hover:text-primary"
        >
          {plain}
        </p>
      ) : (
        <p ref={ref} className="text-sm text-card-foreground line-clamp-2">{plain}</p>
      )}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-background p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <p className="text-sm font-semibold">{label}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground shrink-0"
                aria-label="Close"
              >
                <XIcon size={16} />
              </button>
            </div>
            <div
              className="text-sm text-foreground leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: text }}
            />
          </div>
        </div>
      )}
    </>
  )
}

type Props = {
  id: string
  displayName: string
  image: string | null
  description: string
  whatareWelookingFor: string | null
  location: { city: string; state: string }
  distanceMiles?: number | null
  createdAt: Date
  photos: Photo[]
  isLiked?: boolean
  currentMemberId: string
}

function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (photos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">No photos uploaded yet.</p>
    )
  }

  function prev(e: React.MouseEvent) {
    e.stopPropagation()
    setLightboxIndex((i) => (i === null ? 0 : (i - 1 + photos.length) % photos.length))
  }

  function next(e: React.MouseEvent) {
    e.stopPropagation()
    setLightboxIndex((i) => (i === null ? 0 : (i + 1) % photos.length))
  }

  return (
    <>
      <div className="h-full overflow-y-auto md:flex-1 md:h-auto md:min-h-0">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="aspect-square overflow-hidden rounded border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`View photo ${index + 1}`}
            >
              <img src={photo.thumburl} alt="" className="size-full object-contain hover:opacity-90 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close"
          >
            <XIcon size={28} />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                onClick={prev}
                aria-label="Previous"
              >
                <ArrowLeftIcon size={32} />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                onClick={next}
                aria-label="Next"
              >
                <ArrowRightIcon size={32} />
              </button>
            </>
          )}

          <img
            src={photos[lightboxIndex].url}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <p className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </>
  )
}

export function DashboardMember({
  id,
  displayName,
  image,
  description,
  whatareWelookingFor,
  location,
  distanceMiles,
  createdAt,
  photos,
  isLiked = false,
  currentMemberId,
}: Props) {
  const onlineIds = usePresenceChannel()
  const isOnline = onlineIds.has(id)

  const [tab, setTab] = useState<"profile" | "photos">("profile")
  const [liked, setLiked] = useState(isLiked)
  const [likePending, setLikePending] = useState(false)
  const [blockPending, setBlockPending] = useState(false)
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (likePending) return
    setLikePending(true)
    setLiked((prev) => !prev)
    try {
      await toggleLike(id)
    } catch {
      setLiked((prev) => !prev)
    } finally {
      setLikePending(false)
    }
  }

  function handleBlock(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setBlockConfirmOpen(true)
  }

  async function confirmBlock() {
    setBlockConfirmOpen(false)
    setBlockPending(true)
    try {
      await toggleBlock(id)
    } finally {
      setBlockPending(false)
    }
  }

  function handleChat(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setChatOpen(true)
  }


  const memberSince = createdAt.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-[3fr_7fr] md:h-[320px] overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* Left column — image + action buttons */}
      <div className="relative overflow-hidden bg-muted aspect-[4/3] md:aspect-auto md:h-[300px]">
        <Link href={`/memberdetail/${id}`} className="group block h-full">
          <img
            src={image ?? "/defaultProfile.jpg"}
            alt={displayName}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Action buttons — centered at the bottom of the image (no transform to avoid fixed-position containment) */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
          <button
            type="button"
            onClick={handleLike}
            disabled={likePending}
            aria-label={liked ? "Unlike" : "Like"}
            className="w-9 h-9 rounded-full bg-black/80 hover:bg-black flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <HeartIcon size={16} weight={liked ? "fill" : "regular"} className="text-red-500" />
          </button>

          <button
            type="button"
            onClick={handleBlock}
            disabled={blockPending}
            aria-label="Block"
            className="w-9 h-9 rounded-full bg-black/80 hover:bg-black flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <ProhibitIcon size={16} className="text-red-500" />
          </button>

          <button
            type="button"
            onClick={handleChat}
            aria-label="Send message"
            className="w-9 h-9 rounded-full bg-black/80 hover:bg-black flex items-center justify-center transition-colors"
          >
            <ChatCircleIcon size={16} className="text-red-500" />
          </button>

          <VideoCall
            currentMemberId={currentMemberId}
            recipientId={id}
            recipientName={displayName}
            triggerClassName="w-9 h-9 rounded-full bg-black/80 hover:bg-black flex items-center justify-center transition-colors"
            triggerContent={<VideoCameraIcon size={16} className="text-red-500" />}
          />
        </div>
      </div>

      {/* Right column — tabs */}
      <div className="flex flex-col p-4 min-h-0">
        <div className="flex items-center gap-2 mb-3">
          <Link href={`/memberdetail/${id}`} className="text-lg font-semibold leading-tight text-card-foreground hover:underline">
            {displayName}
          </Link>
          <span
            title={isOnline ? "Online" : "Offline"}
            className={`inline-block size-2.5 rounded-full shrink-0 ${
              isOnline
                ? "bg-green-500 shadow-[0_0_6px_2px_rgba(34,197,94,0.7)] animate-pulse"
                : "bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.5)]"
            }`}
          />
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border mb-4">
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={[
              "px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors",
              tab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-card-foreground",
            ].join(" ")}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setTab("photos")}
            className={[
              "px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors",
              tab === "photos"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-card-foreground",
            ].join(" ")}
          >
            Photos
            {photos.length > 0 && (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                {photos.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab content — profile always in normal flow (drives height); photos absolutely fills that same space */}
        <div className="relative flex-1 min-h-0 md:flex md:flex-col">
          {/* Profile panel — always in flow so it sets the container height on mobile */}
          <div
            className={[
              "flex flex-col gap-3",
              tab !== "profile"
                ? "invisible pointer-events-none md:hidden"
                : "md:flex-1 md:min-h-0",
            ].join(" ")}
          >
            <div className="space-y-1 min-h-0">
              <p className="text-md font-semibold tracking-wide text-muted-foreground flex items-center gap-1">
                <InfoIcon size={12} />
                About Us:
              </p>
              <ExpandableText label="About Us" text={description} />
            </div>

            {whatareWelookingFor && (
              <div className="space-y-1 mt-1 min-h-0 gap-1">
                <p className="text-md font-semibold  tracking-wide text-muted-foreground flex items-center gap-1">
                  <MagnifyingGlassIcon size={12} />
                  What We Are Looking For:
                </p>
                <ExpandableText label="What We Are Looking For" text={whatareWelookingFor} />
              </div>
            )}

            <div className="mt-auto flex flex-wrap gap-4 text-sm text-muted-foreground pt-2 flex-shrink-0">
              <span className="flex items-center gap-1">
                <MapPinIcon size={12} />
                {location.city}, {location.state}
              </span>
              {distanceMiles != null && (
                <span className="flex items-center gap-1">
                  <MapPinIcon size={12} />
                  {distanceMiles < 1 ? "< 1 mi away" : `${Math.round(distanceMiles).toLocaleString()} mi away`}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarIcon size={12} />
                Member since {memberSince}
              </span>
            </div>
          </div>

          {/* Photos panel — absolutely fills the profile panel's footprint on mobile; flex-1 on md+ */}
          <div
            className={[
              "absolute inset-0 flex flex-col md:relative md:inset-auto",
              tab !== "photos"
                ? "invisible pointer-events-none md:hidden"
                : "md:flex-1 md:min-h-0",
            ].join(" ")}
          >
            <PhotoGallery photos={photos} />
          </div>
        </div>
      </div>
    </div>

    <ChatPanel
      isOpen={chatOpen}
      onClose={() => setChatOpen(false)}
      currentMemberId={currentMemberId}
      recipientId={id}
      recipientName={displayName}
    />

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
          <h2 className="text-base font-semibold text-foreground mb-2">Block {displayName}?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            They will no longer appear in your results and will not be able to contact you.
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
              {blockPending ? "Blocking…" : "Block"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
