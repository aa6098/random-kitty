import { create } from "zustand"

type ChatRecipient = { id: string; name: string }

type UserStore = {
  name: string | null
  image: string | null
  unreadCount: number
  missedCallCount: number
  deactivated: boolean
  hasMember: boolean
  chatRecipient: ChatRecipient | null
  setUser: (name: string | null, image: string | null) => void
  setUnreadCount: (count: number) => void
  setDeactivated: (deactivated: boolean) => void
  setHasMember: (hasMember: boolean) => void
  incrementUnread: () => void
  incrementMissedCall: () => void
  clearMissedCalls: () => void
  openChat: (id: string, name: string) => void
  closeChat: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  name: null,
  image: null,
  unreadCount: 0,
  missedCallCount: 0,
  deactivated: false,
  hasMember: true,
  chatRecipient: null,
  setUser: (name, image) => set({ name, image }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  setDeactivated: (deactivated) => set({ deactivated }),
  setHasMember: (hasMember) => set({ hasMember }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  incrementMissedCall: () => set((s) => ({ missedCallCount: s.missedCallCount + 1 })),
  clearMissedCalls: () => set({ missedCallCount: 0 }),
  openChat: (id, name) => set({ chatRecipient: { id, name } }),
  closeChat: () => set({ chatRecipient: null }),
}))
