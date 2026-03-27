import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Vote,
  MessageSquare,
  BarChart3,
  Phone,
  Shield,
  Users,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Bill Simplification",
    desc: "Complex 50-page bills condensed into 5 clear points in English and Kiswahili.",
  },
  {
    icon: Vote,
    title: "Digital Voting",
    desc: "Vote on local budget items via USSD on any phone or through the web portal.",
  },
  {
    icon: MessageSquare,
    title: "Direct Feedback",
    desc: "Send questions, complaints, and suggestions directly to your MCA.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    desc: "Government officials see live community sentiment and participation data.",
  },
  {
    icon: Phone,
    title: "USSD Access",
    desc: "Works on any GSM phone. No smartphone or internet data required.",
  },
  {
    icon: Shield,
    title: "ID Verification",
    desc: "National ID verification via IPRS ensures one citizen, one vote.",
  },
];

const stats = [
  { value: "47", label: "Counties" },
  { value: "2,927", label: "Citizens Engaged" },
  { value: "4", label: "Active Bills" },
  { value: "89%", label: "Approval Rate" },
];

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground">
              <Globe className="h-4 w-4 text-primary" />
              Empowering Kenya's 47 Counties
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Your Voice in{" "}
              <span className="text-primary">Governance</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Sauti-Link bridges the gap between citizens and policymakers.
              Read simplified bills, vote on budget items, and send feedback to
              your MCA — all from any phone.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/bills">
                <Button size="lg" className="gap-2">
                  <FileText className="h-5 w-5" />
                  View Bills
                </Button>
              </Link>
              <Link to="/vote">
                <Button size="lg" variant="outline" className="gap-2">
                  <Vote className="h-5 w-5" />
                  Vote Now
                </Button>
              </Link>
              <Link to="/ussd">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Phone className="h-5 w-5" />
                  Try USSD Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              How Sauti-Link Works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Governance made accessible for every Kenyan citizen.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Problem / CTA */}
      <section className="bg-primary/5 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Users className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight">
            The Problem We're Solving
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
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
      </section>
    </div>
  );
}
