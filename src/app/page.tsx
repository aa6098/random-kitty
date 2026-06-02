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
  FireIcon,
  ProhibitIcon,
  ShieldCheckIcon,
  HeartIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react/dist/ssr";

// ── Reusable feature card ────────────────────────────────────────────────────
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

// ── Fake member card (purely decorative) ────────────────────────────────────
function MockCard({
  name,
  city,
  dist,
  liked,
  online,
}: {
  name: string;
  city: string;
  dist: string;
  liked: boolean;
  online: boolean;
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-foreground/5 border border-border/20 select-none">
      <div className="aspect-[3/4] bg-gradient-to-br from-rose-900/30 via-zinc-800 to-zinc-900" />
      {/* online dot */}
      <span
        className={[
          "absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-zinc-900",
          online ? "bg-green-400" : "bg-zinc-500",
        ].join(" ")}
      />
      {/* heart */}
      <span className="absolute bottom-14 right-3">
        <HeartIcon
          weight={liked ? "fill" : "regular"}
          size={20}
          className={liked ? "text-rose-500" : "text-foreground/60"}
        />
      </span>
      {/* caption */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <p className="font-bold text-foreground text-sm leading-tight">{name}</p>
        <p className="text-foreground/60 text-xs flex items-center gap-1 mt-0.5">
          <MapPinIcon size={10} /> {city} · {dist}
        </p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
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
            className="text-sm font-semibold px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-foreground transition-colors shadow-lg shadow-rose-900/30"
          >
            Join Free
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center">
        {/* Background photo */}
        <Image
          src="/SHomepage.jpg"
          alt="Couples connecting"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/5 to-black/2" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />

        <div className="relative z-10 mx-auto max-w-6xl w-full px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — empty, background image shows through */}
          <div />

          {/* Right — copy */}
          <div>
            <span className="inline-flex items-center gap-1.5 mb-6 px-3 py-1 rounded-full bg-rose-600/20 border border-rose-500/25 text-rose-300 text-[11px] font-semibold tracking-widest uppercase">
              <LockSimpleIcon weight="fill" size={10} />
              Private · Discreet · 18+
            </span>

            <h1 className="text-5xl sm:text-6xl font-bold  leading-[1.08] tracking-tight mb-5">
              The social club
              <br />
              for adventurous
              <br />
              <span className="text-rose-400">couples.</span>
            </h1>

            <p className="text-lg text-foreground/65 leading-relaxed mb-8 max-w-md">
              Chat, video call, and connect with like-minded married and partnered couples near you — privately and on your own terms.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-rose-600 hover:bg-rose-500 font-semibold text-foreground transition-colors shadow-xl shadow-rose-900/40"
              >
                <UsersThreeIcon weight="fill" size={18} />
                Create a Couple Profile
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/30 text-foreground/75 hover:text-foreground hover:bg-foreground/5 font-semibold transition-all"
              >
                Sign In
              </Link>
            </div>

            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {[
                "Free to join — no credit card needed",
                "Couples-only community, verified profiles",
                "Your activity is never indexed publicly",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircleIcon weight="fill" size={14} className="text-rose-500/70 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — decorative member grid
          <div className="hidden lg:grid grid-cols-2 gap-3 opacity-90">
            <MockCard name="Alex & Jamie" city="Austin, TX" dist="3 mi" liked online />
            <MockCard name="Sam & Riley" city="Denver, CO" dist="8 mi" liked={false} online={false} />
            <MockCard name="Casey & Morgan" city="Austin, TX" dist="12 mi" liked={false} online />
            <MockCard name="Jordan & Taylor" city="Austin, TX" dist="5 mi" liked online={false} />
          </div> */}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-foreground/25 text-xs pointer-events-none">
          <span>Scroll</span>
          <span className="animate-bounce text-rose-400/60">↓</span>
        </div>
      </section>

      {/* ── Stats bar ── */}
      {/* <section className="bg-background/60 border-y border-border/10 py-7">
        <div className="mx-auto max-w-5xl px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "50K+", label: "Couples" },
            { value: "120+", label: "Cities" },
            { value: "100%", label: "Discreet" },
            { value: "24/7", label: "Moderated" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-rose-400 mb-0.5">{value}</p>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* ── Features ── */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <span className="inline-block mb-3 px-3 py-1 rounded-full bg-rose-600/15 border border-rose-500/20 text-rose-300 text-[11px] font-semibold tracking-widest uppercase">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
              Everything built for couples
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
              Every feature on the platform is designed around you and your partner as a unit — not individuals.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FeatureCard
              icon={<VideoCameraIcon weight="duotone" size={30} />}
              title="Encrypted Video Calls"
              body="Private face-to-face video calls. Host a virtual double-date night or screen another couple before meeting in person."
            />
            <FeatureCard
              icon={<ChatIcon weight="duotone" size={30} />}
              title="Private Live Chat"
              body="Real-time messaging with full privacy controls. Chat one-on-one or in group threads with couples you connect with."
            />
            <FeatureCard
              icon={<MapPinIcon weight="duotone" size={30} />}
              title="Location-Based Search"
              body="Browse open-minded couples near you filtered by distance and interests. See who's active in your city right now."
            />
            <FeatureCard
              icon={<HeartIcon weight="duotone" size={30} />}
              title="Likes & Mutual Matches"
              body="Express interest by liking a profile. When they like you back a private chat unlocks — mutual interest, always."
            />
            <FeatureCard
              icon={<ProhibitIcon weight="duotone" size={30} />}
              title="Block & Report"
              body="Instant blocking with a single tap. Report profiles that violate our community guidelines — our team reviews every report."
            />
            <FeatureCard
              icon={<ShieldCheckIcon weight="duotone" size={30} />}
              title="Verified Couples Only"
              body="Both partners verify before a profile goes live. No fakes, no singles pretending — every account is a real couple."
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
              From sign-up to real connection in three simple steps.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-10">
            {[
              {
                n: "1",
                icon: <UsersThreeIcon weight="duotone" size={26} />,
                title: "Create your couple profile",
                body: "Both partners sign up together and build one shared profile — your interests, your photo, and your location.",
              },
              {
                n: "2",
                icon: <MapPinIcon weight="duotone" size={26} />,
                title: "Browse couples near you",
                body: "Explore the location map to find couples nearby. Filter by distance and see who's online right now.",
              },
              {
                n: "3",
                icon: <FireIcon weight="duotone" size={26} />,
                title: "Connect & explore together",
                body: "Send a like, open a chat, or jump into a video call. Move at your own pace — you're always in control.",
              },
            ].map(({ n, icon, title, body }) => (
              <div key={n} className="flex flex-col items-center text-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-rose-600/10 border border-rose-500/20">
                  <span className="text-rose-400">{icon}</span>
                  <span className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-rose-600 text-foreground text-[10px] font-bold flex items-center justify-center">
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

      {/* ── Privacy strip ── */}
      <section className="py-14 border-y border-border/10 bg-background/40">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: <LockSimpleIcon weight="duotone" size={26} />,
                title: "Never indexed publicly",
                body: "Your profile and activity are invisible to search engines and non-members.",
              },
              {
                icon: <ShieldCheckIcon weight="duotone" size={26} />,
                title: "Active moderation",
                body: "A dedicated team reviews reports and removes violating accounts — usually within the hour.",
              },
              {
                icon: <UsersThreeIcon weight="duotone" size={26} />,
                title: "Couples-exclusive space",
                body: "Singles are not permitted. Every account requires both partners to verify before going live.",
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
            Ready to explore
            <br />
            <span className="text-rose-400">together?</span>
          </h2>
          <p className="text-foreground/50 mb-9 leading-relaxed">
            Join thousands of couples already discovering and connecting on Random Kitty. Free to join, always discreet.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-rose-600 hover:bg-rose-500 font-bold text-foreground text-lg transition-colors shadow-2xl shadow-rose-900/50"
          >
            Join as a Couple
            <ArrowRightIcon weight="bold" size={20} />
          </Link>
          <p className="mt-5 text-foreground/20 text-xs">
            18+ only · Free to join · No credit card required
          </p>
        </div>
      </section>

      {/* ── Email capture ── */}
      <section className="py-20 bg-background/50 border-t border-border/10">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight">Stay in the loop</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Get updates on new features, community events, and couples near you.
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
          <p>© {new Date().getFullYear()} Random Kitty — The couples lifestyle community.</p>
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
