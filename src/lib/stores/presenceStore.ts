import { create } from "zustand"

type PresenceStore = {
  onlineIds: Set<string>
  setOnline: (ids: Set<string>) => void
  addOnline: (id: string) => void
  removeOnline: (id: string) => void
}

export const usePresenceStore = create<PresenceStore>((set) => ({
  onlineIds: new Set(),
  setOnline: (ids) => set({ onlineIds: ids }),
  addOnline: (id) => set((s) => ({ onlineIds: new Set(s.onlineIds).add(id) })),
  removeOnline: (id) => set((s) => {
    const next = new Set(s.onlineIds)
    next.delete(id)
    return { onlineIds: next }
  }),
}))
