import { notFound } from "next/navigation"
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/ssr"
import prisma from "@/lib/prisma"

type Props = { params: Promise<{ id: string }> }

export default async function MemberProfilePage({ params }: Props) {
  const { id } = await params

  const member = await prisma.member.findUnique({
    where: { id },
    select: {
      displayName: true,
      description: true,
      createdAt: true,
    },
  })

  if (!member) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">About {member.displayName}</h2>
        <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
          <CalendarBlankIcon size={14} />
          Member since {member.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>

      <p className="text-sm leading-relaxed whitespace-pre-wrap">{member.description}</p>
    </div>
  )
}
