"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLineUpIcon, TrashIcon, SpinnerIcon } from "@phosphor-icons/react"

type Photo = { id: string; url: string }

type Props = {
  memberId: string
  initialPhotos: Photo[]
}

export function UploadMemberPhotos({ memberId, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("memberId", memberId)

    try {
      const res = await fetch("/api/upload-photo", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Upload failed.")
      } else {
        setPhotos((prev) => [...prev, data.photo])
      }
    } catch {
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <SpinnerIcon className="animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <ArrowLineUpIcon />
              Upload photo
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 5 MB.</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square border border-border bg-muted overflow-hidden"
            >
              <img
                src={photo.url}
                alt="Member photo"
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && !uploading && (
        <p className="text-sm text-muted-foreground">No photos uploaded yet.</p>
      )}
    </div>
  )
}
