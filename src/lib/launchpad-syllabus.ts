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
