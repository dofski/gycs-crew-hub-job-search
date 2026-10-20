-- supabase/seed.sql
-- Development seed data for GYCS Crew Hub

-- Organisations
INSERT INTO public.organisations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Green Yacht Crew Solutions', 'gycs')
ON CONFLICT (slug) DO NOTHING;

-- Seed coach Chad de Wet
INSERT INTO public.profiles (id, organisation_id, role, display_name, email, country_code, timezone, is_active)
VALUES (
  'c0ac4000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'coach',
  'Chad de Wet',
  'chad@greenyachtcrew.co.za',
  'ZA',
  'Africa/Johannesburg',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Seed member Sarah van der Merwe (Deckhand track, Cape Town)
INSERT INTO public.profiles (id, organisation_id, role, display_name, email, country_code, timezone, journey_state, is_active)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'member',
  'Sarah van der Merwe',
  'sarah.vdm@example.co.za',
  'ZA',
  'Africa/Johannesburg',
  'preparing',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Seed member Thabo Ndlovu (Interior/Steward track, Durban)
INSERT INTO public.profiles (id, organisation_id, role, display_name, email, country_code, timezone, journey_state, is_active)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000001',
  'member',
  'Thabo Ndlovu',
  'thabo.ndlovu@example.co.za',
  'ZA',
  'Africa/Johannesburg',
  'profile_ready',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Seed member Liam Botha (Deckhand track, Interviewing / Antibes)
INSERT INTO public.profiles (id, organisation_id, role, display_name, email, country_code, timezone, journey_state, is_active)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'member',
  'Liam Botha',
  'liam.botha@example.co.za',
  'ZA',
  'Africa/Johannesburg',
  'interviewing',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Assign coach Chad to members
INSERT INTO public.coach_assignments (coach_id, member_id, notes)
VALUES
  ('c0ac4000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Assigned Zero to First Contract cohort lead'),
  ('c0ac4000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Interior candidate mentorship'),
  ('c0ac4000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Active search support in Antibes')
ON CONFLICT DO NOTHING;
