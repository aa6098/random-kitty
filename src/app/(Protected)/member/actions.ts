"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"

export type FieldErrors = {
  displayName?: string
  description?: string
  whatareWelookingFor?: string
  locationId?: string
}

export type MemberActionState = {
  error?: string
  success?: boolean
  name?: string
  image?: string | null
  fieldErrors?: FieldErrors
} | null

export async function saveMemberAction(
  _: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: "Not authenticated." }

  const displayName = (formData.get("displayName") as string)?.trim()
  const description = (formData.get("description") as string)?.trim()
  const whatareWelookingFor = (formData.get("whatareWelookingFor") as string)?.trim()
  const locationId = (formData.get("locationId") as string)?.trim()
  const imageUrl = (formData.get("imageUrl") as string | null)?.trim() || undefined

  const fieldErrors: FieldErrors = {}
  if (!displayName) fieldErrors.displayName = "Display name is required."
  if (!description) fieldErrors.description = "About Us is required."
  if (!whatareWelookingFor) fieldErrors.whatareWelookingFor = "What are we looking for is required."
  if (!locationId) fieldErrors.locationId = "Please select a location."

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  if (displayName) {
    const taken = await prisma.member.findFirst({
      where: {
        displayName: { equals: displayName, mode: "insensitive" },
        NOT: { userId: session.user.id },
      },
      select: { id: true },
    })
    if (taken) return { fieldErrors: { displayName: "Display name is already taken." } }
  }

  let savedImage: string | null | undefined
  try {
    const saved = await prisma.member.upsert({
      where: { userId: session.user.id },
      update: {
        displayName,
        description,
        whatareWelookingFor,
        locationId,
        ...(imageUrl !== undefined && { image: imageUrl }),
      },
      create: {
        userId: session.user.id,
        displayName,
        description,
        whatareWelookingFor,
        locationId,
        image: imageUrl ?? null,
      },
      select: { displayName: true, image: true },
    })
    savedImage = saved.image
  } catch {
    return { error: "Failed to save profile. Please try again." }
  }

  revalidatePath("/member")
  return { success: true, name: displayName, image: savedImage ?? null }
}

export async function searchLocationsAction(
  query: string
): Promise<{ id: string; city: string; state: string; zip: string }[]> {
  if (!query || query.length < 2) return []

  return prisma.location.findMany({
    where: {
      city: { startsWith: query, mode: "insensitive" },
    },
    select: { id: true, city: true, state: true, zip: true },
    take: 5,
  })
}
