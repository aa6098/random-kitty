"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  VideoCameraIcon,
  PhoneSlashIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  CameraIcon,
  CameraSlashIcon,
} from "@phosphor-icons/react"
import { getPusherClient } from "@/lib/pusherClient"
import { getChatChannel } from "@/lib/pusherUtils"
import { useUserStore } from "@/lib/stores/userStore"
import { cn } from "@/lib/utils"
import { sendCallOffer, sendIceCandidate, sendCallEnded } from "@/app/(Protected)/videoCallActions"

type CallState = "idle" | "calling" | "connected"

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
}

type Props = {
  currentMemberId: string
  recipientId: string
  recipientName: string
  triggerClassName?: string
  triggerContent?: React.ReactNode
}

export function VideoCall({ currentMemberId, recipientId, recipientName, triggerClassName, triggerContent }: Props) {
  const callerName = useUserStore((s) => s.name)
  const [callState, setCallState] = useState<CallState>("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const iceCandidateBuffer = useRef<RTCIceCandidateInit[]>([])

  const channelName = getChatChannel(currentMemberId, recipientId)

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
    iceCandidateBuffer.current = []
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    setCallState("idle")
    setIsMuted(false)
    setIsCameraOff(false)
  }, [])

  async function flushIceCandidateBuffer(pc: RTCPeerConnection) {
    for (const candidate of iceCandidateBuffer.current) {
      try { await pc.addIceCandidate(candidate) } catch { /* ignore stale */ }
    }
    iceCandidateBuffer.current = []
  }

  function buildPeerConnection(stream: MediaStream) {
    const pc = new RTCPeerConnection(ICE_SERVERS)
    stream.getTracks().forEach(track => pc.addTrack(track, stream))

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) sendIceCandidate(recipientId, candidate.toJSON())
    }

    pc.ontrack = ({ streams }) => {
      if (remoteVideoRef.current && streams[0]) {
        remoteVideoRef.current.srcObject = streams[0]
      }
    }

    peerConnRef.current = pc
    return pc
  }

  async function startCall() {
    setCallState("calling")
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localStreamRef.current = stream
    if (localVideoRef.current) localVideoRef.current.srcObject = stream

    const pc = buildPeerConnection(stream)
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    await sendCallOffer(recipientId, offer, callerName ?? "")
  }

  async function endCall() {
    await sendCallEnded(recipientId)
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

  useEffect(() => {
    const ch = getPusherClient().subscribe(channelName)

    ch.bind("call-answer", async ({ sdp, fromMemberId }: { sdp: RTCSessionDescriptionInit; fromMemberId: string }) => {
      if (fromMemberId === currentMemberId) return
      const pc = peerConnRef.current
      if (!pc) return
      await pc.setRemoteDescription(sdp)
      await flushIceCandidateBuffer(pc)
      setCallState("connected")
    })

    ch.bind("ice-candidate", async ({ candidate, fromMemberId }: { candidate: RTCIceCandidateInit; fromMemberId: string }) => {
      if (fromMemberId === currentMemberId) return
      const pc = peerConnRef.current
      if (pc?.remoteDescription) {
        try { await pc.addIceCandidate(candidate) } catch { /* ignore */ }
      } else {
        iceCandidateBuffer.current.push(candidate)
      }
    })

    ch.bind("call-declined", ({ fromMemberId }: { fromMemberId: string }) => {
      if (fromMemberId === currentMemberId) return
      stopCall()
    })

    ch.bind("call-ended", ({ fromMemberId }: { fromMemberId: string }) => {
      if (fromMemberId === currentMemberId) return
      stopCall()
    })

    return () => {
      ch.unbind("call-answer")
      ch.unbind("ice-candidate")
      ch.unbind("call-declined")
      ch.unbind("call-ended")
    }
  }, [channelName, currentMemberId, stopCall])

  return (
    <>
      {callState === "idle" && (
        <button
          onClick={startCall}
          className={triggerClassName ?? "inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"}
          title="Start video call"
        >
          {triggerContent ?? (
            <>
              <VideoCameraIcon size={16} weight="fill" />
              Video Call
            </>
          )}
        </button>
      )}

      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4",
          callState === "idle" ? "hidden" : "flex"
        )}
      >
        <div className="flex w-full max-w-[576px] flex-col overflow-hidden rounded-2xl bg-zinc-950 shadow-2xl">
          <div className="shrink-0 px-4 py-3 text-sm text-white/70">
            {callState === "calling"   && `Calling ${recipientName}…`}
            {callState === "connected" && recipientName}
          </div>

          <div className="relative w-full overflow-hidden bg-zinc-900" style={{ aspectRatio: "16/9" }}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={cn("absolute inset-0 h-full w-full object-cover", callState !== "connected" && "hidden")}
            />

            {callState !== "connected" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/30">
                <VideoCameraIcon size={40} />
                <p className="animate-pulse text-sm text-white/60">Waiting for {recipientName}…</p>
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
                callState === "calling"   && "left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-xl",
              )}
            />
          </div>

          <div className="flex shrink-0 items-center justify-center gap-4 bg-zinc-950 py-4">
            {callState === "connected" && (
              <CallButton onClick={toggleMute} color={isMuted ? "dim" : "ghost"} label={isMuted ? "Unmute" : "Mute"}>
                {isMuted ? <MicrophoneSlashIcon size={18} weight="fill" /> : <MicrophoneIcon size={18} weight="fill" />}
              </CallButton>
            )}

            <CallButton onClick={endCall} color="red" label="End">
              <PhoneSlashIcon size={22} weight="fill" />
            </CallButton>

            {callState === "connected" && (
              <CallButton onClick={toggleCamera} color={isCameraOff ? "dim" : "ghost"} label={isCameraOff ? "Cam on" : "Cam off"}>
                {isCameraOff ? <CameraSlashIcon size={18} weight="fill" /> : <CameraIcon size={18} weight="fill" />}
              </CallButton>
            )}
          </div>
        </div>
      </div>
    </>
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
