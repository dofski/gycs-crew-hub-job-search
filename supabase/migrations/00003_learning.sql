-- supabase/migrations/00003_learning.sql
CREATE TYPE public.lesson_type AS ENUM ('video', 'text', 'quiz', 'practical', 'live');

CREATE TABLE IF NOT EXISTS public.programmes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  department public.department,
  duration_weeks integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL REFERENCES public.programmes(id),
  name text NOT NULL, -- e.g. "Deck Jan 2027"
  starts_at date NOT NULL,
  ends_at date,
  max_members integer DEFAULT 12,
  coach_id uuid REFERENCES public.profiles(id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cohort_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'withdrawn')),
  UNIQUE(cohort_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  lesson_type public.lesson_type NOT NULL,
  content text,
  video_url text,
  sort_order integer NOT NULL DEFAULT 0,
  duration_mins integer,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  instructions text NOT NULL,
  due_offset_days integer,
  submission_type text NOT NULL DEFAULT 'text' CHECK (submission_type IN ('text', 'file', 'quiz', 'practical_video')),
  max_score integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  cohort_id uuid NOT NULL REFERENCES public.cohorts(id),
  content text,
  file_path text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  score integer,
  feedback text,
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'reviewed', 'resubmit_requested'))
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Live sessions (links to external meeting provider)
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.cohorts(id),
  title text NOT NULL,
  description text,
  scheduled_at timestamptz NOT NULL,
  duration_mins integer NOT NULL DEFAULT 60,
  meeting_url text,
  meeting_id text,
  recording_url text, -- Cloudflare Stream signed URL (feature-flagged)
  recording_consent_required boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.session_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  joined_at timestamptz,
  left_at timestamptz,
  recording_consent boolean DEFAULT false,
  UNIQUE(session_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.session_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  question text NOT NULL,
  answered boolean DEFAULT false,
  answer text,
  created_at timestamptz NOT NULL DEFAULT now()
);
