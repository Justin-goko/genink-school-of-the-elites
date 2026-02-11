import courseMindset from "@/assets/course-mindset.jpg";
import courseFinance from "@/assets/course-finance.jpg";
import courseIct from "@/assets/course-ict.jpg";
import courseForex from "@/assets/course-forex.jpg";
import courseContent from "@/assets/course-content.jpg";
import courseYoutube from "@/assets/course-youtube.jpg";
import courseCybersecurity from "@/assets/course-cybersecurity.jpg";
import courseCloud from "@/assets/course-cloud.jpg";
import coursePython from "@/assets/course-python.jpg";
import courseDatascience from "@/assets/course-datascience.jpg";
import courseIot from "@/assets/course-iot.jpg";
import courseAi from "@/assets/course-ai.jpg";
import courseAiLiteracy from "@/assets/course-ai-literacy.jpg";
import courseDataLiteracy from "@/assets/course-data-literacy.jpg";
import courseDigitalProductivity from "@/assets/course-digital-productivity.jpg";
import courseAutomation from "@/assets/course-automation.jpg";
import courseDigitalCommunication from "@/assets/course-digital-communication.jpg";
import courseCivicLeadership from "@/assets/course-civic-leadership.jpg";

// ─── Progression Levels ────────────────────────────────────────
export type ProgressionLevel = "foundation" | "practitioner" | "specialist" | "elite";

export const progressionLevels: Record<ProgressionLevel, { label: string; description: string; isFree: boolean }> = {
  foundation: { label: "Foundation", description: "Free introductory modules — immediate value", isFree: true },
  practitioner: { label: "Practitioner", description: "Applied skills and guided practice", isFree: false },
  specialist: { label: "Specialist", description: "Deep expertise and tool mastery", isFree: false },
  elite: { label: "Elite", description: "Capstone project and deployment", isFree: false },
};

// ─── 5-Layer Course Structure ──────────────────────────────────
export interface CourseLayer {
  id: string;
  name: string;
  description: string;
  modules: string[];
}

export const courseLayerTemplate: Omit<CourseLayer, "modules">[] = [
  { id: "identity", name: "Identity & Mindset Foundation", description: "Establish your purpose and mental framework" },
  { id: "core", name: "Core Knowledge", description: "Master essential theory and concepts" },
  { id: "applied", name: "Applied Skill", description: "Hands-on practice and real-world exercises" },
  { id: "tools", name: "Tool Mastery", description: "Proficiency with industry-standard tools" },
  { id: "deploy", name: "Deployment & Monetization", description: "Launch, earn, and create impact" },
];

// ─── Learning Path ─────────────────────────────────────────────
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  estimatedWeeks: number;
  courseIds: string[];
  capstoneProject?: string;
}

// ─── Pillar ────────────────────────────────────────────────────
export interface Pillar {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  color: string;
  learningPaths: LearningPath[];
  courseIds: string[];
}

// ─── Course ────────────────────────────────────────────────────
export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  isPremium: boolean;
  price?: string;
  image: string;
  rating: number;
  category: string;
  pillarId: string;
  subcategory?: string;
  overview: string;
  whatYouLearn: string[];
  prerequisites: string[];
  responsibleUse?: string[];
  layers: CourseLayer[];
  progressionLevel: ProgressionLevel;
  hasCapstone: boolean;
  entrepreneurialModule: boolean;
}

// ─── Entrepreneurial Intelligence Core (shared across premium) ─
export const entrepreneurialIntelligenceModule = {
  title: "Entrepreneurial Intelligence Core",
  topics: [
    "Pitching ideas and presenting with confidence",
    "Building effective pitch decks",
    "Intellectual property basics for Kenya",
    "Business structures and registration in Kenya",
    "Market positioning and competitive analysis",
    "Professional communication for business",
  ],
};

// ═══════════════════════════════════════════════════════════════
// COURSES — merged from 17 originals into 7 pillars
// ═══════════════════════════════════════════════════════════════

