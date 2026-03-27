import { useState, useEffect, useMemo } from "react";
import { budgetItems, bills } from "@/data/dummy";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Globe,
  Search,
  Shield,
  Info,
  Clock,
  MapPin,
  ChevronRight,
  Lock,
  Vote,
  X,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const now = new Date();
  const deadline = new Date(dateStr);
  const diff = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function deadlineUrgencyColor(days: number) {
  if (days <= 3) return "text-red-600 bg-red-50 border-red-200";
  if (days <= 7) return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-muted-foreground bg-muted border-border";
}

function progressGradientColor(forPercent: number): string {
  // Green when mostly for, transitioning to red when mostly against
  if (forPercent >= 70) return "bg-green-500";
  if (forPercent >= 50) return "bg-emerald-400";
  if (forPercent >= 35) return "bg-yellow-500";
  return "bg-red-500";
}

// ── Main Component ────────────────────────────────────────────────────────

export function VotePage() {
  const [language, setLanguage] = useState<"en" | "sw">("en");
  const [searchTerm, setSearchTerm] = useState("");
  const [votedItems, setVotedItems] = useState<
    Record<string, "for" | "against">
  >({});
  const [verified, setVerified] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [nationalId, setNationalId] = useState("");
  const [countyFilter, setCountyFilter] = useState("all");
  const [wardFilter, setWardFilter] = useState("all");
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  const t = language === "en";

  // Derive unique counties and wards from data
  const counties = useMemo(
    () => [...new Set(budgetItems.map((i) => i.county))].sort(),
    [],
  );
  const wards = useMemo(() => {
    const items =
      countyFilter === "all"
        ? budgetItems
        : budgetItems.filter((i) => i.county === countyFilter);
    return [...new Set(items.map((i) => i.ward))].sort();
  }, [countyFilter]);

  // Reset ward when county changes
  useEffect(() => {
    setWardFilter("all");
  }, [countyFilter]);

  const handleVerify = () => {
    if (nationalId.length === 8 && /^\d+$/.test(nationalId)) {
      setShowWelcome(true);
      setTimeout(() => {
        setVerified(true);
        setShowWelcome(false);
      }, 2200);
    }
  };

  const handleVote = (itemId: string, vote: "for" | "against") => {
    setVotedItems((prev) => ({ ...prev, [itemId]: vote }));
  };

  const filtered = budgetItems.filter((item) => {
    const desc = t ? item.description : item.descriptionSw;
    const matchesSearch = desc
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCounty =
      countyFilter === "all" || item.county === countyFilter;
    const matchesWard = wardFilter === "all" || item.ward === wardFilter;
    return item.status === "active" && matchesSearch && matchesCounty && matchesWard;
  });

  const totalActive = budgetItems.filter((i) => i.status === "active").length;
  const totalVoted = Object.keys(votedItems).length;

  // ── Welcome Screen (after verification) ───────────────────────────────

  if (showWelcome) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-14 w-14 text-green-600 animate-in zoom-in-50 duration-700" />
          </div>
          <h2 className="text-2xl font-bold text-green-700">
            {t ? "Welcome, Citizen!" : "Karibu, Mwananchi!"}
          </h2>
          <p className="max-w-sm text-muted-foreground">
            {t
              ? "Your identity has been verified. Redirecting you to the voting page..."
              : "Kitambulisho chako kimethibitishwa. Unachukuliwa kwenye ukurasa wa kupiga kura..."}
          </p>
          <div className="mt-2 h-1 w-48 overflow-hidden rounded-full bg-green-100">
            <div className="h-full animate-[progress-fill_2s_ease-in-out] bg-green-500" />
          </div>
        </div>
      </div>
    );
  }

  // ── Verification Screen ───────────────────────────────────────────────

  if (!verified) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-2 text-sm">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            1
          </span>
          <span className="font-medium text-primary">
            {t ? "Verify" : "Thibitisha"}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            2
          </span>
          <span className="text-muted-foreground">
            {t ? "Vote" : "Piga Kura"}
          </span>
        </div>

        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            {/* Kenya Coat of Arms placeholder */}
            <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/5">
              <div className="flex flex-col items-center">
                <Shield className="h-8 w-8 text-primary" />
                <span className="mt-0.5 text-[8px] font-bold tracking-wider text-primary/70">
                  KENYA
                </span>
              </div>
            </div>
            <CardTitle className="text-lg">
              {t ? "Identity Verification" : "Uthibitisho wa Kitambulisho"}
            </CardTitle>
            <CardDescription>
              {t
                ? "Enter your National ID to verify your identity before voting."
                : "Ingiza Kitambulisho chako cha Taifa kuthibitisha kabla ya kupiga kura."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t ? "National ID Number" : "Nambari ya Kitambulisho cha Taifa"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9 font-mono tracking-widest"
                  placeholder={t ? "e.g. 29384756" : "k.m. 29384756"}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
                  maxLength={8}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerify();
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="flex gap-0.5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 w-3 rounded-full transition-colors ${
                        i < nationalId.length
                          ? "bg-primary"
                          : "bg-muted-foreground/20"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-1">
                  {nationalId.length}/8 {t ? "digits" : "tarakimu"}
                </span>
              </div>
            </div>

            <Button
              onClick={handleVerify}
              disabled={nationalId.length !== 8}
              className="w-full gap-2"
              size="default"
            >
              <Shield className="h-4 w-4" />
              {t ? "Verify & Continue" : "Thibitisha na Endelea"}
            </Button>

            <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 p-3">
              <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {t
                  ? "Demo mode: Enter any 8-digit number to proceed. Your data is encrypted and secure."
                  : "Hali ya maonyesho: Ingiza nambari yoyote ya tarakimu 8 kuendelea. Data yako imehifadhiwa kwa usalama."}
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage((l) => (l === "en" ? "sw" : "en"))}
                className="gap-1.5"
              >
                <Globe className="h-4 w-4" />
                {t ? "Kiswahili" : "English"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main Voting Interface ─────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs">
          <CheckCircle className="h-4 w-4 text-green-600" />
        </span>
        <span className="text-muted-foreground line-through">
          {t ? "Verify" : "Thibitisha"}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          2
        </span>
        <span className="font-medium text-primary">
          {t ? "Vote" : "Piga Kura"}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t
              ? "Vote on Budget Items"
              : "Piga Kura kwa Vipengele vya Bajeti"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t
              ? "Review and cast your vote on active budget proposals."
              : "Kagua na piga kura yako kwa mapendekezo ya bajeti yanayoendelea."}
          </p>
        </div>
        <div className="flex gap-2 self-start">
          <Badge variant="outline" className="gap-1.5 py-1">
            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            {t ? "Verified" : "Imethibitishwa"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage((l) => (l === "en" ? "sw" : "en"))}
            className="gap-1.5"
          >
            <Globe className="h-4 w-4" />
            {t ? "Kiswahili" : "English"}
          </Button>
        </div>
      </div>

      {/* Vote Summary Banner */}
      <div className="mt-6 flex items-center justify-between rounded-xl border bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Vote className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {t ? "Your Voting Progress" : "Maendeleo Yako ya Kupiga Kura"}
            </p>
            <p className="text-xs text-muted-foreground">
              {t
                ? `${totalVoted} of ${totalActive} items voted`
                : `${totalVoted} kati ya ${totalActive} vipengele`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${totalActive > 0 ? (totalVoted / totalActive) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <span className="text-lg font-bold text-primary">
            {totalActive > 0
              ? Math.round((totalVoted / totalActive) * 100)
              : 0}
            %
          </span>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={
              t ? "Search budget items..." : "Tafuta vipengele vya bajeti..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* County filter */}
        <Select value={countyFilter} onValueChange={setCountyFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <MapPin className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder={t ? "County" : "Kaunti"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t ? "All Counties" : "Kaunti Zote"}
            </SelectItem>
            {counties.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ward filter */}
        <Select value={wardFilter} onValueChange={setWardFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={t ? "Ward" : "Kata"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t ? "All Wards" : "Kata Zote"}
            </SelectItem>
            {wards.map((w) => (
              <SelectItem key={w} value={w}>
                {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Search className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">
            {t ? "No items found" : "Hakuna vipengele vilivyopatikana"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            {t
              ? "Try adjusting your filters or search term."
              : "Jaribu kubadilisha vichujio au neno la kutafuta."}
          </p>
        </div>
      )}

      {/* Budget Items */}
      <div className="flex flex-col gap-5">
        {filtered.map((item) => {
          const bill = bills.find((b) => b.id === item.billId);
          const total = item.votesFor + item.votesAgainst;
          const forPercent =
            total > 0 ? Math.round((item.votesFor / total) * 100) : 0;
          const againstPercent = 100 - forPercent;
          const desc = t ? item.description : item.descriptionSw;
          const voted = votedItems[item.id];
          const daysLeft = daysUntil(item.deadline);
          const urgencyClass = deadlineUrgencyColor(daysLeft);
          const isInfoExpanded = expandedInfo === item.id;

          return (
            <Card
              key={item.id}
              className={`transition-all duration-300 hover:shadow-lg ${
                voted
                  ? "border-green-200 bg-green-50/30 ring-green-200/50"
                  : "hover:ring-primary/20"
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  {/* Top row: info + deadline badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <h3 className="text-base font-semibold leading-snug">
                          {desc}
                        </h3>
                        {/* Info button */}
                        <button
                          onClick={() =>
                            setExpandedInfo(isInfoExpanded ? null : item.id)
                          }
                          className="mt-0.5 shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={t ? "More info" : "Maelezo zaidi"}
                        >
                          {isInfoExpanded ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Info className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          {item.county}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.ward} {t ? "Ward" : "Kata"}
                        </Badge>
                        {bill && (
                          <span className="text-xs text-muted-foreground">
                            {t ? bill.title : bill.titleSw}
                          </span>
                        )}
                      </div>
                      {item.amount > 0 && (
                        <p className="mt-2 text-sm font-semibold text-primary">
                          KES {(item.amount / 1_000_000).toFixed(0)}M
                        </p>
                      )}
                    </div>

                    {/* Deadline urgency badge */}
                    <div
                      className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${urgencyClass}`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {daysLeft === 0
                        ? t
                          ? "Last day!"
                          : "Siku ya mwisho!"
                        : t
                          ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`
                          : `Siku ${daysLeft} zimebaki`}
                    </div>
                  </div>

                  {/* Expandable info panel */}
                  {isInfoExpanded && bill && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 text-sm animate-in slide-in-from-top-2 fade-in duration-200">
                      <p className="mb-2 font-medium text-blue-900">
                        {t ? "About this item" : "Kuhusu kipengele hiki"}
                      </p>
                      <p className="text-blue-800/80">
                        {t
                          ? `This budget item is part of "${bill.title}". It was proposed for ${item.ward} Ward in ${item.county} County. Voting closes on ${new Date(item.deadline).toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`
                          : `Kipengele hiki cha bajeti ni sehemu ya "${bill.titleSw}". Kilipendekeza kwa Kata ya ${item.ward} katika Kaunti ya ${item.county}. Kupiga kura kunafungwa ${new Date(item.deadline).toLocaleDateString("sw-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`}
                      </p>
                      {item.amount > 0 && (
                        <p className="mt-1.5 text-blue-800/80">
                          {t
                            ? `Total allocation: KES ${item.amount.toLocaleString()}`
                            : `Ugawaji wa jumla: KES ${item.amount.toLocaleString()}`}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-green-700">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {t ? "For" : "Kwa"}: {item.votesFor}{" "}
                        <span className="font-normal text-muted-foreground">
                          ({forPercent}%)
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-red-600">
                        <ThumbsDown className="h-3.5 w-3.5" />
                        {t ? "Against" : "Dhidi"}: {item.votesAgainst}{" "}
                        <span className="font-normal text-muted-foreground">
                          ({againstPercent}%)
                        </span>
                      </span>
                    </div>

                    {/* Custom dual-color progress bar */}
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`transition-all duration-500 ${progressGradientColor(forPercent)}`}
                        style={{ width: `${forPercent}%` }}
                      />
                      {againstPercent > 0 && (
                        <div
                          className="bg-red-400 transition-all duration-500"
                          style={{ width: `${againstPercent}%` }}
                        />
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {total.toLocaleString()}{" "}
                      {t ? "total votes" : "jumla ya kura"} &middot;{" "}
                      {t ? "Deadline" : "Mwisho"}:{" "}
                      {new Date(item.deadline).toLocaleDateString("en-KE", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Vote Buttons / Confirmation */}
                  {voted ? (
                    <div
                      className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all duration-300 animate-in fade-in zoom-in-95 ${
                        voted === "for"
                          ? "border-green-300 bg-green-50"
                          : "border-red-300 bg-red-50"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          voted === "for" ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {voted === "for" ? (
                          <ThumbsUp className="h-5 w-5 text-green-700" />
                        ) : (
                          <ThumbsDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            voted === "for"
                              ? "text-green-800"
                              : "text-red-800"
                          }`}
                        >
                          {t
                            ? `You voted ${voted === "for" ? "FOR" : "AGAINST"}`
                            : `Umepiga kura ${voted === "for" ? "KWA" : "DHIDI YA"}`}
                        </p>
                        <p
                          className={`text-xs ${
                            voted === "for"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {t
                            ? "Your vote has been recorded."
                            : "Kura yako imerekodiwa."}
                        </p>
                      </div>
                      <CheckCircle
                        className={`ml-auto h-5 w-5 ${
                          voted === "for"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      />
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleVote(item.id, "for")}
                        className="flex-1 gap-2 bg-green-600 shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-[0.98]"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {t ? "Vote For" : "Piga Kura Kwa"}
                      </Button>
                      <Button
                        onClick={() => handleVote(item.id, "against")}
                        variant="destructive"
                        className="flex-1 gap-2 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        {t ? "Vote Against" : "Piga Kura Dhidi"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom summary */}
      {filtered.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          {t
            ? `Showing ${filtered.length} of ${totalActive} active items`
            : `Inaonyesha ${filtered.length} kati ya ${totalActive} vipengele`}
          {totalVoted === totalActive && totalActive > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 font-medium text-green-600">
              <CheckCircle className="h-3.5 w-3.5" />
              {t
                ? "All items voted!"
                : "Vipengele vyote vimepigwa kura!"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
