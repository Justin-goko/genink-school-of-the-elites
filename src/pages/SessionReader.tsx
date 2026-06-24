import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useUnit, useUnitSessions } from "@/hooks/useUnits";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useXPReward } from "@/contexts/XPRewardContext";
import SessionContentBlock, { type Block } from "@/components/learning/SessionContentBlock";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import StickyNav from "@/components/StickyNav";
import { toast } from "sonner";
import TutorButton from "@/components/tutor/TutorButton";

const FALLBACK_BLOCKS: Block[] = [
  { type: "heading", text: "Welcome to this session" },
  { type: "paragraph", text: "This session's content is being prepared. Use the controls below to mark progress while we finalise the material." },
  { type: "callout", title: "AI Prompt", text: "Ask yourself: what is the single most important thing I want to take away from this session?" },
  { type: "reflection", prompt: "In one paragraph, write what you already know about this topic and what you hope to learn." },
  { type: "exercise", title: "Practice exercise", steps: ["Review your notes from the previous session.", "Set a measurable goal for this unit.", "Block 30 minutes in your calendar this week to act on it."] },
];

export default function SessionReader() {
  const { pillarId, unitId, sessionIndex } = useParams<{ pillarId: string; unitId: string; sessionIndex?: string }>();
  const idx = Math.max(0, parseInt(sessionIndex || "1", 10) - 1);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { award } = useXPReward();
  const qc = useQueryClient();

  const { data: unit } = useUnit(unitId);
  const { data: sessions } = useUnitSessions(unitId);

  const [scrollPct, setScrollPct] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setScrollPct(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [idx]);

  useEffect(() => { window.scrollTo(0, 0); }, [idx]);

  const session = sessions?.[idx];
  const totalSessions = unit?.session_count ?? sessions?.length ?? 5;
  const isLast = idx + 1 >= totalSessions;

  const blocks: Block[] = useMemo(() => {
    const raw = (session?.content as any[]) ?? [];
    return raw.length > 0 ? (raw as Block[]) : FALLBACK_BLOCKS;
  }, [session]);

  async function callAwardXP(action_type: string, extra: Record<string, any> = {}) {
    if (!user || !unitId) { toast.error("Sign in to track progress"); return; }
    const session_id = `${unitId}:${idx}:${action_type}:${extra.bucket ?? "default"}`;
    const { data, error } = await supabase.functions.invoke("award-xp", {
      body: { action_type, session_id, unit_id: unitId, ...extra },
    });
    if (error) { toast.error("Could not award XP"); return; }
    const xp = (data as any)?.xp_awarded ?? 0;
    if (xp > 0) award({ amount: xp });
    qc.invalidateQueries({ queryKey: ["user_unit_progress"] });
    qc.invalidateQueries({ queryKey: ["user_xp"] });
  }

  async function completeSession() {
    setBusy(true);
    try {
      await callAwardXP("session");
      if (isLast) {
        await callAwardXP("unit_complete");
        toast.success("Unit complete! +500 XP bonus");
        navigate(`/pillar/${pillarId}`);
      } else {
        navigate(`/pillar/${pillarId}/unit/${unitId}/session/${idx + 2}`);
      }
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-background">
      <StickyNav />

      {/* reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-foreground/5">
        <div className="h-full bg-amber-500 transition-all" style={{ width: `${scrollPct}%` }} />
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Link to={`/pillar/${pillarId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to pillar
        </Link>

        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {unit?.title} · Session {idx + 1} of {totalSessions}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          {session?.title ?? `Session ${idx + 1}`}
        </h1>

        <div className="prose prose-lg max-w-none">
          {blocks.map((b, i) => (
            <SessionContentBlock
              key={i}
              block={b}
              onAwardReflection={() => callAwardXP("reflection", { bucket: `r${i}` })}
              onAwardExercise={() => callAwardXP("exercise", { bucket: `e${i}` })}
            />
          ))}
        </div>

        <div className="mt-12 border-t pt-6 flex items-center justify-between">
          <Button
            variant="outline"
            disabled={idx === 0}
            onClick={() => navigate(`/pillar/${pillarId}/unit/${unitId}/session/${idx}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          <Button onClick={completeSession} disabled={busy} className="bg-amber-600 hover:bg-amber-700 text-white">
            {busy && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            {isLast ? (
              <>Complete Unit <CheckCircle2 className="w-4 h-4 ml-1" /></>
            ) : (
              <>Complete Session <ArrowRight className="w-4 h-4 ml-1" /></>
            )}
            <Sparkles className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>

      <TutorButton
        context={{
          unit_id: unitId,
          session_id: session?.id,
          pillar_name: pillarId,
          unit_title: unit?.title,
          session_title: session?.title ?? `Session ${idx + 1}`,
        }}
      />
    </div>
  );
}