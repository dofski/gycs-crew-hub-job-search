/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OperationalLessonGroup {
  title: string;
  points: string[];
}

export interface LaunchpadWeekSyllabus {
  week: number;
  phase: string;
  phaseCode: 'know' | 'prepare' | 'execute';
  phaseSubtitle: string;
  title: string;
  shortTitle: string;
  moduleFocus: string;
  growAnchor: string;
  coreObjective: string;
  platformTool: string;
  durationMins: number;
  lessonType: 'video' | 'text' | 'quiz' | 'practical' | 'live';
  operationalLessons: OperationalLessonGroup[];
  techDeliverable: string;
  weeklyMilestone: string;
  primaryOutput: string;
  deckUrl?: string;
  assignmentTitle: string;
  assignmentInstructions: string;
}

export interface LaunchpadPhaseOverview {
  code: 'know' | 'prepare' | 'execute';
  phase: string;
  weeks: string;
  subtitle: string;
  bullets: string[];
}

export interface LaunchpadTechTool {
  number: number;
  name: string;
  domain?: string;
  url: string;
  description: string;
}

export interface PortRunwayBenchmark {
  id: string;
  port: string;
  region: string;
  peakSeason: string;
  crewHouseNightlyEur: number;
  monthlyFoodTransportEur: number;
  recommendedRunwayWeeks: number;
  notes: string;
}

export const LAUNCHPAD_COURSE_METADATA = {
  title: '8-Week Superyacht Career Launchpad: Coaching Course Syllabus',
  shortTitle: '8-Week Superyacht Career Launchpad',
  instructor: 'Chad de Wet (Yachtmaster Offshore 200GT, Enterprise AI/API Architect)',
  deliveryFramework: 'The GROW Coaching Model (Goal, Reality, Obstacles, Way Forward)',
  growPillars: [
    { letter: 'G', label: 'Goal', description: 'Target department, vessel tonnage, certified training route, and timeline precision.' },
    { letter: 'R', label: 'Reality', description: 'Baseline audit of ENG1 medical fitness, passport/visa constraints, cabin readiness, and financial runway.' },
    { letter: 'O', label: 'Obstacles', description: 'Eliminating predatory training bundles, static PDF inbox traps, and dockside logistical blockers.' },
    { letter: 'W', label: 'Way Forward', description: 'SOP-translated 2-page CV, live candidate funnel, M/Y Eye AIS outreach, mock interviews, and 30-day execution sprints.' },
  ],
};

export const LAUNCHPAD_PHASES: LaunchpadPhaseOverview[] = [
  {
    code: 'know',
    phase: 'PHASE 1: KNOW',
    weeks: 'Weeks 1–2',
    subtitle: 'Establishing operational baselines, regulatory compliance, and precision department targeting.',
    bullets: ['Career Reality Check', 'Route & Training Navigator'],
  },
  {
    code: 'prepare',
    phase: 'PHASE 2: PREPARE',
    weeks: 'Weeks 3–5',
    subtitle: 'Transforming your background into maritime-compliant assets, interactive digital funnels, and deployment logistics.',
    bullets: ['Experience & CV Studio', 'Digital Conversion Hub', 'Deployment Logistics'],
  },
  {
    code: 'execute',
    phase: 'PHASE 3: EXECUTE',
    weeks: 'Weeks 6–8',
    subtitle: 'Deploying direct intelligence systems, securing interviews, and turning daywork into permanent employment.',
    bullets: ['Job Search & M/Y Eye', 'Interview Confidence Lab', '30-Day Action Blueprint'],
  },
];

export const LAUNCHPAD_INFRASTRUCTURE: LaunchpadTechTool[] = [
  {
    number: 1,
    name: 'GYCS Crew Hub',
    domain: 'hub.chaddewet.com',
    url: 'https://hub.chaddewet.com',
    description: 'Your central dashboard for course modules, asset management, readiness scorecards, and coach feedback.',
  },
  {
    number: 2,
    name: 'CV Studio',
    domain: 'hub.chaddewet.com/?workspace=1',
    url: '/?workspace=1',
    description: 'A specialized builder engineered to produce lightweight (<250KB), compliant 2-page PDFs that align with the review habits of yacht captains and chief stews.',
  },
  {
    number: 3,
    name: 'Candidate Landing Page & Scheduling Funnel',
    domain: 'chaddewet.com/candidate/your-name',
    url: 'https://chaddewet.com',
    description: 'A branded, mobile-first web presence showcasing your 60-second intro video, credential vault, and live calendar booking.',
  },
  {
    number: 4,
    name: 'M/Y Eye Platform',
    domain: 'searchengine.chaddewet.com',
    url: 'https://searchengine.chaddewet.com',
    description: 'Maritime intelligence combining AIS vessel tracking, port arrival schedules, and dockwalking logs.',
  },
  {
    number: 5,
    name: 'CRM Opportunity Pipeline',
    domain: 'hub.chaddewet.com/?workspace=1',
    url: '/?workspace=1',
    description: 'A personal tracking system to log every vessel, management agency, HOD conversation, and follow-up throughout your job search.',
  },
];

export const PORT_RUNWAY_BENCHMARKS: PortRunwayBenchmark[] = [
  {
    id: 'antibes',
    port: 'Antibes (Port Vauban)',
    region: 'French Riviera · Mediterranean',
    peakSeason: 'March – June (Med Spring) & Sept – Oct (Refit)',
    crewHouseNightlyEur: 38,
    monthlyFoodTransportEur: 650,
    recommendedRunwayWeeks: 6,
    notes: 'Walking distance from Old Town Antibes to Port Vauban / Quai des Milliardaires. Track Schengen 90/180-day clock.',
  },
  {
    id: 'palma',
    port: 'Palma de Mallorca (STP & Paseo Marítimo)',
    region: 'Balearic Islands · Spain',
    peakSeason: 'Feb – June (Refit & Med Season) & Oct – Nov',
    crewHouseNightlyEur: 40,
    monthlyFoodTransportEur: 620,
    recommendedRunwayWeeks: 6,
    notes: 'Major motor and sailing yacht refit hub (STP Shipyard). PPE required for yard gate passes.',
  },
  {
    id: 'fort-lauderdale',
    port: 'Fort Lauderdale (17th St / Bahia Mar)',
    region: 'Florida · USA & Caribbean Hub',
    peakSeason: 'Oct – Dec (FLIBS & Caribbean) & April – May',
    crewHouseNightlyEur: 52,
    monthlyFoodTransportEur: 850,
    recommendedRunwayWeeks: 6,
    notes: 'Requires valid B1/B2 visa for foreign-flagged vessels or US citizenship/Green Card for US-flagged yachts.',
  },
  {
    id: 'st-maarten',
    port: 'St. Maarten (Simpson Bay / IGY Isle de Sol)',
    region: 'Caribbean Winter Hub',
    peakSeason: 'November – March (Caribbean Charter Season)',
    crewHouseNightlyEur: 45,
    monthlyFoodTransportEur: 720,
    recommendedRunwayWeeks: 5,
    notes: 'High-turnover charter dockwalking hub in Simpson Bay Lagoon during peak winter charter months.',
  },
];

