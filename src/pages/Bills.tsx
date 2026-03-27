import { useMemo, useState } from "react";
import { bills, budgetItems, mcas } from "@/data/dummy";
import type { Bill } from "@/data/dummy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  Share2,
  Download,
  Search,
  DollarSign,
  Heart,
  GraduationCap,
  Building2,
  Leaf,
  MapPin,
  Stethoscope,
  BookOpen,
  Landmark,
  TreePine,
} from "lucide-react";

// --- Color maps ---

const statusColors: Record<string, string> = {
  open: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

const categoryColors: Record<string, string> = {
  budget: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  health: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  education: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  infrastructure: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  environment: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
};

const categoryBorderColors: Record<string, string> = {
  budget: "border-l-blue-500",
  health: "border-l-red-500",
  education: "border-l-purple-500",
  infrastructure: "border-l-orange-500",
  environment: "border-l-emerald-500",
};

const categoryIcons: Record<string, React.ElementType> = {
  budget: DollarSign,
  health: Heart,
  education: GraduationCap,
  infrastructure: Building2,
  environment: Leaf,
};

// Rotating icons for individual summary points per category
const summaryPointIcons: Record<string, React.ElementType[]> = {
  budget: [DollarSign, Building2, GraduationCap, MapPin, Landmark],
  health: [Stethoscope, Users, Heart, FileText, Clock],
  education: [GraduationCap, BookOpen, Users, Landmark, Building2],
  infrastructure: [Building2, MapPin, Landmark, DollarSign, Users],
  environment: [TreePine, Leaf, FileText, Users, DollarSign],
};

// --- Helpers ---

function estimateReadTime(points: string[]): number {
  const totalWords = points.reduce((sum, p) => sum + p.split(/\s+/).length, 0);
  return Math.max(1, Math.ceil(totalWords / 200));
}

function getBillEngagement(billId: string): number {
  const items = budgetItems.filter((bi) => bi.billId === billId);
  return items.reduce((sum, bi) => sum + bi.votesFor + bi.votesAgainst, 0);
}

// --- Component ---

export function Bills() {
  const [language, setLanguage] = useState<"en" | "sw">("en");
  const [expandedBill, setExpandedBill] = useState<string | null>("b1");
  const [countyFilter, setCountyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const getMca = (id: string) => mcas.find((m) => m.id === id);

  // Derive unique values for filters
  const counties = useMemo(() => [...new Set(bills.map((b) => b.county))], []);
  const statuses = useMemo(() => [...new Set(bills.map((b) => b.status))], []);
  const categories = useMemo(() => [...new Set(bills.map((b) => b.category))], []);

  // Filtered bills
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      if (countyFilter !== "all" && b.county !== countyFilter) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (categoryFilter !== "all" && b.category !== categoryFilter) return false;
      return true;
    });
  }, [countyFilter, statusFilter, categoryFilter]);

  const openCount = filteredBills.filter((b) => b.status === "open").length;
  const uniqueCounties = new Set(filteredBills.map((b) => b.county)).size;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            {language === "en" ? "Active Bills & Policies" : "Miswada na Sera Zinazoendelea"}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            {language === "en"
              ? "AI-simplified summaries of legislation affecting your county."
              : "Muhtasari uliorahisishwa na AI wa sheria zinazoathiri kaunti yako."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage((l) => (l === "en" ? "sw" : "en"))}
          className="gap-1.5 self-start"
        >
          <Globe className="h-4 w-4" />
          {language === "en" ? "Kiswahili" : "English"}
        </Button>
      </div>

      <Separator className="my-8" />

      {/* Summary header */}
      <div className="mb-6 rounded-lg border bg-muted/40 px-5 py-4">
        <p className="text-sm font-medium text-muted-foreground">
          {language === "en" ? (
            <>
              Showing{" "}
              <span className="font-semibold text-foreground">{filteredBills.length}</span>{" "}
              bill{filteredBills.length !== 1 ? "s" : ""} &mdash;{" "}
              <span className="font-semibold text-foreground">{openCount}</span> open across{" "}
              <span className="font-semibold text-foreground">{uniqueCounties}</span>{" "}
              count{uniqueCounties !== 1 ? "ies" : "y"}
            </>
          ) : (
            <>
              Inaonyesha miswada{" "}
              <span className="font-semibold text-foreground">{filteredBills.length}</span>{" "}
              &mdash;{" "}
              <span className="font-semibold text-foreground">{openCount}</span> wazi katika
              kaunti{" "}
              <span className="font-semibold text-foreground">{uniqueCounties}</span>
            </>
          )}
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Select value={countyFilter} onValueChange={setCountyFilter}>
          <SelectTrigger size="sm">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="County" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Counties</SelectItem>
            {counties.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(countyFilter !== "all" || statusFilter !== "all" || categoryFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCountyFilter("all");
              setStatusFilter("all");
              setCategoryFilter("all");
            }}
            className="text-muted-foreground"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Bills list */}
      {filteredBills.length === 0 ? (
        <EmptyState language={language} />
      ) : (
        <div className="flex flex-col gap-5">
          {filteredBills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              language={language}
              isExpanded={expandedBill === bill.id}
              onToggle={() => setExpandedBill(expandedBill === bill.id ? null : bill.id)}
              mca={getMca(bill.uploadedBy)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Empty state ---

function EmptyState({ language }: { language: "en" | "sw" }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">
        {language === "en" ? "No bills found" : "Hakuna miswada iliyopatikana"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {language === "en"
          ? "Try adjusting your filters to see more results."
          : "Jaribu kubadilisha vichujio vyako kuona matokeo zaidi."}
      </p>
    </div>
  );
}

// --- Bill card ---

interface BillCardProps {
  bill: Bill;
  language: "en" | "sw";
  isExpanded: boolean;
  onToggle: () => void;
  mca: ReturnType<typeof mcas.find>;
}

function BillCard({ bill, language, isExpanded, onToggle, mca }: BillCardProps) {
  const title = language === "en" ? bill.title : bill.titleSw;
  const summary = language === "en" ? bill.summaryEn : bill.summarySw;
  const readTime = estimateReadTime(summary);
  const engagement = getBillEngagement(bill.id);
  const CategoryIcon = categoryIcons[bill.category];
  const pointIcons = summaryPointIcons[bill.category];

  return (
    <Card
      className={`border-l-4 ${categoryBorderColors[bill.category]} overflow-hidden transition-all duration-200 hover:shadow-md`}
    >
      <CardHeader className="pb-3 pt-5">
        <div className="flex flex-wrap items-start gap-3">
          {/* Category icon */}
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <CategoryIcon className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Title & meta */}
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl leading-snug">{title}</CardTitle>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {bill.county} County
              </span>
              <span className="hidden sm:inline">&middot;</span>
              <span>
                {language === "en" ? "Uploaded" : "Imepakiwa"}{" "}
                {new Date(bill.uploadedAt).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              {mca && (
                <>
                  <span className="hidden sm:inline">&middot;</span>
                  <span>{mca.name}</span>
                </>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={statusColors[bill.status]}>{bill.status.toUpperCase()}</Badge>
            <Badge className={categoryColors[bill.category]}>
              {bill.category.charAt(0).toUpperCase() + bill.category.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Engagement & read time row */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {readTime} min read
          </span>
          {engagement > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {engagement.toLocaleString()} citizens have voted on items in this bill
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-5">
        {/* Expand / Collapse */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="mb-3 gap-1.5 text-primary"
        >
          <FileText className="h-4 w-4" />
          {language === "en" ? "AI Summary (5 Key Points)" : "Muhtasari wa AI (Hoja 5 Muhimu)"}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {/* Summary points with animation */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <ol className="ml-1 flex flex-col gap-3 pt-1 pb-2">
              {summary.map((point, i) => {
                const PointIcon = pointIcons[i % pointIcons.length];
                return (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <PointIcon className="h-3.5 w-3.5" />
                    </span>
                    <span className="pt-0.5">{point}</span>
                  </li>
                );
              })}
            </ol>

            {/* Action buttons */}
            <Separator className="my-3" />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Share2 className="h-3.5 w-3.5" />
                {language === "en" ? "Share" : "Shiriki"}
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />
                {language === "en" ? "Download Summary" : "Pakua Muhtasari"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
