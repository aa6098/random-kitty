import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export default async function PostSignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/signin")

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })

  redirect(member ? "/memberhome" : "/member")
}
