import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { UserStoreInitializer } from "@/components/UserStoreInitializer"
import { Header } from "./Header"
import { IncomingCallListener } from "./IncomingCallListener"
import { MessageNotificationListener } from "./MessageNotificationListener"
import { PresenceProvider } from "./PresenceProvider"

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
    select: { id: true, displayName: true, image: true },
  })

  const name = member ? member.displayName : (session.user.name ?? null)
  const image = member ? member.image : (session.user.image ?? null)

  const unreadCount = member
    ? await prisma.message.count({
        where: {
          recipientId: member.id,
          dateRead: null,
          recipientDeleted: false,
        },
      })
    : 0

  return (
    <div className="min-h-screen flex flex-col">
      <UserStoreInitializer name={name} image={image} unreadCount={unreadCount} />
      <PresenceProvider />
      <Header />
      {member && <IncomingCallListener currentMemberId={member.id} />}
      {member && <MessageNotificationListener currentMemberId={member.id} />}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
