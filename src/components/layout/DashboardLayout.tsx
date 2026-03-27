import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  FileText,
  Vote,
  MessageSquare,
  Users,
  Bell,
  Menu,
  Phone,
  Link2,
  X,
} from "lucide-react";

const sidebarLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/bills", label: "Bills Management", icon: FileText },
  { to: "/dashboard/votes", label: "Vote Results", icon: Vote },
  { to: "/dashboard/feedback", label: "Citizen Feedback", icon: MessageSquare },
  { to: "/dashboard/citizens", label: "Citizens", icon: Users },
];

function isActiveLink(pathname: string, to: string, end?: boolean) {
  if (end) return pathname === to;
  return pathname.startsWith(to);
}

function getPageTitle(pathname: string) {
  const link = sidebarLinks.find((l) =>
    l.end ? pathname === l.to : pathname.startsWith(l.to) && !l.end
  );
  // Check non-end links first for more specific matches, then fall back
  const specific = sidebarLinks.find(
    (l) => !l.end && pathname.startsWith(l.to)
  );
  return specific?.label || link?.label || "Overview";
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

function SautiLogo() {
  return (
    <div className="relative flex h-9 w-9 items-center justify-center">
      <div className="absolute inset-0 rounded-lg bg-primary" />
      <div
        className="absolute -bottom-1 left-1.5 h-3 w-3 rotate-45 bg-primary"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      />
      <Link2
        className="relative z-10 h-4 w-4 text-primary-foreground"
        strokeWidth={2.5}
      />
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <SautiLogo />
        <div className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-tight">Sauti-Link</span>
          <span className="text-[10px] text-muted-foreground">Admin Panel</span>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {sidebarLinks.map((link) => {
          const active = isActiveLink(location.pathname, link.to, link.end);
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                active
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom CTA */}
      <div className="p-4">
        <div className="rounded-lg bg-primary/10 p-3 text-center">
          <Phone className="mx-auto mb-1 h-5 w-5 text-primary" />
          <p className="text-xs font-semibold text-primary">Dial *384#</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Citizen USSD access
          </p>
        </div>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex min-h-svh flex-col">
      {/* Kenya flag stripe at very top */}
      <KenyaFlagStripe />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r bg-sidebar lg:flex lg:flex-col">
          <KenyaFlagStripe />
          <SidebarContent />
        </aside>

        {/* Main area */}
        <div className="flex flex-1 flex-col">
          {/* Header bar */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-4 lg:px-6">
              {/* Left: mobile menu + title */}
              <div className="flex items-center gap-3">
                {/* Mobile menu */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                      <div className="flex items-center gap-2">
                        <SautiLogo />
                        <span className="text-sm font-bold">Sauti-Link</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setMobileOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <KenyaFlagStripe />
                    <SidebarContent onNavigate={() => setMobileOpen(false)} />
                  </SheetContent>
                </Sheet>

                <h1 className="text-lg font-semibold">{pageTitle}</h1>
              </div>

              {/* Right: notification + avatar */}
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                </Button>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      PN
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col leading-none sm:flex">
                    <span className="text-sm font-medium">
                      Hon. Peter Njoroge
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      MCA, Agikuyu Ward
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