export const LAUNCHPAD_WEEKS: LaunchpadWeekSyllabus[] = [
  {
    week: 1,
    phase: 'Phase 1: KNOW (Weeks 1–2)',
    phaseCode: 'know',
    phaseSubtitle: 'Establishing operational baselines, regulatory compliance, and precision department targeting.',
    title: 'Week 1 — Career Reality Check',
    shortTitle: 'Career Reality Check',
    moduleFocus: 'Baseline Reality Check',
    growAnchor: 'Reality & Goal Calibration',
    coreObjective:
      'Strip away generic industry myths and audit your individual baseline constraints (passports, medical status, financial runway, and lifestyle suitability) before investing time or capital.',
    platformTool: 'Crew Hub Constraints Engine',
    durationMins: 45,
    lessonType: 'video',
    operationalLessons: [
      {
        title: '1. The Maritime Regulatory Floor',
        points: [
          'ENG1 Seafarer Medical Audit: Requirements, identifying disqualifiers (color blindness, respiratory conditions), and booking authorized MCA doctors.',
          'Flag State & Visa Constraints: Managing the Schengen 90/180-day countdown for non-EU crew; understanding B1/B2 vs. US Coast Guard flag restrictions for North American deployment.',
        ],
      },
      {
        title: '2. Cabin Life & Psychological Readiness',
        points: [
          'Shared cabin dynamics, chain of command, zero-tolerance policies (contraband, conduct), and working 14–16 hour charter days.',
        ],
      },
      {
        title: '3. Financial Runway Modeling',
        points: [
          'Calculating living costs in crew houses across Antibes, Palma, and Fort Lauderdale against your required runway before landing paid daywork or a permanent contract.',
        ],
      },
    ],
    techDeliverable: 'Complete the GYCS Baseline Constraints & Financial Runway Calculator inside the Crew Hub.',
    weeklyMilestone: 'Verified eligibility checklist (ENG1, passport/visa eligibility map) and clear timeline clearance.',
    primaryOutput: 'Eligibility & Runway Audit Passed',
    deckUrl: 'https://canva.link/3bhhn1hph1oiyry',
    assignmentTitle: 'Week 1 Deliverable: Baseline Constraints & Financial Runway Audit',
    assignmentInstructions:
      'Complete your GYCS Baseline Constraints & Financial Runway Calculator (ENG1 medical eligibility, Schengen 90/180 or B1/B2 visa status, and monthly crew house runway for Antibes, Palma, or Fort Lauderdale) and submit your verified eligibility summary.',
  },
  {
    week: 2,
    phase: 'Phase 1: KNOW (Weeks 1–2)',
    phaseCode: 'know',
    phaseSubtitle: 'Establishing operational baselines, regulatory compliance, and precision department targeting.',
    title: 'Week 2 — Route & Training Navigator',
    shortTitle: 'Route & Training Navigator',
    moduleFocus: 'Route & Training Navigator',
    growAnchor: 'Goal Precision & Obstacle Elimination',
    coreObjective:
      'Select your target vessel department, identify mandatory qualifications, and eliminate predatory or overpriced training packages.',
    platformTool: 'Department Route Selector',
    durationMins: 50,
    lessonType: 'video',
    operationalLessons: [
      {
        title: '1. Department & Tonnage Specialization',
        points: [
          'Deck Department: Translating trades (carpentry, detailing, watersports, mechanics) into entry-level deckhand assets; officer progression routes (PB2 to OOW 3000GT).',
          'Interior Department: Translating fine dining, boutique hospitality, private households, and mixology into junior steward/ess roles; understanding Chief Stewardess operational expectations.',
          'Engineering & Galley: Positioning commercial mechanics, ETOs, and culinary professionals for rotational salaries; highlighting tonnage, generator capacities, and provisioning metrics.',
        ],
      },
      {
        title: '2. The "Essential vs. Upsell" Training Audit',
        points: [
          'Mandatory tickets: STCW 2010 (Basic Safety Training) and PDSD (Proficiency in Designated Security Duties).',
          'Functional additions: RYA Powerboat Level 2, Food Safety Level 2, or Tender Operator modules.',
          'Auditing local schools to avoid predatory multi-thousand-dollar "guaranteed placement" course bundles.',
        ],
      },
      {
        title: '3. Global Port Selection',
        points: [
          'Deciding where to base yourself (Antibes vs. Palma vs. Fort Lauderdale vs. St. Maarten) based on departure dates, vessel refit cycles, and seasonal fleet migrations.',
        ],
      },
    ],
    techDeliverable: 'Personalized Target Department Blueprint & Training Cost-Audit Sheet.',
    weeklyMilestone: 'Training schedule locked with certified schools; zero capital spent on non-essential certificates.',
    primaryOutput: 'Target Role & Certified Training Plan',
    deckUrl: 'https://canva.link/6rmh1zxrtgcopgc',
    assignmentTitle: 'Week 2 Deliverable: Target Department Blueprint & Training Cost-Audit',
    assignmentInstructions:
      'Submit your target vessel department (Deck, Interior, Engineering, or Galley), mandatory STCW 2010 & PDSD school verification, functional additions (PB2/SRC/Food Safety L2/AEC), and target launch port selection.',
  },
  {
    week: 3,
    phase: 'Phase 2: PREPARE (Weeks 3–5)',
    phaseCode: 'prepare',
    phaseSubtitle:
      'Transforming your background into maritime-compliant assets, interactive digital funnels, and deployment logistics.',
    title: 'Week 3 — Experience-to-CV Builder',
    shortTitle: 'Experience-to-CV Builder',
    moduleFocus: 'Experience-to-CV Builder',
    growAnchor: 'Way Forward: Reframing Non-Yachting Pedigree',
    coreObjective:
      'Translate land-based work history into superyacht Standard Operating Procedure (SOP) language and build a compliant, two-page maritime CV.',
    platformTool: 'CV Studio',
    durationMins: 60,
    lessonType: 'practical',
    operationalLessons: [
      {
        title: '1. Superyacht Translation Formula',
        points: [
          'Converting land-based service, trades, or sports into safety consciousness, discreet service, high-end finishing, and high-pressure stamina.',
          'Removing land-based formatting mistakes (objective statements, dense prose, non-relevant timelines).',
        ],
      },
      {
        title: '2. CV Studio Production Standards',
        points: [
          '2-page hard limit, satellite-optimized PDF size (under 250KB).',
          'Exact maritime hierarchy: Personal details, visa/medical status, maritime certificates, marine-relevant work experience, and verified references.',
        ],
      },
      {
        title: '3. AI-Assisted Evidence Mapping',
        points: [
          'Using prompt frameworks inside the GYCS Crew Hub to extract actionable accomplishments from previous job roles while preserving authenticity.',
        ],
      },
    ],
    techDeliverable: 'Maritime-compliant 2-Page Master CV built, reviewed, and finalized in CV Studio.',
    weeklyMilestone: 'Head of Department-ready CV approved by your GYCS coach.',
    primaryOutput: 'Two-Page Compliant Maritime CV (<250KB)',
    deckUrl: 'https://canva.link/zimcuo866se1ohk',
    assignmentTitle: 'Week 3 Deliverable: 2-Page Maritime Master CV (<250KB) in CV Studio',
    assignmentInstructions:
      'Finalize your 2-page maritime-compliant Master CV in CV Studio translating land-based experience into superyacht SOP language, and submit your CV Studio summary or review notes for HOD readiness sign-off.',
  },
  {
    week: 4,
    phase: 'Phase 2: PREPARE (Weeks 3–5)',
    phaseCode: 'prepare',
    phaseSubtitle:
      'Transforming your background into maritime-compliant assets, interactive digital funnels, and deployment logistics.',
    title: 'Week 4 — Professional Profile Polish & Conversion Funnel',
    shortTitle: 'Profile Polish & Conversion Funnel',
    moduleFocus: 'Digital Profile & Funnel Polish',
    growAnchor: 'Way Forward: Bypassing the Static PDF Inbox Trap',
    coreObjective:
      'Move beyond the static resume by deploying a dedicated candidate landing page with embedded scheduling and high-impact media.',
    platformTool: 'Candidate Landing Page Builder',
    durationMins: 55,
    lessonType: 'video',
    operationalLessons: [
      {
        title: '1. Candidate Funnel Engineering',
        points: [
          'Why static PDFs get lost in Captains’ and Chief Stews’ WhatsApp chats and inboxes.',
          'Structuring a mobile-first Candidate Landing Page with interactive links, verified credentials, and digital references.',
        ],
      },
      {
        title: '2. Multimedia Presentation & Digital Hygiene',
        points: [
          'Crafting a 60-second video introduction: lighting, attire, framing, tone, and crew-mess cultural fit.',
          'Professional photo grading: clean maritime polo, natural lighting, neat grooming, no sunglasses or distracting backgrounds.',
          'Social media security audit: scrubbing personal accounts, configuring privacy settings, and professionalizing public presences.',
        ],
      },
      {
        title: '3. Calendar Booking Automation',
        points: [
          'Embedding a friction-free booking engine (Zoom, Google Meet, dockside daywork slots) that eliminates email scheduling back-and-forth.',
        ],
      },
    ],
    techDeliverable: 'Live Candidate Landing Page & Calendar Scheduling Funnel on chaddewet.com/candidate/your-name.',
    weeklyMilestone: 'Published, interactive landing page tested across mobile and desktop devices.',
    primaryOutput: 'Live Candidate Funnel with Video & Booking',
    deckUrl: 'https://canva.link/lhzd8ucz53izrc3',
    assignmentTitle: 'Week 4 Deliverable: Candidate Landing Page & Scheduling Funnel',
    assignmentInstructions:
      'Share the link or readiness checklist for your mobile-first Candidate Landing Page, 60-second intro video script/link, social media security audit, and embedded calendar booking funnel.',
  },
  {
    week: 5,
    phase: 'Phase 2: PREPARE (Weeks 3–5)',
    phaseCode: 'prepare',
    phaseSubtitle:
      'Transforming your background into maritime-compliant assets, interactive digital funnels, and deployment logistics.',
    title: 'Week 5 — Launch Readiness Planner',
    shortTitle: 'Launch Readiness Planner',
    moduleFocus: 'Launch Readiness Planner',
    growAnchor: 'Obstacle Neutralization & Travel Strategy',
    coreObjective: 'Organize housing, documentation, and packing logistics before boarding a flight to your launch hub.',
    platformTool: 'Document Vault & Hub Logistics',
    durationMins: 50,
    lessonType: 'practical',
    operationalLessons: [
      {
        title: '1. Crew House Operations & Marina Proximity',
        points: [
          'Booking verified crew houses within walking distance of key ports (e.g., Antibes Old Town / Port Vauban, Palma Old Town / Paseo Marítimo, Harbordale / 17th St Causeway).',
          'Crew house etiquette, networking dynamics, and safeguarding mental focus from party culture.',
        ],
      },
      {
        title: '2. Physical & Digital Document Vault',
        points: [
          'Preparing watertight physical folders: original passport, ENG1, STCW, discharge books, reference letters, printed CV copies.',
          'Offline-ready, encrypted cloud storage backups accessible from any smartphone.',
        ],
      },
      {
        title: '3. Seafarer Kit & Packing Essentials',
        points: [
          'Dress codes: proper dockwalking attire, neutral-colored shorts/skorts, UV polos, non-marking boat shoes.',
          'Compact, soft-sided duffel luggage policies for small shared crew cabins.',
        ],
      },
    ],
    techDeliverable:
      'Complete Hub Deployment Vault containing verified certificate scans, travel bookings, and crew house reservations.',
    weeklyMilestone: '100% deployment-ready sign-off: tickets booked, crew house confirmed, packing list audited.',
    primaryOutput: 'Deployment Vault, Crew House & Travel Set',
    deckUrl: 'https://canva.link/wt86tyumbxaypb7',
    assignmentTitle: 'Week 5 Deliverable: Hub Deployment Vault & Crew House Logistics',
    assignmentInstructions:
      'Confirm your uploaded Document Vault records (Passport, ENG1, STCW, PDSD, References), verified crew house reservation near port, and soft-sided seafarer kit audit.',
  },
  {
    week: 6,
    phase: 'Phase 3: EXECUTE (Weeks 6–8)',
    phaseCode: 'execute',
    phaseSubtitle:
      'Deploying direct intelligence systems, securing interviews, and turning daywork into permanent employment.',
    title: 'Week 6 — Job Search Strategist & Direct Vessel Outreach',
    shortTitle: 'Job Search Strategist & Outreach',
    moduleFocus: 'Job Search Strategist',
    growAnchor: 'Way Forward: Bypassing Agency Gatekeepers',
    coreObjective:
      'Launch a dual-track job search combining targeted agency submissions with direct-to-vessel AIS intelligence and CRM tracking.',
    platformTool: 'M/Y Eye + CRM Pipeline',
    durationMins: 60,
    lessonType: 'practical',
    operationalLessons: [
      {
        title: '1. The Modern Crew Agency Protocol',
        points: [
          'High-priority registration with MLC-compliant placement agencies (The Crew Network, YPI Crew, Bluewater, Cotton Crews, Luxury Yacht Group, Northrop & Johnson).',
          'Checking in professionally with recruiters without spamming their communication channels.',
        ],
      },
      {
        title: '2. Maritime Intelligence via M/Y Eye',
        points: [
          'Tracking AIS vessel arrivals, shipyard refit turnarounds, and repositioning cycles into key marinas.',
          'Distinguishing between charter vessels (high turnover, sudden requirements) and private programs.',
        ],
      },
      {
        title: '3. Dockwalking & CRM Opportunity Management',
        points: [
          'The 07:30–09:00 dockwalking protocol: passing security checkpoints, approaching passerelles, identifying hiring decision-makers.',
          'Logging contacts, HOD names, and follow-up reminders inside the GYCS CRM Opportunity Pipeline.',
        ],
      },
    ],
    techDeliverable: 'Active access to M/Y Eye Maritime Intelligence and a pre-populated CRM Opportunity Pipeline.',
    weeklyMilestone:
      '10+ agency registrations submitted; 20+ target vessels cataloged in your CRM with follow-up triggers set.',
    primaryOutput: 'Live Agency Matrix & AIS Port Target Log',
    assignmentTitle: 'Week 6 Deliverable: Live Agency Matrix & M/Y Eye AIS Port Target Log',
    assignmentInstructions:
      'Submit your list of 10+ MLC-compliant agency registrations and 20+ target vessels logged in your CRM Opportunity Pipeline using M/Y Eye AIS port intelligence.',
  },
  {
    week: 7,
    phase: 'Phase 3: EXECUTE (Weeks 6–8)',
    phaseCode: 'execute',
    phaseSubtitle:
      'Deploying direct intelligence systems, securing interviews, and turning daywork into permanent employment.',
    title: 'Week 7 — Interview Confidence Lab',
    shortTitle: 'Interview Confidence Lab',
    moduleFocus: 'Interview Confidence Lab',
    growAnchor: 'Way Forward: Interview Conversion & Value Demonstration',
    coreObjective:
      'Prepare for high-pressure screening calls and in-person passerelle interviews through roleplay and live feedback.',
    platformTool: 'Interview Simulator',
    durationMins: 60,
    lessonType: 'live',
    operationalLessons: [
      {
        title: '1. Captains & Chief Stews Screening Scenarios',
        points: [
          'Preparing for standard superyacht interview questions: handling isolation, taking direction from younger officers, and managing shared cabin lifestyle.',
          'Handling common sensitive topics: tattoos, relationship status, dietary needs, and previous land-based salaries.',
        ],
      },
      {
        title: '2. Passerelle & Daywork Conversions',
        points: [
          'How to approach a boat looking for daywork and convert a one-day chamois-down or laundry shift into a permanent trial.',
          'Asking smart operational questions about vessel itineraries, program longevity, and team culture without focusing solely on leave packages.',
        ],
      },
      {
        title: '3. Live Mock Interview Sessions',
        points: [
          '1-on-1 coach simulation with real-time feedback on delivery, body language, and response frameworks.',
        ],
      },
    ],
    techDeliverable: 'Access to the GYCS Interview Simulator Library & personalized recorded mock interview debrief.',
    weeklyMilestone: 'Passing score in the live GYCS Passerelle & Video Interview Evaluation.',
    primaryOutput: 'Mock Captain/Chief Stew Interview Passed',
    assignmentTitle: 'Week 7 Deliverable: Passerelle & Captain/Chief Stew Mock Interview Debrief',
    assignmentInstructions:
      'Submit your response frameworks for Captain/Chief Stew screening questions, daywork-to-permanent trial conversion pitch, and mock interview self-assessment.',
  },
  {
    week: 8,
    phase: 'Phase 3: EXECUTE (Weeks 6–8)',
    phaseCode: 'execute',
    phaseSubtitle:
      'Deploying direct intelligence systems, securing interviews, and turning daywork into permanent employment.',
    title: 'Week 8 — Career Action Blueprint & Daywork Deployment',
    shortTitle: 'Career Action Blueprint & Deployment',
    moduleFocus: 'Career Action Blueprint',
    growAnchor: 'Execution & Sustained Performance',
    coreObjective:
      'Lock in a rolling 30-day daywork plan, manage initial offers, and build an onboard playbook for your first 90 days.',
    platformTool: '30-Day Sprint Scheduler',
    durationMins: 60,
    lessonType: 'practical',
    operationalLessons: [
      {
        title: '1. Contract Review & Sea Employment Agreements (SEA)',
        points: [
          'Deciphering standard MLC-compliant contracts: basic pay, paid leave allocations (e.g., 38 to 60+ days/year), healthcare coverage, flights, and probationary clauses.',
          'Red flags: unflagged vessels, missing medical coverage, and vague salary/leave terms.',
        ],
      },
      {
        title: '2. The "First 90 Days Onboard" Playbook',
        points: [
          'Integrating smoothly into the crew mess: hierarchy, off-duty behavior, and watchstanding etiquette.',
          'Maintaining daily task lists, logbooks, and sea-time documentation for your next career step.',
        ],
      },
      {
        title: '3. Rolling 30-Day Execution Sprints',
        points: [
          'Sustaining dockwalking schedules, agency check-ins, and direct reach-outs during quiet weeks.',
          'Managing the Schengen clock or US visa validity if initial placement takes 3–4 weeks.',
        ],
      },
    ],
    techDeliverable: 'Final Rolling 30-Day Launchpad Calendar & First 90 Days Sea-Survival Guide.',
    weeklyMilestone:
      'Complete operational deployment readiness sign-off across systems, CV assets, funnels, and dockside execution strategy.',
    primaryOutput: 'Signed SEA Contract / Active Daywork Deployment',
    assignmentTitle: 'Week 8 Deliverable: Rolling 30-Day Launchpad Calendar & First 90 Days Playbook',
    assignmentInstructions:
      'Submit your Rolling 30-Day Dockwalking & Outreach Sprint Schedule, MLC Seafarer Employment Agreement (SEA) review checklist, and First 90 Days Onboard survival plan.',
  },
];

