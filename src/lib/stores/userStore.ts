import { create } from "zustand"

type UserStore = {
  name: string | null
  image: string | null
  unreadCount: number
  missedCallCount: number
  setUser: (name: string | null, image: string | null) => void
  setUnreadCount: (count: number) => void
  incrementUnread: () => void
  incrementMissedCall: () => void
  clearMissedCalls: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  name: null,
  image: null,
  unreadCount: 0,
  missedCallCount: 0,
  setUser: (name, image) => set({ name, image }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  incrementMissedCall: () => set((s) => ({ missedCallCount: s.missedCallCount + 1 })),
  clearMissedCalls: () => set({ missedCallCount: 0 }),
}))
