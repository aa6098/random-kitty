import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NotificationList, type UnifiedNotification } from "./NotificationList"

export default async function NotificationsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) notFound()

  const currentMember = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!currentMember) notFound()

  const [unreadMessages, unreadLikes] = await Promise.all([
    prisma.message.findMany({
      where: { recipientId: currentMember.id, dateRead: null, recipientDeleted: false },
      orderBy: { createdAt: "desc" },
      select: {
        text: true,
        createdAt: true,
        sender: { select: { id: true, displayName: true, image: true } },
      },
    }),
    prisma.likes.findMany({
      where: { LikedMemberId: currentMember.id, dateRead: null, checked: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        likingMember: { select: { id: true, displayName: true, image: true } },
      },
    }),
  ])

  // Group messages by sender, preserving latest-first order
  const senderMap = new Map<
    string,
    { senderId: string; senderName: string; senderImage: string | null; count: number; latestMessage: string; sortAt: string }
  >()
  for (const msg of unreadMessages) {
    if (!msg.sender) continue
    if (!senderMap.has(msg.sender.id)) {
      senderMap.set(msg.sender.id, {
        senderId: msg.sender.id,
        senderName: msg.sender.displayName,
        senderImage: msg.sender.image,
        count: 1,
        latestMessage: msg.text,
        sortAt: msg.createdAt.toISOString(),
      })
    } else {
      senderMap.get(msg.sender.id)!.count++
    }
  }

  const messageItems: UnifiedNotification[] = Array.from(senderMap.values()).map((m) => ({
    kind: "message",
    ...m,
  }))

  const likeItems: UnifiedNotification[] = unreadLikes
    .filter((l) => l.likingMember)
    .map((l) => ({
      kind: "like",
      likeId: l.id,
      likerId: l.likingMember!.id,
      likerName: l.likingMember!.displayName,
      likerImage: l.likingMember!.image,
      sortAt: l.createdAt.toISOString(),
    }))

  const items = [...messageItems, ...likeItems].sort(
    (a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime(),
  )

  const totalMessages = messageItems.reduce(
    (sum, m) => sum + (m.kind === "message" ? m.count : 0),
    0,
  )
  const totalLikes = likeItems.length

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        {items.length > 0 ? (
          <p className="text-sm text-muted-foreground mt-1">
            {[
              totalMessages > 0 && `${totalMessages} unread message${totalMessages !== 1 ? "s" : ""}`,
              totalLikes > 0 && `${totalLikes} new like${totalLikes !== 1 ? "s" : ""}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-1">You&apos;re all caught up</p>
        )}
      </div>

      <NotificationList items={items} />
    </div>
  )
}