export function getLaunchpadWeekByNumber(weekNumber: number): LaunchpadWeekSyllabus {
  return LAUNCHPAD_WEEKS.find((w) => w.week === weekNumber) || LAUNCHPAD_WEEKS[0];
}

export interface WorksheetChecklistItem {
  id: string;
  category: string;
  label: string;
  detail: string;
}

export interface WorksheetFieldPrompt {
  id: string;
  label: string;
  placeholder: string;
  helperText: string;
}

export interface LaunchpadWeekWorksheet {
  week: number;
  phase: string;
  phaseCode: 'know' | 'prepare' | 'execute';
  worksheetTitle: string;
  worksheetSubtitle: string;
  growPrompt: string;
  platformTool: string;
  primaryDeliverable: string;
  checklistItems: WorksheetChecklistItem[];
  fields: WorksheetFieldPrompt[];
}

export const LAUNCHPAD_WORKSHEETS: LaunchpadWeekWorksheet[] = [
  {
    week: 1,
    phase: 'Phase 1: KNOW (Weeks 1–2)',
    phaseCode: 'know',
    worksheetTitle: 'Week 1 Worksheet: Career Reality Check & Financial Runway Audit',
    worksheetSubtitle:
      'Audit your regulatory floor (ENG1 medical, passport, Schengen/B1B2 visas), cabin lifestyle readiness, and crew house financial runway before spending capital.',
    growPrompt:
      'REALITY & GOAL CALIBRATION: What is your current passport, medical, and savings baseline, and what date can you realistically step onto a dock?',
    platformTool: 'Crew Hub Constraints Engine',
    primaryDeliverable: 'Eligibility & Runway Audit Passed',
    checklistItems: [
      {
        id: 'w1_c1',
        category: 'Passport & Flag Floor',
        label: 'Passport validity audited (>18 months remaining & 6+ blank pages)',
        detail: 'Confirm biometric passport expiry date and blank pages for Schengen / US stamps and seafarer transit.',
      },
      {
        id: 'w1_c2',
        category: 'Medical Compliance',
        label: 'ENG1 Seafarer Medical disqualifiers audited & authorized doctor identified',
        detail: 'Check UK MCA MSN 1815 color vision (Ishihara/CAD), respiratory, and medication standards; locate an MCA-approved or SAMSA-accredited doctor.',
      },
      {
        id: 'w1_c3',
        category: 'Visa Strategy',
        label: 'Schengen 90/180-day clock & US B1/B2 / C1/D visa constraints mapped',
        detail: 'Determine whether your passport requires pre-arrival Schengen or US visas and note foreign-flag vs. US Coast Guard flag rules.',
      },
      {
        id: 'w1_c4',
        category: 'Cabin & Conduct Readiness',
        label: 'Shared cabin dynamics & zero-tolerance policies acknowledged',
        detail: 'Commit to shared bunk living, strict contraband/alcohol zero-tolerance rules, and formal maritime chain of command.',
      },
      {
        id: 'w1_c5',
        category: 'Charter Stamina',
        label: '14–16 hour charter workday physical & psychological readiness confirmed',
        detail: 'Assess physical stamina and emotional resilience for high-tempo guest trips and rapid turnarounds.',
      },
      {
        id: 'w1_c6',
        category: 'Financial Runway',
        label: '6-week minimum crew house + living runway modeled in the Crew Hub Calculator',
        detail: 'Compare your available launch savings against monthly burn in Antibes (€1,790/mo), Palma (€1,820/mo), or Fort Lauderdale (€2,410/mo).',
      },
    ],
    fields: [
      {
        id: 'w1_f1',
        label: '1. Passport, Nationality & Visa Baseline (Schengen 90/180 & US B1/B2)',
        placeholder: 'e.g., South African passport valid until Oct 2032 (14 blank pages). Require Schengen visa for Antibes; planning B1/B2 appointment...',
        helperText: 'List your nationality, passport expiry date, current visas held, and any visa applications required before departure.',
      },
      {
        id: 'w1_f2',
        label: '2. ENG1 Seafarer Medical Audit & Doctor Booking Plan',
        placeholder: 'e.g., No color blindness or respiratory conditions. Booking MCA-approved ENG1 examination with Dr. Rosendorff in Cape Town...',
        helperText: 'Confirm you have reviewed medical disqualifiers and note your MCA/SAMSA doctor clinic, city, and booking date.',
      },
      {
        id: 'w1_f3',
        label: '3. Crew House Financial Runway Calculation (Target Port, Monthly Burn & Weeks of Runway)',
        placeholder: 'e.g., Target Port: Antibes (€38/night crew house + €650 food/local = €1,790/mo). Available Launch Capital: €3,800 = ~9 weeks runway...',
        helperText: 'Record your output from the GYCS Baseline Constraints & Financial Runway Calculator.',
      },
      {
        id: 'w1_f4',
        label: '4. Cabin Life, Chain of Command & Personal GROW Reality Reflection',
        placeholder: 'e.g., Comfortable sharing a twin cabin; prior hospitality/sport experience with 14-hour shifts. Biggest constraint to solve in Phase 1 is...',
        helperText: 'Identify how you will handle shared cabin life, chain of command, and any personal timeline blockers.',
      },
    ],
  },
  {
    week: 2,
    phase: 'Phase 1: KNOW (Weeks 1–2)',
    phaseCode: 'know',
    worksheetTitle: 'Week 2 Worksheet: Route, Department & Training Cost-Audit Blueprint',
    worksheetSubtitle:
      'Lock in your target vessel department, separate mandatory STCW/PDSD tickets from predatory upsells, and select your launch port based on seasonal fleet migrations.',
    growPrompt:
      'GOAL PRECISION & OBSTACLE ELIMINATION: Which department maximizes your transferable pedigree, and which non-essential courses are you cutting to protect your runway?',
    platformTool: 'Department Route Selector',
    primaryDeliverable: 'Target Role & Certified Training Plan',
    checklistItems: [
      {
        id: 'w2_c1',
        category: 'Department Lock',
        label: 'Target vessel department & entry role locked (Deck, Interior, Engineering, or Galley)',
        detail: 'Match your land-based trades, hospitality, engineering, or culinary pedigree to a single primary yacht department.',
      },
      {
        id: 'w2_c2',
        category: 'Mandatory Safety',
        label: 'Accredited STCW 2010 Basic Safety Training (PST, PSSR, FPFF, EFA) school verified',
        detail: 'Verify the school holds official MCA, SAMSA, USCG, or Marshall Islands flag approval—never book unverified online-only STCW.',
      },
      {
        id: 'w2_c3',
        category: 'Security Mandate',
        label: 'Proficiency in Designated Security Duties (PDSD - STCW Reg VI/6) included',
        detail: 'Required on commercial and ISPS-compliant superyachts over 500GT.',
      },
      {
        id: 'w2_c4',
        category: 'Functional Addition',
        label: 'Role-specific functional certificate selected (PB2+SRC / Food Safety L2 / AEC 1)',
        detail: 'Deck: RYA Powerboat Level 2 + VHF SRC | Interior & Galley: Food Safety Level 2 (MLC Reg 3.2) | Engineering: MCA AEC 1 & 2.',
      },
      {
        id: 'w2_c5',
        category: 'Anti-Upsell Audit',
        label: 'Zero capital committed to predatory "guaranteed placement" bundles or premature advanced tickets',
        detail: 'Defer Yachtmaster Offshore / OOW modules until qualifying sea time is logged onboard.',
      },
      {
        id: 'w2_c6',
        category: 'Port & Season Lock',
        label: 'Launch port hub & arrival date aligned with seasonal fleet migration / refit windows',
        detail: 'Med Spring (Antibes/Palma: March–June), Med Autumn Refit (Sept–Nov), USA/Caribbean (Fort Lauderdale/St. Maarten: Oct–Feb).',
      },
    ],
    fields: [
      {
        id: 'w2_f1',
        label: '1. Target Department, Entry Role & Long-Term Progression Route',
        placeholder: 'e.g., Deck Department → Entry Role: Junior Deckhand / Tender Operator → 3-Year Goal: Bosun / Officer of the Watch (OOW 3000GT)...',
        helperText: 'Specify your department (Deck, Interior, Engineering, Galley), target vessel size (e.g. 45m–80m M/Y), and progression route.',
      },
      {
        id: 'w2_f2',
        label: '2. Mandatory & Functional Training Schedule (Accredited School, Dates & Total Cost)',
        placeholder: 'e.g., 1) STCW 2010 + PDSD at SSTG Cape Town (€520) | 2) RYA Powerboat Level 2 + VHF SRC at Royal Cape Yacht Club (€390)...',
        helperText: 'List only the mandatory and high-ROI functional certificates you are booking, the accredited school name, and exact cost.',
      },
      {
        id: 'w2_f3',
        label: '3. "Essential vs. Upsell" Savings Audit (Courses Eliminated or Deferred)',
        placeholder: 'e.g., Declined €3,200 "Superyacht Academy Bundle" and deferred Yachtmaster theory until after first season. Capital saved: €2,100...',
        helperText: 'Document non-essential upsell courses you rejected or deferred to preserve your crew house runway.',
      },
      {
        id: 'w2_f4',
        label: '4. Global Port Hub Selection & Target Arrival Window',
        placeholder: 'e.g., Primary Port: Antibes (Port Vauban) arriving April 10 for pre-Med charter commissioning; backup refit hub: Palma de Mallorca...',
        helperText: 'Explain why your chosen port matches your visa status and the fleet migration calendar.',
      },
    ],
  },
  {
    week: 3,
    phase: 'Phase 2: PREPARE (Weeks 3–5)',
    phaseCode: 'prepare',
    worksheetTitle: 'Week 3 Worksheet: Superyacht SOP Translation & 2-Page Master CV Builder',
    worksheetSubtitle:
      'Reframe land-based experience into Superyacht Standard Operating Procedure (SOP) evidence and produce a compliant, <250KB 2-page Master CV in CV Studio.',
    growPrompt:
      'WAY FORWARD — REFRAMING PEDIGREE: How does your previous work history prove safety consciousness, high-end finishing, discreet service, and long-shift reliability?',
    platformTool: 'CV Studio',
    primaryDeliverable: 'Two-Page Compliant Maritime CV (<250KB)',
    checklistItems: [
      {
        id: 'w3_c1',
        category: 'SOP Translation',
        label: 'Land-based job descriptions rewritten using Superyacht SOP action verbs & operational metrics',
        detail: 'Replace generic corporate jargon with washdown/detailing, preventative maintenance, silver/housekeeping service, or provisioning metrics.',
      },
      {
        id: 'w3_c2',
        category: 'Formatting Hygiene',
        label: 'Removed corporate formatting traps (fluff objectives, dense paragraphs, irrelevant jobs)',
        detail: 'Captains and Chief Stews scan CVs in 15 seconds—use crisp bullet points and clear operational headers.',
      },
      {
        id: 'w3_c3',
        category: 'Maritime Hierarchy',
        label: 'Strict maritime CV hierarchy enforced in CV Studio',
        detail: 'Order: 1) Personal & Visa/Medical Status → 2) Maritime Certificates → 3) Relevant Experience → 4) Skills → 5) Verified References.',
      },
      {
        id: 'w3_c4',
        category: 'Satellite Optimization',
        label: 'Hard 2-page limit & PDF file size verified under 250KB',
        detail: 'Ensure fast download over vessel Starlink/VSAT connections and instant rendering inside WhatsApp.',
      },
      {
        id: 'w3_c5',
        category: 'Provenance Integrity',
        label: 'Zero fabricated sea time or inflated qualifications (all claims honest & verifiable)',
        detail: 'Every certificate and experience bullet in CV Studio is truthfully labeled.',
      },
      {
        id: 'w3_c6',
        category: 'Reference Verification',
        label: 'Minimum 2 professional references listed with role, company/vessel, phone & email',
        detail: 'Alert your referees in advance so they respond promptly when a Captain, Chief Stew, or crew agent calls.',
      },
    ],
    fields: [
      {
        id: 'w3_f1',
        label: '1. Maritime Profile Summary (3-Line HOD Hook)',
        placeholder: 'e.g., Physically disciplined, non-smoking Junior Deckhand with 3 years of coastal rescue craft operation, marine detailing, and carpentry...',
        helperText: 'Write your 2–3 sentence profile summary stating your target role, core certificates (ENG1, STCW, PB2/Food Safety), and operational value.',
      },
      {
        id: 'w3_f2',
        label: '2. Experience Role #1 — Land-to-Yacht SOP Translation Bullets',
        placeholder: 'e.g., Before: "Worked as surf lifeguard." → After: "Operated 6m rescue tender in heavy surf; executed daily pre-launch engine/hull checks and emergency first aid..."',
        helperText: 'Transform your most relevant past role into 3–4 superyacht-ready operational bullet points.',
      },
      {
        id: 'w3_f3',
        label: '3. Experience Role #2 — Land-to-Yacht SOP Translation Bullets',
        placeholder: 'e.g., Before: "Waiter at boutique hotel." → After: "Delivered discreet 5-star table service for 60+ covers/night; maintained silver, glassware, and stock rotation..."',
        helperText: 'Transform your second past role into 3–4 superyacht-ready operational bullet points.',
      },
      {
        id: 'w3_f4',
        label: '4. Verified References & CV Studio Export Check (<250KB, 2 Pages)',
        placeholder: 'e.g., Referee 1: Capt. M. Pieterse (+27...) | Referee 2: D. Henderson (+27...). CV Studio v2 saved and verified at 184KB (2 pages).',
        helperText: 'List your 2 verified referees and confirm your CV Studio version number and PDF size.',
      },
    ],
  },
  {
    week: 4,
    phase: 'Phase 2: PREPARE (Weeks 3–5)',
    phaseCode: 'prepare',
    worksheetTitle: 'Week 4 Worksheet: Candidate Conversion Funnel, 60s Video & Digital Hygiene',
    worksheetSubtitle:
      'Bypass the static PDF inbox trap by engineering your mobile-first Candidate Landing Page, 60-second video introduction, maritime headshot, and calendar booking funnel.',
    growPrompt:
      'WAY FORWARD — BYPASSING THE INBOX TRAP: When a Captain or Chief Stew opens your link on WhatsApp, does your 60-second video and page immediately prove crew-mess cultural fit?',
    platformTool: 'Candidate Landing Page Builder',
    primaryDeliverable: 'Live Candidate Funnel with Video & Booking',
    checklistItems: [
      {
        id: 'w4_c1',
        category: 'Funnel Architecture',
        label: 'Mobile-first Candidate Landing Page configured (`chaddewet.com/candidate/your-name`)',
        detail: 'Includes instant 1-tap CV download, verified certificate badges, intro video, and live interview booking.',
      },
      {
        id: 'w4_c2',
        category: '60s Video Intro',
        label: '60-second introduction video scripted, filmed in natural light, and uploaded',
        detail: 'Structure: 0–10s Hook & Role → 10–30s Transferable Pedigree → 30–45s Crew Mess Fit & Attitude → 45–60s Availability & Call to Action.',
      },
      {
        id: 'w4_c3',
        category: 'Photo Grading',
        label: 'Maritime headshot graded (clean white/navy polo, natural daylight, neat grooming, no sunglasses)',
        detail: 'Avoid party photos, selfies, hats, or cluttered backgrounds.',
      },
      {
        id: 'w4_c4',
        category: 'Digital Hygiene',
        label: 'Social media security audit completed (Instagram, TikTok, Facebook, LinkedIn scrubbed)',
        detail: 'Lock down private accounts or curate a clean, professional maritime public presence.',
      },
      {
        id: 'w4_c5',
        category: 'Booking Engine',
        label: 'Friction-free calendar booking engine embedded (Zoom, Google Meet & Dockside Daywork slots)',
        detail: 'Eliminate email back-and-forth so HODs can book a 15-minute screening call or daywork trial in 2 taps.',
      },
      {
        id: 'w4_c6',
        category: 'Cross-Device QA',
        label: 'Landing page tested on iOS, Android, WhatsApp link preview, and desktop',
        detail: 'Verify fast load time, working video playback, and calendar timezone accuracy.',
      },
    ],
    fields: [
      {
        id: 'w4_f1',
        label: '1. Candidate Landing Page URL & Headline Positioning',
        placeholder: 'e.g., URL: chaddewet.com/candidate/sarah-vdm | Headline: "Junior Deckhand & PB2 Tender Operator — Available Immediately in Antibes"',
        helperText: 'Specify your custom candidate funnel URL, headline, and current port availability banner.',
      },
      {
        id: 'w4_f2',
        label: '2. 60-Second Video Introduction Script (Word-for-Word)',
        placeholder: 'e.g., "Hi Captain and Chief Officer, I’m [Name], a non-smoking South African Deckhand holding a valid ENG1, STCW, PDSD, and RYA PB2..."',
        helperText: 'Write out your exact 130–150 word script (~60 seconds) covering role, certificates, work ethic, and immediate availability.',
      },
      {
        id: 'w4_f3',
        label: '3. Calendar Booking Automation Setup (Screening Call & Daywork Slots)',
        placeholder: 'e.g., Connected Google Meet / Zoom 15-min HOD Screening Call + Dockside Daywork Availability calendar (07:30–18:00 CET)...',
        helperText: 'Record your booking link and configured availability windows.',
      },
      {
        id: 'w4_f4',
        label: '4. Photo Grading & Social Media Security Audit Log',
        placeholder: 'e.g., Shot new headshot in navy UV polo against marina background. Archived old public posts on Instagram/Facebook; updated bio...',
        helperText: 'Confirm completion of your headshot check and public social media cleanup.',
      },
    ],
  },
  {
    week: 5,
    phase: 'Phase 2: PREPARE (Weeks 3–5)',
    phaseCode: 'prepare',
    worksheetTitle: 'Week 5 Worksheet: Launch Readiness Planner, Crew House & Seafarer Kit',
    worksheetSubtitle:
      'Lock in marina-proximate crew house accommodation, assemble your watertight physical & encrypted cloud Document Vault, and audit your soft-sided seafarer kit.',
    growPrompt:
      'OBSTACLE NEUTRALIZATION & TRAVEL STRATEGY: Are your documents, accommodation, and cabin-compliant kit 100% ready so you can step onboard a yacht with 2 hours’ notice?',
    platformTool: 'Document Vault & Hub Logistics',
    primaryDeliverable: 'Deployment Vault, Crew House & Travel Set',
    checklistItems: [
      {
        id: 'w5_c1',
        category: 'Marina Accommodation',
        label: 'Verified crew house booked within walking distance of target port',
        detail: 'Antibes Old Town (Port Vauban), Palma Santa Catalina/Paseo Marítimo (STP), or Fort Lauderdale 17th St Causeway.',
      },
      {
        id: 'w5_c2',
        category: 'Physical Document Folder',
        label: 'Watertight physical document folder assembled with originals + 15 printed CVs',
        detail: 'Contains original Passport, ENG1, STCW, PDSD, PB2/Food Safety/AEC, Discharge Book, Reference Letters, and 15 crisp 2-page CVs.',
      },
      {
        id: 'w5_c3',
        category: 'Cloud Document Vault',
        label: 'All certificates & ID scans uploaded to the GYCS Crew Hub Document Vault',
        detail: 'High-resolution PDF scans named cleanly (e.g., `Lastname_Firstname_ENG1_2028.pdf`) and accessible offline on your phone.',
      },
      {
        id: 'w5_c4',
        category: 'Soft-Sided Luggage Rule',
        label: 'Packed exclusively in a collapsible soft-sided duffel bag (ZERO hard-shell suitcases)',
        detail: 'Yacht crew cabins have zero storage for rigid suitcases—arriving at the passerelle with a hard suitcase is an immediate rookie red flag.',
      },
      {
        id: 'w5_c5',
        category: 'Dockwalking Uniform',
        label: 'Dockwalking attire & personal seafarer kit packed',
        detail: '3x neutral UV polos (white/navy/black), 2x tailored navy/beige shorts or skorts, non-marking deck shoes, polarized sunglasses (off during intros).',
      },
      {
        id: 'w5_c6',
        category: 'Crew House Focus',
        label: 'Crew house etiquette & anti-distraction daily routine established',
        detail: 'Lights out by 22:00, zero mid-week crew bar distractions, morning dockprep ready the night before.',
      },
    ],
    fields: [
      {
        id: 'w5_f1',
        label: '1. Crew House Booking & Port Arrival Logistics',
        placeholder: 'e.g., Booked The Glamorgan Crew House, Old Town Antibes (10m walk to Port Vauban). Check-in: April 10, 14 nights initial booking...',
        helperText: 'Record your confirmed crew house name, address, nightly rate, check-in date, and airport-to-port transit plan.',
      },
      {
        id: 'w5_f2',
        label: '2. Physical & Digital Document Vault Inventory',
        placeholder: 'e.g., Uploaded to Crew Hub Vault & packed in waterproof A4 folder: 1) ZA Passport, 2) ENG1, 3) STCW BST, 4) PDSD, 5) RYA PB2, 6) 2x Written References...',
        helperText: 'List every document uploaded in your Crew Hub Document Vault and packed in your physical folder.',
      },
      {
        id: 'w5_f3',
        label: '3. Seafarer Kit & Soft-Sided Duffel Packing Audit',
        placeholder: 'e.g., 90L waterproof collapsible duffel + dry-bag daypack. Packed 3x navy polos, 2x tailored shorts, non-marking Sperry deck shoes, microfiber towel...',
        helperText: 'Confirm your soft-sided luggage model, dockwalking outfit, and onboard work essentials.',
      },
      {
        id: 'w5_f4',
        label: '4. Local SIM / eSIM, Banking & Emergency Contingency Setup',
        placeholder: 'e.g., European eSIM active (50GB data), Wise multi-currency EUR/USD IBAN account ready for SEPA daywork pay, emergency return flight reserve locked...',
        helperText: 'Ensure you have local mobile data for M/Y Eye on the docks and a EUR/USD account to receive daywork/salary transfers.',
      },
    ],
  },
  {
    week: 6,
    phase: 'Phase 3: EXECUTE (Weeks 6–8)',
    phaseCode: 'execute',
    worksheetTitle: 'Week 6 Worksheet: MLC Agency Matrix, M/Y Eye AIS Intelligence & CRM Pipeline',
    worksheetSubtitle:
      'Execute a dual-track outreach campaign combining 10+ MLC-compliant crew agency registrations with M/Y Eye AIS vessel tracking and disciplined 07:30–09:00 dockwalking.',
    growPrompt:
      'WAY FORWARD — BYPASSING GATEKEEPERS: How many vessels and agencies have you contacted directly today, and when is your next scheduled follow-up in the CRM Pipeline?',
    platformTool: 'M/Y Eye + CRM Pipeline',
    primaryDeliverable: 'Live Agency Matrix & AIS Port Target Log',
    checklistItems: [
      {
        id: 'w6_c1',
        category: 'Agency Matrix',
        label: 'Registered with 10+ MLC-compliant placement agencies & profiles 100% completed',
        detail: 'YPI Crew, Bluewater, The Crew Network, Cotton Crews, Northrop & Johnson, Luxury Yacht Group, Burgess, Camper & Nicholsons.',
      },
      {
        id: 'w6_c2',
        category: 'Recruiter Protocol',
        label: 'Executed professional recruiter check-in cadence (in-person / phone / email without spamming)',
        detail: 'Check in with specific availability updates or new daywork references—never send generic daily "any jobs?" messages.',
      },
      {
        id: 'w6_c3',
        category: 'M/Y Eye AIS Scan',
        label: 'Active M/Y Eye AIS port scan completed each evening for tomorrow’s marina walk',
        detail: 'Identify newly arrived 40m–90m+ motor/sailing yachts, shipyard refit turnarounds, and busy quays on `searchengine.chaddewet.com`.',
      },
      {
        id: 'w6_c4',
        category: 'Morning Dockwalk',
        label: 'Executed 07:30–09:00 morning dockwalking window with proper passerelle etiquette',
        detail: 'Arrive as deck/interior crew start morning washdowns; ask politely for the Bosun/Chief Stew/Mate and offer immediate daywork.',
      },
      {
        id: 'w6_c5',
        category: 'Afternoon Sweep',
        label: 'Executed 15:00–17:00 afternoon dock sweep for next-day daywork requirements',
        detail: 'Catch vessels planning tomorrow’s maintenance, provisioning, or charter turnaround.',
      },
      {
        id: 'w6_c6',
        category: 'CRM Pipeline Log',
        label: '20+ target vessels & HOD contacts logged in GYCS CRM Opportunity Pipeline with follow-up dates',
        detail: 'Every yacht visited, CV handed over, and agency call is logged inside the Crew Hub Applications / CRM tracker.',
      },
    ],
    fields: [
      {
        id: 'w6_f1',
        label: '1. MLC-Compliant Crew Agency Registration Matrix (Top 10 Agencies & Recruiter Contacts)',
        placeholder: 'e.g., 1) Bluewater Antibes (Registered, spoke with Deck Recruiter Claire) | 2) YPI Crew (Profile 100% verified) | 3) The Crew Network...',
        helperText: 'List your 10+ registered MLC-compliant crew agencies, portal status, and assigned recruiter names.',
      },
      {
        id: 'w6_f2',
        label: '2. M/Y Eye AIS Target Vessel Log (Vessels, LOA, Marina Berth & Charter/Private Status)',
        placeholder: 'e.g., 1) M/Y [Name] (55m Feadship, Port Vauban IYCA, Charter — high turnover) | 2) M/Y [Name] (48m Benetti, Quay C, Post-Refit)...',
        helperText: 'List your priority target vessels identified on M/Y Eye (`searchengine.chaddewet.com`) and logged in your CRM Pipeline.',
      },
      {
        id: 'w6_f3',
        label: '3. Daily Dockwalking Route & Marina Gate Access Plan (07:30–09:00 & 15:00–17:00)',
        placeholder: 'e.g., 07:30 Old Port Quays → 08:15 IYCA / Quai Camille Rayon → 10:30 Agency walk-ins → 15:30 Afternoon Shipyard/Marina sweep...',
        helperText: 'Map your exact walking sequence across marinas and shipyards to maximize passerelle conversations.',
      },
      {
        id: 'w6_f4',
        label: '4. Same-Evening Follow-Up & WhatsApp Funnel Message Template',
        placeholder: 'e.g., "Good afternoon Chief Officer [Name], great speaking with you at M/Y [Vessel] in Port Vauban this morning. Here is my 2-page CV (<250KB) and 60s intro link..."',
        helperText: 'Write your concise evening follow-up message linking your CV Studio PDF and Candidate Landing Page.',
      },
    ],
  },
  {
    week: 7,
    phase: 'Phase 3: EXECUTE (Weeks 6–8)',
    phaseCode: 'execute',
    worksheetTitle: 'Week 7 Worksheet: Interview Confidence Lab & Passerelle-to-Permanent Conversion',
    worksheetSubtitle:
      'Master Captain and Chief Stew screening calls, passerelle pitches, sensitive question handling, and converting a 1-day daywork shift into a permanent contract.',
    growPrompt:
      'WAY FORWARD — INTERVIEW CONVERSION: How do you demonstrate humility, high energy, and immediate operational value in the first 90 seconds of a Captain or HOD interview?',
    platformTool: 'Interview Simulator',
    primaryDeliverable: 'Mock Captain/Chief Stew Interview Passed',
    checklistItems: [
      {
        id: 'w7_c1',
        category: 'Passerelle Pitch',
        label: '30-second dockside passerelle pitch memorized & practiced aloud',
        detail: 'Lead with immediate daywork availability, relevant trade/hospitality skill, and valid tickets—never ask about salary or time off at the passerelle.',
      },
      {
        id: 'w7_c2',
        category: 'Core Scenarios',
        label: 'Prepared structured answers for isolation, shared cabins, and taking orders from younger officers',
        detail: 'Use concrete examples proving ego-free teamwork, adaptability, and respect for maritime rank.',
      },
      {
        id: 'w7_c3',
        category: 'Sensitive Topics',
        label: 'Prepared professional responses for tattoos, relationship status, dietary needs, and salary transition',
        detail: 'Address sensitive topics honestly, concisely, and without defensiveness.',
      },
      {
        id: 'w7_c4',
        category: 'Daywork Conversion',
        label: 'Daywork-to-permanent conversion protocol locked (15m early, zero phone use, proactive initiative)',
        detail: 'Treat every chamois-down, bilge clean, or laundry shift as a live working interview for a permanent berth.',
      },
      {
        id: 'w7_c5',
        category: 'Smart HOD Questions',
        label: 'Prepared 5 operational questions to ask the Captain / Chief Stew at the end of an interview',
        detail: 'Ask about seasonal itinerary, boss/charter profile, maintenance priorities, and watch structure.',
      },
      {
        id: 'w7_c6',
        category: 'Mock Simulation',
        label: 'Completed live 1-on-1 Mock Interview Simulation & debrief with Coach Chad de Wet',
        detail: 'Tested camera framing, audio clarity, posture, and concise STAR-format answers.',
      },
    ],
    fields: [
      {
        id: 'w7_f1',
        label: '1. Your 30-Second Passerelle & Daywork Pitch',
        placeholder: 'e.g., "Good morning Bosun! I’m [Name], a junior deckhand based 5 minutes away in Old Town. I hold my ENG1, STCW, PDSD, and PB2, and have a strong detailing/carpentry background. If you need an extra pair of hands for washdowns or yard work today or this week, I’m ready to step onboard immediately."',
        helperText: 'Craft a punchy, respectful 30-second introduction for dockwalking approaches.',
      },
      {
        id: 'w7_f2',
        label: '2. Screening Scenario Responses (Shared Cabin, Younger Officers & 16-Hour Charter Days)',
        placeholder: 'e.g., 1) Younger Officer: "Onboard, rank and safety come first regardless of age..." | 2) Shared Cabin: "Keep gear stowed in soft duffel, respect watch-sleep schedules, clean as I go..."',
        helperText: 'Write your prepared responses for the 3 toughest Captain/Chief Stew screening questions.',
      },
      {
        id: 'w7_f3',
        label: '3. Daywork-to-Permanent Conversion Playbook (First 8 Hours Onboard)',
        placeholder: 'e.g., Arrive at passerelle at 07:45 (15m early) in clean kit; phone stays in crew mess locker; ask Bosun/Chief Stew for standards before starting; volunteer for bilges/teak/laundry...',
        helperText: 'List the exact habits you will execute during daywork so the HOD offers you a full-time berth.',
      },
      {
        id: 'w7_f4',
        label: '4. 5 Smart Operational Questions for Captains / HODs + Mock Interview Debrief Notes',
        placeholder: 'e.g., Q1: "What does a successful first 30 days look like for a junior crew member on this program?" | Q2: "What is the upcoming Med/Caribbean itinerary and yard period?"...',
        helperText: 'List your 5 interview questions and key feedback notes from your mock interview.',
      },
    ],
  },
  {
    week: 8,
    phase: 'Phase 3: EXECUTE (Weeks 6–8)',
    phaseCode: 'execute',
    worksheetTitle: 'Week 8 Worksheet: MLC Contract Audit, Rolling 30-Day Sprint & First 90 Days Onboard',
    worksheetSubtitle:
      'Audit Seafarer Employment Agreements (SEA) under MLC 2006, sustain your rolling 30-day execution sprint, and execute your First 90 Days Onboard survival & sea-time playbook.',
    growPrompt:
      'EXECUTION & SUSTAINED PERFORMANCE: Are you auditing your SEA contract thoroughly, and how will you turn your first 90 days onboard into verified sea time and a glowing HOD reference?',
    platformTool: '30-Day Sprint Scheduler',
    primaryDeliverable: 'Signed SEA Contract / Active Daywork Deployment',
    checklistItems: [
      {
        id: 'w8_c1',
        category: 'MLC SEA Audit',
        label: 'Seafarer Employment Agreement (SEA) audited against MLC 2006 standards before signing',
        detail: 'Verify basic monthly salary, paid leave ratio (e.g. 38–60+ days/yr), repatriation flights, medical coverage, and notice period.',
      },
      {
        id: 'w8_c2',
        category: 'Red Flag Check',
        label: 'Zero contract red flags (verified flag state, P&I insurance, and clear payment currency)',
        detail: 'Never board an unflagged vessel or accept vague verbal promises in place of a written SEA.',
      },
      {
        id: 'w8_c3',
        category: '30-Day Sprint',
        label: 'Rolling 30-Day Launchpad Execution Sprint calendar active until permanent contract is signed',
        detail: 'Maintain structured daily dockwalking, agency check-ins, daywork logging, and Schengen/visa tracking.',
      },
      {
        id: 'w8_c4',
        category: 'First 90 Days',
        label: 'First 90 Days Onboard Playbook active (crew mess etiquette, hierarchy, watchstanding)',
        detail: 'Carry a pocket waterproof notebook for SOPs, never complain in the crew mess, and master vessel safety muster duties on Day 1.',
      },
      {
        id: 'w8_c5',
        category: 'Sea-Time Logging',
        label: 'Discharge Book / Sea Service Testimonials & daily task logbook maintained from Day 1',
        detail: 'Track standby, yard, sea, and watchkeeping days accurately for your next ticket (OOW 3000GT / Chief Stew / Y4).',
      },
      {
        id: 'w8_c6',
        category: 'Verified Outcome',
        label: 'Redacted SEA contract or confirmed daywork start logged in GYCS Crew Hub Outcomes',
        detail: 'Schedule your Week 1, Week 4, and Month 3 first-season retention check-ins with Coach Chad de Wet.',
      },
    ],
    fields: [
      {
        id: 'w8_f1',
        label: '1. Rolling 30-Day Execution Sprint Schedule (Daily Rhythm & Weekly KPIs)',
        placeholder: 'e.g., Mon–Fri: 07:30–09:00 Dockwalk (10 vessels/day) → 10:00–12:00 Agency Check-ins & CV Tailoring → 15:00–17:00 Afternoon Dock Sweep → 18:00 M/Y Eye & CRM Update...',
        helperText: 'Define your non-negotiable daily routine and weekly targets (vessels approached, daywork days, interviews).',
      },
      {
        id: 'w8_f2',
        label: '2. MLC 2006 Seafarer Employment Agreement (SEA) Contract Audit Checklist',
        placeholder: 'e.g., Vessel Flag: Cayman Islands | Basic Pay: €3,200/mo | Leave: 45 days paid/yr | Repatriation Port: Johannesburg | Medical/P&I: Confirmed | Probation: 90 days...',
        helperText: 'Record the key terms to verify on your first permanent or seasonal Seafarer Employment Agreement.',
      },
      {
        id: 'w8_f3',
        label: '3. First 90 Days Onboard Playbook (Days 1–7, Days 8–30, Days 31–90)',
        placeholder: 'e.g., Days 1–7: Familiarization, safety muster, pocket SOP notebook, cabin discipline | Days 8–30: Master washdown/laundry/tender routines without supervision | Days 31–90: Pass probation...',
        helperText: 'Outline your operational priorities for your first week, first month, and first 90 days onboard.',
      },
      {
        id: 'w8_f4',
        label: '4. Sea-Time Documentation & Next-Season Progression Plan',
        placeholder: 'e.g., Logging sea days in Discharge Book + PYD/RYA logbook after every passage; targeting Lead Deckhand / Yachtmaster Offshore after 12 months sea service...',
        helperText: 'Specify how you will log sea service and what qualification/role you are targeting after Season 1.',
      },
    ],
  },
];

