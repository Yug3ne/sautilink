import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const COUNTIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Kiambu",
  "Machakos",
  "Nyeri",
  "Uasin Gishu",
];

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
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
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mb-4 h-12 animate-pulse rounded bg-muted" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function ManageMCAs() {
  const { sessionToken, isSuperAdmin } = useAuth();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ward, setWard] = useState("");
  const [county, setCounty] = useState("");
  const [party, setParty] = useState("");
  const [role, setRole] = useState<"mca" | "superadmin">("mca");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const mcas = useQuery(
    api.mcas.listAll,
    sessionToken ? { sessionToken } : "skip"
  );
  const createMca = useMutation(api.auth.createMca);
  const toggleActive = useMutation(api.auth.toggleMcaActive);

  const stats = useMemo(() => {
    if (!mcas) return { total: 0, active: 0, inactive: 0, mcaCount: 0, superadminCount: 0 };
    return {
      total: mcas.length,
      active: mcas.filter((m) => m.isActive).length,
      inactive: mcas.filter((m) => !m.isActive).length,
      mcaCount: mcas.filter((m) => m.role === "mca").length,
      superadminCount: mcas.filter((m) => m.role === "superadmin").length,
    };
  }, [mcas]);

  if (!isSuperAdmin) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold">Access Denied</h2>
            <p className="text-center text-sm text-muted-foreground">
              You do not have permission to access this page. Only super
              administrators can manage MCA accounts.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mcas === undefined) {
    return <LoadingSkeleton />;
  }

  async function handleCreate() {
    if (!name || !email || !password || !ward || !county || !party || !sessionToken) return;
    setCreating(true);
    try {
      await createMca({
        sessionToken,
        name,
        email,
        password,
        ward,
        county,
        party,
        role,
      });
      setName("");
      setEmail("");
      setPassword("");
      setWard("");
      setCounty("");
      setParty("");
      setRole("mca");
      setShowCreateForm(false);
    } catch (err: any) {
      alert(err.message || "Failed to create MCA");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(mcaId: Id<"mcas">) {
    if (!sessionToken) return;
    await toggleActive({ sessionToken, mcaId });
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total MCAs</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <ToggleRight className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">MCAs</p>
              <p className="text-2xl font-bold">{stats.mcaCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <ShieldCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Super Admins</p>
              <p className="text-2xl font-bold">{stats.superadminCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <UserPlus className="mr-2 h-4 w-4" />
          {showCreateForm ? "Cancel" : "Create MCA"}
        </Button>
      </div>

      {/* Create MCA Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New MCA Account</CardTitle>
            <CardDescription>
              Fill in the details to create a new MCA or super admin account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Hon. John Kamau"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., john@county.go.ke"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ward</label>
                <Input
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="e.g., Agikuyu"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">County</label>
                <Select value={county} onValueChange={setCounty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Party</label>
                <Input
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                  placeholder="e.g., UDA"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={role} onValueChange={(v) => setRole(v as "mca" | "superadmin")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mca">MCA</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleCreate}
                disabled={!name || !email || !password || !ward || !county || !party || creating}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {creating ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MCAs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All MCA Accounts</CardTitle>
          <CardDescription>
            Manage MCA accounts. {stats.total} account{stats.total !== 1 ? "s" : ""} total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mcas.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">No MCAs found</p>
              <p className="text-sm">Create the first MCA account to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>County</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mcas.map((mca) => (
                    <TableRow key={mca._id}>
                      <TableCell className="font-medium">{mca.name}</TableCell>
                      <TableCell className="text-sm">{mca.email}</TableCell>
                      <TableCell className="text-sm">{mca.ward}</TableCell>
                      <TableCell className="text-sm">{mca.county}</TableCell>
                      <TableCell className="text-sm">{mca.party}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            mca.role === "superadmin"
                              ? "bg-purple-100 text-purple-800 border-purple-300"
                              : "bg-blue-100 text-blue-800 border-blue-300"
                          }
                        >
                          {mca.role === "superadmin" ? "Super Admin" : "MCA"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            mca.isActive
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-red-100 text-red-800 border-red-300"
                          }
                        >
                          {mca.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(mca._id)}
                        >
                          {mca.isActive ? (
                            <>
                              <ToggleLeft className="mr-1 h-3 w-3" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleRight className="mr-1 h-3 w-3" />
                              Activate
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
