"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { XIcon } from "@phosphor-icons/react"

type Props = {
  src: string | null
  alt: string
}

export function MemberAvatar({ src, alt }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const imgSrc = src ?? "/defaultProfile.jpg"

  return (
    <>
      <div className="size-45 rounded-full overflow-hidden bg-muted ring-2 ring-border">
        <img
          src={imgSrc}
          alt={alt}
          className="size-full object-cover cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        />
      </div>

      {lightboxOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <XIcon size={20} />
          </button>
          <img
            src={imgSrc}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  )
}
