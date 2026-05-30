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

  const [blockRecord, likeRecord] = await Promise.all([
    currentMember
      ? prisma.blockUser.findFirst({
          where: { sourceMemberId: currentMember.id, blockedMemberId: id },
          select: { active: true },
        })
      : null,
    currentMember
      ? prisma.likes.findUnique({
          where: { LikedMemberId_LikedById: { LikedMemberId: id, LikedById: currentMember.id } },
          select: { checked: true },
        })
      : null,
  ])

  const isBlocked = blockRecord?.active ?? false
  const isLiked = likeRecord?.checked ?? false

  return (
    <div className="mx-auto w-full max-w-[1130px] flex flex-1 flex-col md:flex-row gap-6 px-4 py-6">
      <MemberSideBar member={member} currentMemberId={currentMember?.id ?? null} isBlocked={isBlocked} isLiked={isLiked} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
