-- Gumlet Video Courses, Playlists, Live Stream Assets & Webhook Event Sync Migration
-- Target project: wfblxexdqlxeequvywfc (Green Yacht Crew Solutions)

-- 1. Extend existing course/lesson/live/submission tables with Gumlet fields
ALTER TABLE public.programmes
  ADD COLUMN IF NOT EXISTS gumlet_workspace_id text,
  ADD COLUMN IF NOT EXISTS gumlet_playlist_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS gumlet_folder_id text;

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS gumlet_asset_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS gumlet_workspace_id text,
  ADD COLUMN IF NOT EXISTS gumlet_playlist_id text,
  ADD COLUMN IF NOT EXISTS gumlet_status text,
  ADD COLUMN IF NOT EXISTS gumlet_playback_url text,
  ADD COLUMN IF NOT EXISTS gumlet_dash_url text,
  ADD COLUMN IF NOT EXISTS gumlet_embed_url text,
  ADD COLUMN IF NOT EXISTS gumlet_thumbnail_url text,
  ADD COLUMN IF NOT EXISTS gumlet_preview_thumbnails_url text,
  ADD COLUMN IF NOT EXISTS gumlet_chapters jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS gumlet_subtitles jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS gumlet_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.live_sessions
  ADD COLUMN IF NOT EXISTS gumlet_live_asset_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS gumlet_live_source_id text,
  ADD COLUMN IF NOT EXISTS gumlet_status text DEFAULT 'created',
  ADD COLUMN IF NOT EXISTS gumlet_playback_url text,
  ADD COLUMN IF NOT EXISTS gumlet_embed_url text,
  ADD COLUMN IF NOT EXISTS gumlet_recording_asset_id text;

ALTER TABLE public.assignment_submissions
  ADD COLUMN IF NOT EXISTS gumlet_asset_id text,
  ADD COLUMN IF NOT EXISTS gumlet_status text,
  ADD COLUMN IF NOT EXISTS gumlet_embed_url text,
  ADD COLUMN IF NOT EXISTS gumlet_playback_url text;

