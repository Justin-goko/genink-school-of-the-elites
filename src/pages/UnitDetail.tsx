import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import StickyNav from "@/components/StickyNav";
import { getPillarById, comparisonMetrics, type LearningPath } from "@/data/courses";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, ArrowLeft, Clock, Target, Layers, GitCompare, X, CheckCircle2, ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

const skillColors: Record<string, string> = {
  beginner: "bg-accent/20 text-accent border-accent/30",
  intermediate: "bg-premium/20 text-premium border-premium/30",
  advanced: "bg-destructive/20 text-destructive border-destructive/30",
};

const UnitDetail = () => {
  const { pillarId, unitId } = useParams<{ pillarId: string; unitId: string }>();
  const pillar = getPillarById(pillarId || "");
  const unit = pillar?.units?.find((u) => u.id === unitId);
  const [comparePaths, setComparePaths] = useState<LearningPath[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  if (!pillar || !unit) return <Navigate to="/courses" replace />;

  const toggleCompare = (path: LearningPath) => {
    setComparePaths((prev) => {
      if (prev.find((p) => p.id === path.id)) return prev.filter((p) => p.id !== path.id);
      if (prev.length >= 3) return prev;
      return [...prev, path];
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <StickyNav />

      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <Button asChild variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground mb-4">
            <Link to={`/pillar/${pillar.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {pillar.name}
            </Link>
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-accent-foreground"
              style={{ backgroundColor: pillar.color }}
            >
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <Badge variant="outline" className="text-xs border-primary-foreground/30 text-primary-foreground/70 mb-1">
                {pillar.name}
              </Badge>
              <h1 className="text-2xl md:text-4xl font-bold">{unit.title}</h1>
            </div>
          </div>
          <p className="text-lg text-primary-foreground/80 max-w-3xl">{unit.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-10">
        {/* Ethical Notice */}
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <ShieldAlert className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Genlink Values Notice</p>
              <p>This unit promotes responsible market participation. No gambling culture. No get-rich-fast mentality. All paths emphasize risk awareness, capital preservation, and long-term financial thinking.</p>
            </div>
          </CardContent>
        </Card>

        {/* Compare Toggle */}
        {unit.learningPaths.length >= 2 && (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Learning Paths</h2>
            <Button
              variant={showCompare ? "default" : "outline"}
              size="sm"
              onClick={() => { setShowCompare(!showCompare); if (showCompare) setComparePaths([]); }}
              className={cn(showCompare && "bg-accent hover:bg-accent/90")}
            >
              <GitCompare className="w-4 h-4 mr-2" />
              {showCompare ? "Exit Compare" : "Compare Paths"}
            </Button>
          </div>
        )}

        {showCompare && (
          <div className="bg-muted rounded-lg p-4 flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium">Select 2–3 paths to compare:</span>
            {comparePaths.map((p) => (
              <Badge key={p.id} className="bg-accent text-accent-foreground gap-1">
                {p.title}
                <button onClick={() => toggleCompare(p)}><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
        )}

        {/* Path Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unit.learningPaths.map((path) => {
            const isSelected = comparePaths.some((p) => p.id === path.id);
            const isFoundation = path.certificationTier === "Foundation";

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
                      🔓 Foundation Track
                    </Badge>
                  )}
                  <CardTitle className="text-lg group-hover:text-accent transition-colors">
                    {path.title}
                  </CardTitle>
                  <CardDescription>{path.description}</CardDescription>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className={cn("text-xs capitalize", skillColors[path.skillLevel])}>
                      <Layers className="w-3 h-3 mr-1" />{path.skillLevel}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />{path.estimatedWeeks} weeks
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Target className="w-3 h-3 mr-1" />{path.targetRole}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {path.careerOutcomes && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Career Directions</p>
                      <div className="flex flex-wrap gap-1">
                        {path.careerOutcomes.map((o) => (
                          <Badge key={o} variant="secondary" className="text-xs font-normal">{o}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {path.competencyMilestones && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Milestones</p>
                      <ul className="space-y-1">
                        {path.competencyMilestones.map((m) => (
                          <li key={m} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />{m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {path.capstoneProject && (
                    <div className="bg-premium/10 border border-premium/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-premium mb-1">🎯 Capstone Project</p>
                      <p className="text-xs text-muted-foreground">{path.capstoneProject}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button asChild className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground" size="sm">
                      <Link to={`/path/${pillar.id}/${path.id}`}>
                        View Path <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                    {showCompare && (
                      <Button variant={isSelected ? "default" : "outline"} size="sm" onClick={() => toggleCompare(path)} className={cn(isSelected && "bg-accent")}>
                        {isSelected ? "✓" : "+"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Comparison Table */}
        {showCompare && comparePaths.length >= 2 && (
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-accent" />Path Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold text-muted-foreground">Metric</th>
                      {comparePaths.map((p) => (<th key={p.id} className="text-left p-4 font-semibold">{p.title}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonMetrics.map((metric) => (
                      <tr key={metric.key} className="border-b last:border-0">
                        <td className="p-4 text-muted-foreground font-medium">{metric.label}</td>
                        {comparePaths.map((p) => (<td key={p.id} className="p-4">{p.comparisonData?.[metric.key] || "—"}</td>))}
                      </tr>
                    ))}
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

export default UnitDetail;
