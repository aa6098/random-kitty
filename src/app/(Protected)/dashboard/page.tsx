import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { haversineDistance } from "@/lib/distance"
import { getAllLocations } from "@/lib/locationCache"
import { generateSasUrl } from "@/lib/azure"
import { DistanceFilter } from "./DistanceFilter"
import { DashboardList } from "./DashboardList"
import { PAGE_SIZE, type DashboardMemberData } from "./types"

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
  const locationDistanceMap = new Map<string, number>()

  if (myLocation) {
    const allLocations = await getAllLocations()
    for (const loc of allLocations) {
      locationDistanceMap.set(loc.id, haversineDistance(myLocation.lat, myLocation.lng, loc.lat, loc.lng))
    }
    if (distanceFilter > 0) {
      nearbyLocationIds = allLocations
        .filter((loc) => (locationDistanceMap.get(loc.id) ?? Infinity) <= distanceFilter)
        .map((loc) => loc.id)
    }
  }

  const where = {
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
  }

  const [members, likedRows] = await Promise.all([
    prisma.member.findMany({
      take: PAGE_SIZE,
      select: {
        id: true,
        displayName: true,
        image: true,
        description: true,
        whatareWelookingFor: true,
        createdAt: true,
        locationId: true,
        location: { select: { city: true, state: true } },
        photos: {
          where: { delete: false },
          select: { id: true, url: true, thumburl: true },
        },
      },
      where,
      orderBy: { createdAt: "desc" },
    }),
    prisma.likes.findMany({
      where: { LikedById: currentMemberId, checked: true },
      select: { LikedMemberId: true },
    }),
  ])

  const likedSet = new Set(likedRows.map((r) => r.LikedMemberId).filter(Boolean) as string[])

  const initialMembers: DashboardMemberData[] = members.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    image: generateSasUrl(m.image),
    description: m.description,
    whatareWelookingFor: m.whatareWelookingFor,
    location: m.location,
    distanceMiles: locationDistanceMap.get(m.locationId) ?? null,
    createdAt: m.createdAt.toISOString(),
    photos: m.photos.map((p) => ({
      id: p.id,
      url: generateSasUrl(p.url) ?? "",
      thumburl: generateSasUrl(p.thumburl) ?? "",
    })),
    isLiked: likedSet.has(m.id),
  }))

  return (
    <div className="mx-auto w-full max-w-[1130px] px-4 py-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <DistanceFilter />
      </div>

      <DashboardList
        initialMembers={initialMembers}
        currentMemberId={currentMemberId}
        distanceFilter={distanceFilter}
      />
    </div>
  )
}