-- 2. Dedicated Gumlet tables for full lifecycle & webhook synchronization
CREATE TABLE IF NOT EXISTS public.gumlet_video_assets (
  asset_id text PRIMARY KEY,
  workspace_id text,
  playlist_id text,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  submission_id uuid REFERENCES public.assignment_submissions(id) ON DELETE SET NULL,
  title text,
  description text,
  status text NOT NULL DEFAULT 'created',
  progress integer NOT NULL DEFAULT 0,
  duration_seconds numeric,
  aspect_ratio text,
  width integer,
  height integer,
  playback_url text,
  dash_playback_url text,
  embed_url text,
  download_url text,
  thumbnail_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  preview_thumbnails_url text,
  animated_gif_url text,
  tags text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  transformations jsonb NOT NULL DEFAULT '{}'::jsonb,
  chapters jsonb NOT NULL DEFAULT '[]'::jsonb,
  error_code text,
  error_message text,
  warning jsonb,
  gumlet_created_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gumlet_live_assets (
  live_asset_id text PRIMARY KEY,
  live_source_id text,
  live_session_id uuid REFERENCES public.live_sessions(id) ON DELETE SET NULL,
  title text,
  status text NOT NULL DEFAULT 'created',
  is_active boolean NOT NULL DEFAULT false,
  embed_url text,
  playback_url text,
  stream_url text,
  recording_asset_id text,
  vod_collection_id text,
  recording_playback_url text,
  duration_seconds numeric,
  storage_size numeric,
  width integer,
  height integer,
  aspect_ratio text,
  resolution text[] NOT NULL DEFAULT '{}',
  error_code text,
  error_message text,
  gumlet_created_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gumlet_playlists (
  playlist_id text PRIMARY KEY,
  collection_id text NOT NULL,
  programme_id uuid REFERENCES public.programmes(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  player_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  asset_ids text[] NOT NULL DEFAULT '{}',
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gumlet_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  category text NOT NULL,
  asset_id text,
  live_asset_id text,
  playlist_id text,
  status text,
  token_verified boolean NOT NULL DEFAULT false,
  payload jsonb NOT NULL,
  processed boolean NOT NULL DEFAULT true,
  processing_notes text,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gumlet_video_assets_lesson_id ON public.gumlet_video_assets(lesson_id);
CREATE INDEX IF NOT EXISTS idx_gumlet_video_assets_status ON public.gumlet_video_assets(status);
CREATE INDEX IF NOT EXISTS idx_gumlet_live_assets_is_active ON public.gumlet_live_assets(is_active);
CREATE INDEX IF NOT EXISTS idx_gumlet_webhook_events_type ON public.gumlet_webhook_events(event_type, received_at DESC);

-- 3. Enable RLS and configure policies
ALTER TABLE public.gumlet_video_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gumlet_live_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gumlet_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gumlet_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gumlet_video_assets_read ON public.gumlet_video_assets;
CREATE POLICY gumlet_video_assets_read ON public.gumlet_video_assets
  FOR SELECT TO authenticated
  USING (status IN ('ready', 'stream_ready', 'optimized', 'repackaged') OR current_user_role() IN ('coach', 'admin'));

DROP POLICY IF EXISTS gumlet_video_assets_coach_write ON public.gumlet_video_assets;
CREATE POLICY gumlet_video_assets_coach_write ON public.gumlet_video_assets
  FOR ALL TO authenticated
  USING (current_user_role() IN ('coach', 'admin'))
  WITH CHECK (current_user_role() IN ('coach', 'admin'));

DROP POLICY IF EXISTS gumlet_live_assets_read ON public.gumlet_live_assets;
CREATE POLICY gumlet_live_assets_read ON public.gumlet_live_assets
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS gumlet_live_assets_coach_write ON public.gumlet_live_assets;
CREATE POLICY gumlet_live_assets_coach_write ON public.gumlet_live_assets
  FOR ALL TO authenticated
  USING (current_user_role() IN ('coach', 'admin'))
  WITH CHECK (current_user_role() IN ('coach', 'admin'));

DROP POLICY IF EXISTS gumlet_playlists_read ON public.gumlet_playlists;
CREATE POLICY gumlet_playlists_read ON public.gumlet_playlists
  FOR SELECT TO authenticated
  USING (NOT is_deleted OR current_user_role() IN ('coach', 'admin'));

DROP POLICY IF EXISTS gumlet_playlists_coach_write ON public.gumlet_playlists;
CREATE POLICY gumlet_playlists_coach_write ON public.gumlet_playlists
  FOR ALL TO authenticated
  USING (current_user_role() IN ('coach', 'admin'))
  WITH CHECK (current_user_role() IN ('coach', 'admin'));

DROP POLICY IF EXISTS gumlet_webhook_events_coach_read ON public.gumlet_webhook_events;
CREATE POLICY gumlet_webhook_events_coach_read ON public.gumlet_webhook_events
  FOR SELECT TO authenticated
  USING (current_user_role() IN ('coach', 'admin'));

-- 4. Seed the active GYCS Live Coaching Gumlet stream asset
INSERT INTO public.gumlet_live_assets (
  live_asset_id,
  live_source_id,
  title,
  status,
  is_active,
  embed_url,
  playback_url
) VALUES (
  '6adec989e655cfbd8127b254',
  '6adec52cd8b4449c83d2c8ec',
  'Search Engine Overview',
  'complete',
  false,
  'https://play.gumlet.io/embed/live/6adec989e655cfbd8127b254',
  'https://stream.gumlet.io/6adec52cd8b4449c83d2c8ec/6adec989e655cfbd8127b254/main.m3u8'
) ON CONFLICT (live_asset_id) DO NOTHING;
