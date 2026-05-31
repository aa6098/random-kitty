"use client"

import { useState, useRef, useEffect } from "react"
import Cropper from "cropperjs"
import "cropperjs/dist/cropper.css"
import { Button } from "@/components/ui/button"
import { CameraPlusIcon, TrashIcon, CheckIcon, XIcon } from "@phosphor-icons/react"

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
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const cropperRef = useRef<Cropper | null>(null)

  useEffect(() => {
    if (!cropSrc || !imageRef.current) return
    cropperRef.current = new Cropper(imageRef.current, {
      aspectRatio: 1,
      viewMode: 1,
      autoCropArea: 0.9,
      responsive: true,
      cropBoxResizable: false
    })
    return () => {
      cropperRef.current?.destroy()
      cropperRef.current = null
    }
  }, [cropSrc])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleCrop() {
    if (!cropperRef.current) return
    const canvas = cropperRef.current.getCroppedCanvas({ width: 300, height: 300 })
    canvas.toBlob(async (blob) => {
      if (!blob) return
      setUploadError(null)
      setUploading(true)
      setCropSrc(null)
      const localUrl = URL.createObjectURL(blob)
      setPreview(localUrl)
      try {
        const body = new FormData()
        body.append("file", new File([blob], "profile.jpg", { type: "image/jpeg" }))
        const res = await fetch("/api/upload/member-image", { method: "POST", body })
        const data = await res.json()
        if (!res.ok) {
          setUploadError(data.error ?? "Upload failed.")
          setPreview(null)
          setUploadedUrl(null)
          if (inputRef.current) inputRef.current.value = ""
        } else {
          setUploadedUrl(data.url)
        }
      } catch {
        setUploadError("Upload failed. Please try again.")
        setPreview(null)
        setUploadedUrl(null)
        if (inputRef.current) inputRef.current.value = ""
      } finally {
        setUploading(false)
        URL.revokeObjectURL(localUrl)
      }
    }, "image/jpeg", 0.9)
  }

  function handleCancelCrop() {
    setCropSrc(null)
    if (inputRef.current) inputRef.current.value = ""
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
    <>
      <div className="flex flex-col items-start gap-4">
        <div className="flex flex-col items-center">
          <div className="relative size-24 shrink-0 border border-border bg-muted overflow-hidden">
            <img src={displaySrc} alt="Profile" className="size-full object-cover" />
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
            <input type="hidden" name="imageUrl" value={uploadedUrl ?? ""} />
            <Button
              type="button"
              variant="outline"
              className="w-full px-4 py-2.5 text-sm font-medium border-1 rounded border-destructive transition-colors"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <CameraPlusIcon size={32} />
              {uploading ? "Uploading…" : hasCustomImage ? "Change image" : "Upload image"}
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 2 MB.</p>
            {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
          </div>
        </div>
      </div>

      {cropSrc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-4 w-full max-w-md space-y-4">
            <p className="font-semibold text-sm">Crop your profile image</p>
            <div className="max-h-[400px] overflow-hidden">
              <img ref={imageRef} src={cropSrc} alt="Crop preview" style={{ maxWidth: "100%" }} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" onClick={handleCancelCrop}>
                <XIcon size={14} />
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleCrop}>
                <CheckIcon size={14} />
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
