import { notFound } from "next/navigation"
import { CalendarBlankIcon, MapPinIcon } from "@phosphor-icons/react/dist/ssr"
import prisma from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Props = { params: Promise<{ id: string }> }

export default async function MemberProfilePage({ params }: Props) {
  const { id } = await params

  const member = await prisma.member.findUnique({
    where: { id },
    select: {
      displayName: true,
      description: true,
      whatareWelookingFor: true,
      createdAt: true,
      location: { select: { city: true, state: true } },
    },
  })

  if (!member) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          About {member.displayName}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
          <CalendarBlankIcon size={14} />
          Member since{" "}
          {member.createdAt.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* About Us */}
          <div className="space-y-1.5">
            <Label className="font-bold">About Us:</Label>
            {/* <Textarea
              readOnly
              defaultValue={member.description}
              className="min-h-[120px] resize-none bg-muted/50 cursor-default focus-visible:ring-0"
            /> */}
            <p>{member.description ?? "Not specified"}</p>

          </div>

          {/* What Are We Looking For */}
          <div className="space-y-1.5">
            <Label className="font-bold">What Are We Looking For:</Label>
            {/* <Textarea
              readOnly
              defaultValue={member.whatareWelookingFor ?? "Not specified"}
              className="min-h-[120px] resize-none bg-muted/50 cursor-default focus-visible:ring-0"
            /> */}

            <p>{member.whatareWelookingFor ?? "Not specified"}</p>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label className="font-bold">Location:</Label>
            <p className="flex items-center gap-1.5 text-sm text-foreground">
              <MapPinIcon size={14} className="text-muted-foreground shrink-0" />
              {member.location
                ? `${member.location.city}, ${member.location.state}`
                : "Not specified"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
