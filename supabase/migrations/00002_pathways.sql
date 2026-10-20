-- supabase/migrations/00002_pathways.sql
CREATE TYPE public.journey_state AS ENUM (
  'exploring',
  'pathway_agreed',
  'preparing',
  'training_complete',
  'profile_ready',
  'search_active',
  'interviewing',
  'offer',
  'employment_started',
  'first_season_supported',
  -- Non-linear states
  'paused',
  'needs_review',
  'alternative_route'
);

CREATE TYPE public.department AS ENUM ('deck', 'interior', 'engineering', 'galley');

CREATE TYPE public.requirement_classification AS ENUM (
  'required_for_context',
  'employer_preference',
  'useful_development',
  'defer',
  'requires_professional_confirmation'
);

-- Intake assessments
CREATE TABLE IF NOT EXISTS public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'reviewed')),
  -- Structured responses
  motivation jsonb,
  department_fit public.department,
  existing_experience jsonb,
  resources_runway jsonb,
  availability jsonb,
  documents_status jsonb,
  medical_next_step text, -- "Consult a maritime medical provider"
  travel_permissions jsonb,
  expectations jsonb,
  -- Coach review
  coach_id uuid REFERENCES public.profiles(id),
  coach_notes text,
  recommended_pathway text,
  pathway_rationale text, -- "Why this pathway fits"
  uncertainties text, -- "What remains uncertain"
  do_not_spend_yet text, -- "What NOT to spend money on yet"
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Pathway versions (versioned, never mutated once agreed)
CREATE TABLE IF NOT EXISTS public.pathway_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assessment_id uuid REFERENCES public.assessments(id),
  version integer NOT NULL DEFAULT 1,
  department public.department NOT NULL,
  target_role text NOT NULL, -- e.g. "Deckhand", "Steward/ess"
  summary text,
  is_active boolean NOT NULL DEFAULT true,
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, version)
);

-- Requirements engine (versioned, sourced, never hardcoded advice)
CREATE TABLE IF NOT EXISTS public.requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL, -- e.g. "STCW_BASIC_SAFETY"
  title text NOT NULL,
  description text,
  classification public.requirement_classification NOT NULL,
  applicable_flags text[] DEFAULT '{}', -- e.g. ['MCA', 'SAMSA']
  applicable_roles text[] DEFAULT '{}',
  applicable_departments public.department[],
  source_authority text NOT NULL, -- e.g. "IMO STCW Convention"
  source_url text,
  source_version text, -- e.g. "2010 Manila Amendments"
  last_verified_date date NOT NULL,
  verified_by text NOT NULL, -- Person/role who verified
  prerequisites uuid[] DEFAULT '{}',
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Milestones (steps within a pathway)
CREATE TABLE IF NOT EXISTS public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id uuid NOT NULL REFERENCES public.pathway_versions(id) ON DELETE CASCADE,
  requirement_id uuid REFERENCES public.requirements(id),
  title text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  evidence_required text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'approved', 'deferred', 'not_applicable')),
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Journey state transitions (audit trail)
CREATE TABLE IF NOT EXISTS public.journey_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_state public.journey_state,
  to_state public.journey_state NOT NULL,
  reason text,
  evidence jsonb,
  reviewed_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Current journey state on profile
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS journey_state public.journey_state DEFAULT 'exploring';
