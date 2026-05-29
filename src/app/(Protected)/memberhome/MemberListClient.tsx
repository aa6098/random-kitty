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
}

export function MemberListClient({ members }: Props) {
  const onlineIds = usePresenceChannel()

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
        />
      ))}
    </div>
  )
}
