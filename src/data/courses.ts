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

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  isPremium: boolean;
  price?: string;
  image: string;
  rating: number;
  category: "spiritual" | "financial" | "ict" | "income" | "digital-skills";
  subcategory?: string;
  overview: string;
  whatYouLearn: string[];
  prerequisites: string[];
  responsibleUse?: string[];
}

export const courses: Course[] = [
  {
    id: "mindset-renewal",
    title: "Mindset Renewal & Spiritual Wealth Mastery",
    description: "Transform your thinking patterns and unlock spiritual abundance through proven mindset renewal techniques.",
    duration: "6 weeks",
    isPremium: false,
    image: courseMindset,
    rating: 4.9,
    category: "spiritual",
    overview: "Embark on a transformative journey to renew your mind and unlock spiritual wealth. This foundational course teaches you how to break limiting beliefs and cultivate abundance consciousness.",
    whatYouLearn: [
      "Understanding spiritual laws of prosperity",
      "Techniques for breaking limiting beliefs",
      "Building a wealth-conscious mindset",
      "Daily practices for spiritual growth",
      "Aligning your purpose with prosperity"
    ],
    prerequisites: [
      "Open mind and willingness to grow",
      "Commitment to daily practice",
      "Journal for reflection exercises"
    ]
  },
  {
    id: "financial-wisdom",
    title: "Foundations of Financial Wisdom and Wealth Building",
    description: "Master essential financial literacy principles and practical wealth-building strategies for long-term prosperity.",
    duration: "8 weeks",
    isPremium: true,
    price: "Ksh 7,999",
    image: courseFinance,
    rating: 4.8,
    category: "financial",
    overview: "Gain comprehensive financial literacy through this intensive program covering budgeting, investing, asset building, and generational wealth strategies.",
    whatYouLearn: [
      "Personal budgeting and money management",
      "Investment fundamentals and strategies",
      "Asset acquisition and portfolio building",
      "Tax optimization techniques",
      "Creating multiple income streams",
      "Estate planning for generational wealth"
    ],
    prerequisites: [
      "Basic mathematics skills",
      "Willingness to track personal finances",
      "Computer or smartphone for exercises"
    ]
  },
  {
    id: "digital-fluency",
    title: "Digital Fluency & Tech Mindset Development",
    description: "Develop essential digital literacy and cultivate a technology-forward mindset for the modern economy.",
    duration: "6 weeks",
    isPremium: false,
    image: courseIct,
    rating: 4.7,
    category: "ict",
    overview: "Build your digital confidence and master essential tech skills needed to thrive in today's connected world.",
    whatYouLearn: [
      "Digital tools and productivity software",
      "Online collaboration platforms",
      "Digital security best practices",
      "Cloud computing basics",
      "Tech problem-solving mindset"
    ],
    prerequisites: [
      "Basic computer literacy",
      "Internet access",
      "Curiosity about technology"
    ]
  },
  {
    id: "forex-trading",
    title: "Forex Trading Fundamentals and Strategy",
    description: "Learn professional forex trading techniques, risk management, and proven strategies for consistent profits.",
    duration: "10 weeks",
    isPremium: true,
    price: "Ksh 12,999",
    image: courseForex,
    rating: 4.9,
    category: "financial",
    overview: "Master the art of forex trading with comprehensive training covering market analysis, trading psychology, and proven strategies.",
    whatYouLearn: [
      "Forex market fundamentals",
      "Technical and fundamental analysis",
      "Risk management strategies",
      "Trading psychology mastery",
      "Chart patterns and indicators",
      "Developing a personal trading plan"
    ],
    prerequisites: [
      "Basic financial knowledge",
      "Discipline and patience",
      "Capital for practice trading (demo account available)"
    ]
  },
  {
    id: "content-creation",
    title: "Content Creation, Online Writing & eBook Entrepreneurship",
    description: "Master the art of content creation, copywriting, and build a profitable eBook business from scratch.",
    duration: "10 weeks",
    isPremium: true,
    price: "Ksh 9,999",
    image: courseContent,
    rating: 4.8,
    category: "income",
    overview: "Transform your writing skills into a profitable online business. Learn to create compelling content and monetize through eBooks.",
    whatYouLearn: [
      "Professional copywriting techniques",
      "eBook creation and formatting",
      "Publishing on major platforms",
      "Marketing and promotion strategies",
      "Building an author brand",
      "Passive income generation"
    ],
    prerequisites: [
      "Good command of written language",
      "Creative thinking ability",
      "Computer with internet access"
    ]
  },
  {
    id: "youtube-monetization",
    title: "YouTube Monetization & Automation Masterclass",
    description: "Build and automate a profitable YouTube channel with proven strategies for content creation and monetization.",
    duration: "8 weeks",
    isPremium: true,
    price: "Ksh 11,999",
    image: courseYoutube,
    rating: 4.9,
    category: "income",
    overview: "Learn everything from channel setup to advanced monetization strategies, including automation techniques to scale your YouTube business.",
    whatYouLearn: [
      "Channel optimization and branding",
      "Video content strategy and planning",
      "SEO for YouTube growth",
      "Monetization methods beyond AdSense",
      "Automation tools and workflows",
      "Analytics and performance optimization"
    ],
    prerequisites: [
      "Smartphone or camera for recording",
      "Basic video editing knowledge (training provided)",
      "Consistency and commitment"
    ]
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Essentials",
    description: "Protect digital assets and understand security fundamentals in an increasingly connected world.",
    duration: "6 weeks",
    isPremium: false,
    image: courseCybersecurity,
    rating: 4.7,
    category: "ict",
    overview: "Learn essential cybersecurity practices to protect yourself and organizations from digital threats.",
    whatYouLearn: [
      "Threat landscape and attack vectors",
      "Network security fundamentals",
      "Encryption and authentication",
      "Security best practices",
      "Incident response basics"
    ],
    prerequisites: [
      "Basic networking knowledge",
      "Computer literacy",
      "Logical thinking ability"
    ]
  },
  {
    id: "cloud-computing",
    title: "Introduction to Cloud Computing",
    description: "Understand cloud infrastructure, services, and deployment models used by modern businesses.",
    duration: "6 weeks",
    isPremium: false,
    image: courseCloud,
    rating: 4.6,
    category: "ict",
    overview: "Discover the fundamentals of cloud computing and how businesses leverage cloud services for scalability and efficiency.",
    whatYouLearn: [
      "Cloud service models (IaaS, PaaS, SaaS)",
      "Major cloud providers overview",
      "Cloud security and compliance",
      "Cost optimization strategies",
      "Migration planning basics"
    ],
    prerequisites: [
      "Basic IT knowledge",
      "Understanding of networking concepts",
      "Internet access"
    ]
  },
  {
    id: "python-programming",
    title: "Advanced Python Programming",
    description: "Master advanced Python concepts, frameworks, and real-world application development techniques.",
    duration: "8 weeks",
    isPremium: true,
    price: "Ksh 9,999",
    image: coursePython,
    rating: 4.8,
    category: "ict",
    overview: "Take your Python skills to the next level with advanced programming concepts, frameworks, and practical projects.",
    whatYouLearn: [
      "Advanced Python syntax and features",
      "Object-oriented programming mastery",
      "Working with APIs and databases",
      "Popular frameworks (Django, Flask)",
      "Testing and debugging techniques",
      "Building real-world applications"
    ],
    prerequisites: [
      "Basic Python knowledge",
      "Understanding of programming concepts",
      "Computer with Python installed"
    ]
  },
  {
    id: "data-science",
    title: "Data Science & Analytics Foundations",
    description: "Learn data analysis, visualization, and statistical methods to extract insights from complex datasets.",
    duration: "10 weeks",
    isPremium: true,
    price: "Ksh 12,999",
    image: courseDatascience,
    rating: 4.9,
    category: "ict",
    overview: "Master the foundations of data science including statistical analysis, machine learning basics, and data visualization.",
    whatYouLearn: [
      "Statistical analysis fundamentals",
      "Data cleaning and preprocessing",
      "Exploratory data analysis",
      "Data visualization with Python",
      "Machine learning introduction",
      "Real-world data projects"
    ],
    prerequisites: [
      "Basic Python programming",
      "Mathematics and statistics basics",
      "Analytical mindset"
    ]
  },
  {
    id: "iot-basics",
    title: "IoT (Internet of Things) for Beginners",
    description: "Explore the world of connected devices and learn to build simple IoT projects and applications.",
    duration: "6 weeks",
    isPremium: false,
    image: courseIot,
    rating: 4.7,
    category: "ict",
    overview: "Understand how IoT devices work and build your first connected projects using popular platforms and sensors.",
    whatYouLearn: [
      "IoT fundamentals and architecture",
      "Sensor and actuator basics",
      "Arduino and Raspberry Pi projects",
      "IoT communication protocols",
      "Building simple smart devices"
    ],
    prerequisites: [
      "Basic electronics knowledge helpful",
      "Programming basics (any language)",
      "Curiosity about hardware"
    ]
  },
  {
    id: "ai-ml-basics",
    title: "AI & Machine Learning Basics",
    description: "Understand artificial intelligence fundamentals and build your first machine learning models.",
    duration: "10 weeks",
    isPremium: true,
    price: "Ksh 14,999",
    image: courseAi,
    rating: 4.9,
    category: "ict",
    overview: "Dive into the exciting world of AI and machine learning with hands-on projects and real-world applications.",
    whatYouLearn: [
      "AI and ML fundamentals",
      "Supervised and unsupervised learning",
      "Neural networks basics",
      "Popular ML frameworks",
      "Model training and evaluation",
      "AI ethics and responsible use"
    ],
    prerequisites: [
      "Python programming proficiency",
      "Mathematics (algebra, calculus basics)",
      "Data science foundations recommended"
    ]
  },
  {
    id: "ai-literacy",
    title: "AI Literacy & Critical Thinking",
    description: "Learn to use AI tools effectively while maintaining independent judgment and avoiding cognitive dependency.",
    duration: "6 weeks",
    isPremium: false,
    image: courseAiLiteracy,
    rating: 4.8,
    category: "digital-skills",
    subcategory: "Digital Skills for the Modern Economy",
    overview: "Master the practical use of AI assistants, language models, and intelligent tools while developing the critical thinking skills to evaluate their outputs. This course teaches you to leverage AI as a powerful enhancer of your capabilities—not a replacement for your judgment.",
    whatYouLearn: [
      "Understanding how AI tools work and their limitations",
      "Crafting effective prompts for better AI outputs",
      "Evaluating AI-generated content for accuracy and bias",
      "Integrating AI into professional workflows responsibly",
      "Maintaining analytical skills while using AI assistance"
    ],
    prerequisites: [
      "Basic computer literacy",
      "Willingness to think critically",
      "Access to internet for tool exploration"
    ],
    responsibleUse: [
      "AI tools amplify your thinking—they don't replace it",
      "Always verify AI outputs against trusted sources",
      "Develop your own expertise before relying on AI shortcuts",
      "Use AI to learn faster, not to avoid learning entirely",
      "Maintain your ability to work without AI when needed"
    ]
  },
  {
    id: "data-literacy",
    title: "Data Literacy & Informed Decision Making",
    description: "Develop the skills to read, interpret, and question data without falling for misleading statistics or blind trust in numbers.",
    duration: "8 weeks",
    isPremium: true,
    price: "Ksh 8,999",
    image: courseDataLiteracy,
    rating: 4.9,
    category: "digital-skills",
    subcategory: "Digital Skills for the Modern Economy",
    overview: "In a world awash with data, the ability to interpret information critically is essential. This course teaches you to extract meaningful insights from data, recognize manipulation, and make decisions grounded in evidence—not hype.",
    whatYouLearn: [
      "Reading charts, graphs, and statistical claims accurately",
      "Identifying common data manipulation techniques",
      "Using spreadsheets for basic data analysis",
      "Understanding correlation vs causation",
      "Making data-informed (not data-driven) decisions",
      "Presenting data honestly and effectively"
    ],
    prerequisites: [
      "Basic mathematics understanding",
      "Computer with spreadsheet software",
      "Curiosity about how information shapes decisions"
    ],
    responsibleUse: [
      "Data informs decisions—it doesn't make them for you",
      "Always ask: Who collected this data and why?",
      "Numbers without context can mislead as easily as words",
      "Your judgment must interpret what data cannot capture",
      "Resist pressure to let metrics replace human insight"
    ]
  },
  {
    id: "digital-productivity",
    title: "Digital Productivity & Focused Work",
    description: "Master digital tools for productivity while building habits that protect your attention and cognitive capacity.",
    duration: "5 weeks",
    isPremium: false,
    image: courseDigitalProductivity,
    rating: 4.7,
    category: "digital-skills",
    subcategory: "Digital Skills for the Modern Economy",
    overview: "Technology promises productivity but often delivers distraction. This course teaches you to organize your digital workspace, leverage productivity tools effectively, and establish boundaries that protect your ability to do deep, focused work.",
    whatYouLearn: [
      "Setting up distraction-free digital environments",
      "Using task management and note-taking tools effectively",
      "Time-blocking and calendar optimization techniques",
      "Managing notifications and digital boundaries",
      "Building sustainable productivity habits"
    ],
    prerequisites: [
      "Smartphone or computer access",
      "Willingness to change digital habits",
      "Commitment to intentional tool use"
    ],
    responsibleUse: [
      "Productivity tools serve you—not the other way around",
      "More apps don't mean more productivity",
      "Protect time for thinking without digital input",
      "Regular digital detox maintains cognitive sharpness",
      "The goal is meaningful output, not busy activity"
    ]
  },
  {
    id: "workflow-automation",
    title: "Workflow Automation & Smart Systems",
    description: "Learn to automate repetitive tasks while understanding when human oversight and manual control are essential.",
    duration: "8 weeks",
    isPremium: true,
    price: "Ksh 10,999",
    image: courseAutomation,
    rating: 4.8,
    category: "digital-skills",
    subcategory: "Digital Skills for the Modern Economy",
    overview: "Automation can free you from tedious work—but poorly designed automation creates new problems. This course teaches you to identify automation opportunities, build reliable workflows, and maintain appropriate human oversight of automated systems.",
    whatYouLearn: [
      "Identifying tasks suitable for automation",
      "Using no-code automation tools (Zapier, Make, etc.)",
      "Building automated email and document workflows",
      "Testing and monitoring automated systems",
      "Knowing when NOT to automate",
      "Maintaining human checkpoints in critical processes"
    ],
    prerequisites: [
      "Familiarity with common business software",
      "Understanding of basic workflow concepts",
      "Patience for systematic problem-solving"
    ],
    responsibleUse: [
      "Automate the mechanical, not the meaningful",
      "Every automation needs human oversight points",
      "Understand what your automations actually do",
      "Don't automate away your understanding of processes",
      "Maintain ability to perform critical tasks manually"
    ]
  },
  {
    id: "digital-communication",
    title: "Digital Communication & Professional Presence",
    description: "Build an authentic professional presence online while avoiding the pitfalls of performative digital behavior.",
    duration: "6 weeks",
    isPremium: false,
    image: courseDigitalCommunication,
    rating: 4.6,
    category: "digital-skills",
    subcategory: "Digital Skills for the Modern Economy",
    overview: "Your digital presence is increasingly important for career success—but authenticity matters more than algorithms. This course teaches effective online communication, professional networking, and personal branding without sacrificing integrity.",
    whatYouLearn: [
      "Writing clear, professional emails and messages",
      "Building genuine professional networks online",
      "Creating authentic personal brand presence",
      "Effective video and voice communication",
      "Managing online reputation thoughtfully"
    ],
    prerequisites: [
      "Basic social media familiarity",
      "Willingness to engage professionally online",
      "Understanding of professional norms"
    ],
    responsibleUse: [
      "Authenticity builds lasting professional relationships",
      "Engagement should add value, not just visibility",
      "Your digital presence reflects your real values",
      "Quality connections outweigh follower counts",
      "Protect your attention from endless feed scrolling"
    ]
  }
];
