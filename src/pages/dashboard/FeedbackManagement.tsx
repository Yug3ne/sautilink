import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

type FeedbackCategory = "question" | "complaint" | "suggestion";

const categoryConfig: Record<
  FeedbackCategory,
  { color: string; icon: typeof HelpCircle }
> = {
  question: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: HelpCircle,
  },
  complaint: {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: AlertTriangle,
  },
  suggestion: {
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: Lightbulb,
  },
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
          {[...Array(4)].map((_, i) => (
            <div key={i} className="mb-4 h-24 animate-pulse rounded bg-muted" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function FeedbackCard({
  feedback,
  onRespond,
}: {
  feedback: {
    _id: Id<"feedback">;
    citizenName: string;
    category: FeedbackCategory;
    message: string;
    timestamp: string;
    status: "pending" | "responded";
    response?: string;
  };
  onRespond: (id: Id<"feedback">, response: string) => Promise<void>;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const catConfig = categoryConfig[feedback.category];
  const CatIcon = catConfig.icon;

  async function handleSend() {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await onRespond(feedback._id, replyText.trim());
      setReplyText("");
      setShowReply(false);
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className={feedback.status === "pending" ? "border-l-4 border-l-yellow-400" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{feedback.citizenName}</span>
              <Badge variant="outline" className={catConfig.color}>
                <CatIcon className="mr-1 h-3 w-3" />
                {feedback.category}
              </Badge>
              <Badge
                variant="outline"
                className={
                  feedback.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }
              >
                {feedback.status === "pending" ? (
                  <Clock className="mr-1 h-3 w-3" />
                ) : (
                  <CheckCircle className="mr-1 h-3 w-3" />
                )}
                {feedback.status}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed">{feedback.message}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(feedback.timestamp).toLocaleString()}
            </p>

            {/* Show existing response */}
            {feedback.response && (
              <div className="mt-3 rounded-lg bg-green-50 p-3">
                <p className="text-xs font-semibold text-green-800">
                  Admin Response:
                </p>
                <p className="text-sm text-green-700">{feedback.response}</p>
              </div>
            )}

            {/* Reply form */}
            {showReply && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSend}
                    disabled={!replyText.trim() || sending}
                  >
                    <Send className="mr-2 h-3 w-3" />
                    {sending ? "Sending..." : "Send Response"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowReply(false);
                      setReplyText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Respond button */}
          {feedback.status === "pending" && !showReply && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReply(true)}
            >
              <Send className="mr-2 h-3 w-3" />
              Respond
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function FeedbackManagement() {
  const { sessionToken } = useAuth();
  const [tab, setTab] = useState("all");

  const feedback = useQuery(
    api.feedback.list,
    sessionToken ? { sessionToken } : "skip"
  );
  const respondMutation = useMutation(api.feedback.respond);

  const filtered = useMemo(() => {
    if (!feedback) return [];
    if (tab === "pending") return feedback.filter((f) => f.status === "pending");
    if (tab === "responded")
      return feedback.filter((f) => f.status === "responded");
    return feedback;
  }, [feedback, tab]);

  const stats = useMemo(() => {
    if (!feedback) {
      return {
        total: 0,
        pending: 0,
        responded: 0,
        questions: 0,
        complaints: 0,
        suggestions: 0,
      };
    }
    return {
      total: feedback.length,
      pending: feedback.filter((f) => f.status === "pending").length,
      responded: feedback.filter((f) => f.status === "responded").length,
      questions: feedback.filter((f) => f.category === "question").length,
      complaints: feedback.filter((f) => f.category === "complaint").length,
      suggestions: feedback.filter((f) => f.category === "suggestion").length,
    };
  }, [feedback]);

  if (feedback === undefined) {
    return <LoadingSkeleton />;
  }

  async function handleRespond(feedbackId: Id<"feedback">, response: string) {
    await respondMutation({
      feedbackId,
      response,
      ...(sessionToken ? { sessionToken } : {}),
    });
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Feedback</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Responded</p>
              <p className="text-2xl font-bold">{stats.responded}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              By Category
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                <HelpCircle className="mr-1 h-3 w-3" />
                {stats.questions} questions
              </Badge>
              <Badge variant="outline" className="bg-red-100 text-red-800">
                <AlertTriangle className="mr-1 h-3 w-3" />
                {stats.complaints} complaints
              </Badge>
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                <Lightbulb className="mr-1 h-3 w-3" />
                {stats.suggestions} suggestions
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List with Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">
            All ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="responded">
            Responded ({stats.responded})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p className="text-lg font-medium">No feedback found</p>
                <p className="text-sm">
                  {tab === "pending"
                    ? "All feedback has been responded to."
                    : tab === "responded"
                      ? "No responses yet."
                      : "No citizen feedback received yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((item) => (
              <FeedbackCard
                key={item._id}
                feedback={item}
                onRespond={handleRespond}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
