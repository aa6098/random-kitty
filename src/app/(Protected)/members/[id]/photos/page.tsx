import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { generateSasUrl } from "@/lib/azure"
import { MemberPhotoGallery } from "./MemberPhotoGallery"

type Props = { params: Promise<{ id: string }> }

export default async function MemberPhotosPage({ params }: Props) {
  const { id } = await params

  const member = await prisma.member.findUnique({
    where: { id },
    select: {
      displayName: true,
      photos: {
        where: { delete: false },
        select: { id: true, url: true, thumburl: true },
      },
    },
  })

  if (!member) notFound()

  const photos = member.photos.map((p) => ({
    id: p.id,
    url: generateSasUrl(p.url) ?? "",
    thumburl: generateSasUrl(p.thumburl) ?? "",
  }))

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">
        {member.displayName}&apos;s Photos
      </h2>
      <MemberPhotoGallery photos={photos} />
    </div>
  )
}
