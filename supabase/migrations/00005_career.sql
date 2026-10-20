-- supabase/migrations/00005_career.sql
CREATE TYPE public.cv_data_label AS ENUM (
  'claimed',
  'uploaded',
  'reviewed',
  'verified'
);

CREATE TABLE IF NOT EXISTS public.cv_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  -- Structured sections (JSON blocks, each field has a verification label)
  personal_info jsonb DEFAULT '{}',
  objective jsonb DEFAULT '{}', -- { text: string, label: cv_data_label }
  experience jsonb DEFAULT '[]', -- [{ title, employer, dates, description, label }]
  qualifications jsonb DEFAULT '[]', -- [{ name, issuer, date, label }]
  skills jsonb DEFAULT '[]',
  references jsonb DEFAULT '[]', -- [{ name, relation, contact_shared, label }]
  additional jsonb DEFAULT '{}',
  coach_comments text,
  is_current boolean NOT NULL DEFAULT true,
  pdf_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, version)
);

-- Employers (approved partners only)
CREATE TABLE IF NOT EXISTS public.employers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_name text,
  contact_email text,
  website text,
  is_verified boolean NOT NULL DEFAULT false,
  verification_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Opportunities (approved partner listings + outbound links)
CREATE TABLE IF NOT EXISTS public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES public.employers(id),
  title text NOT NULL,
  department public.department,
  description text,
  location text,
  vessel_type text,
  contract_type text CHECK (contract_type IN ('seasonal', 'permanent', 'daywork', 'rotational')),
  external_url text, -- Outbound link to original listing
  source text NOT NULL DEFAULT 'partner' CHECK (source IN ('partner', 'direct_submission')),
  is_active boolean NOT NULL DEFAULT true,
  posted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Applications
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES public.opportunities(id),
  external_title text,
  external_employer text,
  external_url text,
  status text NOT NULL DEFAULT 'saved' CHECK (status IN (
    'saved', 'preparing', 'submitted', 'acknowledged',
    'interview_scheduled', 'interviewed', 'offered',
    'accepted', 'declined', 'rejected', 'withdrawn'
  )),
  cv_version_id uuid REFERENCES public.cv_versions(id),
  cover_note text,
  submitted_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Interviews
CREATE TABLE IF NOT EXISTS public.interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  scheduled_at timestamptz,
  format text CHECK (format IN ('in_person', 'video', 'phone')),
  location text,
  interviewer text,
  notes text,
  outcome text CHECK (outcome IN ('pending', 'positive', 'negative', 'no_feedback')),
  coach_debrief text,
  created_at timestamptz NOT NULL DEFAULT now()
);
