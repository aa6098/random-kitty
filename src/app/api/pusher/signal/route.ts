import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { channel, event, data } = await req.json()

  if (typeof channel !== "string" || !channel.includes(member.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await pusherServer.trigger(channel, event, data)
  return NextResponse.json({ ok: true })
}
