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
}

export function VideoCall({ currentMemberId, recipientId, recipientName }: Props) {
  const [callState, setCallState] = useState<CallState>("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const incomingOfferRef = useRef<RTCSessionDescriptionInit | null>(null)

  const channelName = getChatChannel(currentMemberId, recipientId)

  // Send a WebRTC signaling event through the server (never expose Pusher secret client-side)
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

  // ── Initiator flow ──────────────────────────────────────────────────────────
  async function startCall() {
    setCallState("calling")
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

  // ── Receiver flow ───────────────────────────────────────────────────────────
  async function acceptCall() {
    if (!incomingOfferRef.current) return
    setCallState("connected")
    const stream = await getLocalStream()
    const pc = buildPeerConnection(stream)
    await pc.setRemoteDescription(incomingOfferRef.current)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    await signal("call-answer", { sdp: answer, fromMemberId: currentMemberId })
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

  // ── Pusher signaling subscription ───────────────────────────────────────────
  useEffect(() => {
    const ch = getPusherClient().subscribe(channelName)

    ch.bind("call-offer", ({ sdp, fromMemberId }: { sdp: RTCSessionDescriptionInit; fromMemberId: string }) => {
      if (fromMemberId === currentMemberId) return
      incomingOfferRef.current = sdp
      setCallState("ringing")
    })

    ch.bind("call-answer", async ({ sdp, fromMemberId }: { sdp: RTCSessionDescriptionInit; fromMemberId: string }) => {
      if (fromMemberId === currentMemberId) return
      await peerConnRef.current?.setRemoteDescription(sdp)
      setCallState("connected")
    })

    ch.bind("ice-candidate", async ({ candidate, fromMemberId }: { candidate: RTCIceCandidateInit; fromMemberId: string }) => {
      if (fromMemberId === currentMemberId) return
      try { await peerConnRef.current?.addIceCandidate(candidate) } catch { /* race: ignore if pc not ready */ }
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

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Button — only shown when idle */}
      {callState === "idle" && (
        <button
          onClick={startCall}
          className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
          title="Start video call"
        >
          <VideoCameraIcon size={16} weight="fill" />
          Video Call
        </button>
      )}

      {/* Full-screen call overlay */}
      {callState !== "idle" && (
        <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950">

          {/* Status bar */}
          <div className="flex items-center px-6 py-4 text-white/80 text-sm">
            {callState === "calling" && `Calling ${recipientName}…`}
            {callState === "ringing" && `Incoming call from ${recipientName}`}
            {callState === "connected" && recipientName}
          </div>

          {/* Video area */}
          <div className="relative flex-1 bg-zinc-900">

            {/* Remote video — fills the frame when connected */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={cn(
                "absolute inset-0 w-full h-full object-cover",
                callState !== "connected" && "hidden"
              )}
            />

            {/* Waiting / ringing placeholder */}
            {callState !== "connected" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/40">
                <VideoCameraIcon size={56} />
                {callState === "calling" && (
                  <p className="text-white/70 animate-pulse text-lg">
                    Waiting for {recipientName}…
                  </p>
                )}
              </div>
            )}

            {/* Local video — centered preview while calling, PiP when connected */}
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={cn(
                "absolute object-cover rounded-xl border border-white/20",
                callState === "connected"
                  ? "bottom-6 right-6 w-40 h-28 shadow-lg"
                  : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-60",
                callState === "ringing" && "hidden"
              )}
            />
          </div>

          {/* Controls bar */}
          <div className="flex items-center justify-center gap-5 py-8 bg-zinc-950">

            {/* Ringing: accept / decline */}
            {callState === "ringing" && (
              <>
                <button
                  onClick={acceptCall}
                  className="flex flex-col items-center gap-1.5 text-white"
                >
                  <span className="rounded-full bg-green-500 hover:bg-green-600 p-5 flex items-center justify-center transition-colors">
                    <PhoneIcon size={28} weight="fill" />
                  </span>
                  <span className="text-xs text-white/60">Accept</span>
                </button>
                <button
                  onClick={declineCall}
                  className="flex flex-col items-center gap-1.5 text-white"
                >
                  <span className="rounded-full bg-red-500 hover:bg-red-600 p-5 flex items-center justify-center transition-colors">
                    <PhoneSlashIcon size={28} weight="fill" />
                  </span>
                  <span className="text-xs text-white/60">Decline</span>
                </button>
              </>
            )}

            {/* Calling / connected: mute, camera, end */}
            {(callState === "calling" || callState === "connected") && (
              <>
                {callState === "connected" && (
                  <button
                    onClick={toggleMute}
                    className="flex flex-col items-center gap-1.5 text-white"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    <span className={cn(
                      "rounded-full p-4 flex items-center justify-center transition-colors",
                      isMuted ? "bg-white/30" : "bg-white/10 hover:bg-white/20"
                    )}>
                      {isMuted
                        ? <MicrophoneSlashIcon size={22} weight="fill" />
                        : <MicrophoneIcon size={22} weight="fill" />
                      }
                    </span>
                    <span className="text-xs text-white/60">{isMuted ? "Unmute" : "Mute"}</span>
                  </button>
                )}

                <button
                  onClick={endCall}
                  className="flex flex-col items-center gap-1.5 text-white"
                  title="End call"
                >
                  <span className="rounded-full bg-red-500 hover:bg-red-600 p-5 flex items-center justify-center transition-colors">
                    <PhoneSlashIcon size={28} weight="fill" />
                  </span>
                  <span className="text-xs text-white/60">End</span>
                </button>

                {callState === "connected" && (
                  <button
                    onClick={toggleCamera}
                    className="flex flex-col items-center gap-1.5 text-white"
                    title={isCameraOff ? "Camera on" : "Camera off"}
                  >
                    <span className={cn(
                      "rounded-full p-4 flex items-center justify-center transition-colors",
                      isCameraOff ? "bg-white/30" : "bg-white/10 hover:bg-white/20"
                    )}>
                      {isCameraOff
                        ? <CameraSlashIcon size={22} weight="fill" />
                        : <CameraIcon size={22} weight="fill" />
                      }
                    </span>
                    <span className="text-xs text-white/60">{isCameraOff ? "Camera on" : "Camera off"}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
