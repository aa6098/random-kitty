import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { MemberForm } from "./MemberForm"

export default async function MemberPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  const member = session
    ? await prisma.member.findUnique({
        where: { userId: session.user.id },
        include: {
          location: {
            select: { id: true, city: true, state: true, zip: true },
          },
          photos: {
            where: { delete: false },
            select: { id: true, url: true },
            orderBy: { id: "asc" },
          },
        },
      })
    : null

  return (
    <div className="mx-auto w-full max-w-screen-lg px-4 py-10">
      <MemberForm member={member} />
    </div>
  )
}
