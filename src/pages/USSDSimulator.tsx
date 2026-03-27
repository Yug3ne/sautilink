import { useState } from "react";
import { budgetItems, bills } from "@/data/dummy";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";

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
  selectedBillId: string | null;
  selectedBudgetItemId: string | null;
  selectedVote: "for" | "against" | null;
}

const initialState: USSDState = {
  screen: "welcome",
  language: "en",
  verified: false,
  selectedBillId: null,
  selectedBudgetItemId: null,
  selectedVote: null,
};

export function USSDSimulator() {
  const [state, setState] = useState<USSDState>(initialState);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const t = (en: string, sw: string) => (state.language === "en" ? en : sw);

  const reset = () => {
    setState(initialState);
    setInput("");
    setHistory([]);
  };

  const getScreenContent = (): string => {
    switch (state.screen) {
      case "welcome":
        return "Welcome to Sauti-Link\nKaribu Sauti-Link\n\n1. English\n2. Kiswahili";

      case "verify":
        return t(
          "Enter your National ID\n(8 digits):\n\nDemo: Enter 12345678",
          "Ingiza Kitambulisho\nchako cha Taifa\n(tarakimu 8):\n\nDemo: Ingiza 12345678"
        );

      case "menu":
        return t(
          "SAUTI-LINK MAIN MENU\n\n1. View Bills\n2. Vote on Budget\n3. Send Feedback\n0. Exit",
          "MENYU KUU YA SAUTI-LINK\n\n1. Tazama Miswada\n2. Piga Kura Bajeti\n3. Tuma Maoni\n0. Ondoka"
        );

      case "bills": {
        const openBills = bills.filter((b) => b.status === "open");
        const list = openBills
          .map(
            (b, i) =>
              `${i + 1}. ${state.language === "en" ? b.title.slice(0, 35) : b.titleSw.slice(0, 35)}...`
          )
          .join("\n");
        return t("ACTIVE BILLS\n\n", "MISWADA INAYOENDELEA\n\n") + list + t("\n\n0. Back", "\n\n0. Rudi");
      }

      case "bill_detail": {
        const bill = bills.find((b) => b.id === state.selectedBillId);
        if (!bill) return "Error";
        const summary = (state.language === "en" ? bill.summaryEn : bill.summarySw)
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
        const items = budgetItems.filter((bi) => bi.status === "active");
        const list = items
          .map(
            (bi, i) =>
              `${i + 1}. ${(state.language === "en" ? bi.description : bi.descriptionSw).slice(0, 40)}`
          )
          .join("\n");
        return t("VOTE ON BUDGET ITEMS\n\n", "PIGA KURA BAJETI\n\n") + list + t("\n\n0. Back", "\n\n0. Rudi");
      }

      case "vote_confirm": {
        const item = budgetItems.find((bi) => bi.id === state.selectedBudgetItemId);
        if (!item) return "Error";
        const desc = (state.language === "en" ? item.description : item.descriptionSw).slice(0, 50);
        return desc + t("\n\n1. Vote FOR\n2. Vote AGAINST\n0. Back", "\n\n1. Kura KWA\n2. Kura DHIDI\n0. Rudi");
      }

      case "vote_done":
        return t(
          "Thank you! Your vote has\nbeen recorded.\n\n1. Vote on more items\n0. Main Menu",
          "Asante! Kura yako\nimerekodiwa.\n\n1. Piga kura zaidi\n0. Menyu Kuu"
        );

      case "feedback":
        return t(
          "Type your feedback\nmessage below.\n(Max 160 characters)\n\nType 0 to go back.",
          "Andika ujumbe wako\nhapa chini.\n(Herufi 160)\n\nAndika 0 kurudi."
        );

      case "feedback_sent":
        return t(
          "Feedback sent to your\nMCA successfully!\n\n1. Send another\n0. Main Menu",
          "Maoni yametumwa kwa\nMCA wako!\n\n1. Tuma mengine\n0. Menyu Kuu"
        );

      case "end":
        return t(
          "Thank you for using\nSauti-Link.\n\nYour voice matters!\n\nDial *384# again anytime.",
          "Asante kwa kutumia\nSauti-Link.\n\nSauti yako ni muhimu!\n\nPiga *384# tena wakati wowote."
        );

      default:
        return "";
    }
  };

  const handleSend = () => {
    const val = input.trim();
    if (!val) return;

    setHistory((h) => [...h, `> ${val}`]);
    setInput("");

    switch (state.screen) {
      case "welcome":
        if (val === "1") setState((s) => ({ ...s, language: "en", screen: "verify" }));
        else if (val === "2") setState((s) => ({ ...s, language: "sw", screen: "verify" }));
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
          const openBills = bills.filter((b) => b.status === "open");
          const idx = parseInt(val) - 1;
          if (idx >= 0 && idx < openBills.length) {
            setState((s) => ({ ...s, selectedBillId: openBills[idx].id, screen: "bill_detail" }));
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
          const activeItems = budgetItems.filter((bi) => bi.status === "active");
          const idx = parseInt(val) - 1;
          if (idx >= 0 && idx < activeItems.length) {
            setState((s) => ({
              ...s,
              selectedBudgetItemId: activeItems[idx].id,
              screen: "vote_confirm",
            }));
          }
        }
        break;
      }

      case "vote_confirm":
        if (val === "1") setState((s) => ({ ...s, selectedVote: "for", screen: "vote_done" }));
        else if (val === "2") setState((s) => ({ ...s, selectedVote: "against", screen: "vote_done" }));
        else if (val === "0") setState((s) => ({ ...s, screen: "vote_list" }));
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">USSD Simulator</h1>
        <p className="mt-1 text-muted-foreground">
          Experience how citizens interact with Sauti-Link on basic feature phones via USSD (*384#).
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
        {/* Phone mockup */}
        <div className="w-[300px]">
          <div className="rounded-[2.5rem] border-4 border-foreground/20 bg-foreground/5 p-3">
            {/* Phone top bar */}
            <div className="mb-2 flex items-center justify-center">
              <div className="h-1.5 w-16 rounded-full bg-foreground/20" />
            </div>

            {/* Screen */}
            <Card className="min-h-[420px] rounded-2xl">
              <div className="flex h-full flex-col p-4">
                {/* USSD Header */}
                <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>USSD *384#</span>
                </div>

                {/* Content */}
                <div className="flex-1 rounded-lg bg-muted/50 p-3">
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                    {getScreenContent()}
                  </pre>
                </div>

                {/* Input */}
                <div className="mt-3 flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Reply..."
                    className="font-mono text-sm"
                    maxLength={160}
                  />
                  <Button size="sm" onClick={handleSend}>
                    Send
                  </Button>
                </div>
              </div>
            </Card>

            {/* Phone bottom bar */}
            <div className="mt-2 flex justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-foreground/20" />
            </div>
          </div>
        </div>

        {/* Instructions + Session log */}
        <div className="w-full max-w-md space-y-4">
          <Card className="p-4">
            <h3 className="mb-2 font-semibold">How to Use</h3>
            <ol className="space-y-1.5 text-sm text-muted-foreground">
              <li>1. Select language (1 = English, 2 = Kiswahili)</li>
              <li>2. Enter any 8-digit National ID to verify</li>
              <li>3. Navigate menus using numbers</li>
              <li>4. View bills, vote on budgets, or send feedback</li>
              <li>5. Press 0 to go back at any point</li>
            </ol>
            <Button variant="outline" size="sm" className="mt-3" onClick={reset}>
              Reset Session
            </Button>
          </Card>

          {history.length > 0 && (
            <Card className="p-4">
              <h3 className="mb-2 font-semibold">Session Log</h3>
              <div className="max-h-48 overflow-y-auto rounded bg-muted/50 p-2 font-mono text-xs">
                {history.map((line, i) => (
                  <div key={i} className="text-muted-foreground">
                    {line}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="bg-primary/5 p-4">
            <h3 className="mb-1 font-semibold text-primary">Why USSD?</h3>
            <p className="text-sm text-muted-foreground">
              Over 60% of Kenyans in rural areas use basic feature phones without internet access.
              USSD works on any GSM phone with no data costs, making governance truly accessible.
              Each screen fits within the 160-character USSD limit.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
