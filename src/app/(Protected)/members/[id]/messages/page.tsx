import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { MessageThread } from "./MessageThread"

type Props = { params: Promise<{ id: string }> }

export default async function MessagesPage({ params }: Props) {
  const { id: recipientMemberId } = await params

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) notFound()

  const currentMember = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!currentMember) notFound()

  const recipientMember = await prisma.member.findUnique({
    where: { id: recipientMemberId },
    select: { id: true, displayName: true },
  })
  if (!recipientMember) notFound()

  const rawMessages = await prisma.message.findMany({
    where: {
      OR: [
        {
          senderId: currentMember.id,
          recipientId: recipientMemberId,
          senderDeleted: false,
        },
        {
          senderId: recipientMemberId,
          recipientId: currentMember.id,
          recipientDeleted: false,
        },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      text: true,
      createdAt: true,
      senderId: true,
      recipientId: true,
      dateRead: true,
    },
  })

  // Mark unread messages received by current user as read
  const unreadIds = rawMessages
    .filter(m => m.recipientId === currentMember.id && !m.dateRead)
    .map(m => m.id)

  const readAt = unreadIds.length > 0 ? new Date() : null
  if (unreadIds.length > 0) {
    await prisma.message.updateMany({
      where: { id: { in: unreadIds } },
      data: { dateRead: readAt },
    })
  }

  const messages = rawMessages.map(m => ({
    id: m.id,
    text: m.text,
    createdAt: m.createdAt.toISOString(),
    senderId: m.senderId,
    recipientId: m.recipientId,
    dateRead: unreadIds.includes(m.id)
      ? readAt!.toISOString()
      : (m.dateRead?.toISOString() ?? null),
  }))

  return (
    <MessageThread
      messages={messages}
      currentMemberId={currentMember.id}
      recipientId={recipientMemberId}
      recipientName={recipientMember.displayName}
      hadUnread={unreadIds.length > 0}
    />
  )
}
