import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  Users,
  Vote,
  FileText,
  MessageSquare,
  TrendingUp,
  Phone,
  Monitor,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  BarChart3,
  Activity,
  PieChart as PieChartIcon,
  ListChecks,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  MessageCircle,
  Filter,
  Send,
  Smartphone,
  Globe,
  Mail,
} from "lucide-react";

// --- Dummy sparkline data for KPI cards ---
const citizenSparkline = [
  { v: 30 },
  { v: 45 },
  { v: 35 },
  { v: 55 },
  { v: 48 },
  { v: 62 },
  { v: 70 },
];
const voteSparkline = [
  { v: 12 },
  { v: 24 },
  { v: 18 },
  { v: 40 },
  { v: 35 },
  { v: 52 },
  { v: 58 },
];
const billSparkline = [
  { v: 2 },
  { v: 3 },
  { v: 2 },
  { v: 4 },
  { v: 3 },
  { v: 3 },
  { v: 3 },
];
const feedbackSparkline = [
  { v: 8 },
  { v: 5 },
  { v: 12 },
  { v: 7 },
  { v: 3 },
  { v: 6 },
  { v: 2 },
];

// --- Custom tooltip component ---
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// --- Mini sparkline component ---
function MiniSparkline({
  data,
  color,
}: {
  data: Array<{ v: number }>;
  color: string;
}) {
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${color})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Dashboard() {
  const { sessionToken } = useAuth();
  const [respondingTo, setRespondingTo] = useState<Id<"feedback"> | null>(null);
  const [responseText, setResponseText] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState<
    "all" | "pending" | "responded"
  >("all");
  const [dateRange, setDateRange] = useState("30d");

  // Convex queries - pass sessionToken to scope results
  const sessionArgs = sessionToken ? { sessionToken } : {};
  const stats = useQuery(api.dashboard.getStats, sessionArgs);
  const engagementData = useQuery(api.dashboard.getEngagementByMonth, sessionArgs);
  const sentimentData = useQuery(api.dashboard.getSentimentByCounty, sessionArgs);
  const channelData = useQuery(api.dashboard.getChannelDistribution, sessionArgs);
  const topIssuesData = useQuery(api.dashboard.getTopIssues, sessionArgs);
  const recentActivity = useQuery(api.dashboard.getRecentActivity, sessionArgs);
  const feedbackList = useQuery(
    api.feedback.list,
    sessionToken ? { sessionToken } : {}
  );
  const billsList = useQuery(
    api.bills.list,
    sessionToken ? { sessionToken } : {}
  );
  const budgetItemsList = useQuery(
    api.budgetItems.list,
    sessionToken ? { sessionToken } : {}
  );

  // Convex mutation
  const respondToFeedback = useMutation(api.feedback.respond);

  const handleRespond = async (feedbackId: Id<"feedback">) => {
    if (!responseText.trim()) return;
    await respondToFeedback({
      feedbackId,
      response: responseText,
      ...(sessionToken ? { sessionToken } : {}),
    });
    setRespondingTo(null);
    setResponseText("");
  };

  const totalVotes = stats?.totalVotes ?? 0;
  const ussdVotes = stats?.ussdVotes ?? 0;
  const webVotes = stats?.webVotes ?? 0;
  const pendingFeedback = stats?.pendingFeedback ?? 0;
  const activeBills = stats?.activeBills ?? 0;
  const totalCitizens = stats?.totalCitizens ?? 0;
  const verifiedCitizens = stats?.verifiedCitizens ?? 0;
  const counties = stats?.counties ?? [];

  const filteredFeedbacks =
    feedbackFilter === "all"
      ? (feedbackList ?? [])
      : (feedbackList ?? []).filter((f) => f.status === feedbackFilter);

  const channelColors = ["#22c55e", "#3b82f6", "#f59e0b"];

  const totalChannelVotes = (channelData ?? []).reduce(
    (sum, c) => sum + c.value,
    0
  );

  // Loading state
  if (
    stats === undefined ||
    engagementData === undefined ||
    sentimentData === undefined ||
    channelData === undefined ||
    topIssuesData === undefined ||
    feedbackList === undefined ||
    billsList === undefined ||
    budgetItemsList === undefined
  ) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Loading real-time data...
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-3 w-24 rounded bg-muted" />
                  <div className="h-8 w-16 rounded bg-muted" />
                  <div className="h-3 w-32 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <Card>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 w-48 rounded bg-muted" />
                <div className="h-[350px] rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-32 rounded bg-muted" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 rounded bg-muted" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time citizen engagement analytics
            {counties.length > 0
              ? ` across ${counties.length === 1 ? counties[0] : `${counties.length} counties`}`
              : ""}
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 py-1 text-green-600 border-green-300"
          >
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </Badge>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger size="sm" className="w-[150px]">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download Report</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Citizens */}
          <Card className="relative overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Total Citizens
                  </p>
                  <p className="mt-1 text-3xl font-bold tabular-nums">
                    {totalCitizens.toLocaleString()}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-400">
                      <ArrowUpRight className="h-3 w-3" />
                      +12%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      from last month
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <MiniSparkline data={citizenSparkline} color="#22c55e" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>
                  {verifiedCitizens} verified (
                  {totalCitizens > 0
                    ? Math.round((verifiedCitizens / totalCitizens) * 100)
                    : 0}
                  %)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Votes */}
          <Card className="relative overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Total Votes
                  </p>
                  <p className="mt-1 text-3xl font-bold tabular-nums">
                    {totalVotes.toLocaleString()}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-400">
                      <ArrowUpRight className="h-3 w-3" />
                      +34%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      from last month
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950">
                    <Vote className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <MiniSparkline data={voteSparkline} color="#3b82f6" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> USSD: {ussdVotes}
                </span>
                <span className="flex items-center gap-1">
                  <Monitor className="h-3 w-3" /> Web: {webVotes}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Active Bills */}
          <Card className="relative overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Active Bills
                  </p>
                  <p className="mt-1 text-3xl font-bold tabular-nums">
                    {activeBills}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                      <TrendingUp className="h-3 w-3" />
                      +1
                    </span>
                    <span className="text-xs text-muted-foreground">
                      new this week
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="rounded-lg bg-violet-50 p-2 dark:bg-violet-950">
                    <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <MiniSparkline data={billSparkline} color="#8b5cf6" />
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Across {counties.length} counties
                &middot; {billsList.filter((b) => b.status === "draft").length}{" "}
                drafts
              </div>
            </CardContent>
          </Card>

          {/* Pending Feedback */}
          <Card className="relative overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Pending Feedback
                  </p>
                  <p className="mt-1 text-3xl font-bold tabular-nums">
                    {pendingFeedback}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-400">
                      <ArrowDownRight className="h-3 w-3" />
                      -18%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      from last month
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-950">
                    <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <MiniSparkline data={feedbackSparkline} color="#f59e0b" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-3 w-3" />
                <span>{pendingFeedback} awaiting response</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid: Charts + Activity Sidebar */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left Column: Charts */}
          <div className="space-y-6">
            {/* Charts Tabs */}
            <Tabs defaultValue="engagement">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="engagement" className="gap-1.5">
                  <Activity className="h-3.5 w-3.5" />
                  Engagement
                </TabsTrigger>
                <TabsTrigger value="sentiment" className="gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Sentiment
                </TabsTrigger>
                <TabsTrigger value="issues" className="gap-1.5">
                  <ListChecks className="h-3.5 w-3.5" />
                  Top Issues
                </TabsTrigger>
                <TabsTrigger value="votes" className="gap-1.5">
                  <Vote className="h-3.5 w-3.5" />
                  Vote Results
                </TabsTrigger>
              </TabsList>

              <TabsContent value="engagement" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Citizen Engagement by Month</CardTitle>
                    <CardDescription>
                      USSD and Web participation trends over the last 6 months.
                      Total engagement grew 46% month-over-month.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={engagementData ?? []}>
                          <defs>
                            <linearGradient
                              id="gradUssd"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#22c55e"
                                stopOpacity={0.2}
                              />
                              <stop
                                offset="100%"
                                stopColor="#22c55e"
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="gradWeb"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#3b82f6"
                                stopOpacity={0.2}
                              />
                              <stop
                                offset="100%"
                                stopColor="#3b82f6"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-border"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="month"
                            className="text-xs"
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            className="text-xs"
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: "12px" }}
                          />
                          <Area
                            type="monotone"
                            dataKey="ussd"
                            name="USSD"
                            stroke="#22c55e"
                            strokeWidth={2}
                            fill="url(#gradUssd)"
                            dot={{ r: 3, fill: "#22c55e" }}
                            activeDot={{ r: 5 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="web"
                            name="Web"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#gradWeb)"
                            dot={{ r: 3, fill: "#3b82f6" }}
                            activeDot={{ r: 5 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sentiment" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Citizen Sentiment by County</CardTitle>
                    <CardDescription>
                      Breakdown of positive, neutral, and negative sentiment
                      from citizen feedback across counties.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sentimentData ?? []} barGap={2}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-border"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="county"
                            className="text-xs"
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            className="text-xs"
                            axisLine={false}
                            tickLine={false}
                            unit="%"
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: "12px" }}
                          />
                          <Bar
                            dataKey="positive"
                            name="Positive"
                            fill="#22c55e"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="neutral"
                            name="Neutral"
                            fill="#eab308"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="negative"
                            name="Negative"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="issues" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Community Issues</CardTitle>
                    <CardDescription>
                      Most mentioned issues from citizen feedback and
                      discussions, aggregated across all channels.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      {(topIssuesData ?? []).map((issue, i) => {
                        const colors = [
                          "bg-primary",
                          "bg-blue-500",
                          "bg-violet-500",
                          "bg-amber-500",
                          "bg-red-500",
                          "bg-emerald-500",
                        ];
                        return (
                          <div key={issue.issue}>
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                  #{i + 1}
                                </span>
                                <span className="text-sm font-semibold">
                                  {issue.issue}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold tabular-nums">
                                  {issue.count.toLocaleString()}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {issue.percentage}%
                                </Badge>
                              </div>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full transition-all ${colors[i] || "bg-primary"}`}
                                style={{ width: `${issue.percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="votes" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {(budgetItemsList ?? []).map((item) => {
                    const total = item.votesFor + item.votesAgainst;
                    const forPercent =
                      total > 0
                        ? Math.round((item.votesFor / total) * 100)
                        : 0;
                    const isPassing = forPercent >= 50;
                    return (
                      <Card key={item._id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-semibold leading-tight">
                                {item.description}
                              </h4>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {item.county} &middot; {item.ward} Ward
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                isPassing
                                  ? "border-green-300 text-green-700 dark:text-green-400"
                                  : "border-red-300 text-red-700 dark:text-red-400"
                              }
                            >
                              {isPassing ? "Passing" : "Failing"}
                            </Badge>
                          </div>
                          <div className="mt-4">
                            <div className="mb-1.5 flex justify-between text-xs font-medium">
                              <span className="text-green-600">
                                For: {item.votesFor} ({forPercent}%)
                              </span>
                              <span className="text-red-600">
                                Against: {item.votesAgainst} (
                                {100 - forPercent}%)
                              </span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-red-100 dark:bg-red-950">
                              <div
                                className="h-full rounded-full bg-green-500 transition-all"
                                style={{ width: `${forPercent}%` }}
                              />
                            </div>
                            <p className="mt-1.5 text-xs text-muted-foreground">
                              {total.toLocaleString()} total votes &middot;
                              Deadline:{" "}
                              {new Date(item.deadline).toLocaleDateString(
                                "en-KE",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>

            {/* Channel Distribution + Engagement Summary Row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Channel Distribution Donut */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                    Channel Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of citizen participation across USSD, Web, and SMS
                    channels.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="h-[180px] w-[180px] flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={channelData ?? []}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {(channelData ?? []).map((_, i) => (
                              <Cell key={i} fill={channelColors[i]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-3">
                      {(channelData ?? []).map((ch, i) => {
                        const pct =
                          totalChannelVotes > 0
                            ? Math.round((ch.value / totalChannelVotes) * 100)
                            : 0;
                        const icons = [
                          <Smartphone
                            key="ussd"
                            className="h-4 w-4"
                            style={{ color: channelColors[i] }}
                          />,
                          <Globe
                            key="web"
                            className="h-4 w-4"
                            style={{ color: channelColors[i] }}
                          />,
                          <Mail
                            key="sms"
                            className="h-4 w-4"
                            style={{ color: channelColors[i] }}
                          />,
                        ];
                        return (
                          <div key={ch.name} className="flex items-center gap-3">
                            {icons[i]}
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{ch.name}</span>
                                <span className="tabular-nums font-semibold">
                                  {pct}%
                                </span>
                              </div>
                              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: channelColors[i],
                                  }}
                                />
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {ch.value.toLocaleString()} interactions
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Performance Summary
                  </CardTitle>
                  <CardDescription>
                    Key metrics for the selected time period.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-green-100 p-1.5 dark:bg-green-950">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Engagement Rate
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Across all channels
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        78%
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-blue-100 p-1.5 dark:bg-blue-950">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Avg. Response Time
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Feedback responses
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        4.2h
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-violet-100 p-1.5 dark:bg-violet-950">
                          <CheckCircle className="h-4 w-4 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Resolution Rate
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Complaints resolved
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-violet-600">
                        92%
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-amber-100 p-1.5 dark:bg-amber-950">
                          <Users className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Citizen Satisfaction
                          </p>
                          <p className="text-xs text-muted-foreground">
                            From post-interaction surveys
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-amber-600">
                        4.6/5
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feedback Management */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      Citizen Feedback
                    </CardTitle>
                    <CardDescription>
                      Manage and respond to citizen inquiries, complaints, and
                      suggestions.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={feedbackFilter}
                      onValueChange={(v) =>
                        setFeedbackFilter(
                          v as "all" | "pending" | "responded"
                        )
                      }
                    >
                      <SelectTrigger size="sm" className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All feedback</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="responded">Responded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {filteredFeedbacks.map((fb) => {
                    const priorityMap: Record<
                      string,
                      { label: string; color: string }
                    > = {
                      complaint: {
                        label: "High",
                        color:
                          "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
                      },
                      question: {
                        label: "Medium",
                        color:
                          "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
                      },
                      suggestion: {
                        label: "Low",
                        color:
                          "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
                      },
                    };
                    const priority = priorityMap[fb.category];
                    return (
                      <div
                        key={fb._id}
                        className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Avatar size="sm">
                                <AvatarFallback className="text-xs">
                                  {fb.citizenName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-semibold">
                                {fb.citizenName}
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  fb.category === "complaint"
                                    ? "text-red-600 border-red-300"
                                    : fb.category === "question"
                                      ? "text-blue-600 border-blue-300"
                                      : "text-green-600 border-green-300"
                                }
                              >
                                {fb.category}
                              </Badge>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${priority.color}`}
                              >
                                {priority.label} priority
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed">
                              {fb.message}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(fb.timestamp).toLocaleString("en-KE", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                          </div>
                          <Badge
                            className={
                              fb.status === "responded"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }
                          >
                            {fb.status === "responded" ? (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            ) : (
                              <Clock className="mr-1 h-3 w-3" />
                            )}
                            {fb.status}
                          </Badge>
                        </div>

                        {fb.response && (
                          <div className="mt-3 rounded-lg border border-green-200 bg-green-50/50 p-3 dark:border-green-900 dark:bg-green-950/30">
                            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400">
                              <CheckCircle className="h-3 w-3" />
                              MCA Response
                            </div>
                            <p className="text-sm text-green-900 dark:text-green-200">
                              {fb.response}
                            </p>
                          </div>
                        )}

                        {fb.status === "pending" &&
                          respondingTo !== fb._id && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 gap-1.5"
                              onClick={() => setRespondingTo(fb._id)}
                            >
                              <Send className="h-3.5 w-3.5" />
                              Respond
                            </Button>
                          )}

                        {respondingTo === fb._id && (
                          <div className="mt-3 space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                            <p className="text-xs font-medium text-muted-foreground">
                              Write your response:
                            </p>
                            <Textarea
                              placeholder="Type your response..."
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              rows={3}
                              className="bg-background"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="gap-1.5"
                                onClick={() => handleRespond(fb._id)}
                              >
                                <Send className="h-3.5 w-3.5" />
                                Send Response
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setRespondingTo(null);
                                  setResponseText("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredFeedbacks.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No feedback matching the selected filter.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Recent Activity */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Live feed of citizen actions across all channels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {(recentActivity ?? []).map((item, i) => (
                    <div key={`${item.type}-${item.timestamp}-${i}`}>
                      <div className="flex gap-3 py-3">
                        <div
                          className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                            item.type === "vote"
                              ? "bg-blue-100 dark:bg-blue-950"
                              : "bg-amber-100 dark:bg-amber-950"
                          }`}
                        >
                          {item.type === "vote" ? (
                            <Vote className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-relaxed">
                            {item.type === "vote"
                              ? `Vote cast via ${(item.data as { channel: string }).channel}`
                              : `Feedback submitted: ${(item.data as { message: string }).message?.slice(0, 80)}...`}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(item.timestamp).toLocaleString("en-KE", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                            <Badge
                              variant="outline"
                              className="h-4 px-1 text-[10px]"
                            >
                              {item.type === "vote"
                                ? (item.data as { channel: string }).channel?.toUpperCase()
                                : "Feedback"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {i < (recentActivity ?? []).length - 1 && (
                        <Separator />
                      )}
                    </div>
                  ))}
                  {(recentActivity ?? []).length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No recent activity.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="h-auto flex-col gap-1.5 py-3 text-xs">
                    <FileText className="h-4 w-4" />
                    New Bill
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto flex-col gap-1.5 py-3 text-xs">
                    <MessageSquare className="h-4 w-4" />
                    Send Alert
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto flex-col gap-1.5 py-3 text-xs">
                    <Users className="h-4 w-4" />
                    View Citizens
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto flex-col gap-1.5 py-3 text-xs">
                    <Download className="h-4 w-4" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
