"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"
import { getChatChannel, getUserChannel } from "@/lib/pusherUtils"
import { generateSasUrl } from "@/lib/azure"

async function getCurrentMember() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true, displayName: true, image: true },
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
    await prisma.likes.update({ where: { id: existing.id }, data: { checked: !existing.checked } })
  } else {
    await prisma.likes.create({ data: { LikedMemberId: likedMemberId, LikedById: liker.id, checked: true } })
  }

  revalidatePath("/dashboard")
}

export async function toggleBlock(blockedMemberId: string) {
  const source = await getCurrentMember()
  if (source.id === blockedMemberId) throw new Error("Cannot block yourself")

  const existing = await prisma.blockUser.findFirst({
    where: { sourceMemberId: source.id, blockedMemberId },
  })

  if (existing) {
    await prisma.blockUser.update({ where: { id: existing.id }, data: { active: !existing.active } })
  } else {
    await prisma.blockUser.create({ data: { sourceMemberId: source.id, blockedMemberId, active: true } })
  }

  revalidatePath("/dashboard")
}

export type ChatMessage = {
  id: string
  text: string
  createdAt: string
  senderId: string | null
  recipientId: string | null
  dateRead: string | null
}

export async function fetchMessages(recipientId: string): Promise<ChatMessage[]> {
  const current = await getCurrentMember()

  const rawMessages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: current.id, recipientId, senderDeleted: false },
        { senderId: recipientId, recipientId: current.id, recipientDeleted: false },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, text: true, createdAt: true, senderId: true, recipientId: true, dateRead: true },
  })

  const unreadIds = rawMessages
    .filter((m) => m.recipientId === current.id && !m.dateRead)
    .map((m) => m.id)

  const readAt = unreadIds.length > 0 ? new Date() : null
  if (unreadIds.length > 0) {
    await prisma.message.updateMany({ where: { id: { in: unreadIds } }, data: { dateRead: readAt } })
  }

  return rawMessages.map((m) => ({
    id: m.id,
    text: m.text,
    createdAt: m.createdAt.toISOString(),
    senderId: m.senderId,
    recipientId: m.recipientId,
    dateRead: unreadIds.includes(m.id) ? readAt!.toISOString() : (m.dateRead?.toISOString() ?? null),
  }))
}

export async function sendChatMessage(recipientId: string, text: string): Promise<ChatMessage> {
  const sender = await getCurrentMember()
  if (sender.id === recipientId) throw new Error("Cannot message yourself")

  const message = await prisma.message.create({
    data: { senderId: sender.id, recipientId, text },
    select: { id: true, text: true, createdAt: true, senderId: true, recipientId: true, dateRead: true },
  })

  const payload: ChatMessage = {
    id: message.id,
    text: message.text,
    createdAt: message.createdAt.toISOString(),
    senderId: message.senderId,
    recipientId: message.recipientId,
    dateRead: null,
  }

  await Promise.all([
    pusherServer.trigger(getChatChannel(sender.id, recipientId), "new-message", payload),
    pusherServer.trigger(getUserChannel(recipientId), "new-message-notification", {
      senderId: sender.id,
      senderName: sender.displayName,
      senderImage: generateSasUrl(sender.image),
      messageText: message.text,
      messageId: message.id,
    }),
  ])

  return payload
}
