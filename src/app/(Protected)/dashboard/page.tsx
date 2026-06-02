import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { haversineDistance } from "@/lib/distance"
import { getAllLocations } from "@/lib/locationCache"
import { generateSasUrl } from "@/lib/azure"
import { DashboardMember } from "./DashboardMember"
import { DistanceFilter } from "./DistanceFilter"

type Props = {
  searchParams: Promise<{ distance?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/signin")

  const { distance: distanceParam } = await searchParams
  const distanceFilter = parseInt(distanceParam ?? "0", 10) || 0

  const currentMember = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true, location: { select: { lat: true, lng: true } } },
  })

  if (!currentMember) redirect("/member")

  const myLocation = currentMember.location
  const currentMemberId = currentMember.id

  let nearbyLocationIds: string[] | undefined

  if (myLocation) {
    const allLocations = await getAllLocations()

    if (distanceFilter > 0) {
      nearbyLocationIds = allLocations
        .filter(
          (loc) =>
            haversineDistance(myLocation.lat, myLocation.lng, loc.lat, loc.lng) <= distanceFilter,
        )
        .map((loc) => loc.id)
    }
  }

  const [members, likedRows] = await Promise.all([
    prisma.member.findMany({
      select: {
        id: true,
        displayName: true,
        image: true,
        description: true,
        whatareWelookingFor: true,
        createdAt: true,
        location: { select: { city: true, state: true } },
        photos: {
          where: { delete: false },
          select: { id: true, url: true, thumburl: true },
        },
      },
      where: {
        deactivated: false,
        NOT: [
          { id: currentMemberId },
          {
            OR: [
              { BlockedMembers: { some: { active: true, sourceMemberId: currentMemberId } } },
              { SourceMembers: { some: { active: true, blockedMemberId: currentMemberId } } },
            ],
          },
        ],
        ...(nearbyLocationIds ? { locationId: { in: nearbyLocationIds } } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.likes.findMany({
      where: { LikedById: currentMemberId, checked: true },
      select: { LikedMemberId: true },
    }),
  ])

  const likedMemberIds = new Set(likedRows.map((r) => r.LikedMemberId).filter(Boolean) as string[])

  return (
    <div className="mx-auto w-full max-w-[1130px] px-4 py-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <DistanceFilter />
      </div>

      {members.length === 0 ? (
        <p className="text-muted-foreground text-sm">No members found.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {members.map((member) => (
            <DashboardMember
              key={member.id}
              id={member.id}
              displayName={member.displayName}
              image={generateSasUrl(member.image)}
              description={member.description}
              whatareWelookingFor={member.whatareWelookingFor}
              location={member.location}
              createdAt={member.createdAt}
              isLiked={likedMemberIds.has(member.id)}
              currentMemberId={currentMemberId}
              photos={member.photos.map((p) => ({
                id: p.id,
                url: generateSasUrl(p.url) ?? "",
                thumburl: generateSasUrl(p.thumburl) ?? "",
              }))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