export const courses: Course[] = [
  // ──────────── PILLAR 1: Personal Mastery & Mind Renewal ──────
  {
    id: "mindset-renewal",
    title: "Personal Mastery & Mind Renewal",
    description: "Transform your thinking patterns and unlock spiritual abundance through proven mindset renewal and cognitive discipline techniques.",
    duration: "8 weeks",
    isPremium: true,
    price: "Ksh 7,999",
    image: courseMindset,
    rating: 4.9,
    category: "spiritual",
    pillarId: "personal-mastery",
    overview: "Embark on a transformative journey combining mindset renewal, spiritual wealth principles, and personal leadership. This pillar course covers identity formation, purpose discovery, and building an abundance-conscious life.",
    whatYouLearn: [
      "Understanding spiritual laws of prosperity",
      "Techniques for breaking limiting beliefs",
      "Building a wealth-conscious mindset",
      "Daily practices for spiritual growth and discipline",
      "Aligning your purpose with prosperity",
      "Cognitive discipline: thinking clearly in a noisy world",
    ],
    prerequisites: [
      "Open mind and willingness to grow",
      "Commitment to daily practice",
      "Journal for reflection exercises",
    ],
    responsibleUse: [
      "Self-mastery is the foundation of all other mastery",
      "Technology aids growth — but discipline drives it",
      "Guard your attention as fiercely as your finances",
      "Wisdom is knowing what to ignore",
      "Character is built in silence, not in feeds",
    ],
    layers: [
      { id: "identity", name: "Identity & Mindset Foundation", description: "Discover your purpose and core values", modules: ["Who Am I? — Identity mapping", "Breaking limiting beliefs workshop"] },
      { id: "core", name: "Core Knowledge", description: "Spiritual laws and abundance principles", modules: ["Laws of prosperity and stewardship", "The discipline of daily practice"] },
      { id: "applied", name: "Applied Skill", description: "Guided reflection exercises", modules: ["Journaling for transformation", "Decision frameworks for life choices"] },
      { id: "tools", name: "Tool Mastery", description: "Digital tools for personal growth", modules: ["Habit trackers and reflection apps", "Building accountability systems"] },
      { id: "deploy", name: "Deployment & Monetization", description: "Lead and mentor others", modules: ["Becoming a mindset coach", "Capstone: Personal Mastery Blueprint"] },
    ],
    progressionLevel: "foundation",
    hasCapstone: true,
    entrepreneurialModule: true,
  },

  // ──────────── PILLAR 2: Financial Intelligence & Income Systems ──
  {
    id: "financial-wisdom",
    title: "Financial Intelligence & Wealth Building",
    description: "Master financial literacy, budgeting, investing, and income systems for long-term wealth creation in Kenya.",
    duration: "10 weeks",
    isPremium: true,
    price: "Ksh 9,999",
    image: courseFinance,
    rating: 4.8,
    category: "financial",
    pillarId: "financial-intelligence",
    overview: "A comprehensive financial mastery program combining budgeting, investment strategy, forex fundamentals, and multiple income stream development — tailored for Kenyan professionals and entrepreneurs.",
    whatYouLearn: [
      "Personal budgeting and money management",
      "Investment fundamentals and strategies",
      "Forex trading fundamentals and risk management",
      "Asset acquisition and portfolio building",
      "Creating multiple income streams",
      "Tax optimization and estate planning in Kenya",
    ],
    prerequisites: [
      "Basic mathematics skills",
      "Willingness to track personal finances",
      "Computer or smartphone for exercises",
    ],
    responsibleUse: [
      "Wealth is a tool for impact, not just accumulation",
      "High returns always carry high risk — there are no shortcuts",
      "Financial discipline requires emotional discipline",
      "Diversify wisely; never invest what you cannot afford to lose",
      "Build wealth that serves your family and community",
    ],
    layers: [
      { id: "identity", name: "Identity & Mindset Foundation", description: "Your financial identity and money beliefs", modules: ["Money mindset assessment", "Breaking generational financial patterns"] },
      { id: "core", name: "Core Knowledge", description: "Budgeting, investing, and forex fundamentals", modules: ["Personal finance foundations", "Investment vehicles in Kenya", "Forex market fundamentals"] },
      { id: "applied", name: "Applied Skill", description: "Hands-on financial simulations", modules: ["Budget builder simulation", "Trading practice with demo accounts", "Portfolio construction exercise"] },
      { id: "tools", name: "Tool Mastery", description: "Financial tools and platforms", modules: ["M-Pesa business tools", "Trading platforms and charting", "Financial spreadsheet mastery"] },
      { id: "deploy", name: "Deployment & Monetization", description: "Launch your financial strategy", modules: ["Building your investment plan", "Capstone: Personal Wealth Blueprint"] },
    ],
    progressionLevel: "foundation",
    hasCapstone: true,
    entrepreneurialModule: true,
  },

  // ──────────── PILLAR 3: Digital Literacy & Productivity Systems ──
  {
    id: "digital-literacy",
    title: "Digital Literacy & Productivity Systems",
    description: "Build essential digital fluency, master productivity tools, and develop AI literacy while maintaining cognitive independence.",
    duration: "8 weeks",
    isPremium: true,
    price: "Ksh 8,999",
    image: courseIct,
    rating: 4.7,
    category: "ict",
    pillarId: "digital-literacy",
    subcategory: "Digital Skills for the Modern Economy",
    overview: "From digital fluency basics to AI literacy, data interpretation, and workflow automation — this pillar builds the complete digital professional. Learn to leverage modern tools while maintaining sharp, independent thinking.",
    whatYouLearn: [
      "Digital tools and productivity software mastery",
      "AI literacy and critical evaluation of AI outputs",
      "Data literacy and informed decision-making",
      "Workflow automation with no-code tools",
      "Professional digital communication",
      "Maintaining focus and cognitive discipline online",
    ],
    prerequisites: [
      "Basic computer literacy",
      "Internet access",
      "Curiosity about technology",
    ],
    responsibleUse: [
      "AI tools amplify your thinking — they don't replace it",
      "Productivity tools serve you, not the other way around",
      "Data informs decisions — it doesn't make them for you",
      "Automate the mechanical, not the meaningful",
      "Protect time for thinking without digital input",
    ],
    layers: [
      { id: "identity", name: "Identity & Mindset Foundation", description: "Your digital identity and tech mindset", modules: ["Digital confidence assessment", "Tech mindset vs tech dependency"] },
      { id: "core", name: "Core Knowledge", description: "Digital fluency, AI, and data literacy", modules: ["Digital tools fundamentals", "AI literacy and critical thinking", "Data literacy essentials"] },
      { id: "applied", name: "Applied Skill", description: "Hands-on tool practice", modules: ["Productivity system setup", "AI prompt engineering workshop", "Data analysis with spreadsheets"] },
      { id: "tools", name: "Tool Mastery", description: "Modern productivity stack", modules: ["Automation with Zapier/Make", "Professional communication tools", "Digital workspace optimization"] },
      { id: "deploy", name: "Deployment & Monetization", description: "Digital professional presence", modules: ["Building your digital brand", "Capstone: Digital Transformation Plan"] },
    ],
    progressionLevel: "foundation",
    hasCapstone: true,
    entrepreneurialModule: true,
  },

  // ──────────── PILLAR 4: Cybersecurity & Digital Protection ──
  {
    id: "cybersecurity",
    title: "Cybersecurity & Digital Protection",
    description: "Protect digital assets, understand threat landscapes, and build security-first thinking for personal and organizational safety.",
    duration: "10 weeks",
    isPremium: true,
    price: "Ksh 10,999",
    image: courseCybersecurity,
    rating: 4.7,
    category: "ict",
    pillarId: "cybersecurity",
    overview: "From personal digital safety to organizational security and cloud protection — this pillar covers the full spectrum of cybersecurity. Includes hands-on labs, threat simulations, and IoT security fundamentals.",
    whatYouLearn: [
      "Threat landscape and attack vectors",
      "Network security and encryption fundamentals",
      "Cloud security and compliance",
      "IoT device security essentials",
      "Incident response and recovery",
      "Security best practices for individuals and organizations",
    ],
    prerequisites: [
      "Basic networking knowledge",
      "Computer literacy",
      "Logical thinking ability",
    ],
    responsibleUse: [
      "Security knowledge is for protection, never exploitation",
      "Privacy is a fundamental right — defend it responsibly",
      "The best security is built on awareness, not paranoia",
      "Share security knowledge to protect your community",
      "Ethics must guide every technical capability you develop",
    ],
    layers: [
      { id: "identity", name: "Identity & Mindset Foundation", description: "Security-first thinking", modules: ["The security mindset", "Ethical foundations of cybersecurity"] },
      { id: "core", name: "Core Knowledge", description: "Threats, networks, and defense", modules: ["Network security fundamentals", "Encryption and authentication", "Cloud security and compliance"] },
      { id: "applied", name: "Applied Skill", description: "Hands-on security labs", modules: ["Phishing detection simulation", "Vulnerability assessment exercise", "IoT security lab"] },
      { id: "tools", name: "Tool Mastery", description: "Security tools and platforms", modules: ["Security scanning tools", "Firewall and VPN configuration", "Monitoring and alerting systems"] },
      { id: "deploy", name: "Deployment & Monetization", description: "Security consulting and careers", modules: ["Building a security practice", "Capstone: Security Audit Report"] },
    ],
    progressionLevel: "foundation",
    hasCapstone: true,
    entrepreneurialModule: true,
  },

  // ──────────── PILLAR 5: Programming & Intelligent Systems ──
  {
    id: "programming-systems",
    title: "Programming & Intelligent Systems",
    description: "Master Python, data science, AI/ML, and IoT — building practical intelligent systems from code to deployment.",
    duration: "14 weeks",
    isPremium: true,
    price: "Ksh 14,999",
    image: coursePython,
    rating: 4.9,
    category: "ict",
    pillarId: "programming-systems",
    overview: "A comprehensive programming pillar that takes you from Python fundamentals through data science, machine learning, and IoT — with real-world projects at every stage. Build intelligent systems that solve African problems.",
    whatYouLearn: [
      "Python programming from basics to advanced",
      "Data science and statistical analysis",
      "Machine learning model building and evaluation",
      "IoT device programming and connected systems",
      "API development and database integration",
      "Deploying intelligent applications",
    ],
    prerequisites: [
      "Basic computer skills",
      "Mathematics fundamentals (algebra)",
      "Problem-solving mindset",
    ],
    responsibleUse: [
      "Code is a tool — your judgment determines its impact",
      "AI must serve human welfare, not replace human thought",
      "Build systems that are transparent and explainable",
      "Consider who benefits and who might be harmed by your code",
      "The best programmers think about people, not just machines",
    ],
    layers: [
      { id: "identity", name: "Identity & Mindset Foundation", description: "The developer mindset", modules: ["Thinking like a programmer", "Problem decomposition and logic"] },
      { id: "core", name: "Core Knowledge", description: "Python, data, and AI fundamentals", modules: ["Python programming mastery", "Data science foundations", "AI and ML fundamentals"] },
      { id: "applied", name: "Applied Skill", description: "Build real projects", modules: ["Data analysis projects", "ML model training lab", "IoT sensor project"] },
      { id: "tools", name: "Tool Mastery", description: "Developer tools and frameworks", modules: ["Django/Flask web development", "Jupyter and data tools", "IoT platforms and sensors"] },
      { id: "deploy", name: "Deployment & Monetization", description: "Ship and monetize your code", modules: ["Deploying applications to production", "Capstone: Intelligent System Prototype"] },
    ],
    progressionLevel: "foundation",
    hasCapstone: true,
    entrepreneurialModule: true,
  },

  // ──────────── PILLAR 6: Creator Economy & Digital Monetization ──
  {
    id: "creator-economy",
    title: "Creator Economy & Digital Monetization",
    description: "Build, grow, and monetize your digital presence through content creation, YouTube, eBooks, and online business systems.",
    duration: "10 weeks",
    isPremium: true,
    price: "Ksh 11,999",
    image: courseContent,
    rating: 4.8,
    category: "income",
    pillarId: "creator-economy",
    overview: "Master the creator economy — from professional copywriting and eBook publishing to YouTube channel growth and automation. Build sustainable online income with authenticity and strategic thinking.",
    whatYouLearn: [
      "Professional copywriting and content strategy",
      "eBook creation, formatting, and publishing",
      "YouTube channel optimization and branding",
      "Video content strategy and SEO for growth",
      "Monetization beyond AdSense — sponsorships, courses, products",
      "Automation tools for content workflows",
    ],
    prerequisites: [
      "Good command of written language",
      "Creative thinking ability",
      "Computer or smartphone with internet access",
    ],
    responsibleUse: [
      "Authenticity builds lasting audience relationships",
      "Engagement should add value, not just chase metrics",
      "Quality content outperforms volume every time",
      "Your digital presence reflects your real values",
      "Build a brand you'd be proud to explain to your grandchildren",
    ],
    layers: [
      { id: "identity", name: "Identity & Mindset Foundation", description: "Your creator identity", modules: ["Finding your creator voice", "The discipline of consistent creation"] },
      { id: "core", name: "Core Knowledge", description: "Content, publishing, and video", modules: ["Copywriting and storytelling", "eBook creation and publishing", "YouTube fundamentals and strategy"] },
      { id: "applied", name: "Applied Skill", description: "Create and publish real content", modules: ["Write and publish your first eBook", "Launch and optimize a YouTube channel", "Content calendar and batch production"] },
      { id: "tools", name: "Tool Mastery", description: "Creator tools and automation", modules: ["Video editing and production tools", "SEO and analytics mastery", "Automation and scheduling systems"] },
      { id: "deploy", name: "Deployment & Monetization", description: "Monetize your content empire", modules: ["Multi-platform monetization strategy", "Capstone: Creator Business Plan"] },
    ],
    progressionLevel: "foundation",
    hasCapstone: true,
    entrepreneurialModule: true,
  },

  // ──────────── PILLAR 7: Civic Leadership & Governance ──
  {
    id: "civic-leadership",
    title: "Civic Leadership & Governance",
    description: "Develop leadership skills for community impact, public service, and responsible governance in the digital age.",
    duration: "8 weeks",
    isPremium: true,
    price: "Ksh 7,999",
    image: courseCivicLeadership,
    rating: 4.7,
    category: "civic",
    pillarId: "civic-leadership",
    overview: "Equip yourself for meaningful civic participation and community leadership. This pillar covers public policy literacy, ethical governance, community organizing, and using digital tools for civic engagement — all grounded in Kenyan context.",
    whatYouLearn: [
      "Public policy literacy and the Kenyan constitution",
      "Community organizing and stakeholder engagement",
      "Ethical leadership and governance principles",
      "Digital tools for civic engagement and transparency",
      "Public speaking and advocacy communication",
      "Project management for community development",
    ],
    prerequisites: [
      "Interest in public service and community impact",
      "Basic understanding of Kenyan governance structures",
      "Commitment to ethical leadership",
    ],
    responsibleUse: [
      "Leadership is service, not self-promotion",
      "Digital tools amplify your voice — use it wisely",
      "Governance requires transparency and accountability",
      "Civic engagement is a responsibility, not a trend",
      "Build institutions, not just influence",
    ],
    layers: [
      { id: "identity", name: "Identity & Mindset Foundation", description: "The leader within", modules: ["Your leadership identity", "Values-driven decision making"] },
      { id: "core", name: "Core Knowledge", description: "Governance, policy, and civic literacy", modules: ["The Kenyan constitution and governance", "Public policy analysis", "Ethics in public service"] },
      { id: "applied", name: "Applied Skill", description: "Civic engagement in practice", modules: ["Community needs assessment", "Stakeholder engagement simulation", "Public speaking workshop"] },
      { id: "tools", name: "Tool Mastery", description: "Digital tools for governance", modules: ["Open data and transparency platforms", "Digital advocacy and campaign tools", "Project management for development"] },
      { id: "deploy", name: "Deployment & Monetization", description: "Lead and serve", modules: ["Launching a community initiative", "Capstone: Civic Impact Project"] },
    ],
    progressionLevel: "foundation",
    hasCapstone: true,
    entrepreneurialModule: true,
  },
];

