import Image from "next/image";
import Link from "next/link";
import heroImage from "@/app/HomePageImage.jpg";
import { HeartStraight, ChatCircleDots, MaskHappy, Sparkle } from "@phosphor-icons/react/dist/ssr";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-3.5rem)] flex items-center">
        <Image
          src={heroImage}
          alt="Couple silhouette"
          fill
          priority
          className="object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-white">
          <div className="max-w-xl">
            <span className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/80 text-primary-foreground text-xs font-semibold tracking-widest uppercase">
              Discreet &amp; Anonymous
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">
              Where Couples Meet,{" "}
              <span className="text-primary">Secretly</span>
            </h1>
            <p className="text-lg text-white/85 mb-8 leading-relaxed">
              A safe, anonymous space for married and partnered individuals to connect, chat, and build genuine trust — with complete privacy and zero judgment.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                <MaskHappy weight="fill" size={20} />
                Join Anonymously
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
      </section>

      {/* Features */}
      {/* <section className="bg-card py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Simple, private, and designed for people who value discretion above all else.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <MaskHappy weight="duotone" size={36} />,
                title: "Stay Anonymous",
                body: "No real names, no photos required. Your identity stays yours — always.",
              },
              {
                icon: <ChatCircleDots weight="duotone" size={36} />,
                title: "Private Chat",
                body: "Encrypted messages that disappear. Conversations just between the two of you.",
              },
              {
                icon: <HeartStraight weight="duotone" size={36} />,
                title: "Build Trust",
                body: "Connect authentically and gradually — on your terms and timeline.",
              },
              {
                icon: <Sparkle weight="duotone" size={36} />,
                title: "Have Fun",
                body: "Playful icebreakers and matching help you find your spark again.",
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="flex flex-col items-start gap-3 p-6 rounded-xl border border-border bg-background hover:shadow-md transition-shadow"
              >
                <span className="text-primary">{icon}</span>
                <h3 className="font-semibold text-base">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Banner */}
      {/* <section className="bg-primary text-primary-foreground py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Explore?</h2>
          <p className="opacity-85 mb-8 max-w-md mx-auto">
             Your next meaningful connection is one click away.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary-foreground text-primary font-semibold hover:opacity-90 transition-opacity"
          >
            <MaskHappy weight="fill" size={20} />
            Create a Free Account
          </Link>
        </div>
      </section> */}

      {/* Footer note */}
      <footer className="bg-card border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>
          Random Kitty &copy; {new Date().getFullYear()} &mdash; All activity is anonymous and encrypted.
        </p>
      </footer>
    </div>
  );
}
