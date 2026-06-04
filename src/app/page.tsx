import Image from "next/image";
import Link from "next/link";
import EmailCaptureForm from "@/app/EmailCaptureForm";
import logo from "@/app/logo.png";
import {
  ChatIcon,
  MapPinIcon,
  VideoCameraIcon,
  UsersThreeIcon,
  ArrowRightIcon,
  LockSimpleIcon,
  SparkleIcon,
  ShieldCheckIcon,
  HeartIcon,
  CheckCircleIcon,
  EnvelopeSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="group flex gap-4 p-6 rounded-2xl border border-border/20 bg-foreground/[0.03] hover:bg-foreground/[0.06] hover:border-rose-500/25 transition-all duration-200">
      <span className="shrink-0 mt-0.5 text-rose-400">{icon}</span>
      <div>
        <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">

      {/* ── Fixed nav ── */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 h-14 bg-background/70 backdrop-blur-md border-b border-border/10">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <Image src={logo} alt="Random Kitty" width={36} height={36} />
          <span className="font-semibold text-foreground hidden sm:block tracking-tight">Random Kitty</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/signin"
            className="text-sm text-foreground/60 hover:text-foreground px-4 py-2 rounded-lg hover:bg-foreground/5 transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-lg shadow-rose-900/30"
          >
            Join Free
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center">
        {/* Background photo */}
        <Image
          src="/LoginPage2.jpg"
          alt="People connecting"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Gradient — strong on left so text is readable, fades on right to show photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 md:via-black/50 lg:to-black/10 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

        <div className="relative z-10 mx-auto max-w-6xl w-full px-6 pt-24 pb-20">
          {/* Content sits on the left half on md+ screens */}
          <div className="w-full md:w-1/2 lg:w-5/12">

            <span className="inline-flex items-center gap-1.5 mb-6 px-3 py-1 rounded-full bg-rose-600/25 border border-rose-500/30 text-rose-300 text-[11px] font-semibold tracking-widest uppercase">
              <SparkleIcon weight="fill" size={10} />
              Free · AI-Powered · No Credit Card
            </span>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight mb-5 text-white">
              Meet someone
              <br />
              who truly
              <br />
              <span className="text-rose-400">gets you.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 max-w-sm">
              Vashikar uses AI to match you with compatible people nearby. Chat, message, or jump into a video call — all in one free platform.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-rose-600 hover:bg-rose-500 font-semibold text-white transition-colors shadow-xl shadow-rose-900/40 text-sm sm:text-base"
              >
                <HeartIcon weight="fill" size={16} />
                Join for Free
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/25 text-white/80 hover:text-white hover:bg-white/10 font-semibold transition-all text-sm sm:text-base"
              >
                Sign In
              </Link>
            </div>

            <ul className="flex flex-col gap-2.5">
              {[
                { icon: <SparkleIcon weight="fill" size={13} />, text: "AI-based compatibility matching" },
                { icon: <MapPinIcon weight="fill" size={13} />, text: "Location-based member search" },
                { icon: <EnvelopeSimpleIcon weight="fill" size={13} />, text: "Messages, live chat & video calls" },
                { icon: <CheckCircleIcon weight="fill" size={13} />, text: "Always free — no hidden fees" },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-sm text-white/65">
                  <span className="text-rose-400 shrink-0">{icon}</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/25 text-xs pointer-events-none">
          <span>Scroll</span>
          <span className="animate-bounce text-rose-400/60">↓</span>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <span className="inline-block mb-3 px-3 py-1 rounded-full bg-rose-600/15 border border-rose-500/20 text-rose-300 text-[11px] font-semibold tracking-widest uppercase">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
              Everything you need to connect
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
              From smart AI matching to real-time video calls, every feature is built to help you build meaningful connections.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FeatureCard
              icon={<SparkleIcon weight="duotone" size={28} />}
              title="AI-Based Matching"
              body="Our smart algorithm learns your preferences and surfaces the most compatible profiles — so you spend less time searching and more time connecting."
            />
            <FeatureCard
              icon={<MapPinIcon weight="duotone" size={28} />}
              title="Location-Based Search"
              body="Browse members near you filtered by distance. See who's active in your city right now and discover people you might actually run into."
            />
            <FeatureCard
              icon={<ChatIcon weight="duotone" size={28} />}
              title="Live Chat & Messaging"
              body="Real-time chat for instant conversation and private messages for thoughtful exchanges — both available the moment you match."
            />
            <FeatureCard
              icon={<VideoCameraIcon weight="duotone" size={28} />}
              title="Video Calls"
              body="Face-to-face video calls built right into the platform. Get to know someone for real before you ever meet in person."
            />
            <FeatureCard
              icon={<HeartIcon weight="duotone" size={28} />}
              title="Likes & Mutual Matches"
              body="Like a profile and when they like you back a private chat unlocks automatically — mutual interest, always."
            />
            <FeatureCard
              icon={<ShieldCheckIcon weight="duotone" size={28} />}
              title="Safe & Moderated"
              body="Block, report, and move on instantly. Our moderation team reviews every report and keeps the community respectful and real."
            />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 bg-gradient-to-b from-transparent to-rose-950/10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">How it works</h2>
            <p className="text-muted-foreground max-w-sm mx-auto text-sm">
              From sign-up to first conversation in three simple steps.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-10">
            {[
              {
                n: "1",
                icon: <UsersThreeIcon weight="duotone" size={26} />,
                title: "Create your free profile",
                body: "Sign up in minutes — no credit card, no subscription. Add your photos, interests, and location to get started.",
              },
              {
                n: "2",
                icon: <SparkleIcon weight="duotone" size={26} />,
                title: "Get AI-matched nearby",
                body: "Our AI ranks compatible members by distance and preferences. See your best matches first, not just the newest profiles.",
              },
              {
                n: "3",
                icon: <ChatIcon weight="duotone" size={26} />,
                title: "Chat, message or video call",
                body: "Break the ice in live chat, send a thoughtful message, or jump on a video call — you choose how to connect.",
              },
            ].map(({ n, icon, title, body }) => (
              <div key={n} className="flex flex-col items-center text-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-rose-600/10 border border-rose-500/20">
                  <span className="text-rose-400">{icon}</span>
                  <span className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {n}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="py-14 border-y border-border/10 bg-background/40">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: <LockSimpleIcon weight="duotone" size={26} />,
                title: "Private by default",
                body: "Your profile is never indexed by search engines. Only registered members can see your details.",
              },
              {
                icon: <ShieldCheckIcon weight="duotone" size={26} />,
                title: "Active moderation",
                body: "A dedicated team reviews every report and removes fake or abusive accounts — usually within the hour.",
              },
              {
                icon: <CheckCircleIcon weight="duotone" size={26} />,
                title: "100% free platform",
                body: "All core features — matching, chat, messages, and video calls — are completely free. No paywalls.",
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="flex flex-col items-center gap-3">
                <span className="text-rose-400/80">{icon}</span>
                <h3 className="font-semibold text-foreground/90 text-sm">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950/60 via-background to-background" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-rose-600/6 blur-3xl pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-xl px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">
            Ready to find
            <br />
            <span className="text-rose-400">your match?</span>
          </h2>
          <p className="text-foreground/50 mb-9 leading-relaxed">
            Join thousands of members already connecting on Random Kitty. Free to join, always real.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-rose-600 hover:bg-rose-500 font-bold text-white text-lg transition-colors shadow-2xl shadow-rose-900/50"
          >
            Get Started Free
            <ArrowRightIcon weight="bold" size={20} />
          </Link>
          <p className="mt-5 text-foreground/20 text-xs">
            Free forever · No credit card required
          </p>
        </div>
      </section>

      {/* ── Email capture ── */}
      <section className="py-20 bg-background/50 border-t border-border/10">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight">Stay in the loop</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Get updates on new features, AI improvements, and matches near you.
          </p>
          <EmailCaptureForm />
          <p className="mt-4 text-foreground/20 text-xs">No spam. Unsubscribe any time.</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-background/80 border-t border-border/10 py-8">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-5 text-foreground/25 text-xs">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src={logo} alt="Random Kitty" width={24} height={24} className="opacity-60" />
            <span className="font-semibold text-foreground/40">Random Kitty</span>
          </Link>
          <p>© {new Date().getFullYear()} Random Kitty — AI-powered dating, free forever.</p>
          <nav className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-foreground/60 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground/60 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-foreground/60 transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>

    </div>
  );
}
