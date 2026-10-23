import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Activity, ArrowDown, ArrowUp, BookOpen, Brain, CheckCircle2, Clock, Eye, EyeOff,
  Gamepad2, HelpCircle, Image as ImageIcon, Lightbulb, MessageCircle, Pause, Play,
  RotateCcw, ShieldCheck, Sparkles, Target, UserRound, Video, XCircle, Zap,
} from "lucide-react";
import StickyNav from "@/components/StickyNav";

/**
 * Adapt demo page: "the AI that learns the learner".
 *
 * A scripted, self-running demonstration. A sample learner opens Personal Mastery,
 * Unit 1, Session 1, reads, struggles, and Adapt notices, diagnoses, asks, re-teaches
 * in a different mode and checks whether it worked.
 *
 * Nothing here logs in, calls an AI or writes to the database: it is safe to show
 * publicly. The behaviour mirrors the Adapt engine's loop (Test, Observe, Understand,
 * Personalise, Learn) and its reteach rules (check prerequisites and effort before
 * blaming the teaching; ask before changing anything; judge with a matched question).
 */

// ---------- edit these two lines if needed ----------
const ENGINE_CREDIT = "Adapt engine built by our teammates";
const LEARNER_NAME = "Amani (sample learner)";

// ---------- palette (Genlink brand) ----------
const C = {
  navy: "#060B2E", panel: "#0D1640", card: "#17254F", line: "#24356B",
  gold: "#C9A84C", teal: "#22CEA1", blue: "#1BA0F2", orange: "#E08D3C",
  text: "#FFFFFF", soft: "#C9D3E6", mute: "#8F9BB8", red: "#F0716B",
};

type Stage = "test" | "observe" | "understand" | "personalise" | "learn";
type Phase = "idle" | "reading" | "check" | "diagnosis" | "proposal" | "reteach" | "matched" | "result" | "done";
type LogKind = "observe" | "think" | "ask" | "act" | "learn";
interface LogLine { id: number; clock: string; text: string; kind: LogKind }
interface Signals {
  timeRatio: number; scrollDepth: number; rereads: number; confusion: boolean;
  check: null | "wrong" | "right"; answerSecs: number | null;
}
interface DiagStep { label: string; detail: string; result: "pending" | "clear" | "flag" }

const STAGES: { id: Stage; label: string; hint: string }[] = [
  { id: "test", label: "Test", hint: "A short check at the end of each part" },
  { id: "observe", label: "Observe", hint: "Behaviour signals only" },
  { id: "understand", label: "Understand", hint: "Find the likely cause" },
  { id: "personalise", label: "Personalise", hint: "Propose a change, then ask" },
  { id: "learn", label: "Learn", hint: "Did it work? Remember it" },
];

const EMPTY_SIGNALS: Signals = { timeRatio: 0, scrollDepth: 0, rereads: 0, confusion: false, check: null, answerSecs: null };
const START_DIAG: DiagStep[] = [
  { label: "Missing earlier skill?", detail: "Session 1 has no prerequisite; earlier answers fine", result: "pending" },
  { label: "Rushing or tired?", detail: "Answered in 41s, steady pace, no rapid clicks", result: "pending" },
  { label: "One hard paragraph?", detail: "Re-read the same idea twice, then missed the check on it", result: "pending" },
  { label: "Teaching mode not landing?", detail: "Long reading time, re-reads, a confused question, a missed check", result: "pending" },
];

// ---------- helpers ----------
const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

