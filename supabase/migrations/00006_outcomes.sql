-- supabase/migrations/00006_outcomes.sql
CREATE TYPE public.employment_type AS ENUM ('seasonal', 'permanent', 'daywork', 'rotational');
CREATE TYPE public.outcome_evidence_type AS ENUM (
  'redacted_contract',
  'employer_confirmation',
  'start_confirmation',
  'member_self_report'
);

CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  application_id uuid REFERENCES public.applications(id),
  employer_id uuid REFERENCES public.employers(id),
  role_title text NOT NULL,
  vessel_name text,
  employment_type public.employment_type,
  start_date date,
  salary_range text, -- Redacted range, not exact
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'coach_reviewed', 'accepted', 'declined', 'rescinded')),
  coach_review text, -- Coach commentary on the offer
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.verified_starts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  offer_id uuid REFERENCES public.offers(id),
  evidence_type public.outcome_evidence_type NOT NULL,
  evidence_notes text,
  start_date date NOT NULL,
  verified_by uuid REFERENCES public.profiles(id),
  verified_at timestamptz NOT NULL DEFAULT now(),
  consistent_with_pathway boolean,
  pathway_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.retention_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  verified_start_id uuid REFERENCES public.verified_starts(id),
  check_type text NOT NULL CHECK (check_type IN ('week_1', 'week_4', 'month_3', 'season_end', 'ad_hoc')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'unreachable', 'departed')),
  wellbeing_score integer CHECK (wellbeing_score BETWEEN 1 AND 5),
  notes text,
  coach_id uuid REFERENCES public.profiles(id),
  checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.withdrawal_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  stage public.journey_state NOT NULL, -- State at withdrawal
  reason text NOT NULL,
  details text,
  recorded_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