// ═══════════════════════════════════════════════════════════════
// PILLARS — 7 Core Pillars with Learning Paths
// ═══════════════════════════════════════════════════════════════

export const pillars: Pillar[] = [
  {
    id: "personal-mastery",
    name: "Personal Mastery & Mind Renewal",
    tagline: "Renew the mind, empower the generation",
    icon: "brain",
    color: "hsl(270, 60%, 55%)",
    courseIds: ["mindset-renewal"],
    learningPaths: [
      {
        id: "purpose-driven-leader",
        title: "Purpose-Driven Leader",
        description: "Discover your purpose and lead with clarity and spiritual grounding",
        targetRole: "Personal Leadership Coach",
        skillLevel: "beginner",
        estimatedWeeks: 8,
        courseIds: ["mindset-renewal"],
        capstoneProject: "Personal Mastery Blueprint — a life plan integrating purpose, values, and goals",
      },
      {
        id: "mindset-coach",
        title: "Mindset & Transformation Coach",
        description: "Help others break limiting beliefs and build abundance consciousness",
        targetRole: "Mindset Coach",
        skillLevel: "intermediate",
        estimatedWeeks: 12,
        courseIds: ["mindset-renewal"],
        capstoneProject: "Design and deliver a 4-session mindset coaching program",
      },
    ],
  },
  {
    id: "financial-intelligence",
    name: "Financial Intelligence & Income Systems",
    tagline: "Build wealth that serves purpose",
    icon: "trending-up",
    color: "hsl(45, 100%, 55%)",
    courseIds: ["financial-wisdom"],
    learningPaths: [
      {
        id: "wealth-builder",
        title: "Wealth Builder",
        description: "Master personal finance, budgeting, and long-term investment strategy",
        targetRole: "Financial Advisor",
        skillLevel: "beginner",
        estimatedWeeks: 10,
        courseIds: ["financial-wisdom"],
        capstoneProject: "Personal Wealth Blueprint with 5-year investment plan",
      },
      {
        id: "forex-trader",
        title: "Forex & Markets Trader",
        description: "Learn forex trading, risk management, and technical analysis",
        targetRole: "Forex Trader",
        skillLevel: "intermediate",
        estimatedWeeks: 14,
        courseIds: ["financial-wisdom"],
        capstoneProject: "30-day trading journal with performance analysis and risk review",
      },
      {
        id: "financial-strategist",
        title: "Financial Strategist",
        description: "Advanced wealth management, tax optimization, and estate planning",
        targetRole: "Financial Strategist",
        skillLevel: "advanced",
        estimatedWeeks: 16,
        courseIds: ["financial-wisdom"],
        capstoneProject: "Comprehensive financial strategy for a Kenyan SME",
      },
    ],
  },
  {
    id: "digital-literacy",
    name: "Digital Literacy & Productivity Systems",
    tagline: "Master tools without losing your mind",
    icon: "monitor",
    color: "hsl(180, 75%, 45%)",
    courseIds: ["digital-literacy"],
    learningPaths: [
      {
        id: "digital-professional",
        title: "Digital Professional",
        description: "Build essential digital skills for modern workplace excellence",
        targetRole: "Digital Professional",
        skillLevel: "beginner",
        estimatedWeeks: 8,
        courseIds: ["digital-literacy"],
        capstoneProject: "Digital Transformation Plan for a local business",
      },
      {
        id: "productivity-specialist",
        title: "Productivity & Automation Specialist",
        description: "Master automation tools and build efficient digital workflows",
        targetRole: "Automation Specialist",
        skillLevel: "intermediate",
        estimatedWeeks: 12,
        courseIds: ["digital-literacy"],
        capstoneProject: "End-to-end automated workflow for a real business process",
      },
      {
        id: "ai-strategist",
        title: "AI Literacy & Strategy",
        description: "Leverage AI tools effectively while maintaining critical thinking",
        targetRole: "AI Strategy Consultant",
        skillLevel: "intermediate",
        estimatedWeeks: 10,
        courseIds: ["digital-literacy"],
        capstoneProject: "AI Integration Strategy for an organization",
      },
    ],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity & Digital Protection",
    tagline: "Defend the digital frontier",
    icon: "shield",
    color: "hsl(0, 70%, 50%)",
    courseIds: ["cybersecurity"],
    learningPaths: [
      {
        id: "cybersecurity-analyst",
        title: "Cybersecurity Analyst",
        description: "Monitor, detect, and respond to security threats in organizations",
        targetRole: "Cybersecurity Analyst",
        skillLevel: "beginner",
        estimatedWeeks: 10,
        courseIds: ["cybersecurity"],
        capstoneProject: "Complete security audit report for a simulated organization",
      },
      {
        id: "ethical-hacker",
        title: "Ethical Hacker",
        description: "Learn penetration testing and vulnerability assessment ethically",
        targetRole: "Ethical Hacker / Pen Tester",
        skillLevel: "advanced",
        estimatedWeeks: 14,
        courseIds: ["cybersecurity"],
        capstoneProject: "Penetration test report with remediation recommendations",
      },
      {
        id: "digital-safety-advocate",
        title: "Digital Safety Advocate",
        description: "Protect communities from online threats and promote digital wellness",
        targetRole: "Digital Safety Educator",
        skillLevel: "beginner",
        estimatedWeeks: 8,
        courseIds: ["cybersecurity"],
        capstoneProject: "Community digital safety workshop curriculum",
      },
    ],
  },
  {
    id: "programming-systems",
    name: "Programming & Intelligent Systems",
    tagline: "Build solutions that think",
    icon: "code",
    color: "hsl(210, 80%, 50%)",
    courseIds: ["programming-systems"],
    learningPaths: [
      {
        id: "software-developer",
        title: "Software Developer",
        description: "Master Python and web development for professional software engineering",
        targetRole: "Software Developer",
        skillLevel: "beginner",
        estimatedWeeks: 14,
        courseIds: ["programming-systems"],
        capstoneProject: "Full-stack web application solving a real Kenyan problem",
      },
      {
        id: "data-scientist",
        title: "Data Scientist",
        description: "Analyze data, build models, and extract actionable insights",
        targetRole: "Data Scientist",
        skillLevel: "intermediate",
        estimatedWeeks: 16,
        courseIds: ["programming-systems"],
        capstoneProject: "End-to-end data science project with Kenya-relevant dataset",
      },
      {
        id: "ai-engineer",
        title: "AI & IoT Engineer",
        description: "Build intelligent and connected systems using AI and IoT",
        targetRole: "AI / IoT Engineer",
        skillLevel: "advanced",
        estimatedWeeks: 18,
        courseIds: ["programming-systems"],
        capstoneProject: "Intelligent IoT system prototype with ML integration",
      },
    ],
  },
  {
    id: "creator-economy",
    name: "Creator Economy & Digital Monetization",
    tagline: "Create value, build legacy",
    icon: "video",
    color: "hsl(330, 70%, 50%)",
    courseIds: ["creator-economy"],
    learningPaths: [
      {
        id: "content-creator",
        title: "Content Creator & Writer",
        description: "Master copywriting, eBook publishing, and written content monetization",
        targetRole: "Content Creator / Author",
        skillLevel: "beginner",
        estimatedWeeks: 10,
        courseIds: ["creator-economy"],
        capstoneProject: "Published eBook with marketing launch plan",
      },
      {
        id: "youtube-entrepreneur",
        title: "YouTube Entrepreneur",
        description: "Build, grow, and monetize a YouTube channel with automation",
        targetRole: "YouTube Creator / Entrepreneur",
        skillLevel: "intermediate",
        estimatedWeeks: 12,
        courseIds: ["creator-economy"],
        capstoneProject: "YouTube channel with 10 optimized videos and monetization strategy",
      },
      {
        id: "digital-business-builder",
        title: "Digital Business Builder",
        description: "Build a complete online business combining content, products, and services",
        targetRole: "Digital Entrepreneur",
        skillLevel: "advanced",
        estimatedWeeks: 14,
        courseIds: ["creator-economy"],
        capstoneProject: "Complete digital business plan with revenue model and launch strategy",
      },
    ],
  },
  {
    id: "civic-leadership",
    name: "Civic Leadership & Governance",
    tagline: "Lead with purpose, govern with integrity",
    icon: "landmark",
    color: "hsl(150, 60%, 40%)",
    courseIds: ["civic-leadership"],
    learningPaths: [
      {
        id: "community-leader",
        title: "Community Leader",
        description: "Organize, mobilize, and lead community development initiatives",
        targetRole: "Community Development Leader",
        skillLevel: "beginner",
        estimatedWeeks: 8,
        courseIds: ["civic-leadership"],
        capstoneProject: "Community initiative proposal with stakeholder map and action plan",
      },
      {
        id: "policy-analyst",
        title: "Policy Analyst & Advocate",
        description: "Analyze public policy and advocate for evidence-based governance",
        targetRole: "Policy Analyst",
        skillLevel: "intermediate",
        estimatedWeeks: 12,
        courseIds: ["civic-leadership"],
        capstoneProject: "Policy brief on a current Kenyan governance issue",
      },
    ],
  },
];

// Helper: get pillar for a course
export const getPillarForCourse = (courseId: string): Pillar | undefined => {
  return pillars.find(p => p.courseIds.includes(courseId));
};

// Helper: get learning paths for a course
export const getPathsForCourse = (courseId: string): LearningPath[] => {
  const pillar = getPillarForCourse(courseId);
  return pillar?.learningPaths ?? [];
};