export default function AdaptDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [stage, setStage] = useState<Stage | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [signals, setSignals] = useState<Signals>(EMPTY_SIGNALS);
  const [log, setLog] = useState<LogLine[]>([]);
  const [simClock, setSimClock] = useState(0);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [scrollDir, setScrollDir] = useState<"down" | "up" | null>(null);
  const [tutorQ, setTutorQ] = useState<string | null>(null);
  const [checkPick, setCheckPick] = useState<string | null>(null);
  const [matchedPick, setMatchedPick] = useState<string | null>(null);
  const [diag, setDiag] = useState<DiagStep[]>(START_DIAG);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const [barsOn, setBarsOn] = useState(false);
  const [model, setModel] = useState({ reading: 0, worked: 0, n: 0 });

  const readerRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const runId = useRef(0);
  const pausedRef = useRef(false);
  const speedRef = useRef(1);
  const clockRef = useRef(0);
  const logId = useRef(0);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { pausedRef.current = !playing; }, [playing]);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" }); }, [log]);

  // A sleep that respects pause, speed and restart. Also advances the simulated session clock
  // (the session is sped up: one real second is about six learner seconds).
  const sleep = useCallback(async (ms: number, id: number) => {
    let left = ms;
    while (left > 0) {
      if (runId.current !== id) throw new Error("cancelled");
      await new Promise((r) => setTimeout(r, 50));
      if (pausedRef.current) continue;
      const step = 50 * speedRef.current;
      left -= step;
      clockRef.current += (step / 1000) * 6;
      setSimClock(clockRef.current);
    }
  }, []);

  const say = useCallback((text: string, kind: LogKind) => {
    logId.current += 1;
    const line = { id: logId.current, clock: fmtClock(clockRef.current), text, kind };
    setLog((l) => [...l, line]);
  }, []);

  const scrollToId = useCallback(async (targetId: string, ms: number, id: number) => {
    const box = readerRef.current;
    const el = box?.querySelector<HTMLElement>(`[data-anchor="${targetId}"]`);
    if (!box || !el) return;
    const from = box.scrollTop;
    const to = Math.max(0, el.offsetTop - 24);
    setScrollDir(to > from ? "down" : to < from ? "up" : null);
    let t = 0;
    while (t < ms) {
      if (runId.current !== id) throw new Error("cancelled");
      await new Promise((r) => requestAnimationFrame(r));
      if (pausedRef.current) continue;
      t += 16 * speedRef.current;
      box.scrollTop = from + (to - from) * easeInOut(Math.min(1, t / ms));
      const depth = Math.round(((box.scrollTop + box.clientHeight) / box.scrollHeight) * 100);
      setSignals((s) => ({ ...s, scrollDepth: Math.max(s.scrollDepth, depth) }));
    }
    setScrollDir(null);
  }, []);

  const bump = (patch: Partial<Signals>) => setSignals((s) => ({ ...s, ...patch }));

  const reset = useCallback(() => {
    runId.current += 1;
    clockRef.current = 0;
    setSimClock(0); setPhase("idle"); setStage(null); setPlaying(false);
    setSignals(EMPTY_SIGNALS); setLog([]); setHighlight(null); setScrollDir(null);
    setTutorQ(null); setCheckPick(null); setMatchedPick(null); setDiag(START_DIAG);
    setVerdict(null); setChoice(null); setBarsOn(false); setModel({ reading: 0, worked: 0, n: 0 });
    readerRef.current?.scrollTo({ top: 0 });
  }, []);

  const run = useCallback(async () => {
    reset();
    const id = runId.current;
    setPlaying(true);
    pausedRef.current = false;
    try {
      // ---- reading ----
      setPhase("reading"); setStage("observe");
      say(`${LEARNER_NAME} opened Personal Mastery · Unit 1 · Session 1`, "observe");
      await sleep(1600, id);
      await scrollToId("overview", 1500, id);
      say("Reading the overview. Expected reading time for Part 1: about 4 minutes", "observe");
      bump({ timeRatio: 0.4 }); await sleep(1800, id);
      await scrollToId("p1a", 2600, id);
      bump({ timeRatio: 0.9 }); await sleep(1600, id);
      setHighlight("p1c");
      await scrollToId("p1c", 2600, id);
      bump({ timeRatio: 1.4 }); await sleep(2400, id);
      await scrollToId("p1key", 2200, id);
      bump({ timeRatio: 1.7 }); await sleep(1400, id);
      setHighlight("p1c");
      await scrollToId("p1c", 1800, id);
      bump({ rereads: 1, timeRatio: 2.1 });
      say("Scrolled back up to the paragraph on synthesis vs confusion (re-read 1)", "observe");
      await sleep(2400, id);
      await scrollToId("p1key", 1600, id);
      await sleep(900, id);
      await scrollToId("p1c", 1400, id);
      bump({ rereads: 2, timeRatio: 2.6 });
      say("Back to the same paragraph again (re-read 2). Time on Part 1 is now 2.6× expected", "observe");
      await sleep(2000, id);

      // ---- asks the Light Guide ----
      setTutorQ("I don't get it. How can synthesis and confusion not be opposites?");
      bump({ confusion: true });
      say("Asked the Light Guide a question that signals confusion: \"I don't get it\"", "observe");
      await sleep(2800, id);
      setTutorQ(null);

      // ---- quick check ----
      setHighlight(null);
      await scrollToId("check", 2000, id);
      setPhase("check"); setStage("test");
      say("Quick check on Part 1 (no hints)", "observe");
      await sleep(2600, id);
      setCheckPick("a");
      bump({ check: "wrong", answerSecs: 41 });
      say("Answered in 41s: \"opposite ends of one scale\". Incorrect", "observe");
      await sleep(2200, id);

      // ---- diagnosis ----
      setPhase("diagnosis"); setStage("understand");
      say("Something isn't landing. Checking causes before blaming the teaching", "think");
      for (let i = 0; i < START_DIAG.length; i++) {
        await sleep(1500, id);
        const result: DiagStep["result"] = i < 2 ? "clear" : i === 2 ? "flag" : "flag";
        setDiag((d) => d.map((x, j) => (j === i ? { ...x, result } : x)));
        say(i === 0 ? "No missing earlier skill" : i === 1 ? "Not rushing, not tired: the answer is real evidence"
          : i === 2 ? "Concentrated on one idea: synthesis vs confusion" : "Likely cause: the reading-heavy explanation", "think");
      }
      await sleep(1200, id);
      setVerdict("Reading load: the idea is fine, the text-heavy explanation is not landing for Amani.");
      await sleep(2400, id);

      // ---- proposal ----
      setPhase("proposal"); setStage("personalise");
      say("Proposing a change. Nothing changes until Amani says yes", "ask");
      await sleep(5200, id);
      setChoice("worked");
      say("Amani chose: \"Show me with an example\"", "ask");
      await sleep(1600, id);

      // ---- reteach ----
      setPhase("reteach");
      readerRef.current?.scrollTo({ top: 0 });
      say("Re-teaching Part 1 as a worked example with a picture", "act");
      await sleep(1400, id);
      setBarsOn(true);
      await sleep(3200, id);
      await scrollToId("rt-bars", 2200, id);
      await sleep(3000, id);
      await scrollToId("rt-matched", 2000, id);

      // ---- matched question ----
      setPhase("matched"); setStage("test");
      say("Matched question: same idea, same format, new wording", "act");
      await sleep(2800, id);
      setMatchedPick("b");
      bump({ check: "right", answerSecs: 23 });
      say("Answered in 23s. Correct", "observe");
      await sleep(1800, id);

      // ---- result / learn ----
      setPhase("result"); setStage("learn");
      setModel({ reading: 0, worked: 1, n: 1 });
      say("Worked through it with an example. Recorded: worked examples +1 (early signal, 1 observation)", "learn");
      await sleep(2600, id);
      say("Next time Amani struggles, Adapt offers a worked example sooner. Amani can change this", "learn");
      await sleep(2600, id);
      say("Returning Amani to the text for Part 2: reading is still a skill worth building", "act");
      setPhase("done");
      setPlaying(false);
    } catch {
      /* restarted or left the page */
    }
  }, [reset, say, sleep, scrollToId]);

  useEffect(() => () => { runId.current += 1; }, []);

  const started = phase !== "idle";
  const inReteach = phase === "reteach" || phase === "matched" || phase === "result" || phase === "done";

  return (
    <div className="min-h-screen w-full" style={{ background: C.navy, color: C.text }}>
      <StickyNav />
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-24 md:px-6">
        {/* ---------- header ---------- */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border px-3 py-0.5 text-xs font-semibold tracking-wide" style={{ borderColor: C.gold, color: C.gold }}>PROTOTYPE · SAMPLE LEARNER</span>
              <span className="text-xs" style={{ color: C.mute }}>Nothing on this page is saved or sent to an AI</span>
            </div>
            <h1 className="font-serif text-3xl font-bold md:text-4xl">
              Adapt <span style={{ color: C.gold }}>· the AI that learns the learner</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm md:text-base" style={{ color: C.soft }}>
              Adapt watches how a learner studies, notices when the content isn't landing, finds the likely cause,
              and asks before switching to a teaching mode that suits them better.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!started || phase === "done" ? (
              <button onClick={run} className="flex items-center gap-2 rounded-xl px-5 py-3 font-semibold shadow-lg transition hover:brightness-110" style={{ background: C.gold, color: C.navy }}>
                <Play size={18} /> {phase === "done" ? "Watch again" : "Start the demo"}
              </button>
            ) : (
              <button onClick={() => setPlaying((p) => !p)} className="flex items-center gap-2 rounded-xl px-5 py-3 font-semibold" style={{ background: C.gold, color: C.navy }}>
                {playing ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Resume</>}
              </button>
            )}
            {started && (
              <button onClick={reset} className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: C.line, color: C.soft }}>
                <RotateCcw size={16} /> Restart
              </button>
            )}
            <div className="flex overflow-hidden rounded-xl border text-sm" style={{ borderColor: C.line }}>
              {[1, 2].map((v) => (
                <button key={v} onClick={() => setSpeed(v)} className="px-3 py-3" style={{ background: speed === v ? C.card : "transparent", color: speed === v ? C.text : C.mute }}>{v}×</button>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- the loop ---------- */}
        <div className="mt-6 grid grid-cols-5 gap-1 md:gap-2">
          {STAGES.map((s, i) => {
            const on = stage === s.id;
            return (
              <div key={s.id} className="rounded-xl border px-2 py-2 transition-all md:px-3" style={{ borderColor: on ? C.gold : C.line, background: on ? C.card : C.panel }}>
                <div className="flex items-center gap-1 text-[10px] font-bold leading-tight sm:text-xs md:text-sm" style={{ color: on ? C.gold : C.soft }}>
                  <span className="hidden md:inline" style={{ color: C.mute }}>{i + 1}</span> {s.label}
                </div>
                <div className="mt-0.5 hidden text-xs md:block" style={{ color: C.mute }}>{s.hint}</div>
              </div>
            );
          })}
        </div>

        {/* ---------- main stage ---------- */}
        <div className="mt-4 grid gap-4 lg:grid-cols-5">
          {/* reader */}
          <div className="relative overflow-hidden rounded-2xl border lg:col-span-3" style={{ borderColor: C.line, background: C.panel }}>
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: C.line }}>
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: C.card }}><UserRound size={16} color={C.gold} /></div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{LEARNER_NAME}</div>
                  <div className="truncate text-xs" style={{ color: C.mute }}>Pillar 1 Personal Mastery · Unit 1 · Session 1</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full px-2 py-1 text-xs" style={{ background: C.card, color: inReteach ? C.teal : C.soft }}>
                  {inReteach ? <><Lightbulb size={12} /> Worked example</> : <><BookOpen size={12} /> Reading</>}
                </span>
                {scrollDir && (
                  <span className="hidden items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold sm:flex" style={{ background: C.gold, color: C.navy }}>
                    {scrollDir === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {scrollDir === "up" ? "re-reading" : "scrolling"}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs tabular-nums" style={{ color: C.mute }}><Clock size={12} /> {fmtClock(simClock)}</span>
              </div>
            </div>

            <div ref={readerRef} className="relative h-[520px] overflow-y-auto px-5 py-5 md:px-8" style={{ scrollBehavior: "auto" }}>
              {!started && <IdleCover onStart={run} />}
              {started && !inReteach && <Lesson highlight={highlight} checkPick={checkPick} />}
              {started && inReteach && <Reteach barsOn={barsOn} matchedPick={matchedPick} done={phase === "done" || phase === "result"} />}
            </div>

            {tutorQ && (
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border p-3 shadow-2xl md:left-auto md:w-80" style={{ background: C.card, borderColor: C.gold }}>
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold" style={{ color: C.gold }}><MessageCircle size={14} /> To the Light Guide</div>
                <div className="text-sm">{tutorQ}</div>
              </div>
            )}

            {phase === "proposal" && <ProposalOverlay choice={choice} />}
          </div>

          {/* adapt panel */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <SignalsCard s={signals} />
            {(phase === "diagnosis" || phase === "proposal" || phase === "reteach" || phase === "matched") && <DiagnosisCard steps={diag} verdict={verdict} />}
            {(phase === "result" || phase === "done") && <LearnedCard model={model} />}
            <div className="flex min-h-[160px] flex-1 flex-col rounded-2xl border" style={{ borderColor: C.line, background: C.panel }}>
              <div className="flex items-center gap-2 border-b px-4 py-2 text-sm font-semibold" style={{ borderColor: C.line }}>
                <Activity size={15} color={C.gold} /> What Adapt is thinking
              </div>
              <div ref={logRef} className="max-h-60 flex-1 space-y-2 overflow-y-auto px-4 py-3">
                {log.length === 0 && <div className="text-sm" style={{ color: C.mute }}>Press Start to watch a learner work through a session.</div>}
                {log.map((l) => (
                  <div key={l.id} className="flex gap-2 text-xs leading-relaxed md:text-sm">
                    <span className="shrink-0 tabular-nums" style={{ color: C.mute }}>{l.clock}</span>
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: KIND_COLOR[l.kind] }} />
                    <span style={{ color: C.soft }}>{l.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- how it works ---------- */}
        <HowItWorks />

        <div className="mt-6 flex flex-col gap-2 border-t pt-4 text-xs md:flex-row md:items-center md:justify-between" style={{ borderColor: C.line, color: C.mute }}>
          <span className="flex items-center gap-2"><ShieldCheck size={14} color={C.teal} /> Adapt reads behaviour only: scrolling, time, answers and questions. Never the camera, microphone, keystrokes or other tabs.</span>
          <span>{ENGINE_CREDIT} · scripted demo with a sample learner</span>
        </div>
      </div>
    </div>
  );
}

const KIND_COLOR: Record<LogKind, string> = { observe: C.blue, think: C.orange, ask: C.gold, act: C.teal, learn: C.teal };

// ---------- pieces ----------
function IdleCover({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.card }}><Brain size={30} color={C.gold} /></div>
      <h2 className="font-serif text-2xl font-bold">Watch Adapt notice a learner who is stuck</h2>
      <p className="mt-2 max-w-md text-sm" style={{ color: C.soft }}>
        A sample learner opens the first session of Personal Mastery. No login needed. The demo runs by itself in about a minute and a half; pause it any time.
      </p>
      <button onClick={onStart} className="mt-5 flex items-center gap-2 rounded-xl px-5 py-3 font-semibold" style={{ background: C.gold, color: C.navy }}>
        <Play size={18} /> Start the demo
      </button>
    </div>
  );
}

function Para({ id, hl, children }: { id: string; hl: string | null; children: ReactNode }) {
  const on = hl === id;
  return (
    <p data-anchor={id} className="mb-4 rounded-lg px-2 py-1 text-[15px] leading-7 transition-colors duration-500"
      style={{ color: C.soft, background: on ? "rgba(201,168,76,0.14)" : "transparent", boxShadow: on ? `inset 3px 0 0 ${C.gold}` : "none" }}>
      {children}
    </p>
  );
}

function H({ id, children }: { id: string; children: ReactNode }) {
  return <h3 data-anchor={id} className="mb-3 mt-6 font-serif text-xl font-bold" style={{ color: C.text }}>{children}</h3>;
}

function Lesson({ highlight, checkPick }: { highlight: string | null; checkPick: string | null }) {
  const opts = [
    { id: "a", t: "Opposite ends of one scale: more of one means less of the other" },
    { id: "b", t: "Separate dimensions that can exist in the same person at the same time" },
    { id: "c", t: "Stages you pass through in order: confusion first, then synthesis" },
  ];
  return (
    <div>
      <h2 data-anchor="top" className="font-serif text-2xl font-bold">The Architecture of Identity: What You Are Is Not Fixed</h2>
      <H id="overview">Session overview</H>
      <Para id="ov" hl={highlight}>Session 1 establishes the foundational claim of this unit: that identity is not a property you discover but a structure you build. This is not an inspirational statement. It is a philosophical and scientific claim, and this session makes the case for it with enough precision that you can use the claim as a tool rather than merely accepting it as encouragement.</Para>
      <H id="p1">Part 1: Personal identity, the question you are already answering</H>
      <Para id="p1a" hl={highlight}>Identity, in the developmental psychology sense this unit uses, refers to how individuals understand themselves: their abilities, values, roles and relationships, and specifically how that understanding remains coherent across time and context. You are the same person in your family home as you are in a professional setting, even though your behaviour differs substantially between those contexts.</Para>
      <Para id="p1b" hl={highlight}>Adolescence and young adulthood are described in developmental research as the critical periods for identity formation. Researchers identify two components that operate simultaneously. The first is identity synthesis: the degree to which an individual has a coherent, stable sense of self. The second is identity confusion: the degree to which the individual has a fragmented or unstable sense of self.</Para>
      <Para id="p1c" hl={highlight}>The critical insight here, and one that most learners find counterintuitive when they first encounter it, is that identity synthesis and identity confusion are not opposite ends of a single spectrum. They are separate dimensions that can coexist within the same person simultaneously. You may be entirely clear about your professional direction while being genuinely uncertain about your values.</Para>
      <div data-anchor="p1key" className="mb-4 rounded-xl border-l-4 p-4" style={{ background: C.card, borderColor: C.gold }}>
        <div className="mb-1 text-xs font-bold tracking-wide" style={{ color: C.gold }}>KEY IDEA</div>
        <div className="text-[15px] leading-7" style={{ color: C.soft }}>Identity synthesis and identity confusion are not opposites. They coexist. A person can have strong synthesis in one area of life and real confusion in another. The goal is to build synthesis deliberately where it matters most.</div>
      </div>
      <div data-anchor="check" className="mb-6 mt-8 rounded-2xl border p-5" style={{ borderColor: C.line, background: C.navy }}>
        <div className="mb-1 flex items-center gap-2 text-xs font-bold tracking-wide" style={{ color: C.teal }}><Target size={14} /> QUICK CHECK · PART 1</div>
        <div className="mb-3 font-semibold">According to this session, identity synthesis and identity confusion are…</div>
        <div className="space-y-2">
          {opts.map((o) => {
            const picked = checkPick === o.id;
            return (
              <div key={o.id} className="flex items-start gap-3 rounded-xl border px-3 py-2 text-sm transition"
                style={{ borderColor: picked ? C.red : C.line, background: picked ? "rgba(240,113,107,0.12)" : "transparent", color: C.soft }}>
                <span className="mt-0.5 font-bold" style={{ color: C.mute }}>{o.id.toUpperCase()}</span>
                <span className="flex-1">{o.t}</span>
                {picked && <XCircle size={18} color={C.red} />}
              </div>
            );
          })}
        </div>
      </div>
      <H id="p2">Part 2: Social identity, and why your groups are shaping you</H>
      <Para id="p2a" hl={highlight}>Social identity refers to the part of your self-concept derived from membership in social groups. Henri Tajfel proposed that individuals derive significant portions of their self-understanding from their sense of belonging to groups, and the value they attach to that belonging.</Para>
      <div className="h-40" />
    </div>
  );
}

function ProposalOverlay({ choice }: { choice: string | null }) {
  const modes = [
    { id: "worked", icon: Lightbulb, label: "Show me with an example", sub: "A Kenyan story and a picture", tag: "Suggested", on: true },
    { id: "visual", icon: ImageIcon, label: "Show me a diagram", sub: "The idea as one picture", on: true },
    { id: "video", icon: Video, label: "Watch it as a video", sub: "ContentForge · rolling out", on: true },
    { id: "game", icon: Gamepad2, label: "Learn it as a game", sub: "Coming later", on: false },
  ];
  return (
    <div className="absolute inset-0 flex items-start justify-center overflow-y-auto p-3 md:items-center md:p-6" style={{ background: "rgba(6,11,46,0.78)" }}>
      <div className="w-full max-w-lg rounded-2xl border p-4 shadow-2xl md:p-5" style={{ background: C.panel, borderColor: C.gold }}>
        <div className="mb-1 flex items-center gap-2 text-xs font-bold tracking-wide" style={{ color: C.gold }}><Sparkles size={14} /> ADAPT SUGGESTS A DIFFERENT WAY</div>
        <div className="font-serif text-lg font-bold md:text-xl">This part seems hard to get from the text. Want to try it another way?</div>
        <div className="mt-3 grid gap-2 text-xs md:grid-cols-2" style={{ color: C.soft }}>
          <div className="rounded-lg p-2" style={{ background: C.card }}><b style={{ color: C.text }}>Why I'm asking:</b> you re-read one paragraph twice, spent 2.6× the usual time, and missed the check on it.</div>
          <div className="rounded-lg p-2" style={{ background: C.card }}><b style={{ color: C.text }}>What else it could be:</b> unfamiliar words, or just one tough paragraph. Tell me if so.</div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {modes.map((m) => {
            const sel = choice === m.id;
            const Icon = m.icon;
            return (
              <div key={m.id} className="relative rounded-xl border p-3 transition"
                style={{ borderColor: sel ? C.teal : C.line, background: sel ? "rgba(34,206,161,0.12)" : C.card, opacity: m.on ? 1 : 0.45 }}>
                {m.tag && <span className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: C.gold, color: C.navy }}>{m.tag}</span>}
                <Icon size={18} color={sel ? C.teal : C.gold} />
                <div className="mt-1 text-sm font-semibold">{m.label}</div>
                <div className="text-xs" style={{ color: C.mute }}>{m.sub}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs" style={{ color: C.mute }}>
          <span>How we'll know it worked: one matched question, same format</span>
          <span className="rounded-lg border px-2 py-1" style={{ borderColor: C.line }}>Keep reading instead</span>
        </div>
      </div>
    </div>
  );
}

function Reteach({ barsOn, matchedPick, done }: { barsOn: boolean; matchedPick: string | null; done: boolean }) {
  const rows = [
    { area: "Career direction", syn: 80, con: 20, note: "She knows she wants to run a salon" },
    { area: "Her values", syn: 30, con: 70, note: "Unsure what she stands for when friends push back" },
  ];
  const opts = [
    { id: "a", t: "Brian is clear in one area, so he cannot also be confused" },
    { id: "b", t: "Brian can be clear about his football and unsure about his career at the same time" },
    { id: "c", t: "Brian must first clear his confusion before any synthesis can start" },
  ];
  return (
    <div>
      <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(34,206,161,0.15)", color: C.teal }}>
        <Lightbulb size={14} /> Mode switched by Adapt · you can switch back any time
      </div>
      <h2 className="font-serif text-2xl font-bold">Same idea, shown through Wanjiru</h2>
      <p className="mt-3 text-[15px] leading-7" style={{ color: C.soft }}>
        Wanjiru is 22 and lives in Githurai 45. Ask her about work and she answers in a second: she is training in hair and beauty and wants her own salon by 25. Ask her what she stands for when her friends push her to do something she doesn't agree with, and she goes quiet.
      </p>
      <p className="mt-3 text-[15px] leading-7" style={{ color: C.soft }}>
        She is <b style={{ color: C.text }}>clear</b> and <b style={{ color: C.text }}>confused</b> at the same time, in different parts of her life. That is the whole idea.
      </p>
      <div data-anchor="rt-bars" className="mt-5 rounded-2xl border p-4" style={{ borderColor: C.line, background: C.navy }}>
        <div className="mb-3 text-xs font-bold tracking-wide" style={{ color: C.gold }}>TWO SEPARATE MEASURES, NOT ONE SCALE</div>
        {rows.map((r) => (
          <div key={r.area} className="mb-4">
            <div className="mb-1 flex justify-between text-sm"><b>{r.area}</b><span className="text-xs" style={{ color: C.mute }}>{r.note}</span></div>
            <Bar label="Synthesis (clear)" value={barsOn ? r.syn : 0} color={C.teal} />
            <Bar label="Confusion (unsure)" value={barsOn ? r.con : 0} color={C.orange} />
          </div>
        ))}
        <div className="text-xs" style={{ color: C.soft }}>If they were one scale, the two bars would always add up to the same thing. They don't have to: each one moves on its own.</div>
      </div>
      <div data-anchor="rt-matched" className="mb-6 mt-6 rounded-2xl border p-5" style={{ borderColor: C.line, background: C.navy }}>
        <div className="mb-1 flex items-center gap-2 text-xs font-bold tracking-wide" style={{ color: C.teal }}><Target size={14} /> MATCHED QUESTION</div>
        <div className="mb-3 font-semibold">Brian is sure he's a strong footballer but has no idea what career he wants. Which is true?</div>
        <div className="space-y-2">
          {opts.map((o) => {
            const picked = matchedPick === o.id;
            return (
              <div key={o.id} className="flex items-start gap-3 rounded-xl border px-3 py-2 text-sm transition"
                style={{ borderColor: picked ? C.teal : C.line, background: picked ? "rgba(34,206,161,0.12)" : "transparent", color: C.soft }}>
                <span className="mt-0.5 font-bold" style={{ color: C.mute }}>{o.id.toUpperCase()}</span>
                <span className="flex-1">{o.t}</span>
                {picked && <CheckCircle2 size={18} color={C.teal} />}
              </div>
            );
          })}
        </div>
      </div>
      {done && (
        <div className="mb-6 rounded-2xl border p-4 text-sm" style={{ borderColor: C.teal, background: "rgba(34,206,161,0.08)", color: C.soft }}>
          <b style={{ color: C.teal }}>Got it.</b> Back to the session: Part 2, Social identity. Reading stays part of the course; Adapt changes how a hard idea is explained, not whether you read.
        </div>
      )}
      <div className="h-40" />
    </div>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-1.5 flex items-center gap-2 text-xs">
      <span className="w-32 shrink-0" style={{ color: C.mute }}>{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full" style={{ background: C.card }}>
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="w-8 text-right tabular-nums" style={{ color: C.soft }}>{value}</span>
    </div>
  );
}

function Meter({ icon: Icon, label, value, display, max, warnAt }: { icon: typeof Clock; label: string; value: number; display: string; max: number; warnAt: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const warn = value >= warnAt;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5" style={{ color: C.soft }}><Icon size={13} color={warn ? C.orange : C.mute} /> {label}</span>
        <span className="font-semibold tabular-nums" style={{ color: warn ? C.orange : C.text }}>{display}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: C.card }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: warn ? C.orange : C.blue }} />
      </div>
    </div>
  );
}

function SignalsCard({ s }: { s: Signals }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: C.panel }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold"><Eye size={15} color={C.gold} /> Signals Adapt can see</div>
        <span className="flex items-center gap-1 text-[11px]" style={{ color: C.mute }}><EyeOff size={11} /> no camera, no mic</span>
      </div>
      <div className="space-y-3">
        <Meter icon={Clock} label="Time on this part vs expected" value={s.timeRatio} display={s.timeRatio ? `${s.timeRatio.toFixed(1)}×` : "–"} max={3} warnAt={2.5} />
        <Meter icon={ArrowUp} label="Scrolled back to re-read" value={s.rereads} display={String(s.rereads)} max={3} warnAt={2} />
        <Meter icon={ArrowDown} label="How far through the page" value={s.scrollDepth} display={s.scrollDepth ? `${s.scrollDepth}%` : "–"} max={100} warnAt={101} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Chip on={s.confusion} warn icon={HelpCircle} text={s.confusion ? "Asked a confused question" : "No confused questions"} />
        <Chip on={s.check !== null} warn={s.check === "wrong"} icon={s.check === "right" ? CheckCircle2 : Target}
          text={s.check === null ? "Quick check: not yet" : s.check === "wrong" ? `Check missed · ${s.answerSecs}s` : `Check correct · ${s.answerSecs}s`} />
      </div>
    </div>
  );
}

