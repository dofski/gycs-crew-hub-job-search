-- supabase/migrations/00009_feature_flags.sql
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Everyone can read flags
CREATE POLICY flags_select ON public.feature_flags FOR SELECT USING (true);
CREATE POLICY flags_manage ON public.feature_flags FOR ALL USING (public.current_user_role() = 'admin');

-- Seed flags
INSERT INTO public.feature_flags (key, enabled, description) VALUES
  ('payments_enabled', false, 'Payment checkout — disabled pending legal review (Employment Services Act s.15)'),
  ('ai_cv_assist', false, 'AI-powered CV wording suggestions — server-side only'),
  ('ai_lesson_search', false, 'Semantic lesson search'),
  ('ai_summarisation', false, 'Session summarisation'),
  ('cloudflare_stream', false, 'Cloudflare Stream for replays — signed playback'),
  ('employer_portal', false, 'Employer self-service portal'),
  ('ghl_sync', false, 'GoHighLevel CRM downstream sync'),
  ('map_directory', false, 'MapLibre map directory'),
  ('engineering_department', false, 'Engineering department pathways — requires specialist coach'),
  ('galley_department', false, 'Galley department pathways — requires specialist coach')
ON CONFLICT (key) DO UPDATE SET description = EXCLUDED.description;
