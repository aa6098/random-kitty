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

export async function toggleBlockMember(blockedMemberId: string) {
  const source = await getCurrentMember()
  if (source.id === blockedMemberId) throw new Error("Cannot block yourself")

  const existing = await prisma.blockUser.findFirst({
    where: { sourceMemberId: source.id, blockedMemberId },
  })

  if (existing) {
    await prisma.blockUser.update({
      where: { id: existing.id },
      data: { active: !existing.active },
    })
  } else {
    await prisma.blockUser.create({
      data: { sourceMemberId: source.id, blockedMemberId, active: true },
    })
  }

  revalidatePath(`/members/${blockedMemberId}`)
}
