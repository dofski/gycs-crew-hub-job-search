/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  UserRole,
  JourneyState,
  Department,
  RequirementClassification,
  VerificationStatus,
  DocumentCategory,
  ReadinessDimension,
} from '../lib/constants.ts';

export type {
  UserRole,
  JourneyState,
  Department,
  RequirementClassification,
  VerificationStatus,
  DocumentCategory,
  ReadinessDimension,
};

export interface UserProfile {
  id: string;
  organisationId: string;
  role: UserRole;
  displayName: string;
  email: string;
  phone?: string;
  countryCode: string;
  avatarUrl?: string;
  timezone: string;
  journeyState: JourneyState;
  isActive: boolean;
  onboardedAt?: string;
  assignedCoachId?: string;
  assignedCoachName?: string;
  targetDepartment: Department;
  targetRole: string;
  runwayMonths: number;
  blockers: string[];
  unreadReviewsCount: number;
}

export interface DocumentItem {
  id: string;
  userId: string;
  category: DocumentCategory;
  title: string;
  description?: string;
  verificationStatus: VerificationStatus;
  filePath?: string;
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  documentHash?: string;
  issuedDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  isSensitive: boolean;
}

export interface CVEducation {
  name: string;
  issuer: string;
  date: string;
  label: VerificationStatus;
}

export interface CVExperience {
  id: string;
  role: string;
  employerOrVessel: string;
  dates: string;
  description: string;
  label: VerificationStatus;
}

export interface CVData {
  id: string;
  userId: string;
  version: number;
  personalInfo: {
    fullName: string;
    nationality: string;
    location: string;
    dateOfBirth?: string;
    email?: string;
    phone?: string;
    passportExpiry?: string;
    seamanBook?: string;
    medicalFitness?: string;
    swimmingAbility?: string;
    visas: string[];
    languages: string[];
    smoker: boolean;
    tattoos: string;
  };
  objective: {
    text: string;
    targetRole?: string;
    targetDepartment?: string;
    label: VerificationStatus;
  };
  experience: CVExperience[];
  qualifications: CVEducation[];
  skills: Array<{ name: string; label: VerificationStatus }>;
  references: Array<{
    name: string;
    role: string;
    contact?: string;
    contactShared: boolean;
    label: VerificationStatus;
  }>;
  additional?: {
    targetRole?: string;
    targetDepartment?: string;
    availabilityDate?: string;
    contractPreference?: string;
    preferredPorts?: string;
    runwayMonths?: number;
    hobbiesAndInterests?: string;
    template?: string;
    accentColor?: string;
    fontFamily?: string;
    pageFormat?: 'a4' | 'letter';
    avatarUrl?: string;
  };
  coachComments?: string;
  isCurrent: boolean;
  updatedAt: string;
}

export interface LessonItem {
  id: string;
  programmeId: string;
  week: number;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'practical' | 'live';
  durationMins: number;
  completed: boolean;
  content: string;
  phase?: string;
  phaseCode?: 'know' | 'prepare' | 'execute';
  moduleFocus?: string;
  growAnchor?: string;
  coreObjective?: string;
  platformTool?: string;
  operationalLessons?: Array<{ title: string; points: string[] }>;
  techDeliverable?: string;
  weeklyMilestone?: string;
  primaryOutput?: string;
  deckUrl?: string;
  videoUrl?: string;
  gumletAssetId?: string;
  gumletPlaylistId?: string;
  gumletStatus?: string;
  thumbnailUrl?: string;
  chapters?: Array<{ label: string; startTime: number }>;
  assignment?: {
    id: string;
    title: string;
    instructions: string;
    submissionType: 'text' | 'file' | 'quiz' | 'practical_video';
    status: 'draft' | 'submitted' | 'reviewed' | 'resubmit_requested';
    submittedContent?: string;
    coachFeedback?: string;
    score?: number;
  };
}

export interface LiveSession {
  id: string;
  cohortName: string;
  title: string;
  scheduledAt: string;
  durationMins: number;
  coachName: string;
  meetingUrl: string;
  recordingUrl?: string;
  recordingConsentRequired: boolean;
  questions: Array<{ id: string; user: string; text: string; answered: boolean }>;
}

export interface Opportunity {
  id: string;
  title: string;
  department: Department;
  employerName: string;
  location: string;
  vesselType: string;
  contractType: 'seasonal' | 'permanent' | 'daywork' | 'rotational';
  description: string;
  externalUrl: string;
  source: 'partner' | 'direct_submission';
  isVerifiedEmployer: boolean;
  postedDate: string;
}

export interface Application {
  id: string;
  userId: string;
  opportunityId?: string;
  title: string;
  employer: string;
  location: string;
  status:
    | 'saved'
    | 'preparing'
    | 'submitted'
    | 'acknowledged'
    | 'interview_scheduled'
    | 'interviewed'
    | 'offered'
    | 'accepted'
    | 'declined'
    | 'rejected'
    | 'withdrawn';
  notes: string;
  submittedAt?: string;
  interviews: Array<{
    id: string;
    scheduledAt: string;
    format: 'in_person' | 'video' | 'phone';
    notes: string;
    outcome?: 'pending' | 'positive' | 'negative' | 'no_feedback';
    coachDebrief?: string;
  }>;
}

export interface VerifiedOutcome {
  id: string;
  userId: string;
  memberName: string;
  roleTitle: string;
  vesselName: string;
  employmentType: 'seasonal' | 'permanent' | 'daywork' | 'rotational';
  startDate: string;
  evidenceType: 'redacted_contract' | 'employer_confirmation' | 'start_confirmation' | 'member_self_report';
  evidenceNotes: string;
  consistentWithPathway: boolean;
  verifiedBy: string;
  verifiedAt: string;
  retentionChecks: Array<{
    stage: 'week_1' | 'week_4' | 'month_3' | 'season_end';
    status: 'pending' | 'completed' | 'unreachable' | 'departed';
    wellbeingScore?: number;
    notes?: string;
  }>;
}
