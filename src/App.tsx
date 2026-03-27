import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Home } from "@/pages/Home";
import { Bills } from "@/pages/Bills";
import { VotePage } from "@/pages/VotePage";
import { USSDSimulator } from "@/pages/USSDSimulator";
import { Dashboard } from "@/pages/Dashboard";

export function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-svh flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/vote" element={<VotePage />} />
            <Route path="/ussd" element={<USSDSimulator />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
