/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { UserRole } from './roles.ts';
export type { UserRole };

export type JourneyState =
  | 'exploring'
  | 'pathway_agreed'
  | 'preparing'
  | 'training_complete'
  | 'profile_ready'
  | 'search_active'
  | 'interviewing'
  | 'offer'
  | 'employment_started'
  | 'first_season_supported'
  // Non-linear / exception states
  | 'paused'
  | 'needs_review'
  | 'alternative_route';

export type Department = 'deck' | 'interior' | 'engineering' | 'galley';

export type RequirementClassification =
  | 'required_for_context'
  | 'employer_preference'
  | 'useful_development'
  | 'defer'
  | 'requires_professional_confirmation';

export type VerificationStatus = 'claimed' | 'uploaded' | 'reviewed' | 'verified';

export type DocumentCategory =
  | 'identity'
  | 'medical'
  | 'training'
  | 'qualification'
  | 'reference'
  | 'travel'
  | 'other';

export type ReadinessDimensionKey =
  | 'training'
  | 'medical'
  | 'profile'
  | 'practical_skills'
  | 'travel_work'
  | 'search_prep'
  | 'employment_outcome';

export type ReadinessLevel =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'coach_approved'
  | 'verified';

export interface ReadinessDimension {
  key: ReadinessDimensionKey;
  label: string;
  level: ReadinessLevel;
  measuredBy: string;
  sourceOfTruth: string;
  notes?: string;
  lastUpdated?: string;
}

export interface FeatureFlags {
  payments_enabled: boolean;
  ai_cv_assist: boolean;
  ai_lesson_search: boolean;
  ai_summarisation: boolean;
  cloudflare_stream: boolean;
  employer_portal: boolean;
  ghl_sync: boolean;
  map_directory: boolean;
  engineering_department: boolean;
  galley_department: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  payments_enabled: false, // Employment Services Act s.15
  ai_cv_assist: false, // Feature-flagged server-side AI assist
  ai_lesson_search: false,
  ai_summarisation: false,
  cloudflare_stream: false,
  employer_portal: false,
  ghl_sync: false,
  map_directory: true, // Interactive map UI with provenance
  engineering_department: false, // Specialist coach needed
  galley_department: false, // Specialist coach needed
};

export interface Requirement {
  id: string;
  code: string;
  title: string;
  description: string;
  classification: RequirementClassification;
  applicableFlags: string[];
  applicableRoles: string[];
  applicableDepartments: Department[];
  sourceAuthority: string;
  sourceUrl?: string;
  sourceVersion: string;
  lastVerifiedDate: string;
  verifiedBy: string;
  notes?: string;
}

