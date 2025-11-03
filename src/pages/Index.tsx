import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CourseCard from "@/components/CourseCard";
import CourseModal from "@/components/CourseModal";
import WhySection from "@/components/WhySection";
import Newsletter from "@/components/Newsletter";
import { courses, Course } from "@/data/courses";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      <section id="courses" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Explore Our Transformative Courses
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our carefully crafted curriculum designed to empower your spiritual, financial, and technical growth
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
                className={filter === "all" ? "bg-accent hover:bg-accent/90" : ""}
              >
                All Courses
              </Button>
              <Button
                variant={filter === "free" ? "default" : "outline"}
                onClick={() => setFilter("free")}
                className={filter === "free" ? "bg-accent hover:bg-accent/90" : ""}
              >
                Free
              </Button>
              <Button
                variant={filter === "premium" ? "default" : "outline"}
                onClick={() => setFilter("premium")}
                className={filter === "premium" ? "bg-premium hover:bg-premium/90 text-premium-foreground" : ""}
              >
                Premium
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              <Button
                variant={categoryFilter === "all" ? "default" : "outline"}
                onClick={() => setCategoryFilter("all")}
                size="sm"
              >
                All Categories
              </Button>
              <Button
                variant={categoryFilter === "spiritual" ? "default" : "outline"}
                onClick={() => setCategoryFilter("spiritual")}
                size="sm"
              >
                Spiritual
              </Button>
              <Button
                variant={categoryFilter === "financial" ? "default" : "outline"}
                onClick={() => setCategoryFilter("financial")}
                size="sm"
              >
                Financial
              </Button>
              <Button
                variant={categoryFilter === "ict" ? "default" : "outline"}
                onClick={() => setCategoryFilter("ict")}
                size="sm"
              >
                ICT
              </Button>
              <Button
                variant={categoryFilter === "income" ? "default" : "outline"}
                onClick={() => setCategoryFilter("income")}
                size="sm"
              >
                Income Skills
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                {...course}
                onLearnMore={() => handleLearnMore(course)}
              />
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

      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">&copy; 2025 Genlink Hub. Linking Generations. All rights reserved.</p>
        </div>
      </footer>

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={selectedCourse}
      />
    </div>
  );
};

export default Index;
