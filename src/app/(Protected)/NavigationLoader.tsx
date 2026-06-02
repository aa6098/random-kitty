"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useLoadingStore } from "@/lib/stores/loadingStore"

export function NavigationLoader() {
  const pathname = usePathname()
  const show = useLoadingStore((s) => s.show)
  const hide = useLoadingStore((s) => s.hide)

  // Show overlay on any same-origin link click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null
      if (!anchor) return
      if (anchor.target === "_blank") return
      try {
        const url = new URL(anchor.href, window.location.href)
        if (url.origin !== window.location.origin) return
        if (url.hash && url.pathname === window.location.pathname) return
        show()
      } catch {
        // ignore unparseable hrefs
      }
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [show])

  // Hide overlay when navigation completes (pathname changes)
  useEffect(() => {
    hide()
  }, [pathname, hide])

  return null
}
