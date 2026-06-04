"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { DashboardMember } from "./DashboardMember"
import { fetchMoreMembers } from "./actions"
import { PAGE_SIZE, type DashboardMemberData } from "./types"

type Props = {
  initialMembers: DashboardMemberData[]
  currentMemberId: string
  distanceFilter: number
  selectedLocationId: string
}

export function DashboardList({ initialMembers, currentMemberId, distanceFilter, selectedLocationId }: Props) {
  const [members, setMembers] = useState<DashboardMemberData[]>(initialMembers)
  const [skip, setSkip] = useState(initialMembers.length)
  const [hasMore, setHasMore] = useState(initialMembers.length === PAGE_SIZE)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const next = await fetchMoreMembers(skip, distanceFilter, selectedLocationId)
      setMembers((prev) => [...prev, ...next])
      setSkip((s) => s + next.length)
      if (next.length < PAGE_SIZE) setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, skip, distanceFilter, selectedLocationId])

  useEffect(() => {
    setMembers(initialMembers)
    setSkip(initialMembers.length)
    setHasMore(initialMembers.length === PAGE_SIZE)
  }, [initialMembers, selectedLocationId])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: "200px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  if (members.length === 0 && !loading) {
    return <p className="text-muted-foreground text-sm">No members found.</p>
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {members.map((member) => (
          <DashboardMember
            key={member.id}
            id={member.id}
            displayName={member.displayName}
            image={member.image}
            description={member.description}
            whatareWelookingFor={member.whatareWelookingFor}
            location={member.location}
            createdAt={new Date(member.createdAt)}
            distanceMiles={member.distanceMiles}
            photos={member.photos}
            isLiked={member.isLiked}
            currentMemberId={currentMemberId}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="h-4" />

      {loading && (
        <div className="flex justify-center py-4">
          <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {!hasMore && members.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-4">No more members.</p>
      )}
    </>
  )
}
