"use client"

import { useState } from "react"
import { XIcon, ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react"

type Photo = { id: string; url: string; thumburl: string }

type Props = {
  photos: Photo[]
}

export function MemberPhotoGallery({ photos }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (photos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">
        No photos uploaded yet.
      </p>
    )
  }

  function prevPhoto(e: React.MouseEvent) {
    e.stopPropagation()
    setLightboxIndex((i) => (i === null ? 0 : (i - 1 + photos.length) % photos.length))
  }

  function nextPhoto(e: React.MouseEvent) {
    e.stopPropagation()
    setLightboxIndex((i) => (i === null ? 0 : (i + 1) % photos.length))
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="aspect-square overflow-hidden rounded border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`View photo ${index + 1}`}
          >
            <img
              src={photo.thumburl}
              alt=""
              className="size-full object-contain transition-opacity hover:opacity-90"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
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
                onClick={prevPhoto}
                aria-label="Previous photo"
              >
                <ArrowLeftIcon size={32} />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                onClick={nextPhoto}
                aria-label="Next photo"
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
