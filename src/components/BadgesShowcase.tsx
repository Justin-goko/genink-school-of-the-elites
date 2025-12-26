import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Flame, 
  Star, 
  Zap, 
  Target, 
  Award,
  BookOpen,
  Users
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BadgeItem {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  description: string;
  color: string;
  earned: boolean;
  progress?: number;
}

const badges: BadgeItem[] = [
  {
    icon: Flame,
    name: "7-Day Streak",
    description: "Learn for 7 days in a row",
    color: "from-orange-500 to-red-500",
    earned: true
  },
  {
    icon: BookOpen,
    name: "First Course",
    description: "Complete your first course",
    color: "from-accent to-secondary",
    earned: true
  },
  {
    icon: Star,
    name: "Quiz Master",
    description: "Score 100% on 5 quizzes",
    color: "from-premium to-yellow-400",
    earned: true
  },
  {
    icon: Users,
    name: "Community Star",
    description: "Help 10 fellow learners",
    color: "from-purple-500 to-pink-500",
    earned: false,
    progress: 70
  },
  {
    icon: Zap,
    name: "Speed Learner",
    description: "Complete a course in record time",
    color: "from-blue-500 to-cyan-500",
    earned: false,
    progress: 45
  },
  {
    icon: Target,
    name: "Goal Crusher",
    description: "Achieve all weekly goals",
    color: "from-green-500 to-emerald-500",
    earned: false,
    progress: 80
  },
  {
    icon: Trophy,
    name: "Top 10%",
    description: "Rank in top 10% of learners",
    color: "from-premium to-amber-600",
    earned: false,
    progress: 25
  },
  {
    icon: Award,
    name: "Certified Pro",
    description: "Earn 3 professional certificates",
    color: "from-indigo-500 to-violet-500",
    earned: false,
    progress: 33
  }
];

const BadgesShowcase = () => {
  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 space-y-3">
          <Badge variant="outline" className="border-premium/30 text-premium px-4 py-1.5">
            <Trophy className="w-4 h-4 mr-2" />
            Gamified Learning
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Earn Badges, Build Your Legacy
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete challenges, unlock achievements, and showcase your skills to the world
          </p>
          <p className="text-accent font-semibold">
            {earnedCount} of {badges.length} badges earned
          </p>
        </div>

        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 max-w-5xl mx-auto">
            {badges.map((badge, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div 
                    className={`group relative flex flex-col items-center p-4 rounded-xl transition-all duration-300 cursor-pointer
                      ${badge.earned 
                        ? 'bg-card shadow-lg hover:shadow-xl hover:-translate-y-1' 
                        : 'bg-muted/50 opacity-60 hover:opacity-80'}`}
                  >
                    <div 
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110
                        ${badge.earned 
                          ? `bg-gradient-to-br ${badge.color} shadow-lg` 
                          : 'bg-muted border-2 border-dashed border-muted-foreground/30'}`}
                    >
                      <badge.icon className={`w-7 h-7 ${badge.earned ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    
                    <span className={`text-xs font-medium text-center ${badge.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {badge.name}
                    </span>

                    {!badge.earned && badge.progress && (
                      <div className="absolute bottom-1 left-2 right-2">
                        <div className="h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${badge.color} transition-all duration-500`}
                            style={{ width: `${badge.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {badge.earned && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-md">
                        <span className="text-[10px] text-accent-foreground">✓</span>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-primary text-primary-foreground border-0">
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-xs opacity-80">{badge.description}</p>
                  {!badge.earned && badge.progress && (
                    <p className="text-xs mt-1 text-accent">{badge.progress}% complete</p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
};

export default BadgesShowcase;
