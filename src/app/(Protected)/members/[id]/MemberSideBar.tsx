import { MapPinIcon } from "@phosphor-icons/react/dist/ssr"
import { MemberSideBarTabs } from "./MemberSideBarTabs"
import { VideoCall } from "./messages/VideoCall"

type Props = {
  member: {
    id: string
    displayName: string
    image: string | null
    location: { city: string; state: string }
  }
  currentMemberId: string | null
}

export function MemberSideBar({ member, currentMemberId }: Props) {
  const showVideoCall = currentMemberId && currentMemberId !== member.id

  return (
    <aside className="flex flex-col w-full md:w-60 shrink-0 border border-border rounded-lg overflow-hidden bg-card">
      <div className="flex flex-col items-center gap-3 p-6">
        <div className="size-32 rounded-full overflow-hidden bg-muted ring-2 ring-border">
          <img
            src={member.image ?? "/defaultProfile.jpg"}
            alt={member.displayName}
            className="size-full object-cover"
          />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-lg font-semibold leading-tight">{member.displayName}</p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPinIcon size={14} />
            {member.location.city}, {member.location.state}
          </p>
          {showVideoCall && (
              <VideoCall
                currentMemberId={currentMemberId}
                recipientId={member.id}
                recipientName=""

                triggerClassName="w-full px-4 py-2.5 text-sm font-medium border-b border-border transition-colors hover:bg-muted text-foreground flex items-center gap-2"
              />
          )}
        </div>
      </div>
      <MemberSideBarTabs memberId={member.id} currentMemberId={currentMemberId} />
    </aside>
  )
}
