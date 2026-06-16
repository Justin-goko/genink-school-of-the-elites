import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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

  const handleClick = (stop: PillarStop) => {
    if (stop.status === "locked") {
      toast.error("Complete previous Pillar to unlock");
      return;
    }
    navigate(`/pillar/${stop.id}`);
  };

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
        <div className="overflow-x-auto overflow-y-hidden -mx-4 px-4 pb-4">
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
                `}</style>
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

                    <circle r="26" fill={fill} stroke={stroke} strokeWidth="3" />

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
            </svg>
          </div>
        </div>

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
      </div>
    </section>
  );
};

export default ProgressMap;