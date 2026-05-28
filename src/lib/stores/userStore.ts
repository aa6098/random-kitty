import { create } from "zustand"

type UserStore = {
  name: string | null
  image: string | null
  setUser: (name: string | null, image: string | null) => void
}

export const useUserStore = create<UserStore>((set) => ({
  name: null,
  image: null,
  setUser: (name, image) => set({ name, image }),
}))
