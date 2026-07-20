// Illustrated SVG landmarks for each of the 7 pillars.
// Rendered inside ProgressMap; sized to fit inside a ~52px node region.
// Colors follow status: completed = warm gold, current = breathing gold, locked = dark silhouette.

import type { ReactNode } from "react";

type Status = "completed" | "current" | "locked";

interface Props {
  pillar: number; // 1..7
  status: Status;
}

function palette(status: Status) {
  if (status === "completed") return { fill: "#F1CF6A", stroke: "#C9A84C", accent: "#FFF6D8", glow: 0.9 };
  if (status === "current") return { fill: "#F1CF6A", stroke: "#C9A84C", accent: "#FFF6D8", glow: 1.0 };
  return { fill: "#1B2A4A", stroke: "#3A4A6E", accent: "#5A6B90", glow: 0.0 };
}

// Each landmark is drawn in a local 40x40 coordinate space centred on (0,0).
// Consumer <g transform="translate(x,y)"> handles placement.
export default function PillarLandmark({ pillar, status }: Props): ReactNode {
  const p = palette(status);
  const dim = status === "locked" ? 0.55 : 1;
  const base = (
    <g opacity={dim}>{renderLandmark(pillar, p)}</g>
  );
  return base;
}

function renderLandmark(pillar: number, p: ReturnType<typeof palette>) {
  switch (pillar) {
    case 1: // Financial — small vault/bank with coins
      return (
        <g>
          <rect x={-16} y={-4} width={32} height={20} fill={p.fill} stroke={p.stroke} strokeWidth={1.5} rx={2} />
          <polygon points="-18,-4 18,-4 0,-16" fill={p.fill} stroke={p.stroke} strokeWidth={1.5} />
          <rect x={-4} y={2} width={8} height={14} fill={p.stroke} />
          <circle cx={-10} cy={9} r={2} fill={p.accent} />
          <circle cx={10} cy={9} r={2} fill={p.accent} />
          <text x={0} y={-8} textAnchor="middle" fontSize={7} fontWeight={700} fill={p.stroke}>Ksh</text>
        </g>
      );
    case 2: // Communication — radio tower with signal rings
      return (
        <g>
          <line x1={0} y1={-18} x2={-10} y2={16} stroke={p.stroke} strokeWidth={1.5} />
          <line x1={0} y1={-18} x2={10} y2={16} stroke={p.stroke} strokeWidth={1.5} />
          <line x1={-6} y1={2} x2={6} y2={2} stroke={p.stroke} strokeWidth={1.5} />
          <line x1={-8} y1={10} x2={8} y2={10} stroke={p.stroke} strokeWidth={1.5} />
          <circle cx={0} cy={-18} r={3} fill={p.fill} />
          <path d="M -14 -18 A 14 14 0 0 1 14 -18" fill="none" stroke={p.fill} strokeWidth={1.2} opacity={0.7} />
          <path d="M -20 -14 A 20 20 0 0 1 20 -14" fill="none" stroke={p.fill} strokeWidth={1} opacity={0.4} />
        </g>
      );
    case 3: // Digital — glowing laptop
      return (
        <g>
          <rect x={-14} y={-8} width={28} height={16} fill={p.fill} stroke={p.stroke} strokeWidth={1.5} rx={1.5} />
          <rect x={-11} y={-6} width={22} height={12} fill={p.stroke} />
          <text x={0} y={2} textAnchor="middle" fontSize={7} fontWeight={700} fill={p.accent}>{"</>"}</text>
          <path d="M -18 10 L 18 10 L 14 14 L -14 14 Z" fill={p.stroke} />
        </g>
      );
    case 4: // Leadership — mountain peak with flag
      return (
        <g>
          <polygon points="-18,14 -2,-12 6,0 18,14" fill={p.fill} stroke={p.stroke} strokeWidth={1.5} />
          <polygon points="-6,4 2,-4 10,4" fill={p.stroke} opacity={0.8} />
          <line x1={-2} y1={-12} x2={-2} y2={-20} stroke={p.stroke} strokeWidth={1.5} />
          <polygon points="-2,-20 6,-17 -2,-14" fill={p.accent} />
        </g>
      );
    case 5: // Entrepreneurship — rocket on launch pad
      return (
        <g>
          <path d="M 0 -18 L 6 -6 L 6 8 L -6 8 L -6 -6 Z" fill={p.fill} stroke={p.stroke} strokeWidth={1.5} />
          <circle cx={0} cy={-2} r={2} fill={p.stroke} />
          <polygon points="-6,4 -12,10 -6,10" fill={p.stroke} />
          <polygon points="6,4 12,10 6,10" fill={p.stroke} />
          <polygon points="-3,8 0,16 3,8" fill={p.accent} opacity={0.9} />
          <rect x={-10} y={12} width={20} height={2} fill={p.stroke} />
        </g>
      );
    case 6: // Creator — ring-light studio
      return (
        <g>
          <circle cx={0} cy={-2} r={12} fill="none" stroke={p.fill} strokeWidth={3} />
          <circle cx={0} cy={-2} r={5} fill={p.stroke} />
          <polygon points="-3,3 -3,-7 5,-2" fill={p.accent} />
          <line x1={0} y1={10} x2={0} y2={16} stroke={p.stroke} strokeWidth={1.5} />
          <line x1={-6} y1={16} x2={6} y2={16} stroke={p.stroke} strokeWidth={1.5} />
        </g>
      );
    case 7: // Civic — parliament building with scales
      return (
        <g>
          <rect x={-16} y={2} width={32} height={12} fill={p.fill} stroke={p.stroke} strokeWidth={1.5} />
          <polygon points="-18,2 18,2 0,-8" fill={p.fill} stroke={p.stroke} strokeWidth={1.5} />
          <line x1={-10} y1={2} x2={-10} y2={14} stroke={p.stroke} strokeWidth={1.2} />
          <line x1={0} y1={2} x2={0} y2={14} stroke={p.stroke} strokeWidth={1.2} />
          <line x1={10} y1={2} x2={10} y2={14} stroke={p.stroke} strokeWidth={1.2} />
          <line x1={-6} y1={-4} x2={6} y2={-4} stroke={p.accent} strokeWidth={1.2} />
          <circle cx={-6} cy={-4} r={1.5} fill={p.accent} />
          <circle cx={6} cy={-4} r={1.5} fill={p.accent} />
        </g>
      );
    default:
      return <circle r={12} fill={p.fill} stroke={p.stroke} strokeWidth={1.5} />;
  }
}