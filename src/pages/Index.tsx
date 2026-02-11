import { useState } from "react";
import StickyNav from "@/components/StickyNav";
import Hero from "@/components/Hero";
import TrendingPicks from "@/components/TrendingPicks";
import FeaturesGrid from "@/components/FeaturesGrid";
import QuickQuiz from "@/components/QuickQuiz";
import BadgesShowcase from "@/components/BadgesShowcase";
import CourseCard from "@/components/CourseCard";
import CourseModal from "@/components/CourseModal";
import WhySection from "@/components/WhySection";
import Newsletter from "@/components/Newsletter";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { courses, pillars, Course } from "@/data/courses";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Filter, Sparkles, Map, Brain, TrendingUp, Monitor, Shield, Code, Video, Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

const pillarIcons: Record<string, React.ReactNode> = {
  brain: <Brain className="w-4 h-4" />,
  "trending-up": <TrendingUp className="w-4 h-4" />,
  monitor: <Monitor className="w-4 h-4" />,
  shield: <Shield className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  landmark: <Landmark className="w-4 h-4" />,
};

const Index = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");
  const [pillarFilter, setPillarFilter] = useState<string>("all");

  const handleLearnMore = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const filteredCourses = courses.filter(course => {
    const priceMatch = filter === "all" || 
      (filter === "free" && !course.isPremium) || 
      (filter === "premium" && course.isPremium);
    
    const pillarMatch = pillarFilter === "all" || course.pillarId === pillarFilter;
    
    return priceMatch && pillarMatch;
  });

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

            {/* Learning Path Map CTA */}
            <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent/10">
              <Link to="/learning-paths">
                <Map className="w-4 h-4 mr-2" />
                Open Learning Path Map
              </Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-center flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
            </div>
            
            <div className="flex gap-2 flex-wrap justify-center">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className={cn("transition-all duration-300", filter === "all" && "bg-accent hover:bg-accent/90 shadow-lg")}
              >
                All Courses
              </Button>
              <Button
                variant={filter === "free" ? "default" : "outline"}
                onClick={() => setFilter("free")}
                className={cn("transition-all duration-300", filter === "free" && "bg-accent hover:bg-accent/90 shadow-lg")}
              >
                Free
              </Button>
              <Button
                variant={filter === "premium" ? "default" : "outline"}
                onClick={() => setFilter("premium")}
                className={cn("transition-all duration-300", filter === "premium" && "bg-premium hover:bg-premium/90 text-premium-foreground shadow-lg")}
              >
                Premium
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              <Button
                variant={pillarFilter === "all" ? "default" : "outline"}
                onClick={() => setPillarFilter("all")}
                size="sm"
                className={cn("transition-all duration-300", pillarFilter === "all" && "shadow-md")}
              >
                All Pillars
              </Button>
              {pillars.map((pillar) => (
                <Button
                  key={pillar.id}
                  variant={pillarFilter === pillar.id ? "default" : "outline"}
                  onClick={() => setPillarFilter(pillar.id)}
                  size="sm"
                  className={cn("transition-all duration-300", pillarFilter === pillar.id && "shadow-md")}
                >
                  {pillarIcons[pillar.icon]}
                  <span className="ml-1">{pillar.name.split(" ")[0]}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => (
              <div 
                key={course.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CourseCard
                  {...course}
                  onLearnMore={() => handleLearnMore(course)}
                />
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No courses match your filters. Try adjusting your selection.</p>
            </div>
          )}
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

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={selectedCourse}
      />

      {/* Exit Intent Popup */}
      <ExitIntentPopup />
    </div>
  );
};

export default Index;
