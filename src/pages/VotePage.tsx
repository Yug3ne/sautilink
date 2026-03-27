import { useState } from "react";
import { budgetItems, bills } from "@/data/dummy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Globe,
  Search,
  Shield,
} from "lucide-react";

export function VotePage() {
  const [language, setLanguage] = useState<"en" | "sw">("en");
  const [searchTerm, setSearchTerm] = useState("");
  const [votedItems, setVotedItems] = useState<Record<string, "for" | "against">>({});
  const [verified, setVerified] = useState(false);
  const [nationalId, setNationalId] = useState("");

  const handleVerify = () => {
    // Dummy verification — accepts any 8-digit number
    if (nationalId.length === 8 && /^\d+$/.test(nationalId)) {
      setVerified(true);
    }
  };

  const handleVote = (itemId: string, vote: "for" | "against") => {
    setVotedItems((prev) => ({ ...prev, [itemId]: vote }));
  };

  const filtered = budgetItems.filter((item) => {
    const desc = language === "en" ? item.description : item.descriptionSw;
    return (
      item.status === "active" &&
      desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (!verified) {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <Card>
          <CardHeader className="text-center">
            <Shield className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="mt-3">
              {language === "en" ? "Identity Verification" : "Uthibitisho wa Kitambulisho"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {language === "en"
                ? "Enter your National ID to verify your identity before voting."
                : "Ingiza Kitambulisho chako cha Taifa kuthibitisha kabla ya kupiga kura."}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              placeholder={language === "en" ? "National ID (8 digits)" : "Kitambulisho cha Taifa (tarakimu 8)"}
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              maxLength={8}
            />
            <Button onClick={handleVerify} disabled={nationalId.length !== 8} className="w-full">
              {language === "en" ? "Verify & Continue" : "Thibitisha na Endelea"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {language === "en"
                ? "Demo: Enter any 8-digit number to proceed."
                : "Demo: Ingiza nambari yoyote ya tarakimu 8 kuendelea."}
            </p>
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={() => setLanguage((l) => (l === "en" ? "sw" : "en"))}>
                <Globe className="mr-1.5 h-4 w-4" />
                {language === "en" ? "Kiswahili" : "English"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {language === "en" ? "Vote on Budget Items" : "Piga Kura kwa Vipengele vya Bajeti"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {language === "en"
              ? "Review and cast your vote on active budget proposals."
              : "Kagua na piga kura yako kwa mapendekezo ya bajeti yanayoendelea."}
          </p>
        </div>
        <div className="flex gap-2 self-start">
          <Badge variant="outline" className="gap-1.5 py-1">
            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            {language === "en" ? "Verified" : "Imethibitishwa"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage((l) => (l === "en" ? "sw" : "en"))}
            className="gap-1.5"
          >
            <Globe className="h-4 w-4" />
            {language === "en" ? "Kiswahili" : "English"}
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={language === "en" ? "Search budget items..." : "Tafuta vipengele vya bajeti..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Budget Items */}
      <div className="flex flex-col gap-4">
        {filtered.map((item) => {
          const bill = bills.find((b) => b.id === item.billId);
          const total = item.votesFor + item.votesAgainst;
          const forPercent = total > 0 ? Math.round((item.votesFor / total) * 100) : 0;
          const desc = language === "en" ? item.description : item.descriptionSw;
          const voted = votedItems[item.id];

          return (
            <Card key={item.id} className="transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  {/* Info */}
                  <div>
                    <h3 className="font-semibold">{desc}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {item.county} &middot; {item.ward} Ward
                      </span>
                      {bill && (
                        <>
                          <span>&middot;</span>
                          <span className="text-xs">
                            {language === "en" ? bill.title : bill.titleSw}
                          </span>
                        </>
                      )}
                    </div>
                    {item.amount > 0 && (
                      <p className="mt-1 text-sm font-medium text-primary">
                        KES {(item.amount / 1_000_000).toFixed(0)}M
                      </p>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-green-600">
                        {language === "en" ? "For" : "Kwa"}: {item.votesFor} ({forPercent}%)
                      </span>
                      <span className="text-red-600">
                        {language === "en" ? "Against" : "Dhidi"}: {item.votesAgainst} ({100 - forPercent}%)
                      </span>
                    </div>
                    <Progress value={forPercent} className="h-2.5" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {total} {language === "en" ? "total votes" : "jumla ya kura"} &middot;{" "}
                      {language === "en" ? "Deadline" : "Mwisho"}: {new Date(item.deadline).toLocaleDateString("en-KE")}
                    </p>
                  </div>

                  {/* Vote Buttons */}
                  {voted ? (
                    <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">
                        {language === "en"
                          ? `You voted ${voted === "for" ? "FOR" : "AGAINST"} this item.`
                          : `Umepiga kura ${voted === "for" ? "KWA" : "DHIDI YA"} kipengele hiki.`}
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleVote(item.id, "for")}
                        className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {language === "en" ? "Vote For" : "Piga Kura Kwa"}
                      </Button>
                      <Button
                        onClick={() => handleVote(item.id, "against")}
                        variant="destructive"
                        className="flex-1 gap-2"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        {language === "en" ? "Vote Against" : "Piga Kura Dhidi"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
