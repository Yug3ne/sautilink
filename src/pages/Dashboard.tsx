import { useState } from "react";
import {
  engagementByMonth,
  sentimentByCounty,
  topIssues,
  budgetItems,
  feedbacks,
  bills,
  citizens,
  votes,
} from "@/data/dummy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
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
} from "lucide-react";

export function Dashboard() {
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [localFeedbacks, setLocalFeedbacks] = useState(feedbacks);

  const totalVotes = votes.length;
  const ussdVotes = votes.filter((v) => v.channel === "ussd").length;
  const webVotes = votes.filter((v) => v.channel === "web").length;
  const pendingFeedback = localFeedbacks.filter((f) => f.status === "pending").length;

  const handleRespond = (feedbackId: string) => {
    if (!responseText.trim()) return;
    setLocalFeedbacks((prev) =>
      prev.map((f) =>
        f.id === feedbackId ? { ...f, status: "responded" as const, response: responseText } : f
      )
    );
    setRespondingTo(null);
    setResponseText("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Real-time citizen engagement analytics powered by Sauti-Link.
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 self-start py-1 text-green-600 border-green-300">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </Badge>
      </div>

      <Separator className="my-6" />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Citizens</p>
                <p className="text-2xl font-bold">{citizens.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary/40" />
            </div>
            <p className="mt-1 text-xs text-green-600">
              <TrendingUp className="mr-1 inline h-3 w-3" />
              {citizens.filter((c) => c.verified).length} verified
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Votes</p>
                <p className="text-2xl font-bold">{totalVotes}</p>
              </div>
              <Vote className="h-8 w-8 text-primary/40" />
            </div>
            <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> USSD: {ussdVotes}
              </span>
              <span className="flex items-center gap-1">
                <Monitor className="h-3 w-3" /> Web: {webVotes}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Bills</p>
                <p className="text-2xl font-bold">
                  {bills.filter((b) => b.status === "open").length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-primary/40" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across {new Set(bills.map((b) => b.county)).size} counties
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Feedback</p>
                <p className="text-2xl font-bold">{pendingFeedback}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary/40" />
            </div>
            <p className="mt-1 text-xs text-yellow-600">
              <AlertCircle className="mr-1 inline h-3 w-3" />
              {pendingFeedback} awaiting response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="engagement" className="mt-8">
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="issues">Top Issues</TabsTrigger>
          <TabsTrigger value="votes">Vote Results</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Citizen Engagement by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementByMonth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="ussd"
                      name="USSD"
                      stroke="hsl(142, 71%, 45%)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="web"
                      name="Web"
                      stroke="hsl(217, 91%, 60%)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Citizen Sentiment by County (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentByCounty}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="county" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="positive" name="Positive" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="neutral" name="Neutral" fill="#eab308" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="negative" name="Negative" fill="#ef4444" radius={[4, 4, 0, 0]} />
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
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topIssues.map((issue) => (
                  <div key={issue.issue}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{issue.issue}</span>
                      <span className="text-muted-foreground">
                        {issue.count} mentions ({issue.percentage}%)
                      </span>
                    </div>
                    <Progress value={issue.percentage} className="h-2.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="votes" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {budgetItems.map((item) => {
              const total = item.votesFor + item.votesAgainst;
              const forPercent = total > 0 ? Math.round((item.votesFor / total) * 100) : 0;
              return (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-medium">{item.description}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.county} &middot; {item.ward} Ward
                    </p>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-green-600">For: {item.votesFor}</span>
                        <span className="text-red-600">Against: {item.votesAgainst}</span>
                      </div>
                      <Progress value={forPercent} className="h-2" />
                      <p className="mt-1 text-xs text-muted-foreground">{total} total votes</p>
                    </div>
                    <div className="mt-3">
                      <div className="h-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: "For", value: item.votesFor },
                                { name: "Against", value: item.votesAgainst },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={50}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              <Cell fill="#22c55e" />
                              <Cell fill="#ef4444" />
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Feedback Management */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Citizen Feedback</h2>
        <div className="flex flex-col gap-4">
          {localFeedbacks.map((fb) => (
            <Card key={fb.id}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{fb.citizenName}</span>
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
                    </div>
                    <p className="mt-2 text-sm">{fb.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(fb.timestamp).toLocaleString("en-KE")}
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
                  <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
                    <span className="font-medium text-primary">MCA Response: </span>
                    {fb.response}
                  </div>
                )}

                {fb.status === "pending" && respondingTo !== fb.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setRespondingTo(fb.id)}
                  >
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                    Respond
                  </Button>
                )}

                {respondingTo === fb.id && (
                  <div className="mt-3 flex flex-col gap-2">
                    <Textarea
                      placeholder="Type your response..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleRespond(fb.id)}>
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
