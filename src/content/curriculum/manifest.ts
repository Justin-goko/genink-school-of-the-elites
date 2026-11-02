// Expected unit titles for the curriculum files in this folder.
// Files are named P{pillar}U{unit}S{session}.md. The bulk importer shows these
// next to the unit titles in the database so an admin can spot a mismatch
// before publishing.

export const EXPECTED_UNITS: Record<string, string> = {
  P1U1: "Identity Architecture & Self-Engineering",
  P1U2: "Cognitive Discipline & Mental Frameworks",
  P1U3: "Emotional Regulation & Self-Mastery",
  P1U4: "Digital Attention, Discipline & Cognitive Sovereignty",
  P1U5: "AI Use Without Cognitive Dependency",
  P1U6: "Ethical Foundations & Responsible Power",
  P1U7: "Long-Term Thinking & Habit Architecture",
  P2U1: "Money Psychology & Behavioral Finance",
  P2U2: "Personal Finance & Cashflow Control",
  P2U3: "Savings, Investing & Asset Classes",
  P2U4: "Business Fundamentals & Value Creation",
  P2U5: "Market Systems & Economic Thinking",
  P2U6: "Financial Markets: Foundations & Professional Competency",
  P2U7: "Financial Ethics & Long-Term Wealth Strategy",
  P3U1: "What Is Digital Literacy in 2026?",
  P3U2: "Information vs Misinformation",
  P3U3: "Digital Minimalism & Attention Control",
  P3U4: "Professional Digital Communication",
  P3U5: "Cloud Productivity, File Systems & Digital Organisation",
  P3U6: "Online Safety, Digital Security & Personal Cyber Hygiene",
  P3U7: "Digital Career Architecture",
  P4U1: "The Cybersecurity Landscape",
  P4U2: "Network Security Fundamentals",
  P4U3: "Cryptography, Data Protection & Privacy Engineering",
  P4U4: "Ethical Hacking & Penetration Testing Thinking",
  P4U5: "Organisational Security: Frameworks, Policies & Incident Response",
  P4U6: "AI in Cybersecurity: The Offensive and Defensive Frontier",
  P4U7: "Kenya's Cyber Legal Framework & the Professional Security Career",
  P5U1: "The Modern Developer's Mindset",
  P5U2: "Python & JavaScript",
  P5U3: "AI-Assisted Development",
  P5U4: "Full-Stack Web Development in the AI Era",
  P5U5: "Data, Automation & No-Code / Low-Code Platforms",
  P5U6: "Intelligent Systems: AI Agents & Autonomous Workflows",
  P5U7: "The Developer-Entrepreneur",
  P6U1: "The Creator Economy Landscape",
  P6U2: "Personal Brand & Content Strategy",
  P6U3: "Video, Short-Form & Social Media",
  P6U4: "Writing, Newsletters & Thought Leadership",
  P6U5: "Digital Products",
  P6U6: "Monetisation Systems",
  P6U7: "The Creator-Entrepreneur",
  P7U1: "Civic Leadership Foundations",
  P7U2: "Policy Design & Advocacy",
  P7U3: "Public Speaking",
  P7U4: "Community Organising",
  P7U5: "Ethics & Accountability",
  P7U6: "Kenya & the World",
  P7U7: "The Civic Entrepreneur",
};

// Units whose content is not written yet (no files, or only some sessions).
export const NOT_YET_WRITTEN = [
  "P1U5 sessions 4–5 (sessions 1–3 are ready)",
  "P1U7 (all sessions, includes the Pillar 1 capstone)",
];

// Fallback pillar ids, in canonical order, used only if the pillars table
// can't be read.
export const PILLAR_FALLBACK = [
  "personal-mastery",
  "financial-intelligence",
  "digital-literacy",
  "cybersecurity",
  "programming-systems",
  "creator-economy",
  "civic-leadership",
];
