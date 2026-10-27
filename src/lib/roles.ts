/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'coach'
  | 'deckhand'
  | 'steward'
  | 'engineer'
  | 'chef'
  | 'school_leaver'
  | 'career_changer'
  | 'aspirant'
  | 'junior_crew'
  | 'member';

export type CoachingProgrammeType = 'one_on_one' | 'group';

export interface CoachingProgrammeOption {
  id: CoachingProgrammeType;
  slug: string;
  title: string;
  shortLabel: string;
  eyebrow: string;
  deliveryFramework: string;
  instructor: string;
  summary: string;
  highlights: string[];
}

export const COACHING_PROGRAMMES: Record<CoachingProgrammeType, CoachingProgrammeOption> = {
  one_on_one: {
    id: 'one_on_one',
    slug: 'single-1on1-coaching',
    title: 'Single 1-on-1 Coaching Program (8-Week Launchpad)',
    shortLabel: '1-on-1 Coaching',
    eyebrow: 'PRIVATE 1-ON-1 GROW MENTORSHIP',
    deliveryFramework: 'The GROW Coaching Model (Goal, Reality, Obstacles, Way Forward)',
    instructor: 'Chad de Wet (Yachtmaster Offshore 200GT, Enterprise AI/API Architect)',
    summary:
      'Private, 1-on-1 execution of the 8-Week Superyacht Career Launchpad with Chad de Wet—tailored to your baseline constraints, target department pathway, CV Studio assets, and M/Y Eye outreach.',
    highlights: [
      'Phase 1 KNOW (Weeks 1–2): Private ENG1/Visa/Runway audit & Essential vs. Upsell training route',
      'Phase 2 PREPARE (Weeks 3–5): 1-on-1 CV Studio (<250KB) build, Candidate Conversion Funnel & Deployment Vault',
      'Phase 3 EXECUTE (Weeks 6–8): Direct M/Y Eye AIS vessel outreach, 1-on-1 mock Captain/HOD interviews & SEA contract review',
      'Direct access to GYCS Crew Hub, CV Studio, M/Y Eye, Candidate Funnel & CRM Opportunity Pipeline',
    ],
  },
  group: {
    id: 'group',
    slug: 'group-coaching-program',
    title: 'Group Coaching Program (8-Week Superyacht Career Launchpad)',
    shortLabel: 'Group Coaching',
    eyebrow: '8-WEEK GROW COHORT LAUNCHPAD',
    deliveryFramework: 'The GROW Coaching Model (Goal, Reality, Obstacles, Way Forward)',
    instructor: 'Chad de Wet (Yachtmaster Offshore 200GT, Enterprise AI/API Architect)',
    summary:
      'Structured 8-Week Superyacht Career Launchpad cohort coaching across Phase 1: KNOW (Weeks 1–2), Phase 2: PREPARE (Weeks 3–5), and Phase 3: EXECUTE (Weeks 6–8) with weekly live strategy rooms.',
    highlights: [
      'Phase 1 KNOW (Weeks 1–2): Career Reality Check & Route/Training Navigator (zero wasted capital)',
      'Phase 2 PREPARE (Weeks 3–5): Experience-to-CV Builder (<250KB), Candidate Funnel & Launch Readiness Planner',
      'Phase 3 EXECUTE (Weeks 6–8): M/Y Eye Job Search Strategist, Interview Confidence Lab & 30-Day Action Blueprint',
      'Weekly live cohort coaching rooms, pathway-matched milestones (Deck, Interior, Eng, Galley) & CRM Pipeline',
    ],
  },
};

