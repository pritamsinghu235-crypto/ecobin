import { ArrowRight, Cpu, MapPin, Sparkles } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { FadeIn, Stagger, StaggerItem } from "@/components/animations/fade-in";
import { HeroVisual } from "@/components/3d/HeroVisual";

const features = [
  {
    icon: Cpu,
    title: "AI bottle detection",
    body: "On-device vision classifies 5 plastic types (PET, HDPE, PVC, LDPE, PP) and values each deposit instantly.",
  },
  {
    icon: Sparkles,
    title: "Earn as you recycle",
    body: "Every bottle converts to coins and a live environmental impact score you can track and redeem.",
  },
  {
    icon: MapPin,
    title: "Smart bin network",
    body: "Find the nearest available machine on a live map with real-time fill levels and status.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-5 lg:px-8">
      <FadeIn>
        <header className="flex items-center justify-between py-6">
          <Wordmark />
          <div className="flex items-center gap-2">
            <Button href="/dashboard" variant="ghost" size="sm">
              Sign in
            </Button>
            <Button href="/dashboard" size="sm">
              Get started
            </Button>
          </div>
        </header>
      </FadeIn>

      <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <Stagger className="flex flex-col items-center">
          <StaggerItem>
            <Pill tone="ok" dot>
              Smart City · IoT · AI Recycling
            </Pill>
          </StaggerItem>

          <StaggerItem>
            <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Turn every bottle into <span className="text-gradient">real rewards</span>.
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p className="mt-6 max-w-xl text-pretty text-lg text-ink-muted">
              EcoBin is a network of AI-powered smart collection machines. Deposit plastic
              bottles, earn coins, and watch your environmental impact grow — city-wide.
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button href="/dashboard" size="lg">
                Open dashboard <ArrowRight className="size-4" />
              </Button>
              <Button href="/map" variant="outline" size="lg">
                Find a smart bin
              </Button>
            </div>
          </StaggerItem>
        </Stagger>

        <HeroVisual />

        <Stagger className="mt-20 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <Card hover glow className="h-full p-6">
                <div className="grid size-11 place-items-center rounded-xl bg-brand-dim/50 text-brand-bright">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-medium tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.body}</p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <footer className="border-t border-line/60 py-6 text-center text-sm text-ink-faint">
        EcoBin — IoT Smart Waste Management · Showcase Prototype
      </footer>
    </div>
  );
}
