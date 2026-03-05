import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import StickyNav from "@/components/StickyNav";
import { getPillarById, comparisonMetrics, type LearningPath } from "@/data/courses";
import { pillarAssessments } from "@/data/orientationAssessments";
import type { LearnerArchetype } from "@/data/orientationAssessments";
import PillarOrientation from "@/components/PillarOrientation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain, TrendingUp, Monitor, Shield, Code, Video, Landmark,
  ArrowRight, Clock, Target, Layers, Users, CheckCircle2, ArrowLeft, GitCompare,
  X, BookOpen, ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const pillarIcons: Record<string, React.ReactNode> = {
  brain: <Brain className="w-8 h-8" />,
  "trending-up": <TrendingUp className="w-8 h-8" />,
  monitor: <Monitor className="w-8 h-8" />,
  shield: <Shield className="w-8 h-8" />,
  code: <Code className="w-8 h-8" />,
  video: <Video className="w-8 h-8" />,
  landmark: <Landmark className="w-8 h-8" />,
};

const skillColors: Record<string, string> = {
  beginner: "bg-accent/20 text-accent border-accent/30",
  intermediate: "bg-premium/20 text-premium border-premium/30",
  advanced: "bg-destructive/20 text-destructive border-destructive/30",
};

const PillarDetail = () => {
  const { pillarId } = useParams<{ pillarId: string }>();
  const pillar = getPillarById(pillarId || "");
  const [comparePaths, setComparePaths] = useState<LearningPath[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  if (!pillar) return <Navigate to="/courses" replace />;

  const toggleCompare = (path: LearningPath) => {
    setComparePaths((prev) => {
      if (prev.find((p) => p.id === path.id)) return prev.filter((p) => p.id !== path.id);
      if (prev.length >= 3) return prev;
      return [...prev, path];
    });
  };

  const nonFoundationPaths = pillar.learningPaths.filter(
    (p) => !p.id.includes("foundation")
  );

  return (
    <div className="min-h-screen bg-background">
      <StickyNav />

      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <Button asChild variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground mb-4">
            <Link to="/courses">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Pillars
            </Link>
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-accent-foreground"
              style={{ backgroundColor: pillar.color }}
            >
              {pillarIcons[pillar.icon]}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{pillar.name}</h1>
              <p className="text-primary-foreground/70 italic">{pillar.tagline}</p>
            </div>
          </div>

          <p className="text-lg text-primary-foreground/80 max-w-3xl">{pillar.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" />
                Purpose
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{pillar.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                Who It's For
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{pillar.whoIsItFor}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Core Competencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {pillar.coreCompetencies.map((comp) => (
                  <li key={comp} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-accent mt-1 flex-shrink-0" />
                    {comp}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Compare Paths Toggle */}
        {nonFoundationPaths.length >= 2 && (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Available Learning Paths</h2>
            <Button
              variant={showCompare ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowCompare(!showCompare);
                if (showCompare) setComparePaths([]);
              }}
              className={cn(showCompare && "bg-accent hover:bg-accent/90")}
            >
              <GitCompare className="w-4 h-4 mr-2" />
              {showCompare ? "Exit Compare" : "Compare Paths"}
            </Button>
          </div>
        )}

        {/* Compare Selection Bar */}
        {showCompare && (
          <div className="bg-muted rounded-lg p-4 flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium">Select 2–3 paths to compare:</span>
            {comparePaths.map((p) => (
              <Badge key={p.id} className="bg-accent text-accent-foreground gap-1">
                {p.title}
                <button onClick={() => toggleCompare(p)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {comparePaths.length >= 2 && (
              <span className="text-xs text-muted-foreground ml-auto">Scroll down to see comparison</span>
            )}
          </div>
        )}

        {/* Path Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillar.learningPaths.map((path) => {
            const isSelected = comparePaths.some((p) => p.id === path.id);
            const isFoundation = path.id.includes("foundation");

            return (
              <Card
                key={path.id}
                className={cn(
                  "group transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                  isSelected && "ring-2 ring-accent",
                  isFoundation && "border-accent/40 bg-accent/5"
                )}
              >
                <CardHeader>
                  {isFoundation && (
                    <Badge className="w-fit bg-accent text-accent-foreground mb-2 text-xs">
                      🔓 Mandatory Foundation — Free
                    </Badge>
                  )}
                  <CardTitle className="text-lg group-hover:text-accent transition-colors">
                    {path.title}
                  </CardTitle>
                  <CardDescription>{path.description}</CardDescription>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className={cn("text-xs capitalize", skillColors[path.skillLevel])}>
                      <Layers className="w-3 h-3 mr-1" />
                      {path.skillLevel}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {path.estimatedWeeks} weeks
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Target className="w-3 h-3 mr-1" />
                      {path.targetRole}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Career Outcomes */}
                  {path.careerOutcomes && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Career Directions</p>
                      <div className="flex flex-wrap gap-1">
                        {path.careerOutcomes.map((outcome) => (
                          <Badge key={outcome} variant="secondary" className="text-xs font-normal">
                            {outcome}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Capstone */}
                  {path.capstoneProject && (
                    <div className="bg-premium/10 border border-premium/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-premium mb-1">🎯 Capstone Project</p>
                      <p className="text-xs text-muted-foreground">{path.capstoneProject}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button asChild className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground" size="sm">
                      <Link to={`/path/${pillar.id}/${path.id}`}>
                        View Path
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                    {showCompare && !isFoundation && (
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCompare(path)}
                        className={cn(isSelected && "bg-accent")}
                      >
                        {isSelected ? "✓" : "+"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Units Section */}
        {pillar.units && pillar.units.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Specialized Units</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillar.units.map((unit) => (
                <Card key={unit.id} className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent/10 text-accent">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg group-hover:text-accent transition-colors">
                        {unit.title}
                      </CardTitle>
                    </div>
                    <CardDescription>{unit.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Layers className="w-4 h-4 text-accent" />
                      <span>{unit.learningPaths.length} learning paths inside</span>
                    </div>
                    <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="sm">
                      <Link to={`/pillar/${pillar.id}/unit/${unit.id}`}>
                        Explore Unit <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        {showCompare && comparePaths.length >= 2 && (
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-accent" />
                Path Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold text-muted-foreground">Metric</th>
                      {comparePaths.map((p) => (
                        <th key={p.id} className="text-left p-4 font-semibold">{p.title}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonMetrics.map((metric) => (
                      <tr key={metric.key} className="border-b last:border-0">
                        <td className="p-4 text-muted-foreground font-medium">{metric.label}</td>
                        {comparePaths.map((p) => (
                          <td key={p.id} className="p-4">
                            {p.comparisonData?.[metric.key] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="border-b last:border-0">
                      <td className="p-4 text-muted-foreground font-medium">Target Role</td>
                      {comparePaths.map((p) => (
                        <td key={p.id} className="p-4">{p.targetRole}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 text-muted-foreground font-medium">Capstone</td>
                      {comparePaths.map((p) => (
                        <td key={p.id} className="p-4 text-xs">{p.capstoneProject || "—"}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PillarDetail;
