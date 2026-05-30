"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  PhoneIcon,
  PhoneSlashIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  CameraIcon,
  CameraSlashIcon,
  PhoneXIcon,
} from "@phosphor-icons/react"
import { getPusherClient } from "@/lib/pusherClient"
import { getChatChannel, getUserChannel } from "@/lib/pusherUtils"
import { cn } from "@/lib/utils"
import { useUserStore } from "@/lib/stores/userStore"
import {
  sendCallAnswer,
  sendIceCandidate,
  sendCallDeclined,
  sendCallEnded,
} from "./videoCallActions"

type CallState = "idle" | "ringing" | "connected"

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
}

type Props = {
  currentMemberId: string
}

export function IncomingCallListener({ currentMemberId }: Props) {
  const router = useRouter()
  const [callState, setCallState] = useState<CallState>("idle")
  const [callerName, setCallerName] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)

  const incrementMissedCall = useUserStore((s) => s.incrementMissedCall)

  // Refs to capture values before stopCall() resets them
  const callerNameRef = useRef("")
  useEffect(() => { callerNameRef.current = callerName }, [callerName])

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const incomingOfferRef = useRef<RTCSessionDescriptionInit | null>(null)
  const callerIdRef = useRef<string>("")
  const iceCandidateBuffer = useRef<RTCIceCandidateInit[]>([])
  // True when the user actively declines so we don't count it as a missed call
  const declinedByUserRef = useRef(false)

  // Safety-net: sync local stream → video element after every render.
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current
    }
  })

  const stopCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    localStreamRef.current = null
    peerConnRef.current?.close()
    peerConnRef.current = null
    incomingOfferRef.current = null
    callerIdRef.current = ""
    iceCandidateBuffer.current = []
    declinedByUserRef.current = false
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    setCallState("idle")
    setCallerName("")
    setIsMuted(false)
    setIsCameraOff(false)
  }, [])

  async function flushIceCandidateBuffer(pc: RTCPeerConnection) {
    for (const candidate of iceCandidateBuffer.current) {
      try { await pc.addIceCandidate(candidate) } catch { /* ignore stale */ }
    }
    iceCandidateBuffer.current = []
  }

  async function acceptCall() {
    if (!incomingOfferRef.current) return
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localStreamRef.current = stream
    if (localVideoRef.current) localVideoRef.current.srcObject = stream

    const pc = new RTCPeerConnection(ICE_SERVERS)
    stream.getTracks().forEach(track => pc.addTrack(track, stream))

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) sendIceCandidate(callerIdRef.current, candidate.toJSON())
    }

    pc.ontrack = ({ streams }) => {
      if (remoteVideoRef.current && streams[0]) {
        remoteVideoRef.current.srcObject = streams[0]
      }
    }

    peerConnRef.current = pc
    await pc.setRemoteDescription(incomingOfferRef.current)
    await flushIceCandidateBuffer(pc)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    await sendCallAnswer(callerIdRef.current, answer)
    setCallState("connected")
  }

  async function declineCall() {
    declinedByUserRef.current = true
    await sendCallDeclined(callerIdRef.current)
    stopCall()
  }

  async function endCall() {
    await sendCallEnded(callerIdRef.current)
    stopCall()
  }

  function toggleMute() {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
    setIsMuted(prev => !prev)
  }

  function toggleCamera() {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setIsCameraOff(prev => !prev)
  }

  // Subscribe to personal notification channel for incoming call offers
  useEffect(() => {
    const ch = getPusherClient().subscribe(getUserChannel(currentMemberId))

    ch.bind("call-offer", ({ sdp, fromMemberId, fromName }: {
      sdp: RTCSessionDescriptionInit
      fromMemberId: string
      fromName: string
      channel: string
    }) => {
      if (fromMemberId === currentMemberId) return
      incomingOfferRef.current = sdp
      callerIdRef.current = fromMemberId
      setCallerName(fromName)
      setCallState("ringing")
    })

    return () => {
      getPusherClient().unsubscribe(getUserChannel(currentMemberId))
    }
  }, [currentMemberId])

  // Subscribe to shared chat channel once a call is in progress
  useEffect(() => {
    if (callState === "idle" || !callerIdRef.current) return
    const channelName = getChatChannel(currentMemberId, callerIdRef.current)
    const ch = getPusherClient().subscribe(channelName)

    ch.bind("ice-candidate", async ({ candidate, fromMemberId }: { candidate: RTCIceCandidateInit; fromMemberId: string }) => {
      if (fromMemberId === currentMemberId) return
      const pc = peerConnRef.current
      if (pc?.remoteDescription) {
        try { await pc.addIceCandidate(candidate) } catch { /* ignore */ }
      } else {
        iceCandidateBuffer.current.push(candidate)
      }
    })

    ch.bind("call-ended", ({ fromMemberId }: { fromMemberId: string }) => {
      if (fromMemberId === currentMemberId) return
      if (callState === "ringing" && !declinedByUserRef.current) {
        // Capture values before stopCall() resets them
        const missedName = callerNameRef.current
        const missedId = callerIdRef.current
        incrementMissedCall()
        toast.custom(() => (
          <button
            onClick={() => {
              toast.dismiss("missed-call")
              router.push(`/members/${missedId}/messages`)
            }}
            className="flex items-center gap-3 w-full max-w-sm rounded-xl border border-primary bg-popover text-foreground shadow-lg px-4 py-3 text-left hover:bg-accent transition-colors"
          >
            <span className="flex items-center justify-center size-9 rounded-full bg-red-500/10 text-red-500 shrink-0">
              <PhoneXIcon size={18} weight="fill" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Missed call</p>
              <p className="text-sm text-muted-foreground truncate">{missedName}</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Click to open chat</p>
            </div>
          </button>
        ), { id: "missed-call", duration: 15000 })
      }
      stopCall()
    })

    return () => {
      ch.unbind("ice-candidate")
      ch.unbind("call-ended")
    }
  }, [callState, currentMemberId, stopCall])

  if (callState === "idle") return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex w-full max-w-[576px] flex-col overflow-hidden rounded-2xl bg-zinc-950 shadow-2xl">

        <div className="shrink-0 px-4 py-3 text-sm text-white/70">
          {callState === "ringing"   && `Incoming call from ${callerName}`}
          {callState === "connected" && callerName}
        </div>

        <div className="relative w-full overflow-hidden bg-zinc-900" style={{ aspectRatio: "16/9" }}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={cn("absolute inset-0 h-full w-full object-cover", callState !== "connected" && "hidden")}
          />

          {callState === "ringing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/30">
              <VideoCameraIcon size={40} />
            </div>
          )}

          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={cn(
              "absolute object-cover rounded-lg border border-white/20",
              callState === "connected" && "bottom-2 right-2 h-[22%] w-[30%] shadow-lg",
              callState === "ringing"   && "hidden",
            )}
          />
        </div>

        <div className="flex shrink-0 items-center justify-center gap-4 bg-zinc-950 py-4">
          {callState === "ringing" && (
            <>
              <CallButton onClick={acceptCall} color="green" label="Accept">
                <PhoneIcon size={22} weight="fill" />
              </CallButton>
              <CallButton onClick={declineCall} color="red" label="Decline">
                <PhoneSlashIcon size={22} weight="fill" />
              </CallButton>
            </>
          )}

          {callState === "connected" && (
            <>
              <CallButton onClick={toggleMute} color={isMuted ? "dim" : "ghost"} label={isMuted ? "Unmute" : "Mute"}>
                {isMuted ? <MicrophoneSlashIcon size={18} weight="fill" /> : <MicrophoneIcon size={18} weight="fill" />}
              </CallButton>
              <CallButton onClick={endCall} color="red" label="End">
                <PhoneSlashIcon size={22} weight="fill" />
              </CallButton>
              <CallButton onClick={toggleCamera} color={isCameraOff ? "dim" : "ghost"} label={isCameraOff ? "Cam on" : "Cam off"}>
                {isCameraOff ? <CameraSlashIcon size={18} weight="fill" /> : <CameraIcon size={18} weight="fill" />}
              </CallButton>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function CallButton({
  onClick,
  color,
  label,
  children,
}: {
  onClick: () => void
  color: "green" | "red" | "ghost" | "dim"
  label: string
  children: React.ReactNode
}) {
  const bg = {
    green: "bg-green-500 hover:bg-green-600",
    red:   "bg-red-500   hover:bg-red-600",
    ghost: "bg-white/10  hover:bg-white/20",
    dim:   "bg-white/30  hover:bg-white/40",
  }[color]

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 text-white">
      <span className={cn("flex items-center justify-center rounded-full p-4 transition-colors", bg)}>
        {children}
      </span>
      <span className="text-xs text-white/50">{label}</span>
    </button>
  )
}
