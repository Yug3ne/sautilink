import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { Home } from "@/pages/Home";
import { Bills } from "@/pages/Bills";
import { VotePage } from "@/pages/VotePage";
import { USSDSimulator } from "@/pages/USSDSimulator";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { BillsManagement } from "@/pages/dashboard/BillsManagement";
import { VoteResults } from "@/pages/dashboard/VoteResults";
import { FeedbackManagement } from "@/pages/dashboard/FeedbackManagement";
import { CitizensPage } from "@/pages/dashboard/CitizensPage";
import { ManageMCAs } from "@/pages/dashboard/ManageMCAs";

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

        {/* Login route - wrapped in AuthProvider so useAuth works */}
        <Route
          path="/login"
          element={
            <AuthProvider>
              <Login />
            </AuthProvider>
          }
        />

        {/* Admin routes with Dashboard layout */}
        <Route
          path="/dashboard"
          element={
            <AuthProvider>
              <DashboardLayout />
            </AuthProvider>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="bills" element={<BillsManagement />} />
          <Route path="votes" element={<VoteResults />} />
          <Route path="feedback" element={<FeedbackManagement />} />
          <Route path="citizens" element={<CitizensPage />} />
          <Route path="manage-mcas" element={<ManageMCAs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
