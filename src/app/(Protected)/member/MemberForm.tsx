"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { saveMemberAction, type MemberActionState, type FieldErrors } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ImageUpload } from "./ImageUpload"
import { LocationPicker } from "./LocationPicker"
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react"

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

type Props = {
  member: MemberData | null
  previewImageUrl: string | null
}

export function MemberForm({ member, previewImageUrl }: Props) {
  const [state, action, pending] = useActionState<MemberActionState, FormData>(
    saveMemberAction,
    null
  )
  const router = useRouter()
  const [clearedErrors, setClearedErrors] = useState<Set<keyof FieldErrors>>(new Set())

  useEffect(() => {
    if (state?.success) {
      router.refresh()
    }
  }, [state, router])

  useEffect(() => {
    setClearedErrors(new Set())
  }, [state])

  const isEdit = member !== null

  function fieldError(field: keyof FieldErrors): string | null {
    if (clearedErrors.has(field)) return null
    return state?.fieldErrors?.[field] ?? null
  }

  function clearError(field: keyof FieldErrors) {
    setClearedErrors((prev) => new Set([...prev, field]))
  }

  return (
    <form action={action} encType="multipart/form-data">
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div className="flex flex-col space-y-1.5">
            <CardTitle>{isEdit ? "Edit Profile" : "Create Profile"}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Update your member profile information."
                : "Set up your member profile to get started."}
            </CardDescription>
          </div>
          {isEdit && (
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                name="deactivated"
                defaultChecked={member?.deactivated ?? false}
                className="size-4 rounded border-border accent-destructive cursor-pointer"
              />
              Temporarily Deactivate Account
            </label>
          )}
        </CardHeader>

        <CardContent className="space-y-2">
          {/* Profile Image */}
          <div className="space-y-1.25">
            <Label className="font-bold">Profile Image</Label>
            <ImageUpload currentImage={member?.image} previewUrl={previewImageUrl} />
          </div>
          <div className="grid grid-cols-2 gap-2">
          {/* Display Name */}
          <div className="space-y-1.25">
            <Label className="font-bold" htmlFor="displayName">
              Display Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="displayName"
              name="displayName"
              defaultValue={member?.displayName ?? ""}
              placeholder="Enter your display name"
              maxLength={100}
              aria-invalid={!!fieldError("displayName")}
              onChange={() => clearError("displayName")}
            />
            {fieldError("displayName") && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <WarningCircleIcon size={14} weight="fill" />
                {fieldError("displayName")}
              </p>
            )}
          </div>
          {/* Location */}
          <div className="space-y-1.25">
            <Label className="font-bold">
              Location <span className="text-destructive">*</span>
            </Label>
            <LocationPicker
              initialLocation={member?.location}
              onSelect={() => clearError("locationId")}
            />
            {/* <p className="text-xs text-muted-foreground">
              Type at least 2 characters to search for a city.
            </p> */}
            {fieldError("locationId") && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <WarningCircleIcon size={14} weight="fill" />
                {fieldError("locationId")}
              </p>
            )}
          </div>

          </div>

          

          {/* About Us */}
          <div className="space-y-1.25">
            <Label className="font-bold" htmlFor="description">
              About Us <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              maxLength={1000}
              defaultValue={member?.description ?? ""}
              placeholder="Tell us about yourself."
              className="min-h-[120px]"
              aria-invalid={!!fieldError("description")}
              onChange={() => clearError("description")}
            />
            {fieldError("description") && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <WarningCircleIcon size={14} weight="fill" />
                {fieldError("description")}
              </p>
            )}
          </div>

          {/* What Are We Looking For */}
          <div className="space-y-1.25">
            <Label className="font-bold" htmlFor="whatareWelookingFor">
              What Are We Looking For <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="whatareWelookingFor"
              name="whatareWelookingFor"
              defaultValue={member?.whatareWelookingFor ?? ""}
              placeholder="Describe what you're looking for."
              className="min-h-[120px]"
              maxLength={1000}
              aria-invalid={!!fieldError("whatareWelookingFor")}
              onChange={() => clearError("whatareWelookingFor")}
            />
            {fieldError("whatareWelookingFor") && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <WarningCircleIcon size={14} weight="fill" />
                {fieldError("whatareWelookingFor")}
              </p>
            )}
          </div>

          
          {/* General error */}
          {state?.error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <WarningCircleIcon size={16} weight="fill" />
              {state.error}
            </div>
          )}

          {/* Success */}
          {state?.success && (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <CheckCircleIcon size={16} weight="fill" />
              Profile saved successfully.
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-border pt-4 mt-2">
          <Button type="submit" disabled={pending} size="lg">
            {pending ? "Saving…" : isEdit ? "Update Profile" : "Create Profile"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
