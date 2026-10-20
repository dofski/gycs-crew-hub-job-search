-- supabase/migrations/00001_identity.sql
-- Enum types
CREATE TYPE public.user_role AS ENUM ('member', 'coach', 'admin');
CREATE TYPE public.consent_type AS ENUM (
  'programme_participation',
  'marketing_email',
  'marketing_sms',
  'marketing_whatsapp',
  'recording_consent',
  'data_export',
  'ai_cv_assist'
);
CREATE TYPE public.consent_status AS ENUM ('granted', 'withdrawn');

-- Organisations (future: multiple coaching orgs)
CREATE TABLE IF NOT EXISTS public.organisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid REFERENCES public.organisations(id),
  role public.user_role NOT NULL DEFAULT 'member',
  display_name text NOT NULL,
  email text NOT NULL,
  phone text,
  country_code text DEFAULT 'ZA',
  avatar_url text,
  timezone text DEFAULT 'Africa/Johannesburg',
  is_active boolean NOT NULL DEFAULT true,
  onboarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Coach-to-member assignments
CREATE TABLE IF NOT EXISTS public.coach_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES public.profiles(id),
  member_id uuid NOT NULL REFERENCES public.profiles(id),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  notes text,
  UNIQUE(coach_id, member_id, assigned_at)
);

-- POPIA consent records (separate from participation)
CREATE TABLE IF NOT EXISTS public.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_type public.consent_type NOT NULL,
  status public.consent_status NOT NULL,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Suppression list for marketing (POPIA)
CREATE TABLE IF NOT EXISTS public.marketing_suppressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
  suppressed boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, channel)
);

-- Access log for audit
CREATE TABLE IF NOT EXISTS public.access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);
