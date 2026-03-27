import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "recharts";
import {
  Vote,
  TrendingUp,
  BarChart3,
  Filter,
  Trophy,
  Scale,
} from "lucide-react";

const PIE_COLORS = ["#22c55e", "#ef4444"];

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="h-[300px] animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}

export function VoteResults() {
  const { sessionToken } = useAuth();
  const [filterCounty, setFilterCounty] = useState<string>("all");
  const [filterBill, setFilterBill] = useState<string>("all");

  const budgetItems = useQuery(
    api.budgetItems.list,
    sessionToken ? { sessionToken } : {}
  );
  const bills = useQuery(
    api.bills.list,
    sessionToken ? { sessionToken } : {}
  );

  const filtered = useMemo(() => {
    if (!budgetItems) return [];
    let result = budgetItems;
    if (filterCounty !== "all") {
      result = result.filter((item) => item.county === filterCounty);
    }
    if (filterBill !== "all") {
      result = result.filter((item) => item.billId === filterBill);
    }
    return result;
  }, [budgetItems, filterCounty, filterBill]);

  const stats = useMemo(() => {
    if (!filtered.length) {
      return {
        totalVotes: 0,
        totalFor: 0,
        totalAgainst: 0,
        mostPopular: null as string | null,
        mostControversial: null as string | null,
      };
    }

    let totalFor = 0;
    let totalAgainst = 0;
    let maxVotes = 0;
    let mostPopular: string | null = null;
    let closestRatio = Infinity;
    let mostControversial: string | null = null;

    for (const item of filtered) {
      totalFor += item.votesFor;
      totalAgainst += item.votesAgainst;
      const total = item.votesFor + item.votesAgainst;
      if (total > maxVotes) {
        maxVotes = total;
        mostPopular = item.description;
      }
      if (total > 0) {
        const ratio = Math.abs(item.votesFor / total - 0.5);
        if (ratio < closestRatio) {
          closestRatio = ratio;
          mostControversial = item.description;
        }
      }
    }

    return {
      totalVotes: totalFor + totalAgainst,
      totalFor,
      totalAgainst,
      mostPopular,
      mostControversial,
    };
  }, [filtered]);

  const barChartData = useMemo(() => {
    return filtered.map((item) => ({
      name:
        item.description.length > 25
          ? item.description.slice(0, 25) + "..."
          : item.description,
      For: item.votesFor,
      Against: item.votesAgainst,
    }));
  }, [filtered]);

  const pieData = useMemo(() => {
    return [
      { name: "For", value: stats.totalFor },
      { name: "Against", value: stats.totalAgainst },
    ];
  }, [stats]);

  const counties = useMemo(() => {
    if (!budgetItems) return [];
    return [...new Set(budgetItems.map((item) => item.county))];
  }, [budgetItems]);

  if (budgetItems === undefined || bills === undefined) {
    return <LoadingSkeleton />;
  }

  function getBillTitle(billId: Id<"bills">): string {
    const bill = bills?.find((b) => b._id === billId);
    return bill?.title ?? "Unknown Bill";
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Vote className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Votes Cast</p>
              <p className="text-2xl font-bold">
                {stats.totalVotes.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Most Popular Item</p>
              <p className="text-sm font-semibold truncate max-w-[200px]">
                {stats.mostPopular ?? "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <Scale className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Most Controversial</p>
              <p className="text-sm font-semibold truncate max-w-[200px]">
                {stats.mostControversial ?? "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterCounty} onValueChange={setFilterCounty}>
          <SelectTrigger className="w-[160px]">
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
        <Select value={filterBill} onValueChange={setFilterBill}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Bill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bills</SelectItem>
            {bills.map((b) => (
              <SelectItem key={b._id} value={b._id}>
                {b.title.length > 30 ? b.title.slice(0, 30) + "..." : b.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Charts */}
      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts">
            <BarChart3 className="mr-2 h-4 w-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="details">
            <TrendingUp className="mr-2 h-4 w-4" />
            Item Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Bar Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Votes by Budget Item</CardTitle>
                <CardDescription>
                  For vs Against comparison across all items
                </CardDescription>
              </CardHeader>
              <CardContent>
                {barChartData.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="For" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar
                        dataKey="Against"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Split</CardTitle>
                <CardDescription>Total For vs Against</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.totalVotes === 0 ? (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No votes yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Vote className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p className="text-lg font-medium">No budget items found</p>
                <p className="text-sm">Try adjusting your filters.</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((item) => {
              const total = item.votesFor + item.votesAgainst;
              const forPercent = total > 0 ? (item.votesFor / total) * 100 : 0;
              return (
                <Card key={item._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold">{item.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>{item.county}</span>
                          <span>-</span>
                          <span>{item.ward}</span>
                          <span>-</span>
                          <Badge variant="outline">
                            {getBillTitle(item.billId)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              item.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          KES {item.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-full space-y-2 md:w-64">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">
                            For: {item.votesFor}
                          </span>
                          <span className="text-red-600">
                            Against: {item.votesAgainst}
                          </span>
                        </div>
                        <Progress value={forPercent} className="h-3" />
                        <p className="text-center text-xs text-muted-foreground">
                          {total} total vote{total !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
