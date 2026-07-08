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
import { usePillarUnits, useUserUnitProgress } from "@/hooks/useUnits";
import UnitCard from "@/components/learning/UnitCard";
import SpecializedUnitCard from "@/components/learning/SpecializedUnitCard";
import PillarHeader, { type PillarTheme, pillarThemes } from "@/components/learning/PillarHeader";
import PillarLearningView from "@/components/learning/PillarLearningView";
import { useAuth } from "@/contexts/AuthContext";
import { usePillarEnrollment, useHasAssessment, enrollInPillar } from "@/hooks/usePillarEnrollment";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: isEnrolled = false, isLoading: enrollmentLoading } = usePillarEnrollment(pillarId);
  const { data: userHasAssessment = false } = useHasAssessment();
  const [comparePaths, setComparePaths] = useState<LearningPath[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [archetype, setArchetype] = useState<LearnerArchetype | null>(null);
  const hasAssessment = pillarId ? !!pillarAssessments[pillarId] : false;

  const { data: units = [] } = usePillarUnits(pillarId);
  const learningPathUnits = units.filter((u) => u.track_type === "learning_path");
  const specializedUnits = units.filter((u) => u.track_type === "specialized");
  const { data: progressMap = {} } = useUserUnitProgress(units.map((u) => u.id));

  if (!pillar) return <Navigate to="/courses" replace />;

  const iconEl = pillarIcons[pillar.icon];

  const handleEnrol = async () => {
    if (!user) {
      // Anonymous → assessment first (which captures lead + creates account)
      navigate("/pathway-intelligence");
      return;
    }
    if (!userHasAssessment) {
      navigate("/pathway-intelligence");
      return;
    }
    const { error } = await enrollInPillar(user.id, pillar.id);
    if (error) {
      toast.error(error.message ?? "Could not enrol. Please try again.");
      return;
    }
    toast.success(`You're enrolled in ${pillar.name}.`);
    queryClient.invalidateQueries({ queryKey: ["pillar_enrollment", user.id, pillar.id] });
  };

  // ── AUTHENTICATED + ENROLLED → learning view ──────────────────
  if (user && isEnrolled) {
    return (
      <div className="min-h-screen bg-background">
        <StickyNav />
        <div className="container mx-auto px-4 py-8">
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
            <Link to="/journey">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Journey
            </Link>
          </Button>
          <PillarLearningView pillar={pillar} icon={iconEl} />
        </div>
      </div>
    );
  }

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

      {/* Themed Pillar Header */}
      <PillarHeader
        theme={(pillar.id as PillarTheme) in pillarThemes ? (pillar.id as PillarTheme) : "personal-mastery"}
        title={pillar.name}
        tagline={pillar.tagline}
        icon={pillarIcons[pillar.icon]}
      >
        <Button asChild variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 -ml-2 mb-3">
          <Link to="/courses">
            <ArrowLeft className="w-4 h-4 mr-2" />
            All Pillars
          </Link>
        </Button>
        <p className="text-lg text-white/80 max-w-3xl">{pillar.description}</p>
      </PillarHeader>

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

        {/* Orientation Assessment Section */}
        {hasAssessment && !assessmentComplete && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
                <ClipboardCheck className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Orientation Assessment Required</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Discover Your Learning Direction</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Complete the orientation assessment to receive a personalized pathway recommendation. 
                This diagnostic evaluates your cognitive style, execution preference, risk orientation, 
                and motivation drivers to identify your optimal learning direction.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <PillarOrientation
                pillarId={pillarId || ""}
                pillarColor={pillar.color}
                onComplete={(result) => {
                  setArchetype(result);
                  setAssessmentComplete(true);
                }}
              />
            </div>
          </div>
        )}

        {/* Learning Paths — visible only after assessment or if no assessment exists */}
        {(assessmentComplete || !hasAssessment) && (
          <>
            {/* Archetype Result Banner */}
            {archetype && (
              <Card className="border-accent/30 bg-accent/5">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      Your Archetype: {archetype.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recommended path highlighted below. You may choose any path that aligns with your goals.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

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

            {/* Learning Path Units — primary track */}
            {learningPathUnits.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">Learning Path</h2>
                  <p className="text-sm text-muted-foreground">The 7-unit core curriculum for this pillar.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {learningPathUnits.map((unit) => {
                    const prog = progressMap[unit.id];
                    const completed = prog?.sessions_completed ?? 0;
                    const prevUnit = learningPathUnits.find((u) => u.order_index === unit.order_index - 1);
                    const prevDone = !prevUnit || (progressMap[prevUnit.id]?.sessions_completed ?? 0) >= prevUnit.session_count;
                    let state: "locked" | "current" | "completed" | "available";
                    if (completed >= unit.session_count && unit.session_count > 0) state = "completed";
                    else if (unit.order_index === 1 || prevDone) state = completed > 0 ? "current" : (prevDone ? "current" : "available");
                    else state = "locked";
                    return (
                      <UnitCard key={unit.id} unit={unit} progress={prog} state={state} pillarId={pillar.id} />
                    );
                  })}
                </div>
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
                  isFoundation && "border-accent/40 bg-accent/5",
                  archetype?.recommendedPathId === path.id && "ring-2 ring-accent border-accent/40 bg-accent/5"
                )}
              >
                <CardHeader>
                  {archetype?.recommendedPathId === path.id && (
                    <Badge className="w-fit bg-accent text-accent-foreground mb-2 text-xs">
                      ✦ Recommended for You
                    </Badge>
                  )}
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
        {specializedUnits.length > 0 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-muted-foreground">Bonus & Deep Dives</h3>
              <p className="text-xs text-muted-foreground">Optional enrichment — not part of the core path.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {specializedUnits.map((unit) => (
                <SpecializedUnitCard key={unit.id} unit={unit} pillarId={pillar.id} />
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
          </>
        )}

        {/* Enrol CTA — visible to unauthenticated visitors and signed-in-but-not-enrolled users */}
        <div className="pt-6">
          <div
            className="rounded-2xl p-8 md:p-10 text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${pillar.color}18, hsl(var(--accent) / 0.08))`,
              border: `1px solid ${pillar.color}40`,
            }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white mx-auto mb-4"
              style={{ backgroundColor: pillar.color }}
            >
              {iconEl}
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">Ready to begin {pillar.name}?</h3>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6">
              {user
                ? userHasAssessment
                  ? "You're all set — enrol to unlock the 7 units, XP tracking and mentor access."
                  : "Complete the Pathway Intelligence assessment first — it makes sure this pillar is the right starting point for you."
                : "Start with the Pathway Intelligence assessment. You'll get a personalised profile, then unlock this pillar."}
            </p>
            <Button
              onClick={handleEnrol}
              disabled={enrollmentLoading}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-md"
            >
              {user && userHasAssessment ? "Enrol in this Pillar" : "Enrol in this Pillar"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            {!user && (
              <p className="text-xs text-muted-foreground mt-3">
                Already have an account?{" "}
                <Link to="/auth" className="text-accent hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PillarDetail;
