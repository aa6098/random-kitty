"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { pusherServer, getChatChannel } from "@/lib/pusher"
import { getUserChannel } from "@/lib/pusherUtils"

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

export async function sendMessage(recipientId: string, text: string) {
  const sender = await getCurrentMember()
  if (sender.id === recipientId) throw new Error("Cannot message yourself")

  const message = await prisma.message.create({
    data: { senderId: sender.id, recipientId, text },
    select: {
      id: true,
      text: true,
      createdAt: true,
      senderId: true,
      recipientId: true,
      dateRead: true,
    },
  })

  const payload = {
    ...message,
    createdAt: message.createdAt.toISOString(),
    dateRead: null,
  }

  await Promise.all([
    // Real-time update for anyone already in the chat thread
    pusherServer.trigger(getChatChannel(sender.id, recipientId), "new-message", payload),
    // Toast notification for the recipient wherever they are
    pusherServer.trigger(getUserChannel(recipientId), "new-message-notification", {
      senderId: sender.id,
      senderName: sender.displayName,
      senderImage: sender.image,
      messageText: message.text,
      messageId: message.id,
    }),
  ])

  revalidatePath(`/members/${recipientId}/messages`)
}

export async function deleteMessage(messageId: string, otherMemberId: string) {
  const current = await getCurrentMember()
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { senderId: true, recipientId: true },
  })
  if (!message) throw new Error("Message not found")

  if (message.senderId === current.id) {
    await prisma.message.update({
      where: { id: messageId },
      data: { senderDeleted: true },
    })
  } else if (message.recipientId === current.id) {
    await prisma.message.update({
      where: { id: messageId },
      data: { recipientDeleted: true },
    })
  }

  revalidatePath(`/members/${otherMemberId}/messages`)
}
