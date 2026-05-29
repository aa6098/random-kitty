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

  const body = await req.text()
  const params = new URLSearchParams(body)
  const socketId = params.get("socket_id")
  const channel = params.get("channel_name")

  if (!socketId || !channel) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }

  // Presence channels: any authenticated member can join
  if (channel.startsWith("presence-")) {
    const authResponse = pusherServer.authorizeChannel(socketId, channel, {
      user_id: member.id,
      user_info: {},
    })
    return NextResponse.json(authResponse)
  }

  // Private channels: only authorize if this member is part of the channel
  if (!channel.includes(member.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const authResponse = pusherServer.authorizeChannel(socketId, channel)
  return NextResponse.json(authResponse)
}