export function getLaunchpadWorksheetByWeek(weekNumber: number): LaunchpadWeekWorksheet {
  return LAUNCHPAD_WORKSHEETS.find((w) => w.week === weekNumber) || LAUNCHPAD_WORKSHEETS[0];
}

export interface ParsedWorksheetState {
  checklist: Record<string, boolean>;
  fields: Record<string, string>;
}

export function serializeWorksheetToSubmission(
  worksheet: LaunchpadWeekWorksheet,
  checklist: Record<string, boolean>,
  fields: Record<string, string>
): string {
  const completedCount = worksheet.checklistItems.filter((item) => Boolean(checklist[item.id])).length;
  const lines: string[] = [
    `### ${worksheet.worksheetTitle}`,
    `**Phase:** ${worksheet.phase} | **Core Tool:** ${worksheet.platformTool} | **Checklist Progress:** ${completedCount}/${worksheet.checklistItems.length} Completed`,
    '',
    '#### Follow-Along Checklist',
    ...worksheet.checklistItems.map(
      (item) => `- [${checklist[item.id] ? 'x' : ' '}] [${item.id}] **${item.category}:** ${item.label}`
    ),
    '',
    '#### Client Worksheet Responses',
  ];

  for (const field of worksheet.fields) {
    const val = (fields[field.id] || '').trim();
    lines.push(`##### [${field.id}] ${field.label}`);
    lines.push(val || '_Not completed yet._');
    lines.push('');
  }

  return lines.join('\n').trim();
}

