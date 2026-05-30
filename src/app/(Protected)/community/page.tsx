import Image from "next/image"
import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { NavButton } from "@/app/(Protected)/memberhome/NavButton"
import { CommunityFilter } from "./CommunityFilter"
import { CommunitySearch } from "./CommunitySearch"
import {
  CaretLeftIcon,
  CaretRightIcon,
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
} from "@phosphor-icons/react/dist/ssr"

const PAGE_SIZE = 20

type Props = {
  searchParams: Promise<{ page?: string; filter?: string; search?: string }>
}

export default async function CommunityPage({ searchParams }: Props) {
  const session = await auth.api.getSession({ headers: await headers() })

  const { page: pageParam, filter: filterParam, search: searchParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const skip = (page - 1) * PAGE_SIZE
  const filter: "all" | "blocked" = filterParam === "blocked" ? "blocked" : "all"
  const search = searchParam?.trim() ?? ""

  const currentMember = session
    ? await prisma.member.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })
    : null
  const currentMemberId = currentMember?.id ?? null

  const searchFilter = search ? { displayName: { contains: search, mode: "insensitive" as const } } : {}

  const whereClause = currentMemberId
    ? filter === "blocked"
      ? {
          ...searchFilter,
          BlockedMembers: { some: { active: true, sourceMemberId: currentMemberId } },
        }
      : {
          ...searchFilter,
          NOT: [
            { id: currentMemberId },
            { BlockedMembers: { some: { active: true, sourceMemberId: currentMemberId } } },
          ],
        }
    : searchFilter

  const [total, members] = await Promise.all([
    prisma.member.count({ where: whereClause }),
    prisma.member.findMany({
      where: whereClause,
      select: {
        id: true,
        displayName: true,
        image: true,
        location: { select: { city: true, state: true } },
      },
      orderBy: { displayName: "asc" },
      skip,
      take: PAGE_SIZE,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasPrev = page > 1
  const hasNext = page < totalPages

  const qs = (p: number) => {
    const params = new URLSearchParams()
    params.set("page", String(p))
    params.set("filter", filter)
    if (search) params.set("search", search)
    return `/community?${params.toString()}`
  }

  return (
    <div className="mx-auto w-full max-w-[1130px] px-4 py-3">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight whitespace-nowrap hidden md:block">Community</h1>
        <CommunitySearch initialValue={search} filter={filter} />
        <CommunityFilter filter={filter} />
      </div>

      {members.length === 0 ? (
        <p className="text-muted-foreground text-sm">No members found.</p>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {members.map((member) => (
              <Link key={member.id} href={`/members/${member.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full rounded-lg overflow-hidden">
                  <CardContent className="p-2 flex flex-col items-center gap-1">
                    <div className="relative w-full aspect-square rounded-md overflow-hidden bg-muted">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.displayName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 45vw, (max-width: 1024px) 12vw, 10vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-semibold">
                          {member.displayName[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-center leading-tight w-full truncate">
                      {member.displayName}
                    </p>
                    {member.location && (
                      <p className="text-[10px] text-muted-foreground text-center leading-tight">
                        {member.location.city}, {member.location.state}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
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
