"use client"

import { useLoadingStore } from "@/lib/stores/loadingStore"

export function LoadingOverlay() {
  const count = useLoadingStore((s) => s.count)
  const message = useLoadingStore((s) => s.message)
  if (count === 0) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
      <div className="flex flex-col items-center gap-3 rounded-xl bg-background/90 px-8 py-6 shadow-xl border border-border">
        <div className="relative size-10">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>
    </div>
  )
}
