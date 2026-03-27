import { useState } from "react";
import { bills, mcas } from "@/data/dummy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Globe, FileText, ChevronDown, ChevronUp } from "lucide-react";

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

export function Bills() {
  const [language, setLanguage] = useState<"en" | "sw">("en");
  const [expandedBill, setExpandedBill] = useState<string | null>("b1");

  const getMca = (id: string) => mcas.find((m) => m.id === id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {language === "en" ? "Active Bills & Policies" : "Miswada na Sera Zinazoendelea"}
          </h1>
          <p className="mt-1 text-muted-foreground">
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

      <Separator className="my-6" />

      {/* Bills List */}
      <div className="flex flex-col gap-4">
        {bills.map((bill) => {
          const mca = getMca(bill.uploadedBy);
          const isExpanded = expandedBill === bill.id;
          const title = language === "en" ? bill.title : bill.titleSw;
          const summary = language === "en" ? bill.summaryEn : bill.summarySw;

          return (
            <Card key={bill.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-snug">{title}</CardTitle>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{bill.county} County</span>
                      <span>&middot;</span>
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
                          <span>&middot;</span>
                          <span>{mca.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={statusColors[bill.status]}>{bill.status.toUpperCase()}</Badge>
                    <Badge className={categoryColors[bill.category]}>
                      {bill.category.charAt(0).toUpperCase() + bill.category.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedBill(isExpanded ? null : bill.id)}
                  className="mb-3 gap-1.5 text-primary"
                >
                  <FileText className="h-4 w-4" />
                  {language === "en" ? "AI Summary (5 Key Points)" : "Muhtasari wa AI (Hoja 5 Muhimu)"}
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {isExpanded && (
                  <ol className="ml-4 flex flex-col gap-2.5">
                    {summary.map((point, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {i + 1}
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
