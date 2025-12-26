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
import { courses, Course } from "@/data/courses";
import { Button } from "@/components/ui/button";
import { Filter, Sparkles } from "lucide-react";

const Index = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "spiritual" | "financial" | "ict" | "income">("all");

  const handleLearnMore = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const filteredCourses = courses.filter(course => {
    const priceMatch = filter === "all" || 
      (filter === "free" && !course.isPremium) || 
      (filter === "premium" && course.isPremium);
    
    const categoryMatch = categoryFilter === "all" || course.category === categoryFilter;
    
    return priceMatch && categoryMatch;
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
              <span className="text-sm text-accent font-medium">Curated for Kenyan Excellence</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Explore Our Transformative Courses
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover what top learners are mastering next — each course designed for real-world impact
            </p>
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
                className={`transition-all duration-300 ${filter === "all" ? "bg-accent hover:bg-accent/90 shadow-lg" : "hover:border-accent/50"}`}
              >
                All Courses
              </Button>
              <Button
                variant={filter === "free" ? "default" : "outline"}
                onClick={() => setFilter("free")}
                className={`transition-all duration-300 ${filter === "free" ? "bg-accent hover:bg-accent/90 shadow-lg" : "hover:border-accent/50"}`}
              >
                Free
              </Button>
              <Button
                variant={filter === "premium" ? "default" : "outline"}
                onClick={() => setFilter("premium")}
                className={`transition-all duration-300 ${filter === "premium" ? "bg-premium hover:bg-premium/90 text-premium-foreground shadow-lg" : "hover:border-premium/50"}`}
              >
                Premium
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              {[
                { key: "all", label: "All Categories" },
                { key: "spiritual", label: "Spiritual" },
                { key: "financial", label: "Financial" },
                { key: "ict", label: "ICT" },
                { key: "income", label: "Income Skills" }
              ].map((cat) => (
                <Button
                  key={cat.key}
                  variant={categoryFilter === cat.key ? "default" : "outline"}
                  onClick={() => setCategoryFilter(cat.key as any)}
                  size="sm"
                  className={`transition-all duration-300 ${categoryFilter === cat.key ? "shadow-md" : ""}`}
                >
                  {cat.label}
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
