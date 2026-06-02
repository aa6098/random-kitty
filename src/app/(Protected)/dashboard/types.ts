export const PAGE_SIZE = 5

export type DashboardMemberData = {
  id: string
  displayName: string
  image: string | null
  description: string
  whatareWelookingFor: string | null
  location: { city: string; state: string }
  distanceMiles: number | null
  createdAt: string
  photos: { id: string; url: string; thumburl: string }[]
  isLiked: boolean
}