export const PATHWAY_ROLE_OPTIONS: Array<{
  role: UserRole;
  department: 'deck' | 'interior' | 'engineering' | 'galley' | 'undecided';
  label: string;
  pathwayTitle: string;
  description: string;
  mandatoryTickets: string[];
  functionalAdditions: string[];
  progressionRoute: string;
}> = [
  {
    role: 'deckhand',
    department: 'deck',
    label: 'Deckhand',
    pathwayTitle: 'Deck / Deckhand Pathway',
    description:
      'Translating trades (carpentry, detailing, watersports, mechanics) into entry-level deckhand assets; tender operations, washdowns, line handling, and officer progression routes (PB2 to OOW 3000GT).',
    mandatoryTickets: ['ENG1 Seafarer Medical', 'STCW 2010 Basic Safety Training', 'PDSD (Security Duties)'],
    functionalAdditions: ['RYA Powerboat Level 2 (PB2)', 'Marine VHF Short Range Certificate (SRC)', 'Tender Operator'],
    progressionRoute: 'Deckhand → Lead Deckhand → Bosun → Officer of the Watch (OOW 3000GT) → Chief Officer / Master',
  },
  {
    role: 'steward',
    department: 'interior',
    label: 'Steward / Stewardess',
    pathwayTitle: 'Interior / Steward(ess) Pathway',
    description:
      'Translating fine dining, boutique hospitality, private households, and mixology into junior steward/ess roles; silver service, cabin detailing, laundry systems, and Chief Stewardess operational expectations.',
    mandatoryTickets: ['ENG1 Seafarer Medical', 'STCW 2010 Basic Safety Training', 'PDSD (Security Duties)'],
    functionalAdditions: ['Food Safety & Hygiene Level 2 (MLC Reg 3.2)', 'WSET Wine / Mixology & Barista Skills'],
    progressionRoute: 'Junior Steward/ess → 2nd Steward/ess → Chief Steward/ess → Purser / Interior Manager',
  },
  {
    role: 'engineer',
    department: 'engineering',
    label: 'Engineer',
    pathwayTitle: 'Engineering & ETO Pathway',
    description:
      'Positioning commercial mechanics, ETOs, and technical trades for rotational salaries; highlighting vessel tonnage, generator capacities, preventative maintenance, and AEC 1 & 2 foundations.',
    mandatoryTickets: ['ENG1 Seafarer Medical', 'STCW 2010 Basic Safety Training', 'PDSD (Security Duties)'],
    functionalAdditions: ['MCA Approved Engine Course (AEC 1 & AEC 2)', 'High Voltage / Marine Electrical & AV/IT'],
    progressionRoute: 'Deck/Engineer → Junior Engineer (AEC) → MEOL → Chief Engineer (Y4 / Y3 / Y2 / Y1)',
  },
  {
    role: 'chef',
    department: 'galley',
    label: 'Chef',
    pathwayTitle: 'Galley / Superyacht Chef Pathway',
    description:
      'Positioning culinary professionals for rotational and charter salaries; highlighting guest/crew provisioning metrics, dietary matrices, allergen compliance, and MLC Reg 3.2 maritime food hygiene.',
    mandatoryTickets: ['ENG1 Seafarer Medical', 'STCW 2010 Basic Safety Training', 'PDSD (Security Duties)'],
    functionalAdditions: ['Food Safety & Hygiene Level 2 / 3 (MLC Reg 3.2)', 'Ship’s Cook Assessment / Provisioning Logistics'],
    progressionRoute: 'Crew Chef / Sous Chef → Sole Yacht Chef → Head Charter Chef (50m–100m+)',
  },
  {
    role: 'member',
    department: 'undecided',
    label: 'Exploring / Undecided',
    pathwayTitle: 'Discovery Pathway (Week 1–2 Route Navigator)',
    description:
      'Audit your baseline constraints in Week 1 (Career Reality Check) and evaluate your transferable skills in Week 2 (Route & Training Navigator) before locking in your department.',
    mandatoryTickets: ['ENG1 Seafarer Medical Audit', 'Passport & Visa Baseline Check'],
    functionalAdditions: ['GYCS Baseline Constraints & Runway Calculator', 'Department Route Selector'],
    progressionRoute: 'Phase 1 KNOW (Weeks 1–2) → Lock Deck, Interior, Engineering, or Galley Pathway',
  },
];

const STAFF_ROLES = new Set<string>(['superadmin', 'admin', 'coach']);

export function isStaffRole(role?: string | null): boolean {
  return Boolean(role && STAFF_ROLES.has(role.toLowerCase()));
}

export function isSuperAdminRole(role?: string | null): boolean {
  return role?.toLowerCase() === 'superadmin';
}

export function isAdminOrSuperAdmin(role?: string | null): boolean {
  const normalized = role?.toLowerCase();
  return normalized === 'superadmin' || normalized === 'admin';
}

export function isCrewRole(role?: string | null): boolean {
  if (!role) return true;
  return !isStaffRole(role);
}

/**
 * Resolves the user role that matches the selected pathway/department.
 * Never downgrades staff roles (`superadmin`, `admin`, `coach`).
 */
export function resolvePathwayUserRole(
  department?: string | null,
  pathwaySelection?: string | null,
  currentRole?: string | null
): UserRole {
  if (currentRole && isStaffRole(currentRole)) {
    return currentRole.toLowerCase() as UserRole;
  }

  const dept = (department || '').trim().toLowerCase();
  const pathway = (pathwaySelection || '').trim().toLowerCase();

  if (dept === 'deck' || pathway === 'deck' || pathway === 'deckhand') return 'deckhand';
  if (dept === 'interior' || pathway === 'interior' || pathway === 'steward' || pathway === 'stewardess') return 'steward';
  if (dept === 'engineering' || pathway === 'engineering' || pathway === 'engineer') return 'engineer';
  if (dept === 'galley' || pathway === 'galley' || pathway === 'chef') return 'chef';

  if (pathway === 'school-leaver' || pathway === 'school_leaver') return 'school_leaver';
  if (pathway === 'career-changer' || pathway === 'career_changer') return 'career_changer';
  if (pathway === 'aspirant') return 'aspirant';
  if (pathway === 'junior-crew' || pathway === 'junior_crew') return 'junior_crew';

  if (
    currentRole &&
    ['deckhand', 'steward', 'engineer', 'chef', 'school_leaver', 'career_changer', 'aspirant', 'junior_crew'].includes(
      currentRole.toLowerCase()
    )
  ) {
    return currentRole.toLowerCase() as UserRole;
  }

  return 'member';
}

export function formatUserRoleLabel(role?: string | null): string {
  switch ((role || 'member').toLowerCase()) {
    case 'superadmin':
      return 'Superadmin';
    case 'admin':
      return 'Admin';
    case 'coach':
      return 'Coach';
    case 'deckhand':
      return 'Deckhand';
    case 'steward':
    case 'stewardess':
      return 'Steward / Stewardess';
    case 'engineer':
      return 'Engineer';
    case 'chef':
      return 'Galley / Chef';
    case 'school_leaver':
      return 'First Yacht Role (School Leaver)';
    case 'career_changer':
      return 'Career Changer';
    case 'aspirant':
      return 'Aspirant Crew';
    case 'junior_crew':
      return 'Junior Crew Progression';
    default:
      return 'Crew Member';
  }
}

export function formatCoachingProgrammeLabel(programme?: string | null): string {
  if (programme === 'one_on_one') return COACHING_PROGRAMMES.one_on_one.title;
  if (programme === 'group') return COACHING_PROGRAMMES.group.title;
  return 'Not selected yet';
}
