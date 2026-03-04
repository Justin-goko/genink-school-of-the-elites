import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/pillar/:pillarId" element={<PillarDetail />} />
            <Route path="/path/:pillarId/:pathId" element={<PathDetail />} />
            <Route path="/pillar/:pillarId/unit/:unitId" element={<UnitDetail />} />
            <Route path="/learn/:courseId" element={<CourseLearning />} />
            <Route path="/learning-paths" element={<LearningPathMap />} />
            <Route path="/mind-architecture" element={<MindArchitecture />} />
            <Route path="/financial-intelligence" element={<FinancialIntelligence />} />
            <Route path="/events" element={<Events />} />
            <Route path="/resources" element={<Resources />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
