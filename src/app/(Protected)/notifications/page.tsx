import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NotificationList, type UnifiedNotification } from "./NotificationList"
import { generateSasUrl } from "@/lib/azure"

export default async function NotificationsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) notFound()

  const currentMember = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!currentMember) redirect("/member")

  const [unreadMessages, unreadLikes] = await Promise.all([
    prisma.message.findMany({
      where: { recipientId: currentMember.id, dateRead: null, recipientDeleted: false },
      orderBy: { createdAt: "desc" },
      select: {
        text: true,
        createdAt: true,
        type: true,
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

  // Group chat messages (type C or M) by sender
  const chatMap = new Map<
    string,
    { senderId: string; senderName: string; senderImage: string | null; count: number; latestMessage: string; sortAt: string }
  >()
  // Group email messages (type E) by sender
  const emailMap = new Map<
    string,
    { senderId: string; senderName: string; senderImage: string | null; count: number; latestMessage: string; sortAt: string }
  >()

  for (const msg of unreadMessages) {
    if (!msg.sender) continue
    const isEmail = msg.type?.toUpperCase() === "E"
    const map = isEmail ? emailMap : chatMap
    if (!map.has(msg.sender.id)) {
      map.set(msg.sender.id, {
        senderId: msg.sender.id,
        senderName: msg.sender.displayName,
        senderImage: generateSasUrl(msg.sender.image),
        count: 1,
        latestMessage: msg.text,
        sortAt: msg.createdAt.toISOString(),
      })
    } else {
      map.get(msg.sender.id)!.count++
    }
  }

  const messageItems: UnifiedNotification[] = [
    ...Array.from(chatMap.values()).map((m) => ({ kind: "chat" as const, ...m })),
    ...Array.from(emailMap.values()).map((m) => ({ kind: "email" as const, ...m })),
  ]

  const likeItems: UnifiedNotification[] = unreadLikes
    .filter((l) => l.likingMember)
    .map((l) => ({
      kind: "like",
      likeId: l.id,
      likerId: l.likingMember!.id,
      likerName: l.likingMember!.displayName,
      likerImage: generateSasUrl( l.likingMember!.image),
      sortAt: l.createdAt.toISOString(),
    }))

  const items = [...messageItems, ...likeItems].sort(
    (a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime(),
  )

  const totalMessages = messageItems.reduce(
    (sum, m) => sum + (m.kind === "chat" || m.kind === "email" ? m.count : 0),
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
