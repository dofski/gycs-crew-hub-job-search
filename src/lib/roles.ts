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
  summary: string;
  highlights: string[];
}

export const COACHING_PROGRAMMES: Record<CoachingProgrammeType, CoachingProgrammeOption> = {
  one_on_one: {
    id: 'one_on_one',
    slug: 'single-1on1-coaching',
    title: 'Single 1-on-1 Coaching Program',
    shortLabel: '1-on-1 Coaching',
    eyebrow: 'PRIVATE 1-ON-1 MENTORSHIP',
    summary:
      'Direct, personalised 1-on-1 career coaching with Chad de Wet tailored to your exact starting point, timeline, and chosen pathway.',
    highlights: [
      'Private 1-on-1 strategy calls and tailored pathway roadmap',
      'Direct review and positioning of your yacht CV and experience',
      'Personalised training, certification, and budget prioritisation',
      'Individual search routine, M/Y Eye port planning, and coach check-ins',
    ],
  },
  group: {
    id: 'group',
    slug: 'group-coaching-program',
    title: 'Group Coaching Program',
    shortLabel: 'Group Coaching',
    eyebrow: 'STRUCTURED COHORT PROGRAMME',
    summary:
      'Structured 8-week cohort coaching combining weekly live strategy sessions, step-by-step career modules, and shared milestone accountability.',
    highlights: [
      '8-week structured curriculum from Career Reality Check to Action Blueprint',
      'Weekly live group coaching and interactive Q&A strategy rooms',
      'Pathway-matched milestones (Deckhand, Steward/ess, Engineer, Chef)',
      'Full Crew Hub workspace access, CV Studio, and M/Y Eye search tools',
    ],
  },
};

export const PATHWAY_ROLE_OPTIONS: Array<{
  role: UserRole;
  department: 'deck' | 'interior' | 'engineering' | 'galley' | 'undecided';
  label: string;
  pathwayTitle: string;
  description: string;
}> = [
  {
    role: 'deckhand',
    department: 'deck',
    label: 'Deckhand',
    pathwayTitle: 'Deck / Deckhand Pathway',
    description: 'Exterior maintenance, tender driving (PB2), line handling, washdowns, and bridge/lookout support.',
  },
  {
    role: 'steward',
    department: 'interior',
    label: 'Steward / Stewardess',
    pathwayTitle: 'Interior / Steward(ess) Pathway',
    description: 'Luxury guest hospitality, silver/table service, housekeeping, laundry, and interior detailing.',
  },
  {
    role: 'engineer',
    department: 'engineering',
    label: 'Engineer',
    pathwayTitle: 'Engineering Pathway',
    description: 'Marine propulsion, AEC 1 & 2 foundations, onboard mechanical/electrical systems, and watchkeeping.',
  },
  {
    role: 'chef',
    department: 'galley',
    label: 'Chef',
    pathwayTitle: 'Galley / Chef Pathway',
    description: 'Crew and guest provisioning, menu planning, maritime food hygiene (MLC Reg 3.2), and galley operations.',
  },
  {
    role: 'member',
    department: 'undecided',
    label: 'Exploring / Undecided',
    pathwayTitle: 'Discovery Pathway (Help Me Decide)',
    description: 'Evaluate your transferable skills and goals with your coach before locking in a department role.',
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
