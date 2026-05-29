import Image from "next/image";
import Link from "next/link";
import logo from "@/app/logo.png";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          {/* Branding */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
          <Image src={logo} alt="Random Kitty" width={75} height={75} />
            <span className="text-base hidden md:block font-semibold tracking-tight">Random Kitty</span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link
              href="/signin"
              className="opacity-90 hover:opacity-100 underline-offset-2 hover:underline transition-opacity"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="opacity-90 hover:opacity-100 underline-offset-2 hover:underline transition-opacity"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
