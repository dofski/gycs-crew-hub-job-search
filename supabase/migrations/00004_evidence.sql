-- supabase/migrations/00004_evidence.sql
CREATE TYPE public.document_category AS ENUM (
  'identity',       -- Passport, visa, CoC
  'medical',        -- ENG1, SAMSA accredited, equivalent
  'training',       -- STCW, safety certs
  'qualification',  -- Academic, professional
  'reference',      -- Employment references
  'travel',         -- Visa, work permits
  'other'
);

CREATE TYPE public.verification_status AS ENUM (
  'claimed',   -- Member says they have it
  'uploaded',  -- File uploaded
  'reviewed',  -- Coach has looked at it
  'verified'   -- Confirmed with issuing body or employer
);

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category public.document_category NOT NULL,
  title text NOT NULL,
  description text,
  -- We store STATUS and EXPIRY, not raw sensitive content metadata
  verification_status public.verification_status NOT NULL DEFAULT 'claimed',
  file_path text, -- Supabase Storage path (private bucket)
  file_name text,
  file_size_bytes integer,
  mime_type text,
  issued_date date,
  expiry_date date,
  issuing_authority text,
  document_number_hash text, -- Hashed, not plaintext
  -- Review
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  review_notes text,
  -- Flags
  expiry_warning_sent boolean DEFAULT false,
  is_sensitive boolean NOT NULL DEFAULT false, -- Never sent to AI
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Credential verification records
CREATE TABLE IF NOT EXISTS public.credential_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  verified_by uuid NOT NULL REFERENCES public.profiles(id),
  method text NOT NULL CHECK (method IN ('visual_check', 'issuer_confirmed', 'database_lookup', 'employer_confirmed')),
  result text NOT NULL CHECK (result IN ('confirmed', 'unable_to_verify', 'discrepancy', 'expired')),
  notes text,
  verified_at timestamptz NOT NULL DEFAULT now()
);

-- General audit events
CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid, -- Who was affected
  actor_id uuid, -- Who performed the action
  event_type text NOT NULL, -- e.g. 'document.uploaded', 'state.transition'
  resource text, -- e.g. 'documents', 'cv_versions'
  resource_id uuid,
  details jsonb DEFAULT '{}',
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Data export requests (POPIA right of access)
CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'downloaded', 'expired')),
  file_path text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz
);

-- Data deletion requests (POPIA right to deletion)
CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'denied')),
  reason text,
  approved_by uuid REFERENCES public.profiles(id),
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
