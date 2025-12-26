import { useState } from "react";
import { 
  Sparkles, 
  Trophy, 
  Target, 
  BookOpen, 
  Users, 
  Zap,
  ChevronRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tooltip: string;
  progress?: number;
  badge?: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: Sparkles,
    title: "AI-Powered Learning Paths",
    description: "Get personalized course recommendations based on your goals and learning style",
    tooltip: "Our AI analyzes your progress and suggests the perfect next step!",
    progress: 75,
    badge: "Smart",
    color: "from-accent to-secondary"
  },
  {
    icon: Trophy,
    title: "Earn Badges & Certificates",
    description: "Complete challenges and showcase your achievements on LinkedIn",
    tooltip: "Each badge unlocks new opportunities and community recognition",
    progress: 45,
    badge: "Gamified",
    color: "from-premium to-accent"
  },
  {
    icon: Target,
    title: "Micro-Challenges",
    description: "Daily bite-sized challenges to keep your skills sharp",
    tooltip: "Complete 3 challenges today to earn a streak badge!",
    badge: "Daily",
    color: "from-secondary to-accent"
  },
  {
    icon: BookOpen,
    title: "Expert-Curated Content",
    description: "Learn from Kenya's top professionals in finance, tech, and spiritual growth",
    tooltip: "All content is reviewed by industry experts",
    color: "from-accent to-premium"
  },
  {
    icon: Users,
    title: "Community Forums",
    description: "Connect with fellow learners and share your journey",
    tooltip: "Join 5,000+ active members discussing ideas daily",
    badge: "Social",
    color: "from-premium to-secondary"
  },
  {
    icon: Zap,
    title: "Interactive Quizzes",
    description: "Test your knowledge with engaging assessments",
    tooltip: "Quizzes adapt to your skill level for optimal learning",
    badge: "Adaptive",
    color: "from-secondary to-premium"
  }
];

const FeaturesGrid = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 space-y-4">
          <Badge variant="outline" className="px-4 py-1.5 text-sm border-accent/30 text-accent">
            Personalized for You
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Your Learning Journey, <span className="text-accent">Supercharged</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Every feature is designed to help you learn faster, stay motivated, and achieve your goals
          </p>
        </div>

        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div
                    className={`group relative bg-card rounded-2xl p-6 border border-border/50 transition-all duration-500 cursor-pointer overflow-hidden
                      ${hoveredIndex === index ? 'shadow-2xl border-accent/50 -translate-y-2' : 'hover:shadow-lg hover:-translate-y-1'}`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <feature.icon className="w-7 h-7 text-primary-foreground" />
                        </div>
                        {feature.badge && (
                          <Badge 
                            variant="secondary" 
                            className="bg-accent/10 text-accent border-0 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300"
                          >
                            {feature.badge}
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
                        {feature.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                        {feature.description}
                      </p>

                      {feature.progress && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Your progress</span>
                            <span className="font-medium text-accent">{feature.progress}%</span>
                          </div>
                          <Progress 
                            value={hoveredIndex === index ? feature.progress : 0} 
                            className="h-2 transition-all duration-700"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-1 mt-4 text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span>Learn more</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="max-w-xs bg-primary text-primary-foreground border-0 shadow-xl"
                >
                  <p className="text-sm">{feature.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
};

export default FeaturesGrid;
