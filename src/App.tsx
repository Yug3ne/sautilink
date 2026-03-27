import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Home } from "@/pages/Home";
import { Bills } from "@/pages/Bills";
import { VotePage } from "@/pages/VotePage";
import { USSDSimulator } from "@/pages/USSDSimulator";
import { Dashboard } from "@/pages/Dashboard";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes with Navbar + Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/vote" element={<VotePage />} />
          <Route path="/ussd" element={<USSDSimulator />} />
        </Route>

        {/* Admin routes with Dashboard layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
