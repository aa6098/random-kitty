import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  href: string
  disabled: boolean
  label: string
  children: React.ReactNode
}

export function NavButton({ href, disabled, label, children }: Props) {
  const cls = cn(buttonVariants({ variant: "outline", size: "icon" }), "size-8")
  if (disabled) {
    return (
      <span aria-disabled="true" aria-label={label} className={cn(cls, "opacity-50 pointer-events-none")}>
        {children}
      </span>
    )
  }
  return (
    <Link href={href} aria-label={label} className={cls}>
      {children}
    </Link>
  )
}
