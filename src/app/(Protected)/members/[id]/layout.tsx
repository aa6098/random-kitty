import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { MemberSideBar } from "./MemberSideBar"

type Props = {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function MemberLayout({ children, params }: Props) {
  const { id } = await params

  const [member, session] = await Promise.all([
    prisma.member.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        image: true,
        location: { select: { city: true, state: true } },
      },
    }),
    auth.api.getSession({ headers: await headers() }),
  ])

  if (!member) notFound()

  const currentMember = session
    ? await prisma.member.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })
    : null

  return (
    <div className="mx-auto w-full max-w-[1130px] flex flex-1 flex-col md:flex-row gap-6 px-4 py-6">
      <MemberSideBar member={member} currentMemberId={currentMember?.id ?? null} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
