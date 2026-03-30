import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Shield,
  Loader2,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Send,
  CheckCircle,
  Clock,
  User,
  MapPin,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";

type FeedbackCategory = "question" | "complaint" | "suggestion";

const categoryConfig: Record<
  FeedbackCategory,
  { label: string; labelSw: string; icon: React.ElementType; color: string; bg: string; description: string; descriptionSw: string }
> = {
  question: {
    label: "Question",
    labelSw: "Swali",
    icon: HelpCircle,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    description: "Ask your MCA about policies, services, or plans",
    descriptionSw: "Uliza MCA wako kuhusu sera, huduma, au mipango",
  },
  complaint: {
    label: "Complaint",
    labelSw: "Malalamiko",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    description: "Report issues or problems in your ward",
    descriptionSw: "Ripoti matatizo katika kata yako",
  },
  suggestion: {
    label: "Suggestion",
    labelSw: "Pendekezo",
    icon: Lightbulb,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    description: "Share ideas for improving your community",
    descriptionSw: "Shiriki mawazo ya kuboresha jamii yako",
  },
};

export function FeedbackPage() {
  const [language, setLanguage] = useState<"en" | "sw">("en");
  const t = language === "en";

  // Verification state
  const [nationalId, setNationalId] = useState("");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [citizenId, setCitizenId] = useState<Id<"citizens"> | null>(null);
  const [citizenName, setCitizenName] = useState("");
  const [citizenCounty, setCitizenCounty] = useState("");
  const [citizenWard, setCitizenWard] = useState("");

  // Feedback form state
  const [selectedMcaId, setSelectedMcaId] = useState<string>("");
  const [category, setCategory] = useState<FeedbackCategory | "">("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Convex
  const simulateIPRS = useAction(api.actions.simulateIPRSVerification);
  const registerCitizen = useMutation(api.citizens.register);
  const submitFeedback = useMutation(api.feedback.submit);

  const existingCitizen = useQuery(
    api.citizens.getByNationalId,
    verified && nationalId.length === 8 ? { nationalId } : "skip"
  );

  // MCAs for citizen's county
  const countyMcas = useQuery(
    api.mcas.listByCounty,
    citizenCounty ? { county: citizenCounty } : "skip"
  );

  // Citizen's feedback history
  const myFeedback = useQuery(
    api.feedback.getByCitizen,
    citizenId ? { citizenId } : "skip"
  );

  // Store citizen ID from query
  useEffect(() => {
    if (existingCitizen && !citizenId) {
      setCitizenId(existingCitizen._id);
      setCitizenName(existingCitizen.name);
    }
  }, [existingCitizen, citizenId]);

  // Auto-select MCA if only one in the county
  useEffect(() => {
    if (countyMcas && countyMcas.length === 1 && !selectedMcaId) {
      setSelectedMcaId(countyMcas[0]._id);
    }
  }, [countyMcas, selectedMcaId]);

  const handleVerify = async () => {
    if (nationalId.length !== 8 || !/^\d+$/.test(nationalId)) return;
    setVerifying(true);
    setVerifyError(null);

    try {
      const result = await simulateIPRS({ nationalId });
      if (!result.verified) {
        setVerifyError(
          t
            ? "ID could not be verified. Please check and try again."
            : "Kitambulisho hakikuweza kuthibitishwa. Tafadhali angalia na ujaribu tena."
        );
        return;
      }

      setCitizenName(result.name ?? "Verified Citizen");
      setCitizenCounty(result.county ?? "Kiambu");
      setCitizenWard(result.ward ?? "Agikuyu");

      // Register citizen
      try {
        const newId = await registerCitizen({
          nationalId,
          name: result.name ?? "Verified Citizen",
          county: result.county ?? "Kiambu",
          ward: result.ward ?? "Agikuyu",
          phone: "",
          language,
          verified: true,
        });
        setCitizenId(newId);
      } catch {
        // Already registered — existingCitizen query will set the ID
      }

      setShowWelcome(true);
      setTimeout(() => {
        setVerified(true);
        setShowWelcome(false);
      }, 1800);
    } catch (err) {
      console.error(err);
      setVerifyError(
        t
          ? "Verification failed. Please try again."
          : "Uthibitishaji umeshindikana. Tafadhali jaribu tena."
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!citizenId || !selectedMcaId || !category || !message.trim()) return;
    setSubmitting(true);

    try {
      await submitFeedback({
        citizenId,
        citizenName,
        mcaId: selectedMcaId as Id<"mcas">,
        message: message.trim(),
        category: category as FeedbackCategory,
      });
      setSubmitted(true);
      setMessage("");
      setCategory("");

      // Auto-dismiss success after 3s
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Verification Screen ──────────────────────────────────
  if (!verified) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        {/* Language toggle */}
        <div className="mb-8 flex justify-end">
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

        {/* Welcome animation */}
        {showWelcome && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 text-center animate-in fade-in zoom-in duration-500">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {t ? "Welcome!" : "Karibu!"}
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {t
                    ? "Your identity has been verified."
                    : "Utambulisho wako umethibitishwa."}
                </p>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <MessageSquare className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {t ? "Citizen Feedback" : "Maoni ya Raia"}
            </CardTitle>
            <CardDescription className="text-base">
              {t
                ? "Share your questions, complaints, or suggestions directly with your elected MCA representative."
                : "Shiriki maswali, malalamiko, au mapendekezo yako moja kwa moja na mwakilishi wako wa MCA aliyechaguliwa."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Separator />

            {/* ID verification */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4 text-primary" />
                {t
                  ? "Verify your identity to continue"
                  : "Thibitisha utambulisho wako kuendelea"}
              </div>
              <p className="text-xs text-muted-foreground">
                {t
                  ? "Enter your 8-digit National ID number for IPRS verification."
                  : "Ingiza nambari yako ya Kitambulisho cha Kitaifa yenye tarakimu 8 kwa uthibitishaji wa IPRS."}
              </p>
              <div className="flex gap-2">
                <Input
                  value={nationalId}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                    setNationalId(val);
                    setVerifyError(null);
                  }}
                  placeholder={t ? "e.g., 29384756" : "mfano, 29384756"}
                  className="font-mono text-lg tracking-widest"
                  maxLength={8}
                  disabled={verifying}
                />
                <Button
                  onClick={handleVerify}
                  disabled={nationalId.length !== 8 || verifying}
                  className="shrink-0 gap-2"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t ? "Verifying..." : "Inathibitisha..."}
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      {t ? "Verify" : "Thibitisha"}
                    </>
                  )}
                </Button>
              </div>
              {verifyError && (
                <p className="text-sm text-destructive">{verifyError}</p>
              )}
            </div>

            {/* Info note */}
            <div className="rounded-lg bg-muted/50 px-4 py-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t
                  ? "Your feedback is sent directly to your ward's MCA. They will be able to read and respond to your message from their dashboard."
                  : "Maoni yako yanatumwa moja kwa moja kwa MCA wa kata yako. Wataweza kusoma na kujibu ujumbe wako kutoka kwenye dashibodi yao."}
              </p>
            </div>

            {/* Demo credentials */}
            <div className="rounded-lg border border-dashed px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">
                {t ? "Demo: Use any 8-digit number" : "Demo: Tumia nambari yoyote ya tarakimu 8"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t ? "e.g., " : "mfano, "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono">29384756</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Feedback Form (Post-verification) ──────────────────
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t ? "Share Your Feedback" : "Shiriki Maoni Yako"}
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            {t
              ? "Your voice matters. Communicate directly with your elected representative."
              : "Sauti yako ina umuhimu. Wasiliana moja kwa moja na mwakilishi wako aliyechaguliwa."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage((l) => (l === "en" ? "sw" : "en"))}
          className="gap-1.5 self-start"
        >
          <Globe className="h-4 w-4" />
          {t ? "Kiswahili" : "English"}
        </Button>
      </div>

      {/* Citizen identity bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{citizenName}</p>
          <p className="text-xs text-muted-foreground">
            <MapPin className="mr-0.5 inline h-3 w-3" />
            {citizenWard} Ward, {citizenCounty} County
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setVerified(false);
            setNationalId("");
            setCitizenId(null);
            setSelectedMcaId("");
          }}
          className="text-xs text-muted-foreground"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          {t ? "Change ID" : "Badilisha ID"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* Success banner */}
          {submitted && (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {t ? "Feedback submitted successfully!" : "Maoni yamewasilishwa kwa mafanikio!"}
                </p>
                <p className="text-xs text-green-600">
                  {t
                    ? "Your MCA will be notified and can respond from their dashboard."
                    : "MCA wako ataarifiwa na anaweza kujibu kutoka kwenye dashibodi yake."}
                </p>
              </div>
            </div>
          )}

          {/* Select MCA */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" />
                {t ? "Select Your MCA" : "Chagua MCA Wako"}
              </CardTitle>
              <CardDescription>
                {t
                  ? "Choose the representative you want to send feedback to."
                  : "Chagua mwakilishi unayetaka kumtumia maoni."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {countyMcas === undefined ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t ? "Loading representatives..." : "Inapakia wawakilishi..."}
                </div>
              ) : countyMcas.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t
                    ? "No MCAs found for your county."
                    : "Hakuna MCA aliyepatikana kwa kaunti yako."}
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {countyMcas.map((mca) => (
                    <button
                      key={mca._id}
                      onClick={() => setSelectedMcaId(mca._id)}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
                        selectedMcaId === mca._id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/30 hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          selectedMcaId === mca._id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {mca.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{mca.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {mca.ward} Ward &middot; {mca.party}
                        </p>
                      </div>
                      {selectedMcaId === mca._id && (
                        <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="h-4 w-4 text-primary" />
                {t ? "What type of feedback?" : "Aina gani ya maoni?"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-3">
                {(Object.entries(categoryConfig) as [FeedbackCategory, typeof categoryConfig[FeedbackCategory]][]).map(
                  ([key, config]) => {
                    const Icon = config.icon;
                    const isSelected = category === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setCategory(key)}
                        className={`flex flex-col items-center gap-2 rounded-lg border px-4 py-4 text-center transition-all ${
                          isSelected
                            ? `${config.bg} ring-1 ring-current ${config.color}`
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <Icon
                          className={`h-6 w-6 ${isSelected ? config.color : "text-muted-foreground"}`}
                        />
                        <span className="text-sm font-medium">
                          {t ? config.label : config.labelSw}
                        </span>
                        <span className="text-[11px] text-muted-foreground leading-tight">
                          {t ? config.description : config.descriptionSw}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Send className="h-4 w-4 text-primary" />
                {t ? "Your Message" : "Ujumbe Wako"}
              </CardTitle>
              <CardDescription>
                {t
                  ? "Be specific and clear. Your MCA will read this directly."
                  : "Kuwa mahususi na wazi. MCA wako atasoma hii moja kwa moja."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder={
                  t
                    ? "Describe your question, concern, or suggestion in detail..."
                    : "Eleza swali lako, wasiwasi, au pendekezo lako kwa undani..."
                }
                className="resize-none"
                maxLength={1000}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {message.length}/1000
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedMcaId || !category || !message.trim() || submitting || !citizenId}
                  className="gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t ? "Submitting..." : "Inawasilisha..."}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t ? "Submit Feedback" : "Wasilisha Maoni"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Feedback History */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t ? "Your Feedback History" : "Historia ya Maoni Yako"}
          </h3>

          {myFeedback === undefined ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-muted/30" />
              ))}
            </div>
          ) : myFeedback.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {t
                    ? "No feedback submitted yet. Your messages will appear here."
                    : "Hakuna maoni yaliyowasilishwa bado. Ujumbe wako utaonekana hapa."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myFeedback
                .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                .map((fb) => {
                  const config = categoryConfig[fb.category];
                  const Icon = config.icon;
                  return (
                    <Card key={fb._id} className="overflow-hidden">
                      <CardContent className="p-4">
                        {/* Header */}
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${config.color}`} />
                            <Badge variant="outline" className={`text-[10px] ${config.bg}`}>
                              {t ? config.label : config.labelSw}
                            </Badge>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              fb.status === "responded"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }
                          >
                            {fb.status === "responded"
                              ? t ? "Responded" : "Imejibiwa"
                              : t ? "Pending" : "Inasubiri"}
                          </Badge>
                        </div>

                        {/* Message */}
                        <p className="mb-2 text-sm leading-relaxed line-clamp-3">
                          {fb.message}
                        </p>

                        {/* MCA & timestamp */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {fb.mcaName}
                          </span>
                          <span>&middot;</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(fb.timestamp).toLocaleDateString("en-KE", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>

                        {/* Response */}
                        {fb.response && (
                          <div className="mt-3 rounded-md bg-green-50 px-3 py-2">
                            <p className="mb-1 text-[10px] font-semibold text-green-700 uppercase">
                              {t ? "MCA Response" : "Jibu la MCA"}
                            </p>
                            <p className="text-xs leading-relaxed text-green-800">
                              {fb.response}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
