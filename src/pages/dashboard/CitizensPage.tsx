import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
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
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Shield,
  ShieldAlert,
  MapPin,
  Languages,
  Globe,
} from "lucide-react";

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
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-40 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function CitizensPage() {
  const { sessionToken } = useAuth();

  const stats = useQuery(
    api.dashboard.getStats,
    sessionToken ? { sessionToken } : {}
  );
  const allBills = useQuery(
    api.bills.list,
    sessionToken ? { sessionToken } : {}
  );

  // Derive county info from bills since we cannot list all citizens
  const countyData = useMemo(() => {
    if (!allBills) return [];
    const countySet = [...new Set(allBills.map((b) => b.county))];
    return countySet.sort();
  }, [allBills]);

  if (stats === undefined) {
    return <LoadingSkeleton />;
  }

  const verifiedPercent =
    stats.totalCitizens > 0
      ? (stats.verifiedCitizens / stats.totalCitizens) * 100
      : 0;
  const unverifiedCount = stats.totalCitizens - stats.verifiedCitizens;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Citizens</p>
              <p className="text-2xl font-bold">
                {stats.totalCitizens.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified</p>
              <p className="text-2xl font-bold">
                {stats.verifiedCitizens.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <ShieldAlert className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unverified</p>
              <p className="text-2xl font-bold">
                {unverifiedCount.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Progress</CardTitle>
          <CardDescription>
            {stats.verifiedCitizens} of {stats.totalCitizens} citizens have been
            verified via IPRS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-medium">
                {verifiedPercent.toFixed(1)}% verified
              </span>
              <span className="text-muted-foreground">
                {unverifiedCount} remaining
              </span>
            </div>
            <Progress value={verifiedPercent} className="h-4" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Engagement Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Overview</CardTitle>
            <CardDescription>
              How citizens interact with the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Total Votes Cast</p>
                  <p className="text-xs text-muted-foreground">
                    Across all channels
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold">
                {stats.totalVotes.toLocaleString()}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  USSD
                </Badge>
                <span className="text-sm">Votes via USSD (*384#)</span>
              </div>
              <span className="font-semibold">
                {stats.ussdVotes.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Web
                </Badge>
                <span className="text-sm">Votes via Web</span>
              </div>
              <span className="font-semibold">
                {stats.webVotes.toLocaleString()}
              </span>
            </div>
            {stats.totalVotes > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>USSD</span>
                    <span>Web</span>
                  </div>
                  <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="bg-orange-400 transition-all"
                      style={{
                        width: `${(stats.ussdVotes / stats.totalVotes) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-blue-400 transition-all"
                      style={{
                        width: `${(stats.webVotes / stats.totalVotes) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* County Coverage */}
        <Card>
          <CardHeader>
            <CardTitle>County Coverage</CardTitle>
            <CardDescription>
              Counties with active participation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {countyData.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <MapPin className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">No county data available yet</p>
              </div>
            ) : (
              countyData.map((county) => (
                <div
                  key={county}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{county}</span>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <Languages className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-blue-900">
              Citizen Data Management
            </p>
            <p className="mt-1 text-sm text-blue-800">
              Individual citizen records are managed through the IPRS (Integrated
              Population Registration System) integration. Citizens register via
              USSD (*384#) or the web portal using their National ID, and their
              identity is verified against IPRS records. Detailed citizen
              management and lookup is available through the USSD admin channel.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
