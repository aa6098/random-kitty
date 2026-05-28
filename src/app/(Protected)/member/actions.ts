"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export type MemberActionState = {
  error?: string
  success?: boolean
  name?: string
  image?: string | null
} | null

export async function saveMemberAction(
  _: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: "Not authenticated." }

  const displayName = (formData.get("displayName") as string)?.trim()
  const description = (formData.get("description") as string) ?? ""
  const locationId = (formData.get("locationId") as string)?.trim()
  const imageFile = formData.get("image") as File | null

  if (!displayName) return { error: "Display name is required." }
  if (!locationId) return { error: "Please select a location." }

  let imageUrl: string | undefined
  if (imageFile && imageFile.size > 0) {
    try {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uploadsDir = path.join(process.cwd(), "public", "uploads")
      await mkdir(uploadsDir, { recursive: true })
      const ext = path.extname(imageFile.name) || ".jpg"
      const filename = `${session.user.id}${ext}`
      await writeFile(path.join(uploadsDir, filename), buffer)
      imageUrl = `/uploads/${filename}`
    } catch {
      return { error: "Failed to upload image. Please try again." }
    }
  }

  let savedImage: string | null | undefined
  try {
    const saved = await prisma.member.upsert({
      where: { userId: session.user.id },
      update: {
        displayName,
        description,
        locationId,
        ...(imageUrl !== undefined && { image: imageUrl }),
      },
      create: {
        userId: session.user.id,
        displayName,
        description,
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
