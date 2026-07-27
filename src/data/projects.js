export const projects = [
  {
    id: 'siemens',
    slug: 'siemens',
    title: 'Siemens × M365 Copilot',
    subtitle: 'AI-Assisted Beta Testing Infrastructure',
    category: 'UX Research',
    categoryKey: 'ux',
    year: '2025',
    role: 'UX Design Intern',
    company: 'Siemens Industry Software Inc.',
    duration: '3 months',
    tags: ['User Research', 'AI Tooling', 'Copilot', 'Testing Strategy', 'Figma'],
    summary:
      "Redesigned Siemens' beta testing infrastructure by identifying a systemic notetaker quality gap across 10 product domains and building an AI-powered Notetaker Assistant that surfaced 4\xD7 more validated usability issues than manual processes alone.",
    challenge:
      'With 60\u201380 user testing sessions running across 10 domains in a single beta week, notetakers of varying experience were producing inconsistent, incomplete issue logs. The system was creating blind spots at scale \u2014 and no one had measured just how wide those blind spots were.',
    approach:
      'Quantified the problem first: surveyed 23 notetakers, surfacing a 7.5/10 "rushed score." Audited issue documentation patterns to identify where time was lost. Designed an AI Notetaker Assistant using M365 Copilot that compared session transcripts against notetaker scripts to surface missed issues, then validated the tool against human output — verified by the Scrum Master.',
    outcomes: [
      'AI assistant surfaced 4× more validated usability issues than manual note-taking alone',
      'Experience gap between junior and senior notetakers measurably mitigated across 23 contributors',
      'AI-verified issue log adopted as standard handoff format for beta testing to Scrum Masters',
      'Established a replicable research operations framework scalable across all 10 product domains',
    ],
    placeholderColor: '#DCDCDD',
    placeholderAccent: '#00BFA5',
    heroImage: '/siemens/homepage-thumbnail.png',
    hoverImage: '/siemens/siemens-task-issue.gif',
    pills: ['AI-native tool', 'User Experience Research'],
    images: [
      { label: 'Beta Testing Process', aspect: '16/9' },
      { label: 'Notetaker Assistant Flow', aspect: '16/9' },
      { label: 'Pain-to-Solution Mapping', aspect: '16/9' },
      { label: 'Testing Results Chart', aspect: '16/9' },
    ],
  },
  {
    id: 'mochi-health-brand',
    slug: 'mochi-health-brand',
    title: 'Mochi Health Brand',
    subtitle: 'Brand System for an AI-Native Telehealth Platform',
    category: 'Brand',
    categoryKey: 'ui',
    year: '2026',
    role: 'Product Designer',
    company: 'Mochi Health',
    duration: 'Ongoing',
    tags: ['Brand Identity', 'Visual Design', 'Design Systems', 'Marketing'],
    summary:
      'Brand and visual system work for Mochi Health — shaping how an AI-native telehealth product shows up across product, marketing, and partner touchpoints.',
    challenge:
      'A fast-growing telehealth brand needs a clear, consistent visual language that feels clinical enough to trust and human enough to convert — across product UI, campaigns, and partner surfaces.',
    approach:
      'Defined brand foundations and applied them across key product and marketing surfaces, aligning color, type, imagery, and component expression with Mochi’s clinical + consumer positioning.',
    outcomes: [
      'Established a coherent brand expression across core product and marketing touchpoints',
      'Strengthened visual consistency for an AI-native telehealth experience',
    ],
    placeholderColor: '#FFF0F3',
    placeholderAccent: '#E88A9A',
    heroImage: '/mochi/mochi-thumbnail.png',
    externalUrl: 'https://joinmochi.com/',
    pills: ['Brand Identity', 'Visual Design'],
    images: [
      { label: 'Brand Overview', aspect: '16/9' },
      { label: 'Visual System', aspect: '16/9' },
      { label: 'Product Touchpoints', aspect: '16/9' },
      { label: 'Campaign Applications', aspect: '16/9' },
    ],
  },
  {
    id: 'rec-o',
    slug: 'rec-o',
    title: 'REC-O',
    subtitle: 'LLM-Backed Communication Coaching System',
    category: 'UX',
    categoryKey: 'ux',
    year: '2026',
    role: 'Journey Owner · UX Researcher · UI Designer · Developer',
    company: 'Rhode Island School of Design',
    duration: 'Academic project',
    tags: ['Interaction Design', 'Accessibility', 'Hardware', 'LLM'],
    summary:
      'A communication-coaching system that pairs an LLM-backed app (Rec) with a wearable voice-recording pin (O) to help young professionals speak with clarity and confidence in high-stakes moments.',
    challenge:
      'Young professionals often lack structured feedback on how they communicate in networking and high-stakes conversations. Coaching is expensive, episodic, and rarely available in the moments that matter most.',
    approach:
      'Designed and built Rec-O as a dual-system product: Rec prepares and reflects with users before and after conversations, while O captures speech unobtrusively during events for transcription and LLM analysis. Explored form factors that read as accessories, and iterated hardware layouts for a compact recording stack.',
    outcomes: [
      'Shipped a functional LLM-backed coaching website with session analysis',
      'Designed and prototyped wearable audio-recording hardware (O)',
      'Mapped end-to-end system architecture from capture → analysis → feedback',
    ],
    placeholderColor: '#F3E5F5',
    placeholderAccent: '#7B1FA2',
    heroImage: '/rec-o/reco-thumbnail.png',
    pills: ['Interaction Design', 'Accessibility'],
    images: [
      { label: 'System Overview', aspect: '16/9' },
      { label: 'Feedback Interface', aspect: '4/3' },
      { label: 'Session Dashboard', aspect: '16/9' },
      { label: 'Hardware Prototypes', aspect: '3/2' },
    ],
  },
  {
    id: 'nasa-suit',
    slug: 'nasa-suit',
    title: 'NASA SUIT',
    subtitle: 'Spacesuit User Interface Technology',
    category: 'UX',
    categoryKey: 'ux',
    year: '2024',
    role: 'UI/UX Designer — LMCC, Map & Rover',
    company: 'NASA SUITS Challenge',
    duration: 'Sep 2023 – May 2024',
    tags: ['Product Design', 'AR Interface', 'Multi-User Systems', 'Field Testing'],
    summary:
      'AR HUD for astronauts and LMCC console for mission control — designed for the NASA SUITS challenge, HITL-tested at Johnson Space Center.',
    challenge:
      'Extravehicular activity is a dual-operator problem under extreme constraint: a gloved Design Evaluator in featureless terrain, and an LMCC operator evaluating live data. Shared maps, tasks, and rover control need progressive disclosure and unambiguous authority.',
    approach:
      'Expert interviews and faculty think-alouds on wireframes, then a synchronized AR + LMCC system. Owned LMCC, shared map, and rover Allow/Deny rules. Validated through sims, local park HITL, and NASA JSC Rock Yard evaluation on HoloLens 2.',
    outcomes: [
      'Two-time national finalist; HITL at NASA Johnson Space Center (May 18–23)',
      'Designed LMCC + shared map/rover commanding across AR and console',
      'Shipped hi-fi into Unity/MRTK3 for HoloLens 2 field evaluation',
    ],
    placeholderColor: '#E3F2FD',
    placeholderAccent: '#1565C0',
    heroImage: '/nasa/nasa-thumbnail.png',
    pills: ['Product Design', 'AR Interface'],
    images: [
      { label: 'Dual System Overview', aspect: '16/9' },
      { label: 'Shared Map & Navigation', aspect: '4/3' },
      { label: 'Rover Authority Model', aspect: '16/9' },
      { label: 'HITL Field Testing', aspect: '3/2' },
    ],
  }

];

export const getProjectBySlug = (slug) =>
  projects.find((p) => p.slug === slug) ?? null;

export const CATEGORIES = ['All', 'UX Research', 'UX', 'UI', 'Brand'];
