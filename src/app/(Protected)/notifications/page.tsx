import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NotificationList } from "./NotificationList"

export default async function NotificationsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) notFound()

  const currentMember = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!currentMember) notFound()

  // Unread messages where current member is the recipient
  const unreadMessages = await prisma.message.findMany({
    where: {
      recipientId: currentMember.id,
      dateRead: null,
      recipientDeleted: false,
    },
    orderBy: { createdAt: "desc" },
    select: {
      text: true,
      createdAt: true,
      sender: {
        select: { id: true, displayName: true, image: true },
      },
    },
  })

  // Group by sender — map preserves insertion order (latest message per sender first)
  const senderMap = new Map<
    string,
    {
      senderId: string
      senderName: string
      senderImage: string | null
      count: number
      latestMessage: string
      latestAt: string
    }
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
        latestAt: msg.createdAt.toISOString(),
      })
    } else {
      senderMap.get(msg.sender.id)!.count++
    }
  }

  const items = Array.from(senderMap.values())
  const totalUnread = items.reduce((sum, i) => sum + i.count, 0)

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        {items.length > 0 ? (
          <p className="text-sm text-muted-foreground mt-1">
            {totalUnread} unread message{totalUnread !== 1 ? "s" : ""} from{" "}
            {items.length} conversation{items.length !== 1 ? "s" : ""}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-1">You&apos;re all caught up</p>
        )}
      </div>

      {items.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/50 px-4 py-3 mb-5 text-sm text-muted-foreground">
          <span className="mt-px shrink-0 text-base leading-none">💬</span>
          <p>
            You have unread messages. Click any conversation below to open the chat and reply.
          </p>
        </div>
      )}

      <NotificationList items={items} />
    </div>
  )
}
