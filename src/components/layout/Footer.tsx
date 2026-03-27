import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Phone,
  ArrowUp,
  Mail,
  MapPin,
  ExternalLink,
  Twitter,
  Facebook,
  Github,
  MessageCircle,
} from "lucide-react";

const quickLinks = [
  { to: "/bills", label: "Active Bills" },
  { to: "/vote", label: "Vote Now" },
  { to: "/ussd", label: "USSD Simulator" },
  { to: "/dashboard", label: "Admin Dashboard" },
];

const legalLinks = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/accessibility", label: "Accessibility" },
  { to: "/data-policy", label: "Data Protection" },
];

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function Footer() {
  return (
    <>
      {/* USSD Call-to-Action Band */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                No smartphone? No problem!
              </p>
              <p className="text-xs opacity-90">
                Participate in governance from any phone
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary-foreground/20 px-4 py-1.5 text-lg font-bold tracking-wider">
              *384#
            </span>
            <span className="text-sm font-medium">
              Dial to participate
            </span>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="border-t bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* About Column */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                About Sauti-Link
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Democratizing public participation across Kenya's 47 counties.
                Empowering citizens to engage with legislation through digital
                and USSD channels.
              </p>
              {/* Social icons */}
              <div className="flex gap-2 pt-1">
                <a
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label="Twitter"
                >
                  <Twitter className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label="Facebook"
                >
                  <Facebook className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label="GitHub"
                >
                  <Github className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Contact
              </h3>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>African Leadership University, Kigali, Rwanda</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <a href="mailto:contact@sauti-link.ke" className="hover:text-primary transition-colors">
                    contact@sauti-link.ke
                  </a>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>*384#</span>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Legal
              </h3>
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        {/* Supported By */}
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Supported by
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                  ALU
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  African Leadership University
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom bar */}
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Sauti-Link. Built by Eugene Koech &middot;
              African Leadership University.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToTop}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              Back to top
            </Button>
          </div>
        </div>

        {/* Kenyan flag bottom stripe */}
        <div className="flex h-1 w-full">
          <div className="h-full flex-1 bg-black" />
          <div className="h-full flex-1 bg-red-600" />
          <div className="h-full flex-1 bg-green-700" />
        </div>
      </footer>
    </>
  );
}
