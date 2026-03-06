import { Link } from "react-router-dom";
import StickyNav from "@/components/StickyNav";
import { pillars } from "@/data/courses";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain, TrendingUp, Monitor, Shield, Code, Video, Landmark,
  ArrowRight, GraduationCap, Sparkles, Compass,
} from "lucide-react";

const pillarIcons: Record<string, React.ReactNode> = {
  brain: <Brain className="w-8 h-8" />,
  "trending-up": <TrendingUp className="w-8 h-8" />,
  monitor: <Monitor className="w-8 h-8" />,
  shield: <Shield className="w-8 h-8" />,
  code: <Code className="w-8 h-8" />,
  video: <Video className="w-8 h-8" />,
  landmark: <Landmark className="w-8 h-8" />,
};

const Courses = () => {
  return (
    <div className="min-h-screen bg-background">
      <StickyNav />

      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 mb-4">
            <GraduationCap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">7 Core Pillars of Mastery</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Explore Our Learning Pillars</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Each pillar is a structured domain with goal-oriented learning paths. Select a pillar to discover available paths.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <Card
              key={pillar.id}
              className="group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-border animate-fade-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-accent-foreground"
                    style={{ backgroundColor: pillar.color }}
                  >
                    {pillarIcons[pillar.icon]}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl group-hover:text-accent transition-colors">
                      {pillar.name}
                    </CardTitle>
                    <CardDescription className="text-xs italic">{pillar.tagline}</CardDescription>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Focus Areas */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Focus Areas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {pillar.focusAreas.slice(0, 4).map((area) => (
                      <Badge key={area} variant="outline" className="text-xs font-normal">
                        {area}
                      </Badge>
                    ))}
                    {pillar.focusAreas.length > 4 && (
                      <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                        +{pillar.focusAreas.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Path count */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>{pillar.learningPaths.length} learning paths available</span>
                </div>

                {/* CTA */}
                <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link to={`/pillar/${pillar.id}`}>
                    Explore Paths
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
