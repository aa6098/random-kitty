"use client"
import { usePresenceChannel } from "@/hooks/usePresenceChannel"
import { MemberCard } from "./MemberCard"

type Member = {
  id: string
  displayName: string
  image: string | null
  location: { city: string; state: string }
  distanceMiles: number | null
}

type Props = {
  members: Member[]
  likedMemberIds: string[]
}

export function MemberListClient({ members, likedMemberIds }: Props) {
  const onlineIds = usePresenceChannel()
  const likedSet = new Set(likedMemberIds)

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {members.map((member) => (
        <MemberCard
          key={member.id}
          id={member.id}
          displayName={member.displayName}
          image={member.image}
          location={member.location}
          distanceMiles={member.distanceMiles}
          isOnline={onlineIds.has(member.id)}
          isLiked={likedSet.has(member.id)}
        />
      ))}
    </div>
  )
}
