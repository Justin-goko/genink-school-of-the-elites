import StickyNav from "@/components/StickyNav";
import ProgressMap from "@/components/ProgressMap";
import TrendingPicks from "@/components/TrendingPicks";
import FeaturesGrid from "@/components/FeaturesGrid";
import QuickQuiz from "@/components/QuickQuiz";
import BadgesShowcase from "@/components/BadgesShowcase";
import WhySection from "@/components/WhySection";
import Newsletter from "@/components/Newsletter";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { pillars } from "@/data/courses";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Brain, TrendingUp, Monitor, Shield, Code, Video, Landmark, ArrowRight,
} from "lucide-react";

const pillarIcons: Record<string, React.ReactNode> = {
  brain: <Brain className="w-6 h-6" />,
  "trending-up": <TrendingUp className="w-6 h-6" />,
  monitor: <Monitor className="w-6 h-6" />,
  shield: <Shield className="w-6 h-6" />,
  code: <Code className="w-6 h-6" />,
  video: <Video className="w-6 h-6" />,
  landmark: <Landmark className="w-6 h-6" />,
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <StickyNav />
      <Hero />
      
      {/* Social Proof - Trending Picks */}
      <TrendingPicks />

      {/* Quick Quiz for Personalization */}
      <QuickQuiz />

      {/* Features Grid with Gamification */}
      <FeaturesGrid />

      {/* Badges & Achievements */}
      <BadgesShowcase />

      {/* Pillars Preview Section */}
      <section id="courses" className="py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm text-accent font-medium">7 Core Pillars of Mastery</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Explore Our Learning Pillars
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each pillar contains structured learning paths with Foundation (Free) through Elite levels
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {pillars.map((pillar, i) => (
              <Link
                key={pillar.id}
                to={`/pillar/${pillar.id}`}
                className="group p-5 rounded-xl border border-border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-accent-foreground"
                    style={{ backgroundColor: pillar.color }}
                  >
                    {pillarIcons[pillar.icon]}
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors leading-tight">
                    {pillar.name}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{pillar.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {pillar.learningPaths.length} paths
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/courses">
                View All Pillars & Paths
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <WhySection />
      <Newsletter />

      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <p className="text-lg font-medium">Genlink Hub — Linking Generations</p>
            <p className="text-sm text-primary-foreground/70">&copy; 2025 Genlink Hub. All rights reserved.</p>
            <p className="text-xs text-primary-foreground/50">Proudly serving learners across Kenya 🇰🇪</p>
          </div>
        </div>
      </footer>

      {/* Exit Intent Popup */}
      <ExitIntentPopup />
    </div>
  );
};

export default Index;
