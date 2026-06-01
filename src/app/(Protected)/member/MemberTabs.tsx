"use client"

import { useState } from "react"
import { MemberForm } from "./MemberForm"
import { PhotosTab } from "./PhotosTab"
import { cn } from "@/lib/utils"
import { WarningIcon, ArrowRightIcon } from "@phosphor-icons/react"

type LocationOption = { id: string; city: string; state: string; zip: string }

type MemberData = {
  id: string
  displayName: string
  image: string | null
  description: string
  whatareWelookingFor: string | null
  location: LocationOption
  deactivated: boolean
}

type Photo = { id: string; url: string; thumburl: string }

type Props = {
  member: MemberData | null
  previewImageUrl: string | null
  initialPhotos: Photo[]
}

const TABS = ["Profile", "Upload Photos"] as const
type Tab = (typeof TABS)[number]

export function MemberTabs({ member, previewImageUrl, initialPhotos }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Profile")

  return (
    <div className="space-y-4">
      {!member && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3.5 text-sm">
          <WarningIcon weight="fill" size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-200">Complete your profile to unlock the platform</p>
            <p className="text-amber-300/70 mt-0.5 leading-relaxed">
              Fill in your display name, description, and location below, then save. Once your profile is created, you&apos;ll have full access to Home, Notifications, and Community.
            </p>
          </div>
          <ArrowRightIcon weight="bold" size={16} className="text-amber-400 shrink-0 mt-1" />
        </div>
      )}

      <div className="flex border-b border-border gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            // className={[
            //   "px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors",
            //   activeTab === tab
            //     ? "border-primary text-primary"
            //     : "border-transparent text-muted-foreground hover:text-foreground",
            // ].join(" ")}
            className={cn(
                          "px-4 py-2.5 text-sm font-medium border-b border-border rounded-t-lg transition-colors bg-muted ",
                          activeTab === tab ? "bg-primary text-primary-foreground" : "text-foreground"
                        )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Profile" && (
        <MemberForm member={member} previewImageUrl={previewImageUrl} />
      )}
      {activeTab === "Upload Photos" && (
        <PhotosTab initialPhotos={initialPhotos} />
      )}
    </div>
  )
}
