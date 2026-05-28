import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { MapPinIcon } from "@phosphor-icons/react/dist/ssr"

type Props = {
  id: string
  displayName: string
  image: string | null
  location: { city: string; state: string }
  distanceMiles: number | null
}

export function MemberCard({ id, displayName, image, location, distanceMiles }: Props) {
  return (
    <Link href={`/members/${id}`} className="group">
      <Card className="overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <img
            src={image ?? "/defaultProfile.jpg"}
            alt={displayName}
            className="size-full object-cover transition-transform group-hover:scale-105"
          />
          <CardContent className="absolute bottom-0 left-0 right-0 p-3 space-y-0.5 bg-white/5 backdrop-blur-[2px]">
            <p className="text-base font-bold leading-snug truncate text-white">{displayName}</p>
            <p className="flex items-center gap-1 text-xs truncate text-white">
              <MapPinIcon size={12} />
              {location.city}, {location.state}
            </p>
            {distanceMiles !== null && (
              <p className="text-sm font-bold text-primary text-muted">
                {distanceMiles < 1
                  ? "< 1 mi away"
                  : `${Math.round(distanceMiles).toLocaleString()} mi away`}
              </p>
            )}
          </CardContent>
        </div>
      </Card>
    </Link>
  )
}
