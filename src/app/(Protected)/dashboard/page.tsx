import { Suspense } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { haversineDistance } from "@/lib/distance"
import { getAllLocations } from "@/lib/locationCache"
import { generateSasUrl } from "@/lib/azure"
import { DistanceFilter } from "./DistanceFilter"
import { DashboardLocationPicker } from "./DashboardLocationPicker"
import { DashboardList } from "./DashboardList"
import { PAGE_SIZE, type DashboardMemberData } from "./types"

type Props = {
  searchParams: Promise<{ distance?: string; location?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/signin")

  const { distance: distanceParam, location: locationParam } = await searchParams
  const distanceFilter = parseInt(distanceParam ?? "0", 10) || 0
  const selectedLocationId = locationParam ?? ""

  const [currentMember, selectedLocation] = await Promise.all([
    prisma.member.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        locationId: true,
        location: { select: { lat: true, lng: true, id: true, city: true, state: true, zip: true } },
      },
    }),
    selectedLocationId
      ? prisma.location.findUnique({
          where: { id: selectedLocationId },
          select: { lat: true, lng: true, id: true, city: true, state: true, zip: true },
        })
      : Promise.resolve(null),
  ])

  if (!currentMember) redirect("/member")

  // Ensure member's own location is always available for the picker default
  const memberLocation = currentMember.location
    ?? (currentMember.locationId
      ? await prisma.location.findUnique({
          where: { id: currentMember.locationId },
          select: { lat: true, lng: true, id: true, city: true, state: true, zip: true },
        })
      : null)

  // myLocation is the selected location's lat/lng, or the member's own location
  const myLocation = selectedLocation ?? memberLocation
  const currentMemberId = currentMember.id

  // Picker shows the selected location; falls back to member's own location as the default
  const pickerLocation = selectedLocation ?? memberLocation

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

  const [stubs, likedRows] = await Promise.all([
    prisma.member.findMany({ select: { id: true, locationId: true }, where }),
    prisma.likes.findMany({
      where: { LikedById: currentMemberId, checked: true },
      select: { LikedMemberId: true },
    }),
  ])

  const sortedIds = stubs
    .sort((a, b) => (locationDistanceMap.get(a.locationId) ?? Infinity) - (locationDistanceMap.get(b.locationId) ?? Infinity))
    .slice(0, PAGE_SIZE)
    .map((s) => s.id)

  const members = sortedIds.length
    ? await prisma.member.findMany({
        where: { id: { in: sortedIds } },
        select: {
          id: true, displayName: true, image: true, description: true,
          whatareWelookingFor: true, createdAt: true, locationId: true,
          location: { select: { city: true, state: true } },
          photos: { where: { delete: false }, select: { id: true, url: true, thumburl: true } },
        },
      })
    : []

  const memberMap = new Map(members.map((m) => [m.id, m]))
  const orderedMembers = sortedIds.map((id) => memberMap.get(id)!).filter(Boolean)
  const likedSet = new Set(likedRows.map((r) => r.LikedMemberId).filter(Boolean) as string[])

  const initialMembers: DashboardMemberData[] = orderedMembers.map((m) => ({
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
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
        {/* <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1> */}
        <div className="flex flex-row items-center justify-center md:justify-end gap-3">
          <Suspense>
            <DashboardLocationPicker
              initialLocation={pickerLocation}
              memberLocation={memberLocation}
            />
          </Suspense>
          <DistanceFilter />
        </div>
      </div>

      <DashboardList
        initialMembers={initialMembers}
        currentMemberId={currentMemberId}
        distanceFilter={distanceFilter}
        selectedLocationId={selectedLocationId}
      />
    </div>
  )
}
