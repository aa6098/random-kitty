import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { haversineDistance } from "@/lib/distance"
import { getAllLocations } from "@/lib/locationCache"
import { MemberCard } from "./MemberCard"
import { NavButton } from "./NavButton"
import { SearchBar } from "./SearchBar"
import {
  CaretLeftIcon,
  CaretRightIcon,
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
} from "@phosphor-icons/react/dist/ssr"

const PAGE_SIZE = 8

type Props = {
  searchParams: Promise<{ page?: string; distance?: string; sort?: string }>
}

export default async function MemberHomePage({ searchParams }: Props) {
  const session = await auth.api.getSession({ headers: await headers() })

  const { page: pageParam, distance: distanceParam, sort: sortParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const skip = (page - 1) * PAGE_SIZE
  const distanceFilter = parseInt(distanceParam ?? "0", 10) || 0
  const sortBy = sortParam === "D" ? "D" : "U"

  // Fetch current user's location for distance calculation
  const currentMember = session
    ? await prisma.member.findUnique({
        where: { userId: session.user.id },
        select: { location: { select: { id: true, lat: true, lng: true } } },
      })
    : null
  const myLocation = currentMember?.location ?? null

  // Build locationId → distanceMiles map from the Location table (smaller than Member table)
  const locationDistanceMap = new Map<string, number>()
  let nearbyLocationIds: string[] | undefined

  if (myLocation) {
    const allLocations = await getAllLocations()

    for (const loc of allLocations) {
      locationDistanceMap.set(
        loc.id,
        haversineDistance(myLocation.lat, myLocation.lng, loc.lat, loc.lng),
      )
    }

    if (distanceFilter > 0) {
      nearbyLocationIds = allLocations
        .filter((loc) => (locationDistanceMap.get(loc.id) ?? Infinity) <= distanceFilter)
        .map((loc) => loc.id)
    }
  }

  // Fetch only members whose locationId is in the nearby set (DB-level filter), excluding self
  const excludeUserId = session?.user.id
  const allMembers = await prisma.member.findMany({
    select: {
      id: true,
      displayName: true,
      image: true,
      updatedAt: true,
      locationId: true,
      location: { select: { city: true, state: true } },
    },
    where: {
      ...(excludeUserId ? { NOT: { userId: excludeUserId } } : {}),
      ...(nearbyLocationIds ? { locationId: { in: nearbyLocationIds } } : {}),
    },
    orderBy: { updatedAt: "desc" },
  })

  type MemberWithDistance = (typeof allMembers)[number] & { distanceMiles: number | null }

  const withDistance: MemberWithDistance[] = allMembers.map((m) => ({
    ...m,
    distanceMiles: locationDistanceMap.get(m.locationId) ?? null,
  }))

  const sorted =
    sortBy === "D"
      ? [...withDistance].sort((a, b) => (a.distanceMiles ?? Infinity) - (b.distanceMiles ?? Infinity))
      : withDistance

  const total = sorted.length
  const members = sorted.slice(skip, skip + PAGE_SIZE)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasPrev = page > 1
  const hasNext = page < totalPages

  const qs = (p: number) => {
    const params = new URLSearchParams()
    params.set("page", String(p))
    if (distanceParam) params.set("distance", distanceParam)
    if (sortParam) params.set("sort", sortParam)
    return `?${params.toString()}`
  }

  return (
    <div className="mx-auto w-full max-w-[1130px] px-4 py-3">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight whitespace-nowrap hidden md:block">Latest Members</h1>
        <SearchBar />
      </div>

      {members.length === 0 ? (
        <p className="text-muted-foreground text-sm">No members yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                id={member.id}
                displayName={member.displayName}
                image={member.image}
                location={member.location}
                distanceMiles={member.distanceMiles}
              />
            ))}
          </div>

          <div className="mt-8 flex items-center gap-1">
            <NavButton href={qs(1)} disabled={!hasPrev} label="First page">
              <CaretDoubleLeftIcon size={14} />
            </NavButton>

            <NavButton href={qs(page - 1)} disabled={!hasPrev} label="Previous page">
              <CaretLeftIcon size={14} />
            </NavButton>

            <span className="px-2 text-xs text-muted-foreground font-medium">
              {page} / {totalPages}
            </span>

            <NavButton href={qs(page + 1)} disabled={!hasNext} label="Next page">
              <CaretRightIcon size={14} />
            </NavButton>

            <NavButton href={qs(totalPages)} disabled={!hasNext} label="Last page">
              <CaretDoubleRightIcon size={14} />
            </NavButton>
          </div>
        </>
      )}
    </div>
  )
}
