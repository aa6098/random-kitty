"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLineUpIcon, TrashIcon } from "@phosphor-icons/react"

const DEFAULT_IMAGE = "/defaultProfile.jpg"

type Props = {
  currentImage?: string | null
}

export function ImageUpload({ currentImage }: Props) {
  const [preview, setPreview] = useState<string | null>(currentImage ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleRemove() {
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const displaySrc = preview ?? DEFAULT_IMAGE
  const hasCustomImage = preview !== null

  return (
    <div className="flex items-start gap-4">
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
          name="image"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <ArrowLineUpIcon />
          {hasCustomImage ? "Change image" : "Upload image"}
        </Button>
        <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 2 MB.</p>
      </div>
    </div>
  )
}
