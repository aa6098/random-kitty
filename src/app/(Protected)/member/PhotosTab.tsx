"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CameraPlusIcon, TrashIcon, XIcon, ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react"
import { deletePhotoAction } from "./actions"

type Photo = { id: string; url: string; thumburl: string }

const MAX_PHOTOS = 25

type Props = {
  initialPhotos: Photo[]
}

export function PhotosTab({ initialPhotos }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function makeThumbnail(file: File, maxPx: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Failed to load image")) }
      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        const scale = Math.min(maxPx / img.width, maxPx / img.height, 1)
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Thumbnail generation failed"))),
          file.type,
          0.999,
        )
      }
      img.src = objectUrl
    })
  }

  async function handleFiles(files: FileList) {
    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) {
      setError(`Maximum ${MAX_PHOTOS} photos allowed`)
      return
    }
    const selected = Array.from(files).slice(0, remaining)
    setError(null)
    setUploading(true)

    const uploaded: Photo[] = []
    for (const file of selected) {
      try {
        const thumb = await makeThumbnail(file, 300)
        const body = new FormData()
        body.append("file", file)
        body.append("thumb", new File([thumb], file.name, { type: file.type }))
        const res = await fetch("/api/upload/member-photo", { method: "POST", body })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? "Upload failed")
          break
        }
        uploaded.push(data as Photo)
      } catch {
        setError("Upload failed. Please try again.")
        break
      }
    }

    if (uploaded.length > 0) setPhotos((prev) => [...prev, ...uploaded])
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleDelete(id: string) {
    const result = await deletePhotoAction(id)
    if (result?.error) {
      setError(result.error)
      return
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    setLightboxIndex(null)
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {photos.length} / {MAX_PHOTOS} photos
        </p>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={photos.length >= MAX_PHOTOS || uploading}
            onClick={() => inputRef.current?.click()}
          >
            <CameraPlusIcon size={16} />
            {uploading ? "Uploading…" : "Add Photos"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {photos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No photos yet. Click &quot;Add Photos&quot; to get started.
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group aspect-square overflow-hidden rounded border border-border bg-muted"
            >
              <img
                src={photo.thumburl}
                alt=""
                className="size-full object-contain cursor-pointer"
                onClick={() => setLightboxIndex(index)}
              />
              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                aria-label="Delete photo"
                className="absolute top-1 right-1 size-5 bg-destructive text-destructive-foreground flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <TrashIcon size={10} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      )}

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
        </div>
      )}
    </div>
  )
}
