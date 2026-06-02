import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { generateSasUrl } from "@/lib/azure"
import { MemberSideBar } from "./MemberSideBar"
import { MemberDetailTabs } from "./MemberDetailTabs"

type Props = { params: Promise<{ id: string }> }

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/signin")

  const currentMember = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!currentMember) redirect("/member")

  const [member, likeRecord, blockRecord] = await Promise.all([
    prisma.member.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        image: true,
        description: true,
        whatareWelookingFor: true,
        createdAt: true,
        deactivated: true,
        location: { select: { city: true, state: true } },
        photos: {
          where: { delete: false },
          select: { id: true, url: true, thumburl: true },
        },
      },
    }),
    prisma.likes.findUnique({
      where: {
        LikedMemberId_LikedById: { LikedMemberId: id, LikedById: currentMember.id },
      },
      select: { checked: true },
    }),
    prisma.blockUser.findFirst({
      where: { sourceMemberId: currentMember.id, blockedMemberId: id, active: true },
      select: { id: true },
    }),
  ])

  if (!member || member.deactivated) notFound()

  const photos = member.photos.map((p) => ({
    id: p.id,
    url: generateSasUrl(p.url) ?? "",
    thumburl: generateSasUrl(p.thumburl) ?? "",
  }))

  return (
    <div className="mx-auto w-full max-w-[1130px] px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar */}
        <MemberSideBar
          member={{
            id: member.id,
            displayName: member.displayName,
            image: generateSasUrl(member.image),
            location: member.location,
            createdAt: member.createdAt,
          }}
          currentMemberId={currentMember.id}
          isLiked={likeRecord?.checked ?? false}
          isBlocked={!!blockRecord}
        />

        {/* Tabbed content */}
        <MemberDetailTabs
          description={member.description}
          whatareWelookingFor={member.whatareWelookingFor}
          location={member.location}
          createdAt={member.createdAt}
          photos={photos}
        />
      </div>
    </div>
  )
}
