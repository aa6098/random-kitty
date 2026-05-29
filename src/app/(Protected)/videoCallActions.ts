"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"
import { getChatChannel, getUserChannel } from "@/lib/pusherUtils"

async function getCurrentMember() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!member) throw new Error("Member profile not found")
  return member
}

export async function sendCallOffer(
  recipientId: string,
  sdp: RTCSessionDescriptionInit,
  fromName: string,
) {
  const caller = await getCurrentMember()
  const sharedChannel = getChatChannel(caller.id, recipientId)
  await pusherServer.trigger(getUserChannel(recipientId), "call-offer", {
    sdp,
    fromMemberId: caller.id,
    fromName,
    channel: sharedChannel,
  })
}

export async function sendCallAnswer(
  callerId: string,
  sdp: RTCSessionDescriptionInit,
) {
  const current = await getCurrentMember()
  await pusherServer.trigger(
    getChatChannel(current.id, callerId),
    "call-answer",
    { sdp, fromMemberId: current.id },
  )
}

export async function sendIceCandidate(
  otherMemberId: string,
  candidate: RTCIceCandidateInit,
) {
  const current = await getCurrentMember()
  await pusherServer.trigger(
    getChatChannel(current.id, otherMemberId),
    "ice-candidate",
    { candidate, fromMemberId: current.id },
  )
}

export async function sendCallDeclined(callerId: string) {
  const current = await getCurrentMember()
  await pusherServer.trigger(
    getChatChannel(current.id, callerId),
    "call-declined",
    { fromMemberId: current.id },
  )
}

export async function sendCallEnded(otherMemberId: string) {
  const current = await getCurrentMember()
  await pusherServer.trigger(
    getChatChannel(current.id, otherMemberId),
    "call-ended",
    { fromMemberId: current.id },
  )
}
