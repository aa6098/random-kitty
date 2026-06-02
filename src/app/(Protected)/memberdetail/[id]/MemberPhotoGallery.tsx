"use client"

import { useState } from "react"
import { XIcon, ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react"

type Photo = { id: string; url: string; thumburl: string }

export function MemberPhotoGallery({ photos }: { photos: Photo[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

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
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
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
