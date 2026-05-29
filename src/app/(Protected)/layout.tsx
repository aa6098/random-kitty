import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { UserStoreInitializer } from "@/components/UserStoreInitializer"
import { Header } from "./Header"
import { IncomingCallListener } from "./IncomingCallListener"
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

  return (
    <div className="min-h-screen flex flex-col">
      <UserStoreInitializer name={name} image={image} />
      <PresenceProvider />
      <Header />
      {member && <IncomingCallListener currentMemberId={member.id} />}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
