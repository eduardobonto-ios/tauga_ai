import { createFileRoute, Link } from "@tanstack/react-router";
import { UserRound, ShieldCheck } from "lucide-react";
import hero from "@/assets/hotel-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cincinnati Hotel — Concierge Chat" },
      {
        name: "description",
        content:
          "Chat with the Cincinnati Hotel concierge or manage the hotel knowledge base.",
      },
      { property: "og:title", content: "Cincinnati Hotel — Concierge Chat" },
      {
        property: "og:description",
        content:
          "AI concierge for Cincinnati Hotel guests, powered by the hotel information document.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <img
        src={hero}
        alt="Cincinnati Hotel lobby"
        width={1600}
        height={1000}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/70 to-primary/90" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-primary-foreground">
        <span className="mb-4 rounded-full border border-gold/60 px-4 py-1 text-xs uppercase tracking-[0.3em] text-gold">
          Cincinnati Hotel
        </span>
        <h1 className="max-w-3xl text-center text-5xl leading-tight md:text-7xl">
          Your stay, <span className="italic text-gold">gracefully</span> answered.
        </h1>
        <p className="mt-6 max-w-xl text-center text-base text-primary-foreground/80 md:text-lg">
          Ask our AI concierge anything about rooms, dining, amenities and services —
          or step into the admin suite to manage the knowledge base.
        </p>

        <div className="mt-12 grid w-full max-w-2xl gap-5 md:grid-cols-2">
          <Link
            to="/chat"
            className="group flex flex-col items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-8 text-left backdrop-blur transition hover:border-gold/60 hover:bg-white/10"
          >
            <div className="rounded-full bg-gold/20 p-3 text-gold">
              <UserRound className="h-6 w-6" />
            </div>
            <h2 className="text-2xl">Regular User</h2>
            <p className="text-sm text-primary-foreground/70">
              Chat with the Cincinnati Hotel concierge.
            </p>
            <span className="mt-2 text-sm text-gold group-hover:underline">
              Enter chat →
            </span>
          </Link>

          <Link
            to="/admin"
            className="group flex flex-col items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-8 text-left backdrop-blur transition hover:border-gold/60 hover:bg-white/10"
          >
            <div className="rounded-full bg-gold/20 p-3 text-gold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-2xl">Admin</h2>
            <p className="text-sm text-primary-foreground/70">
              Upload the hotel PDF and view live chat statistics.
            </p>
            <span className="mt-2 text-sm text-gold group-hover:underline">
              Open dashboard →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
