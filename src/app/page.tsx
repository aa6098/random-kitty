import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Chat,
  MapPin,
  VideoCamera,
  UsersThree,
  HandsClapping,
  Prohibit,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-3.5rem)] flex items-center">
        <Image
          src="/SHomepage.jpg"
          alt="Two couples socializing together"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/20" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-white">
          <div className="max-w-xl">
            <span className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/80 text-primary-foreground text-xs font-semibold tracking-widest uppercase">
              For Couples · By Couples
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">
              Where Committed Couples{" "}
              <span className="text-primary">Connect &amp; Thrive</span>
            </h1>
            <p className="text-lg text-white/85 mb-8 leading-relaxed">
              The social network built exclusively for married and partnered couples. Discover like-minded pairs nearby, plan activities together, and stay connected through live chat and video.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                <UsersThree weight="fill" size={20} />
                Join as a Couple
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 text-xs">
          <span>Discover more</span>
          <span className="animate-bounce">↓</span>
        </div>
      </section>

      {/* Why Random Kitty */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <span className="inline-block mb-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase">
              Built for Couples
            </span>
            <h2 className="text-3xl font-bold mb-3">Everything You Need as a Pair</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Random Kitty is the only social platform designed from the ground up for married and committed couples — not singles.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Card 1 — Couples Social */}
            <div className="flex gap-4 p-6 rounded-xl border border-border bg-background hover:shadow-md transition-shadow">
              <span className="shrink-0 mt-1 text-primary">
                <Heart weight="duotone" size={36} />
              </span>
              <div>
                <h3 className="font-semibold text-base mb-1">A Social Space Made for Couples</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Every profile, every feature, every interaction is built around you and your partner as a unit. Meet other married or committed pairs in a safe, welcoming community that understands your lifestyle.
                </p>
              </div>
            </div>

            {/* Card 2 — Location */}
            <div className="flex gap-4 p-6 rounded-xl border border-border bg-background hover:shadow-md transition-shadow">
              <span className="shrink-0 mt-1 text-primary">
                <MapPin weight="duotone" size={36} />
              </span>
              <div>
                <h3 className="font-semibold text-base mb-1">Discover Couples Near You</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Browse a location-based listing of couples in your area who share your interests — from hiking and dining to game nights and travel. Find pairs to connect with who are actually nearby.
                </p>
              </div>
            </div>

            {/* Card 3 — Communication */}
            <div className="flex gap-4 p-6 rounded-xl border border-border bg-background hover:shadow-md transition-shadow">
              <span className="shrink-0 mt-1 text-primary">
                <VideoCamera weight="duotone" size={36} />
              </span>
              <div>
                <h3 className="font-semibold text-base mb-1">Live Chat &amp; Video Calls</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Go beyond text with real-time messaging and face-to-face video calls. Whether you want a quick chat or a virtual double date, our advanced communication tools keep couples genuinely connected.
                </p>
              </div>
            </div>

            {/* Card 4 — Social Features */}
            <div className="flex gap-4 p-6 rounded-xl border border-border bg-background hover:shadow-md transition-shadow">
              <span className="shrink-0 mt-1 text-primary">
                <HandsClapping weight="duotone" size={36} />
              </span>
              <div>
                <h3 className="font-semibold text-base mb-1">Full Social Toolkit</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Like profiles you admire, block anyone who isn&apos;t a good fit, and engage through comments and reactions — the complete set of social features you expect, tuned for couple-to-couple interaction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Getting started takes minutes. Your next favourite couple-friends could be just around the corner.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <UsersThree weight="duotone" size={32} />,
                title: "Create Your Couple Profile",
                body: "Sign up together and build a shared profile that represents you both — interests, activities you enjoy, and where you are.",
              },
              {
                step: "02",
                icon: <MapPin weight="duotone" size={32} />,
                title: "Browse Nearby Couples",
                body: "Explore the map listing to find couples in your city interested in the same activities — filter by distance, interests, or availability.",
              },
              {
                step: "03",
                icon: <Chat weight="duotone" size={32} />,
                title: "Connect &amp; Meet Up",
                body: "Send a like, start a live chat, or jump straight into a video call. Turn digital connections into real-world friendships.",
              },
            ].map(({ step, icon, title, body }) => (
              <div key={step} className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-primary/30 font-bold text-4xl leading-none select-none">{step}</span>
                  <span className="text-primary">{icon}</span>
                </div>
                <h3 className="font-semibold text-base" dangerouslySetInnerHTML={{ __html: title }} />
                <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Strip */}
      <section className="bg-primary/5 border-y border-border py-10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: <Heart weight="fill" size={24} />, label: "Like Profiles" },
              { icon: <Prohibit weight="fill" size={24} />, label: "Block Unwanted" },
              { icon: <Chat weight="fill" size={24} />, label: "Live Chat" },
              { icon: <VideoCamera weight="fill" size={24} />, label: "Video Calls" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <span className="text-primary">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Ready to meet your next couple-friends?</h2>
            <p className="opacity-85 max-w-md">
              Join thousands of couples already discovering, chatting, and building friendships on Random Kitty.
            </p>
          </div>
          <Link
            href="/signup"
            className="shrink-0 inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary-foreground text-primary font-semibold hover:opacity-90 transition-opacity"
          >
            Get Started Free
            <ArrowRight weight="bold" size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>
          Random Kitty &copy; {new Date().getFullYear()} &mdash; The social network for couples.
        </p>
      </footer>
    </div>
  );
}
