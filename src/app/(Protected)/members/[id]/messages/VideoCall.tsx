"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  VideoCameraIcon,
  PhoneIcon,
  PhoneSlashIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  CameraIcon,
  CameraSlashIcon,
} from "@phosphor-icons/react"
import { getPusherClient } from "@/lib/pusherClient"
import { getChatChannel } from "@/lib/pusherUtils"
import { cn } from "@/lib/utils"

type CallState = "idle" | "calling" | "ringing" | "connected"

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
}

export function VideoCall({ currentMemberId, recipientId, recipientName, triggerClassName }: Props) {
  const [callState, setCallState] = useState<CallState>("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const incomingOfferRef = useRef<RTCSessionDescriptionInit | null>(null)
  // Buffer ICE candidates that arrive before setRemoteDescription is called
  const iceCandidateBuffer = useRef<RTCIceCandidateInit[]>([])

  const channelName = getChatChannel(currentMemberId, recipientId)

  // Safety-net: sync local stream → video element after every render.
  // Needed because setCallState() and getUserMedia() are async — the video
  // element may not be in the DOM yet when the stream first arrives.
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current
    }
  })

  async function signal(event: string, data: unknown) {
    await fetch("/api/pusher/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: channelName, event, data }),
    })
  }

  const stopCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    localStreamRef.current = null
    peerConnRef.current?.close()
    peerConnRef.current = null
    incomingOfferRef.current = null
    iceCandidateBuffer.current = []
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    setCallState("idle")
    setIsMuted(false)
    setIsCameraOff(false)
  }, [])

  async function getLocalStream() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localStreamRef.current = stream
    if (localVideoRef.current) localVideoRef.current.srcObject = stream
    return stream
  }

  function buildPeerConnection(stream: MediaStream) {
    const pc = new RTCPeerConnection(ICE_SERVERS)
    stream.getTracks().forEach(track => pc.addTrack(track, stream))

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) signal("ice-candidate", { candidate, fromMemberId: currentMemberId })
    }

    pc.ontrack = ({ streams }) => {
      if (remoteVideoRef.current && streams[0]) {
        remoteVideoRef.current.srcObject = streams[0]
      }
    }

    peerConnRef.current = pc
    return pc
  }

  // Drain any ICE candidates that arrived before setRemoteDescription
  async function flushIceCandidateBuffer(pc: RTCPeerConnection) {
    for (const candidate of iceCandidateBuffer.current) {
      try { await pc.addIceCandidate(candidate) } catch { /* ignore stale */ }
    }
    iceCandidateBuffer.current = []
  }

  // ── Initiator ───────────────────────────────────────────────────────────────
  async function startCall() {
    setCallState("calling")
    // getUserMedia shows a permission dialog — by the time it resolves,
    // React will have re-rendered the overlay so localVideoRef is valid.
    const stream = await getLocalStream()
    const pc = buildPeerConnection(stream)
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    await signal("call-offer", { sdp: offer, fromMemberId: currentMemberId })
  }

  async function endCall() {
    await signal("call-ended", { fromMemberId: currentMemberId })
    stopCall()
  }

  // ── Receiver ────────────────────────────────────────────────────────────────
  async function acceptCall() {
    if (!incomingOfferRef.current) return
    const stream = await getLocalStream()
    const pc = buildPeerConnection(stream)
    await pc.setRemoteDescription(incomingOfferRef.current)
    // Flush any candidates that arrived before we set remote description
    await flushIceCandidateBuffer(pc)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    await signal("call-answer", { sdp: answer, fromMemberId: currentMemberId })
    // Mark connected only after the full SDP exchange is done
    setCallState("connected")
  }

  async function declineCall() {
    await signal("call-declined", { fromMemberId: currentMemberId })
    stopCall()
  }

  // ── Controls ────────────────────────────────────────────────────────────────
  function toggleMute() {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
    setIsMuted(prev => !prev)
  }

  function toggleCamera() {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setIsCameraOff(prev => !prev)
  }

  // ── Pusher signaling ─────────────────────────────────────────────────────────
  useEffect(() => {
    const ch = getPusherClient().subscribe(channelName)

    ch.bind("call-offer", ({ sdp, fromMemberId }: { sdp: RTCSessionDescriptionInit; fromMemberId: string }) => {
      if (fromMemberId === currentMemberId) return
      incomingOfferRef.current = sdp
      setCallState("ringing")
    })

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
        // Remote description not set yet — buffer for later
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
      ch.unbind("call-offer")
      ch.unbind("call-answer")
      ch.unbind("ice-candidate")
      ch.unbind("call-declined")
      ch.unbind("call-ended")
    }
  }, [channelName, currentMemberId, stopCall])

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {callState === "idle" && (
        <button
          onClick={startCall}
          className={triggerClassName ?? "inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"}
          title="Start video call"
        >
          <VideoCameraIcon size={16} weight="fill" />
          Video Call
        </button>
      )}

      {/*
        Backdrop + centred card. CSS display toggle (not conditional render) keeps
        localVideoRef / remoteVideoRef always mounted so refs are valid when streams arrive.
        Max width 576 px ≈ 6 inches at 96 dpi; scales down on smaller screens via p-4 padding.
      */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4",
          callState === "idle" ? "hidden" : "flex"
        )}
      >
        <div className="flex w-full max-w-[576px] flex-col overflow-hidden rounded-2xl bg-zinc-950 shadow-2xl">

          {/* Status bar */}
          <div className="shrink-0 px-4 py-3 text-sm text-white/70">
            {callState === "calling"   && `Calling ${recipientName}…`}
            {callState === "ringing"   && `Incoming call from ${recipientName}`}
            {callState === "connected" && recipientName}
          </div>

          {/* Video area — fixed 16:9 aspect ratio so it scales with the card width */}
          <div className="relative w-full overflow-hidden bg-zinc-900" style={{ aspectRatio: "16/9" }}>

            {/* Remote — fills frame when connected */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={cn("absolute inset-0 h-full w-full object-cover", callState !== "connected" && "hidden")}
            />

            {/* Placeholder while not yet connected */}
            {callState !== "connected" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/30">
                <VideoCameraIcon size={40} />
                {callState === "calling" && (
                  <p className="animate-pulse text-sm text-white/60">Waiting for {recipientName}…</p>
                )}
              </div>
            )}

            {/* Local preview: centred (60% of container) while calling; PiP corner when connected; hidden when ringing */}
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={cn(
                "absolute object-cover rounded-lg border border-white/20",
                callState === "connected" && "bottom-2 right-2 h-[22%] w-[30%] shadow-lg",
                callState === "calling"   && "left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-xl",
                callState === "ringing"   && "hidden"
              )}
            />
          </div>

          {/* Controls */}
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

            {(callState === "calling" || callState === "connected") && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Small helper to keep button markup DRY
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
