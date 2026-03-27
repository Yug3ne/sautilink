import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Signal,
  Battery,
  Wifi,
  RotateCcw,
  Smartphone,
  Users,
  Globe,
  TrendingUp,
  MessageSquare,
  Clock,
  ChevronRight,
} from "lucide-react";

// USSD screen states
type Screen =
  | "welcome"
  | "language"
  | "verify"
  | "menu"
  | "bills"
  | "bill_detail"
  | "vote_list"
  | "vote_confirm"
  | "vote_done"
  | "feedback"
  | "feedback_sent"
  | "end";

interface USSDState {
  screen: Screen;
  language: "en" | "sw";
  verified: boolean;
  selectedBillId: Id<"bills"> | null;
  selectedBudgetItemId: Id<"budgetItems"> | null;
  selectedVote: "for" | "against" | null;
}

interface HistoryEntry {
  type: "user" | "system";
  text: string;
  timestamp: string;
}

const initialState: USSDState = {
  screen: "welcome",
  language: "en",
  verified: false,
  selectedBillId: null,
  selectedBudgetItemId: null,
  selectedVote: null,
};

const KEYPAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
];

const KEYPAD_LETTERS: Record<string, string> = {
  "1": "",
  "2": "ABC",
  "3": "DEF",
  "4": "GHI",
  "5": "JKL",
  "6": "MNO",
  "7": "PQRS",
  "8": "TUV",
  "9": "WXYZ",
  "*": "",
  "0": "+",
  "#": "",
};

function getNow(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function useCurrentTime(): string {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  );
  useEffect(() => {
    const id = setInterval(
      () =>
        setTime(
          new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        ),
      10_000,
    );
    return () => clearInterval(id);
  }, []);
  return time;
}

