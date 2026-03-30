import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id, Doc } from "../../../convex/_generated/dataModel";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Upload,
  File,
  X,
  Eye,
  Loader2,
  Download,
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

const CATEGORIES = [
  "budget",
  "health",
  "education",
  "infrastructure",
  "environment",
] as const;

type BillStatus = "draft" | "open" | "closed";
type BillCategory = (typeof CATEGORIES)[number];

const statusColors: Record<BillStatus, string> = {
  draft: "bg-yellow-100 text-yellow-800 border-yellow-300",
  open: "bg-green-100 text-green-800 border-green-300",
  closed: "bg-gray-100 text-gray-600 border-gray-300",
};

const categoryColors: Record<BillCategory, string> = {
  budget: "bg-blue-100 text-blue-800",
  health: "bg-red-100 text-red-800",
  education: "bg-purple-100 text-purple-800",
  infrastructure: "bg-orange-100 text-orange-800",
  environment: "bg-emerald-100 text-emerald-800",
};

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

export function BillsManagement() {
  const { sessionToken } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCounty, setFilterCounty] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [detailBill, setDetailBill] = useState<Doc<"bills"> | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [titleSw, setTitleSw] = useState("");
  const [county, setCounty] = useState("");
  const [category, setCategory] = useState<BillCategory | "">("");
  const [summaryEn, setSummaryEn] = useState("");
  const [summarySw, setSummarySw] = useState("");
  const [simplifiedEn, setSimplifiedEn] = useState("");
  const [simplifiedSw, setSimplifiedSw] = useState("");
  const [detailedSummaryEn, setDetailedSummaryEn] = useState("");
  const [detailedSummarySw, setDetailedSummarySw] = useState("");
  const [fullTextUrl, setFullTextUrl] = useState("");
  const [createStatus, setCreateStatus] = useState<BillStatus>("draft");

  // PDF upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Per-bill PDF upload state (for existing bills)
  const [uploadingForBillId, setUploadingForBillId] = useState<Id<"bills"> | null>(null);
  const existingFileInputRef = useRef<HTMLInputElement>(null);

  const bills = useQuery(
    api.bills.list,
    sessionToken
      ? {
          sessionToken,
          ...(filterStatus !== "all" ? { status: filterStatus as BillStatus } : {}),
          ...(filterCounty !== "all" ? { county: filterCounty } : {}),
        }
      : "skip"
  );
  const mcas = useQuery(api.mcas.list, {});
  const createBill = useMutation(api.bills.create);
  const updateStatus = useMutation(api.bills.updateStatus);
  const updateBill = useMutation(api.bills.update);
  const generateUploadUrl = useMutation(api.bills.generateUploadUrl);

  // PDF URL for detail dialog
  const pdfUrl = useQuery(
    api.bills.getPdfUrl,
    detailBill?.pdfFileId ? { storageId: detailBill.pdfFileId } : "skip"
  );

  if (bills === undefined || mcas === undefined) {
    return <LoadingSkeleton />;
  }

  const totalBills = bills.length;
  const openCount = bills.filter((b) => b.status === "open").length;
  const draftCount = bills.filter((b) => b.status === "draft").length;
  const closedCount = bills.filter((b) => b.status === "closed").length;

  async function uploadPdf(file: File): Promise<Id<"_storage"> | undefined> {
    try {
      const uploadUrl = await generateUploadUrl({
        ...(sessionToken ? { sessionToken } : {}),
      });
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await response.json();
      return storageId as Id<"_storage">;
    } catch (error) {
      console.error("PDF upload failed:", error);
      return undefined;
    }
  }

  async function handleCreate() {
    if (!title || !titleSw || !county || !category) return;
    setIsUploading(true);
    try {
      let pdfFileId: Id<"_storage"> | undefined;
      if (pdfFile) {
        pdfFileId = await uploadPdf(pdfFile);
      }

      await createBill({
        title,
        titleSw,
        county,
        category: category as BillCategory,
        summaryEn: summaryEn.split("\n").filter(Boolean),
        summarySw: summarySw.split("\n").filter(Boolean),
        simplifiedEn: simplifiedEn || undefined,
        simplifiedSw: simplifiedSw || undefined,
        detailedSummaryEn: detailedSummaryEn || undefined,
        detailedSummarySw: detailedSummarySw || undefined,
        fullTextUrl: fullTextUrl || "#",
        status: createStatus,
        ...(pdfFileId ? { pdfFileId } : {}),
        ...(sessionToken ? { sessionToken } : {}),
      });
      // Reset form
      setTitle("");
      setTitleSw("");
      setCounty("");
      setCategory("");
      setSummaryEn("");
      setSummarySw("");
      setSimplifiedEn("");
      setSimplifiedSw("");
      setDetailedSummaryEn("");
      setDetailedSummarySw("");
      setFullTextUrl("");
      setCreateStatus("draft");
      setPdfFile(null);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create bill:", error);
    } finally {
      setIsUploading(false);
    }
  }

  async function handlePdfUploadForBill(billId: Id<"bills">, file: File) {
    setUploadingForBillId(billId);
    try {
      const pdfFileId = await uploadPdf(file);
      if (pdfFileId) {
        await updateBill({
          billId,
          pdfFileId,
          ...(sessionToken ? { sessionToken } : {}),
        });
      }
    } catch (error) {
      console.error("Failed to upload PDF:", error);
    } finally {
      setUploadingForBillId(null);
    }
  }

  async function handleStatusChange(billId: Id<"bills">, newStatus: BillStatus) {
    await updateStatus({
      billId,
      status: newStatus,
      ...(sessionToken ? { sessionToken } : {}),
    });
  }

  function getMcaName(mcaId: Id<"mcas">): string {
    const found = (mcas ?? []).find((m) => m._id === mcaId);
    return found?.name ?? "Unknown MCA";
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Bills</p>
              <p className="text-2xl font-bold">{totalBills}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-2xl font-bold">{openCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Drafts</p>
              <p className="text-2xl font-bold">{draftCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
              <AlertCircle className="h-6 w-6 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Closed</p>
              <p className="text-2xl font-bold">{closedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Create Button */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCounty} onValueChange={setFilterCounty}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="County" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Counties</SelectItem>
              {COUNTIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto">
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="mr-2 h-4 w-4" />
            {showCreateForm ? "Cancel" : "New Bill"}
          </Button>
        </div>
      </div>

      {/* Create Bill Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Upload New Bill</CardTitle>
            <CardDescription>
              Fill in the details to create a new bill for public participation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Basic Information
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title (English)</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Nairobi County Budget 2025/26"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title (Swahili)</label>
                  <Input
                    value={titleSw}
                    onChange={(e) => setTitleSw(e.target.value)}
                    placeholder="e.g., Bajeti ya Kaunti ya Nairobi 2025/26"
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
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={category}
                    onValueChange={(v) => setCategory(v as BillCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Status</label>
                  <Select
                    value={createStatus}
                    onValueChange={(v) => setCreateStatus(v as BillStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Text URL (optional)</label>
                  <Input
                    value={fullTextUrl}
                    onChange={(e) => setFullTextUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* PDF Upload */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Bill Document (PDF)
              </h3>
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPdfFile(file);
                  }}
                />
                {pdfFile ? (
                  <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                    <File className="h-5 w-5 text-red-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{pdfFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => setPdfFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Choose PDF File
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload the full bill document in PDF format
                </p>
              </div>
            </div>

            <Separator />

            {/* Summary Points */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Key Points (5 bullet points)
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Key Points (English) - one per line
                  </label>
                  <Textarea
                    value={summaryEn}
                    onChange={(e) => setSummaryEn(e.target.value)}
                    rows={5}
                    placeholder="Enter key points, one per line..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Key Points (Swahili) - one per line
                  </label>
                  <Textarea
                    value={summarySw}
                    onChange={(e) => setSummarySw(e.target.value)}
                    rows={5}
                    placeholder="Ingiza hoja muhimu, moja kwa kila mstari..."
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Simplified Summary */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Simplified Summary (Public-friendly)
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                A brief, easy-to-understand explanation of what this bill means for ordinary citizens.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Simplified Summary (English)</label>
                  <Textarea
                    value={simplifiedEn}
                    onChange={(e) => setSimplifiedEn(e.target.value)}
                    rows={4}
                    placeholder="This bill proposes to allocate funds for..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Simplified Summary (Swahili)</label>
                  <Textarea
                    value={simplifiedSw}
                    onChange={(e) => setSimplifiedSw(e.target.value)}
                    rows={4}
                    placeholder="Muswada huu unapendekeza kugawa fedha kwa..."
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Detailed Summary */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Detailed Summary
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                A more comprehensive breakdown covering scope, impact, implementation plan, and timeline.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Detailed Summary (English)</label>
                  <Textarea
                    value={detailedSummaryEn}
                    onChange={(e) => setDetailedSummaryEn(e.target.value)}
                    rows={6}
                    placeholder="Provide a detailed breakdown of the bill covering its scope, affected areas, budget allocation, expected impact, and implementation timeline..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Detailed Summary (Swahili)</label>
                  <Textarea
                    value={detailedSummarySw}
                    onChange={(e) => setDetailedSummarySw(e.target.value)}
                    rows={6}
                    placeholder="Toa maelezo ya kina ya muswada yakijumuisha upeo wake, maeneo yaliyoathiriwa, ugawaji wa bajeti, athari zinazotarajiwa, na ratiba ya utekelezaji..."
                  />
                </div>
              </div>
            </div>

            <Separator />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!title || !titleSw || !county || !category || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Bill
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file input for existing bill PDF upload */}
      <input
        ref={existingFileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadingForBillId) {
            handlePdfUploadForBill(uploadingForBillId, file);
          }
          // Reset input
          if (existingFileInputRef.current) {
            existingFileInputRef.current.value = "";
          }
        }}
      />

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bills</CardTitle>
          <CardDescription>
            Manage bills and update their status. {totalBills} bill
            {totalBills !== 1 ? "s" : ""} found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">No bills found</p>
              <p className="text-sm">
                Try adjusting your filters or create a new bill.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>County</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>PDF</TableHead>
                    <TableHead>MCA</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill._id}>
                      <TableCell className="max-w-[200px]">
                        <button
                          className="truncate font-medium text-left hover:text-primary hover:underline transition-colors"
                          onClick={() => setDetailBill(bill)}
                        >
                          {bill.title}
                        </button>
                      </TableCell>
                      <TableCell>{bill.county}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={categoryColors[bill.category]}
                        >
                          {bill.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[bill.status]}
                        >
                          {bill.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {bill.pdfFileId ? (
                          <Badge variant="outline" className="gap-1 bg-red-50 text-red-700 border-red-200">
                            <File className="h-3 w-3" />
                            PDF
                          </Badge>
                        ) : uploadingForBillId === bill._id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs text-muted-foreground"
                            onClick={() => {
                              setUploadingForBillId(bill._id);
                              existingFileInputRef.current?.click();
                            }}
                          >
                            <Upload className="h-3 w-3" />
                            Upload
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getMcaName(bill.uploadedBy)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(bill.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetailBill(bill)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {bill.status === "draft" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusChange(bill._id, "open")
                              }
                            >
                              Open
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          )}
                          {bill.status === "open" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusChange(bill._id, "closed")
                              }
                            >
                              Close
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          )}
                          {bill.status === "closed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleStatusChange(bill._id, "draft")
                              }
                            >
                              Reopen as Draft
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bill Detail Dialog */}
      <Dialog open={detailBill !== null} onOpenChange={(open) => !open && setDetailBill(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {detailBill && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{detailBill.title}</DialogTitle>
                <DialogDescription className="text-base italic">
                  {detailBill.titleSw}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {/* Metadata */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={statusColors[detailBill.status]}>
                    {detailBill.status}
                  </Badge>
                  <Badge variant="outline" className={categoryColors[detailBill.category]}>
                    {detailBill.category}
                  </Badge>
                  <Badge variant="outline">{detailBill.county} County</Badge>
                </div>

                {/* PDF Download */}
                {detailBill.pdfFileId && (
                  <div className="flex items-center gap-3 rounded-lg border bg-red-50/50 px-4 py-3">
                    <File className="h-5 w-5 text-red-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Bill Document (PDF)</p>
                      <p className="text-xs text-muted-foreground">Full text of the bill</p>
                    </div>
                    {pdfUrl && (
                      <Button variant="outline" size="sm" asChild className="gap-1.5">
                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {/* Simplified Summary */}
                {(detailBill.simplifiedEn || detailBill.simplifiedSw) && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Simplified Summary
                    </h4>
                    {detailBill.simplifiedEn && (
                      <div className="mb-2 rounded-lg bg-blue-50/50 px-4 py-3">
                        <p className="mb-1 text-xs font-medium text-blue-600">English</p>
                        <p className="text-sm leading-relaxed">{detailBill.simplifiedEn}</p>
                      </div>
                    )}
                    {detailBill.simplifiedSw && (
                      <div className="rounded-lg bg-green-50/50 px-4 py-3">
                        <p className="mb-1 text-xs font-medium text-green-600">Kiswahili</p>
                        <p className="text-sm leading-relaxed">{detailBill.simplifiedSw}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Key Points */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Key Points
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-muted-foreground">English</p>
                      <ul className="space-y-1.5">
                        {detailBill.summaryEn.map((point, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                              {i + 1}
                            </span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-muted-foreground">Kiswahili</p>
                      <ul className="space-y-1.5">
                        {detailBill.summarySw.map((point, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                              {i + 1}
                            </span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Detailed Summary */}
                {(detailBill.detailedSummaryEn || detailBill.detailedSummarySw) && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Detailed Summary
                    </h4>
                    {detailBill.detailedSummaryEn && (
                      <div className="mb-2 rounded-lg border px-4 py-3">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">English</p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {detailBill.detailedSummaryEn}
                        </p>
                      </div>
                    )}
                    {detailBill.detailedSummarySw && (
                      <div className="rounded-lg border px-4 py-3">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">Kiswahili</p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {detailBill.detailedSummarySw}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <Separator />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploaded by {getMcaName(detailBill.uploadedBy)}</span>
                  <span>{new Date(detailBill.uploadedAt).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
