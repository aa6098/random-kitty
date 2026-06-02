import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { generateSasUrl } from "@/lib/azure"
import { UserStoreInitializer } from "@/components/UserStoreInitializer"
import { Header } from "./Header"
import { IncomingCallListener } from "./IncomingCallListener"
import { MessageNotificationListener } from "./MessageNotificationListener"
import { PresenceProvider } from "./PresenceProvider"
import { GlobalChatPanel } from "./GlobalChatPanel"
import { NavigationLoader } from "./NavigationLoader"
import { LoadingOverlay } from "@/components/LoadingOverlay"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    redirect("/signin")
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true, displayName: true, image: true, deactivated: true },
  })

  const name = member ? member.displayName : (session.user.name ?? null)
  const image = generateSasUrl(member ? member.image : (session.user.image ?? null))

  const [unreadMessages, unreadLikes] = member
    ? await Promise.all([
        prisma.message.count({
          where: { recipientId: member.id, dateRead: null, recipientDeleted: false },
        }),
        prisma.likes.count({
          where: { LikedMemberId: member.id, dateRead: null, checked: true },
        }),
      ])
    : [0, 0]
  const unreadCount = unreadMessages + unreadLikes

  return (
    <div className="min-h-screen flex flex-col">
      <UserStoreInitializer name={name} image={image} unreadCount={unreadCount} deactivated={member?.deactivated ?? false} hasMember={!!member} />
      <PresenceProvider />
      <Header />
      {member && <IncomingCallListener currentMemberId={member.id} />}
      {member && <MessageNotificationListener currentMemberId={member.id} />}
      {member && <GlobalChatPanel currentMemberId={member.id} />}
      <NavigationLoader />
      <LoadingOverlay />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
