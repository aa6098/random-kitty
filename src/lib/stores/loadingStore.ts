import { create } from "zustand"

type LoadingStore = {
  count: number
  message: string
  show: (message?: string) => void
  hide: () => void
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  count: 0,
  message: "Please wait…",
  show: (message = "Please wait…") =>
    set((s) => ({ count: s.count + 1, message })),
  hide: () =>
    set((s) => ({
      count: Math.max(0, s.count - 1),
      message: s.count <= 1 ? "Please wait…" : s.message,
    })),
}))