function Chip({ on, warn, icon: Icon, text }: { on: boolean; warn?: boolean; icon: typeof Clock; text: string }) {
  const color = !on ? C.mute : warn ? C.orange : C.teal;
  return (
    <div className="flex items-center gap-1.5 rounded-lg border px-2 py-1.5" style={{ borderColor: on ? color : C.line, color }}>
      <Icon size={13} /> <span className="leading-tight">{text}</span>
    </div>
  );
}

function DiagnosisCard({ steps, verdict }: { steps: DiagStep[]; verdict: string | null }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: C.orange, background: C.panel }}>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Brain size={15} color={C.orange} /> Why isn't it landing?</div>
      <div className="space-y-2">
        {steps.map((d) => (
          <div key={d.label} className="flex items-start gap-2 text-xs">
            <span className="mt-0.5">
              {d.result === "pending" ? <span className="block h-3.5 w-3.5 animate-pulse rounded-full" style={{ background: C.card }} />
                : d.result === "clear" ? <CheckCircle2 size={14} color={C.teal} /> : <Zap size={14} color={C.orange} />}
            </span>
            <div>
              <div className="font-semibold" style={{ color: d.result === "pending" ? C.mute : C.text }}>{d.label} {d.result === "clear" && <span style={{ color: C.teal }}>No</span>}{d.result === "flag" && <span style={{ color: C.orange }}>Likely</span>}</div>
              {d.result !== "pending" && <div style={{ color: C.mute }}>{d.detail}</div>}
            </div>
          </div>
        ))}
      </div>
      {verdict && <div className="mt-3 rounded-lg p-2 text-xs" style={{ background: C.card, color: C.soft }}><b style={{ color: C.orange }}>Best explanation: </b>{verdict}</div>}
    </div>
  );
}

