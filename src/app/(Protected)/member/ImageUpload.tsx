"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CameraPlusIcon, TrashIcon } from "@phosphor-icons/react"

const DEFAULT_IMAGE = "/defaultProfile.jpg"

type Props = {
  currentImage?: string | null
  previewUrl?: string | null
}

export function ImageUpload({ currentImage, previewUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(previewUrl ?? currentImage ?? null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentImage ?? null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    setUploadError(null)
    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)
      const res = await fetch("/api/upload/member-image", { method: "POST", body })
      const data = await res.json()
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed.")
        setPreview(null)
        setUploadedUrl(null)
        if (inputRef.current) inputRef.current.value = ""
      } else {
        console.log(data.url);
        setUploadedUrl(data.url)
      }
    } catch {
      setUploadError("Upload failed. Please try again.")
      setPreview(null)
      setUploadedUrl(null)
      if (inputRef.current) inputRef.current.value = ""
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    setPreview(null)
    setUploadedUrl(null)
    setUploadError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const displaySrc = preview ?? DEFAULT_IMAGE
  const hasCustomImage = preview !== null

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-col items-center">
        <div className="relative size-24 shrink-0 border border-border bg-muted overflow-hidden">
          <img
            src={displaySrc}
            alt="Profile"
            className="size-full object-cover"
          />
          {hasCustomImage && (
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove image"
              className="absolute top-1 right-1 size-5 bg-destructive text-destructive-foreground flex items-center justify-center rounded-full"
            >
              <TrashIcon size={10} weight="bold" />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          {/* Submits the Azure URL (not the file) to the server action */}
          <input type="hidden" name="imageUrl" value={uploadedUrl ?? ""} />
          <Button
            type="button"
            variant={"outline"}
            className="w-full px-4 py-2.5 text-sm font-medium border-1 rounded border-destructive transition-colors"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <CameraPlusIcon size={32} />
            {uploading ? "Uploading…" : hasCustomImage ? "Change image" : "Upload image"}
          </Button>
          <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 2 MB.</p>
          {uploadError && (
            <p className="text-xs text-destructive">{uploadError}</p>
          )}
        </div>
      </div>
    </div>
  )
}