export function USSDSimulator() {
  const [state, setState] = useState<USSDState>(initialState);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayedContent, setDisplayedContent] = useState("");
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const currentTime = useCurrentTime();

  // Convex queries for real data
  const billsData = useQuery(api.bills.list, {});
  const budgetItemsData = useQuery(api.budgetItems.list, {});

  const dataLoading = billsData === undefined || budgetItemsData === undefined;

  const t = useCallback(
    (en: string, sw: string) => (state.language === "en" ? en : sw),
    [state.language],
  );

  const reset = () => {
    setState(initialState);
    setInput("");
    setHistory([]);
    setDisplayedContent("");
    setIsLoading(false);
  };

  const getScreenContent = useCallback((): string => {
    if (dataLoading) return "Loading data...";

    switch (state.screen) {
      case "welcome":
        return "Welcome to Sauti-Link\nKaribu Sauti-Link\n\n1. English\n2. Kiswahili";

      case "verify":
        return t(
          "Enter your National ID\n(8 digits):\n\nDemo: Enter 12345678",
          "Ingiza Kitambulisho\nchako cha Taifa\n(tarakimu 8):\n\nDemo: Ingiza 12345678",
        );

      case "menu":
        return t(
          "SAUTI-LINK MAIN MENU\n\n1. View Bills\n2. Vote on Budget\n3. Send Feedback\n0. Exit",
          "MENYU KUU YA SAUTI-LINK\n\n1. Tazama Miswada\n2. Piga Kura Bajeti\n3. Tuma Maoni\n0. Ondoka",
        );

      case "bills": {
        const openBills = billsData?.filter((b) => b.status === "open") ?? [];
        const list = openBills
          .map(
            (b, i) =>
              `${i + 1}. ${state.language === "en" ? b.title.slice(0, 35) : b.titleSw.slice(0, 35)}...`,
          )
          .join("\n");
        return (
          t("ACTIVE BILLS\n\n", "MISWADA INAYOENDELEA\n\n") +
          list +
          t("\n\n0. Back", "\n\n0. Rudi")
        );
      }

      case "bill_detail": {
        const bill = billsData?.find((b) => b._id === state.selectedBillId);
        if (!bill) return "Error";
        const summary = (
          state.language === "en" ? bill.summaryEn : bill.summarySw
        )
          .map((s, i) => `${i + 1}. ${s.slice(0, 50)}...`)
          .join("\n");
        return (
          (state.language === "en" ? bill.title : bill.titleSw).slice(0, 40) +
          "\n\n" +
          summary +
          t("\n\n0. Back", "\n\n0. Rudi")
        );
      }

      case "vote_list": {
        const items = budgetItemsData?.filter((bi) => bi.status === "active") ?? [];
        const list = items
          .map(
            (bi, i) =>
              `${i + 1}. ${(state.language === "en" ? bi.description : bi.descriptionSw).slice(0, 40)}`,
          )
          .join("\n");
        return (
          t("VOTE ON BUDGET ITEMS\n\n", "PIGA KURA BAJETI\n\n") +
          list +
          t("\n\n0. Back", "\n\n0. Rudi")
        );
      }

      case "vote_confirm": {
        const item = budgetItemsData?.find(
          (bi) => bi._id === state.selectedBudgetItemId,
        );
        if (!item) return "Error";
        const desc = (
          state.language === "en" ? item.description : item.descriptionSw
        ).slice(0, 50);
        return (
          desc +
          t(
            "\n\n1. Vote FOR\n2. Vote AGAINST\n0. Back",
            "\n\n1. Kura KWA\n2. Kura DHIDI\n0. Rudi",
          )
        );
      }

      case "vote_done":
        return t(
          "Thank you! Your vote has\nbeen recorded.\n\n1. Vote on more items\n0. Main Menu",
          "Asante! Kura yako\nimerekodiwa.\n\n1. Piga kura zaidi\n0. Menyu Kuu",
        );

      case "feedback":
        return t(
          "Type your feedback\nmessage below.\n(Max 160 characters)\n\nType 0 to go back.",
          "Andika ujumbe wako\nhapa chini.\n(Herufi 160)\n\nAndika 0 kurudi.",
        );

      case "feedback_sent":
        return t(
          "Feedback sent to your\nMCA successfully!\n\n1. Send another\n0. Main Menu",
          "Maoni yametumwa kwa\nMCA wako!\n\n1. Tuma mengine\n0. Menyu Kuu",
        );

      case "end":
        return t(
          "Thank you for using\nSauti-Link.\n\nYour voice matters!\n\nDial *384# again anytime.",
          "Asante kwa kutumia\nSauti-Link.\n\nSauti yako ni muhimu!\n\nPiga *384# tena wakati wowote.",
        );

      default:
        return "";
    }
  }, [state, t, billsData, budgetItemsData, dataLoading]);

  // Typing animation effect
  useEffect(() => {
    const content = getScreenContent();
    setIsLoading(true);
    setDisplayedContent("");

    const delay = 300 + Math.random() * 200; // 300-500ms network delay
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
      let charIndex = 0;
      const typeTimer = setInterval(() => {
        charIndex += 2;
        if (charIndex >= content.length) {
          setDisplayedContent(content);
          clearInterval(typeTimer);
        } else {
          setDisplayedContent(content.slice(0, charIndex));
        }
      }, 8);
      return () => clearInterval(typeTimer);
    }, delay);

    return () => clearTimeout(loadTimer);
  }, [getScreenContent]);

  // Auto-scroll history
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleKeyPress = (key: string) => {
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 150);
    setInput((prev) => prev + key);
  };

  const handleBackspace = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const processInput = (val: string) => {
    switch (state.screen) {
      case "welcome":
        if (val === "1")
          setState((s) => ({ ...s, language: "en", screen: "verify" }));
        else if (val === "2")
          setState((s) => ({ ...s, language: "sw", screen: "verify" }));
        break;

      case "verify":
        if (val.length === 8 && /^\d+$/.test(val)) {
          setState((s) => ({ ...s, verified: true, screen: "menu" }));
        }
        break;

      case "menu":
        if (val === "1") setState((s) => ({ ...s, screen: "bills" }));
        else if (val === "2") setState((s) => ({ ...s, screen: "vote_list" }));
        else if (val === "3") setState((s) => ({ ...s, screen: "feedback" }));
        else if (val === "0") setState((s) => ({ ...s, screen: "end" }));
        break;

      case "bills": {
        if (val === "0") {
          setState((s) => ({ ...s, screen: "menu" }));
        } else {
          const openBills = billsData?.filter((b) => b.status === "open") ?? [];
          const idx = parseInt(val) - 1;
          if (idx >= 0 && idx < openBills.length) {
            setState((s) => ({
              ...s,
              selectedBillId: openBills[idx]._id,
              screen: "bill_detail",
            }));
          }
        }
        break;
      }

      case "bill_detail":
        if (val === "0") setState((s) => ({ ...s, screen: "bills" }));
        break;

      case "vote_list": {
        if (val === "0") {
          setState((s) => ({ ...s, screen: "menu" }));
        } else {
          const activeItems = budgetItemsData?.filter(
            (bi) => bi.status === "active",
          ) ?? [];
          const idx = parseInt(val) - 1;
          if (idx >= 0 && idx < activeItems.length) {
            setState((s) => ({
              ...s,
              selectedBudgetItemId: activeItems[idx]._id,
              screen: "vote_confirm",
            }));
          }
        }
        break;
      }

      case "vote_confirm":
        if (val === "1")
          setState((s) => ({
            ...s,
            selectedVote: "for",
            screen: "vote_done",
          }));
        else if (val === "2")
          setState((s) => ({
            ...s,
            selectedVote: "against",
            screen: "vote_done",
          }));
        else if (val === "0")
          setState((s) => ({ ...s, screen: "vote_list" }));
        break;

      case "vote_done":
        if (val === "1") setState((s) => ({ ...s, screen: "vote_list" }));
        else if (val === "0") setState((s) => ({ ...s, screen: "menu" }));
        break;

      case "feedback":
        if (val === "0") {
          setState((s) => ({ ...s, screen: "menu" }));
        } else {
          setState((s) => ({ ...s, screen: "feedback_sent" }));
        }
        break;

      case "feedback_sent":
        if (val === "1") setState((s) => ({ ...s, screen: "feedback" }));
        else if (val === "0") setState((s) => ({ ...s, screen: "menu" }));
        break;

      case "end":
        reset();
        break;
    }
  };

  const handleSend = () => {
    const val = input.trim();
    if (!val) return;

    setHistory((h) => [
      ...h,
      { type: "user", text: val, timestamp: getNow() },
      { type: "system", text: getScreenContent().slice(0, 80), timestamp: getNow() },
    ]);
    setInput("");
    processInput(val);
  };

  const instructions = [
    {
      label: "Select language",
      detail: "1 = English, 2 = Kiswahili",
    },
    {
      label: "Verify identity",
      detail: "Enter any 8-digit National ID",
    },
    {
      label: "Navigate menus",
      detail: "Type option numbers to proceed",
    },
    {
      label: "Take action",
      detail: "View bills, vote on budgets, or send feedback",
    },
    {
      label: "Go back anytime",
      detail: "Press 0 to return to the previous menu",
    },
  ];

  const stats = [
    {
      icon: Smartphone,
      value: "29M+",
      label: "Feature phones in Kenya",
      description: "Most lack internet access but all support USSD",
    },
    {
      icon: Users,
      value: "60%",
      label: "Rural population reliant on basic phones",
      description: "USSD bridges the digital divide for civic participation",
    },
    {
      icon: Globe,
      value: "0",
      label: "Data cost for USSD sessions",
      description: "Works on any GSM network with no internet required",
    },
    {
      icon: TrendingUp,
      value: "97%",
      label: "GSM coverage across Kenya",
      description: "Virtually every citizen can be reached via USSD",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="text-center">
        <Badge variant="secondary" className="mb-3">
          Interactive Demo
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          USSD Simulator
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
          Experience how citizens interact with Sauti-Link on basic feature
          phones via USSD. No internet, no apps -- just dial{" "}
          <span className="font-mono font-semibold text-primary">*384#</span>{" "}
          and participate in governance.
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center">
        {/* ============ PHONE MOCKUP ============ */}
        <div className="w-[320px] shrink-0">
          {/* Outer phone body */}
          <div className="relative rounded-[3rem] border-[3px] border-zinc-700 bg-zinc-900 p-2 shadow-[0_0_40px_rgba(0,0,0,0.3),inset_0_0_0_2px_rgba(255,255,255,0.05)]">
            {/* Side buttons - volume */}
            <div className="absolute -left-[5px] top-24 h-8 w-[3px] rounded-l-sm bg-zinc-600" />
            <div className="absolute -left-[5px] top-36 h-8 w-[3px] rounded-l-sm bg-zinc-600" />
            {/* Side button - power */}
            <div className="absolute -right-[5px] top-28 h-12 w-[3px] rounded-r-sm bg-zinc-600" />

            {/* Inner bezel */}
            <div className="rounded-[2.5rem] bg-zinc-800 p-2">
              {/* Notch / speaker grille area */}
              <div className="relative mb-1 flex items-center justify-center py-2">
                {/* Speaker grille */}
                <div className="flex items-center gap-0.5">
                  <div className="h-[3px] w-1 rounded-full bg-zinc-600" />
                  <div className="h-[3px] w-1 rounded-full bg-zinc-600" />
                  <div className="h-[3px] w-1 rounded-full bg-zinc-600" />
                  <div className="h-[3px] w-12 rounded-full bg-zinc-600" />
                  <div className="h-[3px] w-1 rounded-full bg-zinc-600" />
                  <div className="h-[3px] w-1 rounded-full bg-zinc-600" />
                  <div className="h-[3px] w-1 rounded-full bg-zinc-600" />
                </div>
                {/* Front camera */}
                <div className="absolute right-12 h-2.5 w-2.5 rounded-full bg-zinc-700 ring-1 ring-zinc-600">
                  <div className="ml-[3px] mt-[3px] h-1 w-1 rounded-full bg-zinc-500" />
                </div>
              </div>

              {/* ===== PHONE SCREEN ===== */}
              <div className="overflow-hidden rounded-2xl bg-[#1a1a2e]">
                {/* Status bar */}
                <div className="flex items-center justify-between bg-[#16162a] px-3 py-1.5 text-[10px] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Signal className="h-3 w-3 text-green-400" />
                    <span className="font-medium text-green-400">
                      Safaricom
                    </span>
                  </div>
                  <span className="font-mono text-zinc-300">{currentTime}</span>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="h-3 w-3 text-zinc-500" />
                    <Battery className="h-3 w-3 text-green-400" />
                    <span className="text-zinc-300">87%</span>
                  </div>
                </div>

                {/* USSD header bar */}
                <div className="flex items-center justify-between border-b border-white/5 bg-[#1f1f3a] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-green-400" />
                    <span className="font-mono text-xs font-bold tracking-wide text-green-300">
                      *384#
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-green-500/30 bg-green-500/10 text-[9px] text-green-400"
                  >
                    USSD Session
                  </Badge>
                </div>

                {/* Screen content area */}
                <div
                  ref={screenRef}
                  className="relative min-h-[260px] max-h-[280px] overflow-y-auto px-3 py-3"
                >
                  {dataLoading ? (
                    <div className="flex flex-col items-center gap-3 pt-8">
                      <div className="flex gap-1">
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-green-400"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-green-400"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-green-400"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        Connecting to network...
                      </span>
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center gap-2 pt-4">
                      <div className="flex gap-1">
                        <div
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-green-400"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-green-400"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-green-400"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        Loading...
                      </span>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap font-mono text-[11px] leading-[1.6] text-green-300">
                      {displayedContent}
                      <span className="inline-block h-3 w-1 animate-pulse bg-green-400" />
                    </pre>
                  )}
                </div>

                {/* Input area */}
                <div className="border-t border-white/5 bg-[#16162a] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-md border border-zinc-700 bg-[#0f0f20] px-2 py-1.5">
                      <span className="font-mono text-xs text-green-300">
                        {input}
                        <span className="inline-block h-3 w-0.5 animate-pulse bg-green-400" />
                      </span>
                    </div>
                    <button
                      onClick={handleSend}
                      className="rounded-md bg-green-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-all hover:bg-green-500 active:scale-95"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>

              {/* ===== DIAL PAD ===== */}
              <div className="mt-2 rounded-2xl bg-[#1a1a2e] p-2.5">
                <div className="grid grid-cols-3 gap-1.5">
                  {KEYPAD_ROWS.flat().map((key) => (
                    <button
                      key={key}
                      onClick={() => handleKeyPress(key)}
                      className={`relative flex h-11 flex-col items-center justify-center rounded-xl transition-all duration-150 ${
                        pressedKey === key
                          ? "scale-90 bg-green-500/30 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                          : "bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95"
                      }`}
                    >
                      <span className="text-sm font-semibold text-zinc-200">
                        {key}
                      </span>
                      {KEYPAD_LETTERS[key] && (
                        <span className="text-[7px] tracking-widest text-zinc-500">
                          {KEYPAD_LETTERS[key]}
                        </span>
                      )}
                      {/* Flash overlay */}
                      {pressedKey === key && (
                        <div className="absolute inset-0 animate-ping rounded-xl bg-green-400/20" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Action row */}
                <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                  <button
                    onClick={handleBackspace}
                    className="flex h-9 items-center justify-center rounded-xl bg-zinc-800/80 text-xs text-zinc-400 transition-all hover:bg-zinc-700/80 active:scale-95"
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleSend}
                    className="flex h-9 items-center justify-center rounded-xl bg-green-600 text-xs font-semibold text-white transition-all hover:bg-green-500 active:scale-95"
                  >
                    <Phone className="mr-1 h-3 w-3" />
                    Send
                  </button>
                  <button
                    onClick={reset}
                    className="flex h-9 items-center justify-center rounded-xl bg-red-900/50 text-xs text-red-400 transition-all hover:bg-red-900/70 active:scale-95"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Reset
                  </button>
                </div>
              </div>

              {/* Bottom bar / home indicator */}
              <div className="mt-2 flex justify-center pb-1">
                <div className="h-1 w-28 rounded-full bg-zinc-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ============ RIGHT PANEL ============ */}
        <div className="w-full max-w-md space-y-5">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                How to Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {instructions.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-none">
                      {step.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-3.5 w-3.5" />
                  Reset Session
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Session Log */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Session Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {history.map((entry, i) => (
                    <div
                      key={i}
                      className={`flex gap-2 ${entry.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-1.5 ${
                          entry.type === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="font-mono text-xs">{entry.text}</p>
                        <p
                          className={`mt-0.5 flex items-center gap-1 text-[9px] ${
                            entry.type === "user"
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Clock className="h-2 w-2" />
                          {entry.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={historyEndRef} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current State indicator */}
          <Card size="sm">
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Current screen
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {state.screen}
                  </Badge>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="secondary" className="text-[10px]">
                    {state.language === "en" ? "English" : "Kiswahili"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============ WHY USSD MATTERS ============ */}
      <div className="mt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            Why USSD Matters in Kenya
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            USSD technology ensures every Kenyan can participate in governance,
            regardless of their phone type or internet access.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex flex-col items-center text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-3 text-2xl font-bold">{stat.value}</p>
                <p className="mt-1 text-sm font-medium">{stat.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-primary/5 p-5 text-center ring-1 ring-primary/10">
          <p className="text-sm text-muted-foreground">
            Each USSD screen fits within the{" "}
            <span className="font-semibold text-foreground">
              160-character limit
            </span>
            , ensuring compatibility with every GSM phone in Kenya. Sessions
            cost citizens{" "}
            <span className="font-semibold text-foreground">
              KES 0 in data charges
            </span>{" "}
            -- only standard airtime applies. This makes Sauti-Link accessible
            to all{" "}
            <span className="font-semibold text-foreground">
              47+ million Kenyans
            </span>{" "}
            with mobile coverage.
          </p>
        </div>
      </div>
    </div>
  );
}