function LearnedCard({ model }: { model: { reading: number; worked: number; n: number } }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: C.teal, background: C.panel }}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Sparkles size={15} color={C.teal} /> What Adapt learned about Amani</div>
      <div className="text-xs leading-relaxed" style={{ color: C.soft }}>
        Missed the check after reading, got the matched question after a worked example.
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full px-2 py-1" style={{ background: C.card }}>Worked examples: +{model.worked}</span>
          <span className="rounded-full px-2 py-1" style={{ background: C.card, color: C.orange }}>Early signal · {model.n} observation</span>
        </div>
        <div className="mt-2" style={{ color: C.mute }}>Adapt needs about 8 observations before calling it a pattern. Learners will be able to see and change this on their profile.</div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const items = [
    { icon: Eye, t: "Observe", d: "Time on each part, scrolling back to re-read, quick-check answers and questions to the Light Guide. A fixed list of signals; nothing else is recorded." },
    { icon: Brain, t: "Understand", d: "Before blaming the teaching, it rules out a missing earlier skill and rushing or tiredness. Only then does it call it a teaching-mode problem." },
    { icon: MessageCircle, t: "Personalise, with consent", d: "It explains why it is asking, what else could explain it, and offers modes: worked example, diagram, video, and games later. Nothing changes until the learner says yes." },
    { icon: Target, t: "Learn", d: "A matched question shows whether the switch worked. Results build up per learner, labelled early signal until there is enough evidence." },
  ];
  return (
    <div className="mt-8">
      <h2 className="font-serif text-2xl font-bold">How Adapt decides</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.t} className="rounded-2xl border p-4" style={{ borderColor: C.line, background: C.panel }}>
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full" style={{ background: C.gold }}><Icon size={18} color={C.navy} /></div>
              <div className="font-semibold">{it.t}</div>
              <div className="mt-1 text-sm leading-relaxed" style={{ color: C.soft }}>{it.d}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
