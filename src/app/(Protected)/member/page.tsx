import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { generateSasUrl } from "@/lib/azure"
import { MemberTabs } from "./MemberTabs"

export default async function MemberPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  const member = session
    ? await prisma.member.findUnique({
        where: { userId: session.user.id },
        include: {
          location: { select: { id: true, city: true, state: true, zip: true } },
          photos: {
            where: { delete: false },
            select: { id: true, url: true, thumburl: true },
          },
        },
      })
    : null

  const previewImageUrl = member?.image ? generateSasUrl(member.image) : null

  const photos = (member?.photos ?? []).map((p) => ({
    id: p.id,
    url: generateSasUrl(p.url) ?? "",
    thumburl: generateSasUrl(p.thumburl) ?? "",
  }))

  return (
    <div className="mx-auto w-full max-w-screen-lg px-4 py-10">
      <MemberTabs
        member={
          member
            ? {
                id: member.id,
                displayName: member.displayName,
                image: member.image,
                description: member.description,
                whatareWelookingFor: member.whatareWelookingFor,
                location: member.location,
              }
            : null
        }
        previewImageUrl={previewImageUrl}
        initialPhotos={photos}
      />
    </div>
  )
}
