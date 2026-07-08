/**
 * Per-pillar motion theming for zoom transitions and ambient overlays.
 * Keyed by canonical pillar id used across the app (see src/data/courses.ts).
 * Each entry gives the hue used by PillarZoomLink bursts + the glyph set
 * that rushes outward on navigation.
 */
export interface PillarMotionTheme {
  /** Human-facing label — for docs / debug only. */
  label: string;
  /** Hex hue used for burst particles + glow. */
  color: string;
  /** Small glyph rotation used by the zoom burst. Keep to 2 chars max. */
  glyphs: string[];
}

export const pillarMotionThemes: Record<string, PillarMotionTheme> = {
  "financial-intelligence": {
    label: "Financial Intelligence",
    color: "#C9A84C",
    glyphs: ["◉", "Ksh", "✦"],
  },
  // Communication & Networking — mapped onto the cybersecurity/comms surface.
  "cybersecurity": {
    label: "Communication & Networking",
    color: "#2DD4BF",
    glyphs: ["●", "○", "≋"],
  },
  "digital-literacy": {
    label: "Digital Skills & Technology",
    color: "#3B82F6",
    glyphs: ["</>", "·", "•"],
  },
  "personal-mastery": {
    label: "Leadership & Personal Development",
    color: "#7C5CBF",
    glyphs: ["▲", "✧", "☀"],
  },
  // Entrepreneurship & Innovation — mapped onto programming-systems surface.
  "programming-systems": {
    label: "Entrepreneurship & Innovation",
    color: "#E08D3C",
    glyphs: ["⚡", "▲", "✦"],
  },
  "creator-economy": {
    label: "Creator Economy & Monetisation",
    color: "#E0607E",
    glyphs: ["▶", "♥", "✦"],
  },
  "civic-leadership": {
    label: "Civic Leadership & Governance",
    color: "#2F855A",
    glyphs: ["★", "⚖", "✦"],
  },
};

export const defaultPillarMotion: PillarMotionTheme = {
  label: "Default",
  color: "#C9A84C",
  glyphs: ["✦"],
};

export const getPillarMotion = (pillarId?: string | null): PillarMotionTheme =>
  (pillarId && pillarMotionThemes[pillarId]) || defaultPillarMotion;