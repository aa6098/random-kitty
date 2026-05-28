import prisma from "@/lib/prisma"

export type CachedLocation = { id: string; lat: number; lng: number }

let cache: CachedLocation[] | null = null

export async function getAllLocations(): Promise<CachedLocation[]> {
  if (!cache) {
    cache = await prisma.location.findMany({
      select: { id: true, lat: true, lng: true },
    })
  }
  return cache
}

export function invalidateLocationCache(): void {
  cache = null
}
