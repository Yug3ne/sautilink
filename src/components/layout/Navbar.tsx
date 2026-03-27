import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Vote,
  FileText,
  BarChart3,
  Phone,
  Home,
  Globe,
} from "lucide-react";

const navLinks = [
  { to: "/", label: "Home", labelSw: "Nyumbani", icon: Home },
  { to: "/bills", label: "Bills", labelSw: "Miswada", icon: FileText },
  { to: "/vote", label: "Vote", labelSw: "Piga Kura", icon: Vote },
  { to: "/ussd", label: "USSD Simulator", labelSw: "Kiigizo cha USSD", icon: Phone },
  { to: "/dashboard", label: "Admin Dashboard", labelSw: "Dashibodi", icon: BarChart3 },
];

export function Navbar() {
  const location = useLocation();
  const [language, setLanguage] = useState<"en" | "sw">("en");
  const [open, setOpen] = useState(false);

  const toggleLang = () => setLanguage((l) => (l === "en" ? "sw" : "en"));

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            SL
          </div>
          <span className="text-lg font-bold tracking-tight">Sauti-Link</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button
                variant={location.pathname === link.to ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <link.icon className="h-4 w-4" />
                {language === "en" ? link.label : link.labelSw}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Language toggle + Mobile menu */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLang}
            className="gap-1.5"
          >
            <Globe className="h-4 w-4" />
            {language === "en" ? "SW" : "EN"}
          </Button>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="mt-8 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>
                    <Button
                      variant={location.pathname === link.to ? "secondary" : "ghost"}
                      className="w-full justify-start gap-2"
                    >
                      <link.icon className="h-4 w-4" />
                      {language === "en" ? link.label : link.labelSw}
                    </Button>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
