import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Vote,
  MessageSquare,
  BarChart3,
  Phone,
  Shield,
  Users,
  Globe,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Quote,
  MapPin,
  Clock,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: FileText,
    title: "Bill Simplification",
    desc: "Complex 50-page bills condensed into 5 clear points in English and Kiswahili.",
    color: "from-emerald-500/20 to-green-600/20",
  },
  {
    icon: Vote,
    title: "Digital Voting",
    desc: "Vote on local budget items via USSD on any phone or through the web portal.",
    color: "from-green-500/20 to-teal-600/20",
  },
  {
    icon: MessageSquare,
    title: "Direct Feedback",
    desc: "Send questions, complaints, and suggestions directly to your MCA.",
    color: "from-teal-500/20 to-cyan-600/20",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    desc: "Government officials see live community sentiment and participation data.",
    color: "from-cyan-500/20 to-blue-600/20",
  },
  {
    icon: Phone,
    title: "USSD Access",
    desc: "Works on any GSM phone. No smartphone or internet data required.",
    color: "from-lime-500/20 to-green-600/20",
  },
  {
    icon: Shield,
    title: "ID Verification",
    desc: "National ID verification via IPRS ensures one citizen, one vote.",
    color: "from-green-600/20 to-emerald-700/20",
  },
];

const stats = [
  { value: 47, label: "Counties", suffix: "", icon: MapPin },
  { value: 2927, label: "Citizens Engaged", suffix: "+", icon: Users },
  { value: 4, label: "Active Bills", suffix: "", icon: FileText },
  { value: 89, label: "Approval Rate", suffix: "%", icon: TrendingUp },
];

const steps = [
  {
    number: "01",
    title: "Verify Your ID",
    desc: "Enter your National ID number for quick IPRS verification. One citizen, one voice.",
    icon: Shield,
  },
  {
    number: "02",
    title: "Read Simplified Bills",
    desc: "Access county bills summarised in plain English and Kiswahili - no legal jargon.",
    icon: FileText,
  },
  {
    number: "03",
    title: "Vote & Give Feedback",
    desc: "Cast your vote on budget items and send feedback directly to your MCA.",
    icon: Vote,
  },
];

const counties = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Kiambu",
  "Machakos",
  "Kajiado",
  "Uasin Gishu",
  "Kilifi",
  "Nyeri",
  "Murang'a",
  "Laikipia",
];

const testimonials = [
  {
    quote:
      "For the first time, I understood what the county budget actually means for my community. I voted from my phone while selling vegetables at the market.",
    name: "Amina Wanjiku",
    role: "Citizen, Nakuru County",
    avatar: "AW",
  },
  {
    quote:
      "Sauti-Link has transformed how I understand my constituents. Real-time feedback means I can make decisions that truly reflect what people need.",
    name: "Hon. James Ochieng'",
    role: "MCA, Kisumu County",
    avatar: "JO",
  },
];

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */

function useAnimatedCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ------------------------------------------------------------------ */
/*  Dots pattern component                                             */
/* ------------------------------------------------------------------ */

function DotsPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute pointer-events-none opacity-[0.035] ${className}`}
      width="404"
      height="404"
      fill="none"
      viewBox="0 0 404 404"
      aria-hidden="true"
    >
      <defs>
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="404" height="404" fill="url(#dots)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function Home() {
  // Countdown: pretend window closes in ~12 days from now
  const [daysLeft] = useState(() => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 12);
    return Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  });

  return (
    <div className="flex flex-col">
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden py-24 md:py-36">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary) 0%, oklch(0.45 0.14 155) 40%, oklch(0.35 0.10 170) 70%, oklch(0.20 0.05 240) 100%)",
          }}
        />
        {/* Subtle moving shimmer overlay */}
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 20% 60%, oklch(0.7 0.18 140 / 0.4), transparent), radial-gradient(ellipse 60% 50% at 80% 30%, oklch(0.6 0.15 160 / 0.3), transparent)",
          }}
        />
        {/* Dot pattern decorations */}
        <DotsPattern className="top-0 left-0 text-white opacity-[0.06]" />
        <DotsPattern className="bottom-0 right-0 text-white opacity-[0.06]" />

        <div className="mx-auto max-w-7xl px-4 text-center relative">
          <div className="mx-auto max-w-3xl">
            <Badge
              variant="secondary"
              className="mb-6 gap-2 rounded-full bg-white/15 text-white/90 border-white/20 px-4 py-1.5 text-sm backdrop-blur-sm"
            >
              <Globe className="h-4 w-4" />
              Empowering Kenya's 47 Counties
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl leading-[1.1]">
              Your Voice in{" "}
              <span className="relative">
                <span className="relative z-10">Governance</span>
                <span
                  className="absolute bottom-1 left-0 w-full h-3 md:h-4 bg-white/20 -z-0 rounded-sm"
                  aria-hidden="true"
                />
              </span>
            </h1>

            <p className="mt-6 text-lg text-white/80 md:text-xl max-w-2xl mx-auto leading-relaxed">
              Sauti-Link bridges the gap between citizens and policymakers. Read
              simplified bills, vote on budget items, and send feedback to your
              MCA — all from any phone.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/bills">
                <Button
                  size="lg"
                  className="gap-2 bg-white text-primary hover:bg-white/90 font-semibold shadow-lg shadow-black/20"
                >
                  <FileText className="h-5 w-5" />
                  View Bills
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/vote">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <Vote className="h-5 w-5" />
                  Vote Now
                </Button>
              </Link>
              <Link to="/ussd">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <Phone className="h-5 w-5" />
                  Try USSD Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade into page */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ============================================================ */}
      {/*  STATS                                                       */}
      {/* ============================================================ */}
      <section className="relative -mt-12 z-10 pb-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {stats.map((stat) => {
              const { count, ref } = useAnimatedCounter(stat.value);
              return (
                <div
                  key={stat.label}
                  ref={ref}
                  className="group rounded-xl border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary md:text-4xl tabular-nums">
                    {count.toLocaleString()}
                    {stat.suffix}
                  </div>
                  <div className="mt-1 text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS - 3 steps                                      */}
      {/* ============================================================ */}
      <section className="relative py-24 overflow-hidden">
        <DotsPattern className="top-10 right-0 text-foreground" />

        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Simple Process
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Three simple steps to make your voice heard in county governance.
            </p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3 md:gap-0">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

            {steps.map((step, i) => (
              <div key={step.number} className="relative flex flex-col items-center text-center px-6">
                {/* Step circle */}
                <div className="relative z-10 mb-6">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <step.icon className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  {/* Number badge */}
                  <span className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg">
                    {step.number}
                  </span>
                </div>

                {/* Arrow between steps on mobile */}
                {i < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-2">
                    <ChevronRight className="h-6 w-6 text-primary/40 rotate-90" />
                  </div>
                )}

                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES                                                    */}
      {/* ============================================================ */}
      <section className="relative py-24 bg-muted/30">
        <DotsPattern className="bottom-0 left-0 text-foreground" />

        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Platform Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything You Need to Participate
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Governance made accessible for every Kenyan citizen, from Nairobi
              to the most remote village.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="group relative overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
              >
                {/* Gradient hover overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <CardContent className="relative pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                    <f.icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="font-semibold text-base">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TESTIMONIALS                                                */}
      {/* ============================================================ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Voices
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              What People Are Saying
            </h2>
            <p className="mt-3 text-muted-foreground">
              Hear from citizens and leaders using Sauti-Link.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <Card
                key={t.name}
                className="relative overflow-hidden border-primary/10"
              >
                <CardContent className="pt-8 pb-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <blockquote className="text-base leading-relaxed text-foreground/90 italic">
                    "{t.quote}"
                  </blockquote>
                  <Separator className="my-5" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-bl from-primary/5 to-transparent" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SUPPORTED COUNTIES                                          */}
      {/* ============================================================ */}
      <section className="relative py-24 bg-muted/30 overflow-hidden">
        <DotsPattern className="top-0 right-10 text-foreground" />

        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Coverage
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Supported Counties
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              We are actively rolling out across Kenya. Currently live in pilot
              counties, with plans to cover all 47.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* County grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {counties.map((county) => (
                <div
                  key={county}
                  className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  {county}
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">12</span> counties
                live &middot;{" "}
                <span className="font-semibold text-foreground">35</span> coming
                soon
              </p>
              <div className="mt-3 mx-auto max-w-md">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2"
                    style={{ width: "25.5%" }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  25% nationwide coverage
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PROBLEM SECTION                                             */}
      {/* ============================================================ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="relative rounded-2xl border bg-card overflow-hidden">
            {/* Background accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
            <DotsPattern className="top-0 left-0 text-foreground" />

            <div className="relative px-8 py-16 md:px-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                The Problem We're Solving
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed max-w-2xl mx-auto text-base md:text-lg">
                Kenyan citizens face systematic exclusion from legislative and
                budgeting processes. The barriers — costly internet data, physical
                distance to government offices, and complex legal English — leave
                millions without a voice. Sauti-Link changes this by bringing
                governance to every phone in every village.
              </p>
              <Link to="/dashboard" className="mt-8 inline-block">
                <Button variant="outline" size="lg" className="gap-2">
                  <BarChart3 className="h-5 w-5" />
                  View Live Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FINAL CTA                                                   */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary) 0%, oklch(0.40 0.13 150) 50%, oklch(0.30 0.10 170) 100%)",
          }}
        />
        <DotsPattern className="top-0 right-0 text-white opacity-[0.06]" />
        <DotsPattern className="bottom-0 left-0 text-white opacity-[0.06]" />

        <div className="relative py-24 px-4">
          <div className="mx-auto max-w-3xl text-center">
            {/* Urgency badge */}
            <Badge className="mb-6 gap-2 bg-white/15 text-white border-white/20 hover:bg-white/20 px-4 py-1.5 text-sm">
              <Clock className="h-4 w-4" />
              Public participation window closes in {daysLeft} days
            </Badge>

            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl leading-tight">
              Your County Needs Your Voice
            </h2>
            <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-xl mx-auto">
              Don't let others decide your community's future. It takes less than
              5 minutes to read a bill summary and cast your vote.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/bills">
                <Button
                  size="lg"
                  className="gap-2 bg-white text-primary hover:bg-white/90 font-semibold shadow-lg shadow-black/20"
                >
                  <Vote className="h-5 w-5" />
                  Start Participating
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/ussd">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/30 text-white hover:bg-white/10"
                >
                  <Phone className="h-5 w-5" />
                  Dial *384*001#
                </Button>
              </Link>
            </div>

            <p className="mt-8 text-sm text-white/50">
              Free on Safaricom, Airtel &amp; Telkom Kenya. No data required.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
