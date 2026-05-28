import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { MemberSideBar } from "./MemberSideBar"

type Props = {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function MemberLayout({ children, params }: Props) {
  const { id } = await params

  const member = await prisma.member.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      image: true,
      location: { select: { city: true, state: true } },
    },
  })

  if (!member) notFound()

  return (
    <div className="mx-auto w-full max-w-[1130px] flex flex-1 flex-col md:flex-row gap-6 px-4 py-6">
      <MemberSideBar member={member} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