export function parseWorksheetFromSubmission(
  worksheet: LaunchpadWeekWorksheet,
  submittedContent?: string | null
): ParsedWorksheetState {
  const checklist: Record<string, boolean> = {};
  const fields: Record<string, string> = {};

  for (const item of worksheet.checklistItems) {
    checklist[item.id] = false;
  }
  for (const field of worksheet.fields) {
    fields[field.id] = '';
  }

  if (!submittedContent || !submittedContent.trim()) {
    return { checklist, fields };
  }

  const raw = submittedContent.trim();
  const hasStructuredFormat = raw.includes('#### Follow-Along Checklist') || raw.includes('##### [w');

  if (!hasStructuredFormat) {
    // Preserve legacy single-field submission inside the first worksheet field
    if (worksheet.fields[0]) {
      fields[worksheet.fields[0].id] = raw;
    }
    return { checklist, fields };
  }

  for (const item of worksheet.checklistItems) {
    const checkedRegex = new RegExp(`- \\[[xX]\\] \\[${item.id}\\]`);
    if (checkedRegex.test(raw)) {
      checklist[item.id] = true;
    }
  }

  for (let i = 0; i < worksheet.fields.length; i++) {
    const currentField = worksheet.fields[i];
    const nextField = worksheet.fields[i + 1];
    const startMarker = `##### [${currentField.id}]`;
    const startIdx = raw.indexOf(startMarker);
    if (startIdx === -1) continue;
    const lineEndIdx = raw.indexOf('\n', startIdx);
    if (lineEndIdx === -1) continue;
    const endIdx = nextField ? raw.indexOf(`##### [${nextField.id}]`, lineEndIdx) : raw.length;
    const extracted = raw.slice(lineEndIdx + 1, endIdx === -1 ? raw.length : endIdx).trim();
    fields[currentField.id] = extracted === '_Not completed yet._' ? '' : extracted;
  }

  return { checklist, fields };
}

