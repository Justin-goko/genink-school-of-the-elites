import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { XPRewardProvider } from "@/contexts/XPRewardContext";
import XPRewardOverlay from "@/components/xp/XPRewardOverlay";
import Index from "./pages/Index";
import MarketingHome from "./pages/MarketingHome";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import Courses from "./pages/Courses";
import PillarDetail from "./pages/PillarDetail";
import PathDetail from "./pages/PathDetail";
import CourseLearning from "./pages/CourseLearning";
import LearningPathMap from "./pages/LearningPathMap";
import MindArchitecture from "./pages/MindArchitecture";
import FinancialIntelligence from "./pages/FinancialIntelligence";
import Events from "./pages/Events";
import Resources from "./pages/Resources";
import UnitDetail from "./pages/UnitDetail";
import SessionReader from "./pages/SessionReader";
import PathwayIntelligence from "./pages/PathwayIntelligence";
import OperationsDashboard from "./pages/OperationsDashboard";
import OpsDashboard from "./pages/OpsDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <XPRewardProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <XPRewardOverlay />
          <BrowserRouter>
          <Routes>
            {/* Layer 1 — public marketing */}
            <Route path="/" element={<MarketingHome />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/pillar/:pillarId" element={<PillarDetail />} />
            <Route path="/pathway-intelligence" element={<PathwayIntelligence />} />
            <Route path="/events" element={<Events />} />
            <Route path="/resources" element={<Resources />} />

            {/* Layer 2 — authenticated journey */}
            <Route path="/journey" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/path/:pillarId/:pathId" element={<ProtectedRoute><PathDetail /></ProtectedRoute>} />
            <Route path="/pillar/:pillarId/unit/:unitId" element={<ProtectedRoute><UnitDetail /></ProtectedRoute>} />
            <Route path="/pillar/:pillarId/unit/:unitId/session/:sessionIndex" element={<ProtectedRoute><SessionReader /></ProtectedRoute>} />
            <Route path="/learn/:courseId" element={<ProtectedRoute><CourseLearning /></ProtectedRoute>} />
            <Route path="/learning-paths" element={<ProtectedRoute><LearningPathMap /></ProtectedRoute>} />
            <Route path="/mind-architecture" element={<ProtectedRoute><MindArchitecture /></ProtectedRoute>} />
            <Route path="/financial-intelligence" element={<ProtectedRoute><FinancialIntelligence /></ProtectedRoute>} />
            {/* Layer 3 — team / admin operations */}
            <Route path="/dashboard" element={<ProtectedRoute><OperationsDashboard /></ProtectedRoute>} />
            <Route path="/ops-dashboard" element={<ProtectedRoute><OpsDashboard /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </XPRewardProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
