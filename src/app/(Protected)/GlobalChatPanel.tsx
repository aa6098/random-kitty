"use client"

import { useUserStore } from "@/lib/stores/userStore"
import { ChatPanel } from "./dashboard/ChatPanel"

type Props = {
  currentMemberId: string
}

export function GlobalChatPanel({ currentMemberId }: Props) {
  const chatRecipient = useUserStore((s) => s.chatRecipient)
  const closeChat = useUserStore((s) => s.closeChat)

  return (
    <ChatPanel
      isOpen={chatRecipient !== null}
      onClose={closeChat}
      currentMemberId={currentMemberId}
      recipientId={chatRecipient?.id ?? ""}
      recipientName={chatRecipient?.name ?? ""}
    />
  )
}
