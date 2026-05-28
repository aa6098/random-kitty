"use client"

import { useActionState, useEffect } from "react"
import { saveMemberAction, type MemberActionState } from "./actions"
import { useUserStore } from "@/lib/stores/userStore"
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
import { UploadMemberPhotos } from "./UploadMemberPhotos"
import { CheckCircle, WarningCircle } from "@phosphor-icons/react"

type LocationOption = { id: string; city: string; state: string; zip: string }

type MemberData = {
  id: string
  displayName: string
  image: string | null
  description: string
  location: LocationOption
  photos: { id: string; url: string }[]
}

type Props = {
  member: MemberData | null
}

export function MemberForm({ member }: Props) {
  const [state, action, pending] = useActionState<MemberActionState, FormData>(
    saveMemberAction,
    null
  )
  const setUser = useUserStore((s) => s.setUser)

  useEffect(() => {
    if (state?.success && state.name !== undefined) {
      setUser(state.name, state.image ?? null)
    }
  }, [state, setUser])

  const isEdit = member !== null

  return (
    <form action={action} encType="multipart/form-data">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Profile" : "Create Profile"}</CardTitle>
          <CardDescription>
            {isEdit
              ? "Update your member profile information."
              : "Set up your member profile to get started."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Display Name */}
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              defaultValue={member?.displayName ?? ""}
              placeholder="Enter your display name"
              required
              maxLength={100}
            />
          </div>

          {/* Profile Image */}
          <div className="space-y-1.5">
            <Label>Profile Image</Label>
            <ImageUpload currentImage={member?.image} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={member?.description ?? ""}
              placeholder="Tell us about yourself. You can use plain text or markup."
              className="min-h-[120px]"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label>Location</Label>
            <LocationPicker initialLocation={member?.location} />
            <p className="text-xs text-muted-foreground">
              Type at least 2 characters to search for a city.
            </p>
          </div>

          {/* Member Photos */}
          {isEdit && (
            <div className="space-y-1.5">
              <Label>Photos</Label>
              <UploadMemberPhotos
                memberId={member!.id}
                initialPhotos={member!.photos}
              />
            </div>
          )}

          {/* Feedback */}
          {state?.error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <WarningCircle size={16} weight="fill" />
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <CheckCircle size={16} weight="fill" />
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