export function generateClientWorkbookMarkdown(
  memberName?: string,
  targetRole?: string,
  coachingProgramme?: string,
  allSubmissions?: Record<number, string | undefined>
): string {
  const lines: string[] = [
    '# Green Yacht Crew Solutions (GYCS)',
    '## 8-Week Superyacht Career Launchpad: Client Workbook, Worksheets & Follow-Along Checklists',
    '',
    `* **Instructor / Systems Architect:** ${LAUNCHPAD_COURSE_METADATA.instructor}`,
    `* **Delivery Framework:** ${LAUNCHPAD_COURSE_METADATA.deliveryFramework}`,
    `* **Crew Member:** ${memberName || 'GYCS Client'}`,
    `* **Target Pathway Role:** ${targetRole || 'Superyacht Crew'}`,
    `* **Coaching Program:** ${coachingProgramme || '8-Week Superyacht Career Launchpad'}`,
    `* **Core Platform Stack:** GYCS Crew Hub (https://hub.chaddewet.com) · CV Studio · M/Y Eye (https://searchengine.chaddewet.com) · Candidate Funnel · CRM Pipeline`,
    '',
    '---',
    '',
  ];

  for (const ws of LAUNCHPAD_WORKSHEETS) {
    const parsed = parseWorksheetFromSubmission(ws, allSubmissions?.[ws.week]);
    lines.push(`## Week 0${ws.week} — ${ws.worksheetTitle}`);
    lines.push(`* **Phase:** ${ws.phase}`);
    lines.push(`* **Core Platform Tool:** ${ws.platformTool}`);
    lines.push(`* **Primary Deliverable:** ${ws.primaryDeliverable}`);
    lines.push(`* **GROW Coaching Prompt:** *${ws.growPrompt}*`);
    lines.push('');
    lines.push('### Follow-Along Operational Checklist');
    for (const item of ws.checklistItems) {
      const mark = parsed.checklist[item.id] ? 'x' : ' ';
      lines.push(`- [${mark}] **[${item.category}] ${item.label}** — ${item.detail}`);
    }
    lines.push('');
    lines.push('### Client Worksheet Exercises');
    for (const field of ws.fields) {
      lines.push(`#### ${field.label}`);
      lines.push(`> *Guidance:* ${field.helperText}`);
      lines.push('');
      lines.push(parsed.fields[field.id]?.trim() || `*(Complete this section in the GYCS Crew Hub: ${field.placeholder})*`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}
