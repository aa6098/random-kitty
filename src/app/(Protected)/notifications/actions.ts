"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function markLikeRead(likeId: number) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!member) throw new Error("Member not found")

  await prisma.likes.updateMany({
    where: { id: likeId, LikedMemberId: member.id, dateRead: null },
    data: { dateRead: new Date() },
  })

  revalidatePath("/notifications")
}
