import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { playUnlockChime } from "@/lib/journeySound";
import {
  Coins,
  MessageCircle,
  Laptop,
  Crown,
  Rocket,
  TrendingUp,
  Landmark,
  Check,
  Lock,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type Status = "completed" | "current" | "locked";

interface PillarStop {
  num: number;
  id: string;
  title: string;
  icon: LucideIcon;
  xp: number;
  completion: number;
  status: Status;
}

// Pillar slugs map to /pillar/:pillarId. Adjust IDs if data slugs differ later.
const PILLARS: PillarStop[] = [
  { num: 1, id: "financial-intelligence", title: "Financial Intelligence", icon: Coins, xp: 1200, completion: 100, status: "completed" },
  { num: 2, id: "communication-networking", title: "Communication & Networking", icon: MessageCircle, xp: 950, completion: 100, status: "completed" },
  { num: 3, id: "digital-literacy", title: "Digital Skills & Technology", icon: Laptop, xp: 1400, completion: 45, status: "current" },
  { num: 4, id: "personal-mastery", title: "Leadership & Personal Development", icon: Crown, xp: 1100, completion: 0, status: "locked" },
  { num: 5, id: "entrepreneurship", title: "Entrepreneurship & Innovation", icon: Rocket, xp: 1500, completion: 0, status: "locked" },
  { num: 6, id: "creator-economy", title: "Creator Economy & Monetisation", icon: TrendingUp, xp: 1300, completion: 0, status: "locked" },
  { num: 7, id: "civic-leadership", title: "Civic Leadership & Governance", icon: Landmark, xp: 1000, completion: 0, status: "locked" },
];

// Layout constants for the SVG viewBox.
const VB_W = 1400;
const VB_H = 420;
const MARGIN_X = 90;
const BASE_Y = 260;

// Evenly distribute stops, undulate Y for a "winding" feel.
const stops = PILLARS.map((p, i) => {
  const t = i / (PILLARS.length - 1);
  const x = MARGIN_X + t * (VB_W - MARGIN_X * 2);
  const y = BASE_Y + Math.sin(i * 0.95) * 38;
  return { ...p, x, y };
});

// Smooth curve through the stops.
const pathD = stops
  .map((s, i) => {
    if (i === 0) return `M ${s.x} ${s.y}`;
    const prev = stops[i - 1];
    const cx = (prev.x + s.x) / 2;
    return `Q ${cx} ${prev.y}, ${cx} ${(prev.y + s.y) / 2} T ${s.x} ${s.y}`;
  })
  .join(" ");

const ProgressMap = () => {
  const navigate = useNavigate();
  // The next index that just unlocked (renders bounce + particles).
  const [unlockedIdx, setUnlockedIdx] = useState<number | null>(null);
  // The index from which the orb is travelling. The orb renders only when this is set.
  const [travelFromIdx, setTravelFromIdx] = useState<number | null>(null);
  const motionRef = useRef<SVGAnimateMotionElement | null>(null);

  // Auto-detect: when a stop is completed and the next is locked, queue an unlock animation.
  useEffect(() => {
    if (travelFromIdx !== null || unlockedIdx !== null) return;
    for (let i = 0; i < stops.length - 1; i++) {
      if (stops[i].status === "completed" && stops[i + 1].status === "locked") {
        // Don't auto-fire — wait for explicit trigger (data hasn't actually changed mid-session).
        break;
      }
    }
  }, []);

  const triggerUnlock = (fromIdx: number) => {
    if (fromIdx < 0 || fromIdx >= stops.length - 1) return;
    if (travelFromIdx !== null) return;
    setUnlockedIdx(null);
    setTravelFromIdx(fromIdx);
    // Kick the SMIL animateMotion via begin attribute change.
    requestAnimationFrame(() => {
      try { motionRef.current?.beginElement(); } catch { /* ignore */ }
    });
  };

  const onOrbArrive = (toIdx: number) => {
    setUnlockedIdx(toIdx);
    playUnlockChime();
    // Clear the travelling orb after the unlock animation completes.
    window.setTimeout(() => {
      setTravelFromIdx(null);
      setUnlockedIdx(null);
    }, 1400);
  };

  // SMIL "endEvent" is not exposed via React props — bind it imperatively.
  useEffect(() => {
    const el = motionRef.current;
    if (!el || travelFromIdx === null) return;
    const handler = () => onOrbArrive(travelFromIdx + 1);
    el.addEventListener("endEvent", handler);
    return () => el.removeEventListener("endEvent", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelFromIdx]);

  const handleClick = (stop: PillarStop) => {
    if (stop.status === "locked") {
      toast.error("Complete previous Pillar to unlock");
      return;
    }
    navigate(`/pillar/${stop.id}`);
  };

  // Find first locked index for demo trigger.
  const firstLockedIdx = stops.findIndex((s) => s.status === "locked");
  const demoFromIdx = firstLockedIdx > 0 ? firstLockedIdx - 1 : -1;
  const targetIdx = travelFromIdx !== null ? travelFromIdx + 1 : -1;
  const target = targetIdx >= 0 ? stops[targetIdx] : null;

  return (
    <section
      aria-label="Learning journey progress map"
      className="w-full"
      style={{ background: "#F9F6F0" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="mb-8 text-center">
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight"
            style={{ color: "#1B2A4A" }}
          >
            Your Journey
          </h1>
          <p className="mt-2 text-sm md:text-base" style={{ color: "#1B2A4A", opacity: 0.7 }}>
            From the village to the city — seven landmarks of mastery.
          </p>
        </div>

        {/* Horizontal scroll on mobile, fits on desktop */}
        {/* DESKTOP LAYOUT — horizontal winding road (hidden below md) */}
        <div className="hidden md:block overflow-x-auto overflow-y-hidden -mx-4 px-4 pb-4">
          <div className="min-w-[900px] md:min-w-0">
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              className="w-full h-auto"
              role="img"
              aria-label="Pillar progression path"
            >
              <defs>
                <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F9F6F0" />
                  <stop offset="100%" stopColor="#EFE7D5" />
                </linearGradient>
                <style>{`
                  @keyframes pm-pulse {
                    0% { transform: scale(1); opacity: 0.6; }
                    70% { transform: scale(2.2); opacity: 0; }
                    100% { transform: scale(2.2); opacity: 0; }
                  }
                  .pm-pulse-ring {
                    transform-origin: center;
                    transform-box: fill-box;
                    animation: pm-pulse 2s ease-out infinite;
                  }
                  @keyframes pm-unlock {
                    0%   { transform: scale(0.8); opacity: 0.3; }
                    60%  { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1);   opacity: 1; }
                  }
                  .pm-unlock {
                    transform-origin: center;
                    transform-box: fill-box;
                    animation: pm-unlock 0.6s cubic-bezier(.34,1.56,.64,1) 1 both;
                  }
                  @keyframes pm-particle {
                    0%   { transform: translate(0,0) scale(1); opacity: 1; }
                    100% { transform: translate(var(--pm-dx), var(--pm-dy)) scale(0.3); opacity: 0; }
                  }
                  .pm-particle {
                    transform-origin: center;
                    transform-box: fill-box;
                    animation: pm-particle 0.9s ease-out forwards;
                  }
                  @keyframes pm-orb-pulse {
                    0%,100% { opacity: 0.95; }
                    50%     { opacity: 0.7;  }
                  }
                  .pm-orb-pulse { animation: pm-orb-pulse 1.2s ease-in-out infinite; }
                `}</style>
                <radialGradient id="pm-orb-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="#FFF6D8" stopOpacity="1" />
                  <stop offset="45%"  stopColor="#F1CF6A" stopOpacity="0.95" />
                  <stop offset="80%"  stopColor="#C9A84C" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
                </radialGradient>
                <filter id="pm-orb-blur" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
                <path id="pm-road-path" d={pathD} fill="none" />
              </defs>

              {/* Sky band */}
              <rect x="0" y="0" width={VB_W} height={BASE_Y - 60} fill="url(#skyFade)" />

              {/* Village (left) */}
              <g opacity="0.9">
                <polygon points="20,260 50,220 80,260" fill="#8B6F3A" />
                <rect x="30" y="258" width="40" height="30" fill="#A8814A" />
                <rect x="44" y="270" width="12" height="18" fill="#1B2A4A" />
                <polygon points="0,260 20,240 40,260" fill="#6B5530" opacity="0.8" />
              </g>

              {/* City skyline (right) */}
              <g opacity="0.9">
                <rect x={VB_W - 110} y="200" width="22" height="90" fill="#1B2A4A" />
                <rect x={VB_W - 84} y="170" width="26" height="120" fill="#1B2A4A" />
                <rect x={VB_W - 54} y="190" width="20" height="100" fill="#1B2A4A" />
                <rect x={VB_W - 30} y="215" width="24" height="75" fill="#1B2A4A" />
                <rect x={VB_W - 84} y="160" width="4" height="14" fill="#C9A84C" />
              </g>

              {/* Ground line */}
              <line x1="0" y1="290" x2={VB_W} y2="290" stroke="#1B2A4A" strokeWidth="1" opacity="0.15" />

              {/* Road — dashed under-layer */}
              <path d={pathD} fill="none" stroke="#1B2A4A" strokeWidth="10" strokeLinecap="round" />
              <path
                d={pathD}
                fill="none"
                stroke="#F9F6F0"
                strokeWidth="2"
                strokeDasharray="10 14"
                strokeLinecap="round"
              />

              {/* Stops */}
              {stops.map((s) => {
                const Icon = s.icon;
                const isCompleted = s.status === "completed";
                const isCurrent = s.status === "current";
                const isLocked = s.status === "locked";
                const isUnlocking = unlockedIdx === s.num - 1;

                const fill = isCompleted ? "#C9A84C" : isCurrent ? "#1B2A4A" : "#C9C4BA";
                const stroke = isCompleted ? "#A8862F" : isCurrent ? "#0F1B33" : "#A8A498";

                return (
                  <g
                    key={s.id}
                    transform={`translate(${s.x} ${s.y})`}
                    className="cursor-pointer"
                    onClick={() => handleClick(s)}
                    role="button"
                    aria-label={`Pillar ${s.num}: ${s.title}${isLocked ? " (locked)" : ""}`}
                  >
                    {isCurrent && (
                      <circle
                        r="26"
                        fill="none"
                        stroke="#1B2A4A"
                        strokeWidth="2"
                        className="pm-pulse-ring"
                        opacity="0.6"
                      />
                    )}

                    <g className={isUnlocking ? "pm-unlock" : undefined}>
                      <circle
                        r="26"
                        fill={isUnlocking ? "#C9A84C" : fill}
                        stroke={isUnlocking ? "#A8862F" : stroke}
                        strokeWidth="3"
                      />
                    </g>

                    {/* Icon / state mark inside the circle */}
                    <g transform="translate(-10 -10)" pointerEvents="none">
                      {isCompleted ? (
                        <Check size={20} color="#FFFFFF" strokeWidth={3} />
                      ) : isLocked ? (
                        <Lock size={20} color="#FFFFFF" strokeWidth={2.5} />
                      ) : (
                        <Icon size={20} color="#C9A84C" strokeWidth={2.5} />
                      )}
                    </g>

                    {/* Number badge */}
                    <g transform="translate(20 -28)">
                      <circle r="11" fill="#FFFFFF" stroke="#1B2A4A" strokeWidth="1.5" />
                      <text
                        textAnchor="middle"
                        dy="4"
                        fontSize="12"
                        fontWeight="700"
                        fill="#1B2A4A"
                      >
                        {s.num}
                      </text>
                    </g>

                    {/* Label block below */}
                    <g transform="translate(0 48)">
                      <text
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="600"
                        fill="#1B2A4A"
                      >
                        {s.title}
                      </text>
                      <text
                        textAnchor="middle"
                        y="18"
                        fontSize="11"
                        fill="#1B2A4A"
                        opacity="0.7"
                      >
                        {s.xp.toLocaleString()} XP · {s.completion}%
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Travelling orb — only renders while an unlock animation is in flight */}
              {travelFromIdx !== null && (
                <g className="pm-orb-pulse">
                  <circle r="22" fill="url(#pm-orb-grad)" filter="url(#pm-orb-blur)" />
                  <circle r="10" fill="#FFF6D8" opacity="0.9" />
                  <animateMotion
                    ref={motionRef}
                    dur="1.5s"
                    fill="freeze"
                    calcMode="spline"
                    keySplines="0.42 0 0.58 1"
                    keyTimes="0;1"
                    begin="indefinite"
                  >
                    <mpath href="#pm-road-path" />
                  </animateMotion>
                </g>
              )}

              {/* Particle burst at the newly-unlocked node */}
              {target && unlockedIdx === targetIdx && (
                <g transform={`translate(${target.x} ${target.y})`}>
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    const dist = 60 + (i % 3) * 12;
                    const dx = Math.cos(angle) * dist;
                    const dy = Math.sin(angle) * dist;
                    return (
                      <circle
                        key={i}
                        r={3 + (i % 2)}
                        fill="#C9A84C"
                        className="pm-particle"
                        style={{
                          ["--pm-dx" as any]: `${dx}px`,
                          ["--pm-dy" as any]: `${dy}px`,
                          animationDelay: `${(i % 4) * 30}ms`,
                        }}
                      />
                    );
                  })}
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* MOBILE LAYOUT — vertical zigzag road (shown below md) */}
        <MobileJourney
          stops={PILLARS}
          travelFromIdx={travelFromIdx}
          unlockedIdx={unlockedIdx}
          onSelect={handleClick}
        />

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs" style={{ color: "#1B2A4A" }}>
          <span className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#C9A84C" }} />
            Completed
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#1B2A4A" }} />
            In progress
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#C9C4BA" }} />
            Locked
          </span>
        </div>

        {/* Demo: trigger the unlock animation for the first locked pillar */}
        {demoFromIdx >= 0 && (
          <div className="mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={() => triggerUnlock(demoFromIdx)}
              disabled={travelFromIdx !== null}
              className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#1B2A4A]/20 text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#1B2A4A]"
              aria-label="Preview the next pillar unlock animation"
            >
              <Sparkles className="w-3 h-3" />
              Preview next-pillar unlock
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProgressMap;

// ============================================================
// Mobile vertical zigzag layout
// ============================================================

interface MobileJourneyProps {
  stops: PillarStop[];
  travelFromIdx: number | null;
  unlockedIdx: number | null;
  onSelect: (s: PillarStop) => void;
}

const CARD_STEP = 140; // vertical spacing between nodes (px)
const CARD_TOP = 40;   // offset before first node

function MobileJourney({ stops, travelFromIdx, unlockedIdx, onSelect }: MobileJourneyProps) {
  const totalHeight = CARD_TOP + stops.length * CARD_STEP;
  // Vertical winding path down the centre with subtle left/right sway.
  const pathPoints = stops.map((_, i) => {
    const y = CARD_TOP + i * CARD_STEP;
    const sway = Math.sin(i * 0.9) * 18;
    return { x: 50 + sway, y };
  });
  const verticalPath = pathPoints
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pathPoints[i - 1];
      const cy = (prev.y + p.y) / 2;
      return `C ${prev.x} ${cy}, ${p.x} ${cy}, ${p.x} ${p.y}`;
    })
    .join(" ");

  return (
    <div className="md:hidden relative mx-auto" style={{ maxWidth: 480, height: totalHeight }}>
      {/* Road svg spans the full column */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 100 ${totalHeight}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <path id="pm-road-path-v" d={verticalPath} fill="none" />
          <radialGradient id="pm-orb-grad-v" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF6D8" stopOpacity="1" />
            <stop offset="45%" stopColor="#F1CF6A" stopOpacity="0.95" />
            <stop offset="80%" stopColor="#C9A84C" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={verticalPath} stroke="#1B2A4A" strokeWidth="3" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={verticalPath} stroke="#F9F6F0" strokeWidth="1" strokeDasharray="4 6" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {travelFromIdx !== null && (
          <g className="pm-orb-pulse">
            <circle r="4" fill="url(#pm-orb-grad-v)" />
            <circle r="1.6" fill="#FFF6D8" opacity="0.9" />
            <animateMotion dur="1.5s" fill="freeze" begin="0s">
              <mpath href="#pm-road-path-v" />
            </animateMotion>
          </g>
        )}
      </svg>

      {/* Alternating zigzag cards */}
      <ol className="relative">
        {stops.map((s, i) => {
          const Icon = s.icon;
          const isLocked = s.status === "locked";
          const isCompleted = s.status === "completed";
          const isCurrent = s.status === "current";
          const isUnlocking = unlockedIdx === i;
          const side = i % 2 === 0 ? "left" : "right";
          const nodeFill = isCompleted ? "#C9A84C" : isCurrent ? "#1B2A4A" : "#C9C4BA";

          return (
            <li
              key={s.id}
              className="absolute inset-x-0 flex items-center"
              style={{
                top: CARD_TOP + i * CARD_STEP - 40,
                height: 80,
                flexDirection: side === "left" ? "row" : "row-reverse",
              }}
            >
              {/* Card */}
              <button
                type="button"
                onClick={() => onSelect(s)}
                disabled={isLocked}
                aria-label={`Pillar ${s.num}: ${s.title}${isLocked ? " (locked)" : ""}`}
                className={`w-[42%] rounded-xl border p-3 text-left shadow-sm transition-all ${
                  isLocked
                    ? "opacity-50 cursor-not-allowed bg-[#EFE7D5] border-[#C9C4BA]"
                    : "bg-white border-[#1B2A4A]/15 hover:shadow-md active:scale-[0.98]"
                } ${isUnlocking ? "ring-2 ring-[#C9A84C]" : ""}`}
                style={{ color: "#1B2A4A" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold"
                    style={{ background: nodeFill, color: "#fff" }}
                  >
                    {s.num}
                  </span>
                  {isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : isCompleted ? (
                    <Check className="w-4 h-4" style={{ color: "#C9A84C" }} />
                  ) : (
                    <Icon className="w-4 h-4" style={{ color: "#C9A84C" }} />
                  )}
                </div>
                <div className="text-sm font-semibold leading-tight">{s.title}</div>
                <div className="text-[11px] mt-1 opacity-70">
                  {s.xp.toLocaleString()} XP · {s.completion}%
                </div>
              </button>

              {/* Spacer for road column */}
              <div className="w-[16%]" />

              {/* Node circle on the road (visual anchor) */}
              <div
                className="w-[42%] flex"
                style={{ justifyContent: side === "left" ? "flex-start" : "flex-end" }}
              >
                <span
                  className={`block w-4 h-4 rounded-full border-2 ${
                    isCurrent ? "animate-pulse" : ""
                  }`}
                  style={{
                    background: nodeFill,
                    borderColor: isCompleted ? "#A8862F" : isCurrent ? "#0F1B33" : "#A8A498",
                    marginLeft: side === "left" ? "-12px" : 0,
                    marginRight: side === "right" ? "-12px" : 0,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}