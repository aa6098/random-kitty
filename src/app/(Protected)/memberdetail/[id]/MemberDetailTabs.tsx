"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { InfoIcon, MagnifyingGlassIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react"
import { MemberPhotoGallery } from "./MemberPhotoGallery"
import { MemberEmailTab } from "./MemberEmailTab"

type Photo = { id: string; url: string; thumburl: string }

type Props = {
  description: string
  whatareWelookingFor: string | null
  photos: Photo[]
  currentMemberId: string
  otherMember: { id: string; displayName: string }
}

export function MemberDetailTabs({ description, whatareWelookingFor, photos, currentMemberId, otherMember }: Props) {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab")
  const [tab, setTab] = useState<"profile" | "photos" | "email">(
    initialTab === "email" ? "email" : initialTab === "photos" ? "photos" : "profile"
  )

  const tabCls = (active: boolean) =>
    [
      "px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors",
      active
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground",
    ].join(" ")

  return (
    <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border px-4">
        <button type="button" onClick={() => setTab("profile")} className={tabCls(tab === "profile")}>
          Profile
        </button>
        <button type="button" onClick={() => setTab("photos")} className={tabCls(tab === "photos")}>
          Photos
          {photos.length > 0 && (
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">
              {photos.length}
            </span>
          )}
        </button>
        <button type="button" onClick={() => setTab("email")} className={tabCls(tab === "email")}>
          <span className="flex items-center gap-1.5">
            <EnvelopeSimpleIcon size={14} />
            Email
          </span>
        </button>
      </div>

      {/* Tab content */}
      <div className="p-5">
        {tab === "profile" && (
          <div className="flex flex-col gap-5">
            <div className="space-y-1">
              <p className="text-md font-semibold tracking-wide text-muted-foreground flex items-center gap-1">
                <InfoIcon size={12} />
                About Us
              </p>
              <div
                className="text-md text-card-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>

            {whatareWelookingFor && (
              <div className="space-y-1">
                <p className="text-md font-semibold tracking-wide text-muted-foreground flex items-center gap-1">
                  <MagnifyingGlassIcon size={12} />
                  What We Are Looking For
                </p>
                <div
                  className="text-md text-card-foreground prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: whatareWelookingFor }}
                />
              </div>
            )}
          </div>
        )}

        {tab === "photos" && <MemberPhotoGallery photos={photos} />}

        {tab === "email" && (
          <MemberEmailTab currentMemberId={currentMemberId} otherMember={otherMember} />
        )}
      </div>
    </div>
  )
}
