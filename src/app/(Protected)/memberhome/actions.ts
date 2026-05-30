"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

async function getCurrentMember() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!member) throw new Error("Member profile not found")
  return member
}

export async function toggleLike(likedMemberId: string) {
  const liker = await getCurrentMember()
  if (liker.id === likedMemberId) throw new Error("Cannot like yourself")

  const existing = await prisma.likes.findUnique({
    where: { LikedMemberId_LikedById: { LikedMemberId: likedMemberId, LikedById: liker.id } },
  })

  if (existing) {
    await prisma.likes.update({
      where: { id: existing.id },
      data: { checked: !existing.checked },
    })
  } else {
    await prisma.likes.create({
      data: { LikedMemberId: likedMemberId, LikedById: liker.id, checked: true },
    })
  }

  revalidatePath("/memberhome")
}