export interface Milestone {
  id: string;
  pathwayId: string;
  requirementId?: string;
  title: string;
  description: string;
  sortOrder: number;
  evidenceRequired: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'deferred' | 'not_applicable';
  phase?: string;
  growAnchor?: string;
  platformTool?: string;
  primaryOutput?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export const JOURNEY_STAGE_CONFIG: Record<
  JourneyState,
  {
    title: string;
    description: string;
    color: string;
    order: number;
    isNonLinear?: boolean;
  }
> = {
  exploring: {
    title: 'Exploring',
    description: 'Assessing motivation, physical suitability, runway and department alignment.',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    order: 1,
  },
  pathway_agreed: {
    title: 'Pathway Agreed',
    description: 'Human coach reviewed intake; approved department roadmap and milestones.',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    order: 2,
  },
  preparing: {
    title: 'Preparing',
    description: 'Acquiring prerequisites, scheduling medical and foundational certificates.',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    order: 3,
  },
  training_complete: {
    title: 'Training Complete',
    description: 'Core maritime mandatory qualifications (STCW, Medical) uploaded and checked.',
    color: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    order: 4,
  },
  profile_ready: {
    title: 'Profile Ready',
    description: 'Structured CV reviewed by coach; all credentials labeled with provenance.',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    order: 5,
  },
  search_active: {
    title: 'Search Active',
    description: 'Target hub selected (e.g. Antibes/Palma/Fort Lauderdale), active applications underway.',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    order: 6,
  },
  interviewing: {
    title: 'Interviewing',
    description: 'Crew agent or captain interviews scheduled; coach debrief available.',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    order: 7,
  },
  offer: {
    title: 'Offer Received',
    description: 'Contract or daywork engagement received and submitted for coach review.',
    color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    order: 8,
  },
  employment_started: {
    title: 'Employment Started',
    description: 'Verified start onboard; first contract in progress.',
    color: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/40',
    order: 9,
  },
  first_season_supported: {
    title: 'First Season Support',
    description: 'Onboarding check-ins (week 1, week 4, month 3), reference building and progression.',
    color: 'bg-emerald-500/30 text-emerald-200 border-emerald-500/50',
    order: 10,
  },
  // Non-linear
  paused: {
    title: 'Paused',
    description: 'Member temporarily halted due to personal, financial, or timing reasons. Safe state.',
    color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    order: 99,
    isNonLinear: true,
  },
  needs_review: {
    title: 'Needs Review',
    description: 'Coach intervention required (medical hurdle, visa obstacle, or repeated rejection).',
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    order: 99,
    isNonLinear: true,
  },
  alternative_route: {
    title: 'Alternative Route',
    description: 'Superyacht career not optimal right now; directed to domestic maritime or hospitality.',
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    order: 99,
    isNonLinear: true,
  },
};

export const SOURCED_REQUIREMENTS: Requirement[] = [
  {
    id: 'req-stcw-95',
    code: 'STCW_BASIC_SAFETY',
    title: 'STCW Basic Safety Training (PST, PSSR, FPFF, EFA)',
    description: 'Mandatory maritime safety training for all seafarers on vessels over 24m/commercial.',
    classification: 'required_for_context',
    applicableFlags: ['MCA', 'SAMSA', 'Marshall Islands', 'Cayman Islands'],
    applicableRoles: ['Deckhand', 'Steward/ess', 'Junior Engineer', 'Chef'],
    applicableDepartments: ['deck', 'interior', 'engineering', 'galley'],
    sourceAuthority: 'IMO STCW Convention',
    sourceUrl: 'https://www.imo.org/en/OurWork/HumanElement/Pages/STCW-Conv-LINK.aspx',
    sourceVersion: '2010 Manila Amendments',
    lastVerifiedDate: '2026-09-15',
    verifiedBy: 'Chad de Wet (Coach / Maritime Compliance)',
    notes: 'Must be from a SAMSA-accredited or MCA-approved training provider. 5-year validity.',
  },
  {
    id: 'req-dsd',
    code: 'STCW_PDSD',
    title: 'Proficiency in Designated Security Duties (PDSD)',
    description: 'Security awareness and threat response for crew with designated duties under ISPS code.',
    classification: 'required_for_context',
    applicableFlags: ['MCA', 'SAMSA', 'Marshall Islands'],
    applicableRoles: ['Deckhand', 'Steward/ess'],
    applicableDepartments: ['deck', 'interior'],
    sourceAuthority: 'IMO ISPS Code / STCW Reg VI/6',
    sourceVersion: 'Regulation VI/6, Para 4',
    lastVerifiedDate: '2026-09-15',
    verifiedBy: 'Chad de Wet',
  },
  {
    id: 'req-eng1',
    code: 'SEAFARER_MEDICAL_ENG1',
    title: 'Seafarer Medical Certificate (ENG1 or SAMSA-Accredited Equivalent)',
    description: 'Statutory seafarer physical and eyesight fitness certificate.',
    classification: 'required_for_context',
    applicableFlags: ['MCA', 'SAMSA', 'Flag State Mutuals'],
    applicableRoles: ['All Crew'],
    applicableDepartments: ['deck', 'interior', 'engineering', 'galley'],
    sourceAuthority: 'UK MCA MSN 1815 / SAMSA Marine Notice',
    sourceVersion: 'MSN 1815 (M+F) Amendment 2',
    lastVerifiedDate: '2026-10-01',
    verifiedBy: 'Maritime Medical Advisor',
    notes: 'NOTE: South African SAMSA seafarer medicals are accepted by many flags, but MCA flags require MCA-approved doctors (Cape Town / Durban have approved doctors). Never auto-reject non-ENG1.',
  },
  {
    id: 'req-pbl2',
    code: 'RYA_POWERBOAT_LEVEL_2',
    title: 'RYA Powerboat Level 2 (PB2)',
    description: 'Tender driving qualification. Critical for deckhand employability; high employer preference.',
    classification: 'employer_preference',
    applicableFlags: ['Commercial Endorsement eligible'],
    applicableRoles: ['Deckhand'],
    applicableDepartments: ['deck'],
    sourceAuthority: 'Royal Yachting Association (RYA)',
    sourceVersion: 'RYA PB2 Syllabus 2024',
    lastVerifiedDate: '2026-08-20',
    verifiedBy: 'Chad de Wet',
    notes: 'Not legally mandatory for stepping on board, but 90%+ of captains expect deckhands to drive tenders.',
  },
  {
    id: 'req-vhf-src',
    code: 'RYA_SRC_VHF',
    title: 'Short Range Certificate (SRC / Marine VHF Radio)',
    description: 'Radio operator license required to operate maritime VHF tender radios.',
    classification: 'employer_preference',
    applicableFlags: ['ITU / RYA / SAMSA'],
    applicableRoles: ['Deckhand'],
    applicableDepartments: ['deck'],
    sourceAuthority: 'ITU Radio Regulations / RYA',
    sourceVersion: '2023 edition',
    lastVerifiedDate: '2026-08-20',
    verifiedBy: 'Chad de Wet',
  },
  {
    id: 'req-food-safety',
    code: 'CIEH_FOOD_SAFETY_L2',
    title: 'Food Safety & Hygiene Level 2 for Catering / Maritime',
    description: 'Required under MLC 2006 for anyone handling food or drinks onboard.',
    classification: 'required_for_context',
    applicableFlags: ['MLC 2006 Standard A3.2'],
    applicableRoles: ['Steward/ess', 'Cook / Chef'],
    applicableDepartments: ['interior', 'galley'],
    sourceAuthority: 'ILO Maritime Labour Convention 2006',
    sourceVersion: 'Title 3, Reg 3.2',
    lastVerifiedDate: '2026-09-10',
    verifiedBy: 'Chad de Wet',
  },
  {
    id: 'req-aec-1-2',
    code: 'MCA_AEC_1_2',
    title: 'MCA Approved Engine Course (AEC 1 & AEC 2)',
    description: 'Entry-level marine engineering qualification covering marine diesel propulsion, generators, electrical systems, and auxiliary machinery.',
    classification: 'employer_preference',
    applicableFlags: ['MCA', 'Cayman Islands', 'Marshall Islands'],
    applicableRoles: ['Junior Engineer', 'Deck/Engineer'],
    applicableDepartments: ['engineering', 'deck'],
    sourceAuthority: 'UK Maritime & Coastguard Agency (MCA)',
    sourceVersion: 'MIN 642 (M) AEC Syllabus',
    lastVerifiedDate: '2026-10-27',
    verifiedBy: 'Chad de Wet',
    notes: 'Essential for commercial mechanics and ETOs transitioning into superyacht engineering rotational roles.',
  },
  {
    id: 'req-visa-schengen-b1b2',
    code: 'VISA_SCHENGEN_B1B2',
    title: 'Schengen 90/180-Day & US B1/B2 / C1/D Visa Compliance',
    description: 'Passport validity (>18 months recommended) and visa readiness for Mediterranean (Schengen) and North American/Caribbean (B1/B2) deployment.',
    classification: 'required_for_context',
    applicableFlags: ['All Foreign-Flagged Commercial & Private Yachts'],
    applicableRoles: ['All Crew'],
    applicableDepartments: ['deck', 'interior', 'engineering', 'galley'],
    sourceAuthority: 'EU Schengen Borders Code / US Department of State',
    sourceVersion: '2026 Consular Guidance',
    lastVerifiedDate: '2026-10-27',
    verifiedBy: 'Chad de Wet',
    notes: 'Audited in Week 1 Career Reality Check: non-EU crew must manage the Schengen 90/180-day clock; US-flagged vessels require US citizenship/Green Card.',
  },
  {
    id: 'req-mlc-sea',
    code: 'MLC_SEA_CONTRACT',
    title: 'MLC 2006 Seafarer Employment Agreement (SEA) Compliance',
    description: 'Standard Maritime Labour Convention contract audit covering basic pay, leave ratio (38–60+ days/year), repatriation, and medical coverage.',
    classification: 'required_for_context',
    applicableFlags: ['MLC 2006 Signatory Flag States'],
    applicableRoles: ['All Crew'],
    applicableDepartments: ['deck', 'interior', 'engineering', 'galley'],
    sourceAuthority: 'ILO Maritime Labour Convention 2006',
    sourceVersion: 'Standard A2.1',
    lastVerifiedDate: '2026-10-27',
    verifiedBy: 'Chad de Wet',
    notes: 'Audited in Week 8 Career Action Blueprint before signing any permanent or seasonal yacht contract.',
  },
  {
    id: 'req-yachtmaster-offshore',
    code: 'RYA_YACHTMASTER_OFFSHORE',
    title: 'RYA Yachtmaster Offshore 200GT / OOW 3000GT Route',
    description: 'Advanced watchkeeping and command qualification for experienced deck crew progressing toward Officer of the Watch.',
    classification: 'defer',
    applicableFlags: ['MCA'],
    applicableRoles: ['Lead Deckhand', 'Bosun', 'Officer'],
    applicableDepartments: ['deck'],
    sourceAuthority: 'RYA / MCA',
    sourceVersion: 'Current',
    lastVerifiedDate: '2026-10-27',
    verifiedBy: 'Chad de Wet',
    notes: 'DO NOT spend capital on advanced tickets before your first contract. Defer until qualifying sea time is logged.',
  },
];
