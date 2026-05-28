export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getAllLocations } = await import("@/lib/locationCache")
    await getAllLocations()
  }
}
