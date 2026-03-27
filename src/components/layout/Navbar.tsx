import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Menu,
  Vote,
  FileText,
  BarChart3,
  Phone,
  Home,
  Globe,
  Bell,
  ChevronRight,
  X,
  Link2,
} from "lucide-react";

const navLinks = [
  { to: "/", label: "Home", labelSw: "Nyumbani", icon: Home },
  { to: "/bills", label: "Bills", labelSw: "Miswada", icon: FileText },
  { to: "/vote", label: "Vote", labelSw: "Piga Kura", icon: Vote },
  { to: "/ussd", label: "USSD Simulator", labelSw: "Kiigizo cha USSD", icon: Phone },
  { to: "/dashboard", label: "Admin Dashboard", labelSw: "Dashibodi", icon: BarChart3 },
];

function SautiLogo() {
  return (
    <div className="relative flex h-9 w-9 items-center justify-center">
      {/* Speech bubble shape */}
      <div className="absolute inset-0 rounded-lg bg-primary" />
      {/* Bubble tail */}
      <div
        className="absolute -bottom-1 left-1.5 h-3 w-3 rotate-45 bg-primary"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      />
      {/* Link icon overlay */}
      <Link2 className="relative z-10 h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
    </div>
  );
}

function KenyaFlagStripe() {
  return (
    <div className="flex h-[3px] w-full">
      <div className="h-full flex-1 bg-black" />
      <div className="h-full flex-1 bg-red-600" />
      <div className="h-full flex-1 bg-green-700" />
    </div>
  );
}

function Breadcrumb({ language }: { language: "en" | "sw" }) {
  const location = useLocation();
  const currentLink = navLinks.find((l) => l.to === location.pathname);

  if (!currentLink || currentLink.to === "/") return null;

  return (
    <div className="border-b bg-muted/30">
      <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-1.5 text-xs text-muted-foreground">
        <Link to="/" className="transition-colors hover:text-foreground">
          {language === "en" ? "Home" : "Nyumbani"}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-foreground">
          {language === "en" ? currentLink.label : currentLink.labelSw}
        </span>
      </div>
    </div>
  );
}

export function Navbar() {
  const location = useLocation();
  const [language, setLanguage] = useState<"en" | "sw">("en");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLang = () => setLanguage((l) => (l === "en" ? "sw" : "en"));

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-200 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      {/* Kenyan flag stripe */}
      <KenyaFlagStripe />

      {/* Main navbar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <SautiLogo />
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight group-hover:text-primary transition-colors">
                Sauti-Link
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:block">
                {language === "en" ? "Your Voice, Your Power" : "Sauti Yako, Nguvu Yako"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 rounded-none h-14 px-3 transition-colors ${
                      isActive
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <link.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                    {language === "en" ? link.label : link.labelSw}
                  </Button>
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-[3px] rounded-t-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5">
            {/* Notification bell (admin) */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden md:inline-flex"
              asChild
            >
              <Link to="/dashboard">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
              </Link>
            </Button>

            {/* Language toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLang}
              className="gap-1.5 text-xs font-medium"
            >
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {language === "en" ? "Kiswahili" : "English"}
                </span>
                <span className="sm:hidden">
                  {language === "en" ? "SW" : "EN"}
                </span>
              </span>
            </Button>

            {/* Mobile hamburger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                {/* Mobile menu header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <SautiLogo />
                    <span className="text-sm font-bold">Sauti-Link</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Kenya flag accent */}
                <KenyaFlagStripe />

                {/* Mobile nav links */}
                <nav className="flex flex-col p-3">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.to;
                    return (
                      <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>
                        <div
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <link.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                          <span className="flex-1">
                            {language === "en" ? link.label : link.labelSw}
                          </span>
                          {isActive && (
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </nav>

                <Separator />

                {/* Mobile notification row */}
                <div className="p-3">
                  <Link to="/dashboard" onClick={() => setOpen(false)}>
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                      <Bell className="h-4 w-4" />
                      <span className="flex-1">
                        {language === "en" ? "Notifications" : "Arifa"}
                      </span>
                      <Badge variant="destructive" className="text-[10px] px-1.5">
                        3
                      </Badge>
                    </div>
                  </Link>
                </div>

                <Separator />

                {/* Mobile language toggle */}
                <div className="p-3">
                  <Button
                    variant="outline"
                    onClick={toggleLang}
                    className="w-full justify-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    {language === "en"
                      ? "Switch to Kiswahili"
                      : "Badili hadi English"}
                  </Button>
                </div>

                {/* USSD call to action */}
                <div className="mt-auto border-t p-4">
                  <div className="rounded-lg bg-primary/10 p-3 text-center">
                    <Phone className="mx-auto mb-1 h-5 w-5 text-primary" />
                    <p className="text-xs font-semibold text-primary">
                      {language === "en" ? "Dial *384# to participate" : "Piga *384# kushiriki"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {language === "en" ? "No internet needed" : "Huhitaji mtandao"}
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb language={language} />
    </header>
  );
}
