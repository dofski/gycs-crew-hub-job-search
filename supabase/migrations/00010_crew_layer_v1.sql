-- M/Y Eye crew layer migration for Supabase project wfblxexdqlxeequvywfc

-- 1. Consent type for location sharing
alter type public.consent_type add value if not exists 'location_sharing';

-- 2. Map-safe profile card + sharing switch (one row per member)
create table if not exists public.crew_map_cards (
  user_id           uuid primary key references public.profiles(id) on delete cascade,
  headline          text check (char_length(headline) <= 80),
  department        text check (department in ('deck','interior','engineering','galley','other')),
  skills            text[] not null default '{}' check (cardinality(skills) <= 8),
  available_from    date,
  availability_note text check (char_length(availability_note) <= 120),
  sharing_enabled   boolean not null default false,
  show_photo        boolean not null default false,
  consent_version   text,
  updated_at        timestamptz not null default now()
);

-- 3. Current location only (no history). One row per member.
create table if not exists public.crew_locations_current (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  source       text not null check (source in ('port_checkin','vessel_link')),
  place_label  text not null check (char_length(place_label) <= 80),
  country_code text check (char_length(country_code) = 2),
  lat          double precision not null check (lat between -90 and 90),
  lon          double precision not null check (lon between -180 and 180),
  observed_at  timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '72 hours',
  check (expires_at > observed_at and expires_at <= observed_at + interval '14 days')
);

-- 4. Member-declared vessel link
create table if not exists public.crew_vessel_links (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  vessel_name  text not null check (char_length(vessel_name) <= 80),
  mmsi         text check (mmsi ~ '^[0-9]{9}$'),
  imo          text check (imo ~ '^[0-9]{7}$'),
  relationship text not null check (relationship in ('crew_onboard','daywork','interviewing')),
  show_on_map  boolean not null default false,
  declared_at  timestamptz not null default now()
);

-- 5. RLS: owner-only direct access. No coach/admin/public table reads.
alter table public.crew_map_cards         enable row level security;
alter table public.crew_locations_current enable row level security;
alter table public.crew_vessel_links      enable row level security;

drop policy if exists crew_cards_own on public.crew_map_cards;
create policy crew_cards_own on public.crew_map_cards
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists crew_loc_own on public.crew_locations_current;
create policy crew_loc_own on public.crew_locations_current
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists crew_vessel_own on public.crew_vessel_links;
create policy crew_vessel_own on public.crew_vessel_links
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Keep updated_at current on crew_map_cards
create or replace function public.crew_cards_touch_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists crew_cards_touch_updated_at on public.crew_map_cards;
create trigger crew_cards_touch_updated_at
  before update on public.crew_map_cards
  for each row execute function public.crew_cards_touch_updated_at();

-- A location may only exist while sharing is on.
create or replace function public.crew_location_requires_sharing()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.crew_map_cards c where c.user_id = new.user_id and c.sharing_enabled) then
    raise exception 'Location sharing is off';
  end if;
  new.observed_at := now();  -- server time, not client-supplied
  return new;
end $$;

drop trigger if exists crew_location_requires_sharing on public.crew_locations_current;
create trigger crew_location_requires_sharing
  before insert or update on public.crew_locations_current
  for each row execute function public.crew_location_requires_sharing();

-- Turning sharing off deletes the current position.
create or replace function public.crew_sharing_off_clears_location()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.sharing_enabled and not new.sharing_enabled then
    delete from public.crew_locations_current where user_id = new.user_id;
  end if;
  return new;
end $$;

drop trigger if exists crew_sharing_off_clears_location on public.crew_map_cards;
create trigger crew_sharing_off_clears_location
  after update of sharing_enabled on public.crew_map_cards
  for each row execute function public.crew_sharing_off_clears_location();

-- 6. The only cross-user read path: self + actively assigned members.
create or replace function public.crew_map_snapshot()
returns table (
  user_id uuid, is_self boolean, display_name text, avatar_url text,
  headline text, department text, skills text[], available_from date, availability_note text,
  source text, place_label text, country_code text, lat double precision, lon double precision,
  observed_at timestamptz, expires_at timestamptz,
  vessel_name text, mmsi text, vessel_relationship text
)
language sql stable security definer set search_path = public as $$
  with viewer as (select auth.uid() as id),
  visible as (
    select v.id as member_id, true as is_self from viewer v where v.id is not null
    union
    select ca.member_id, false as is_self
    from public.coach_assignments ca
    join viewer v on ca.coach_id = v.id
    join public.profiles p on p.id = v.id and p.role = 'coach' and p.is_active
    where ca.ended_at is null and ca.member_id <> v.id
  )
  select distinct on (pr.id)
    pr.id as user_id,
    vis.is_self,
    -- first name + initial only
    split_part(btrim(pr.display_name), ' ', 1) ||
      coalesce(' ' || left(nullif(split_part(btrim(pr.display_name), ' ', 2), ''), 1) || '.', '') as display_name,
    case when c.show_photo then pr.avatar_url end as avatar_url,
    c.headline, c.department, c.skills, c.available_from, c.availability_note,
    l.source, l.place_label, l.country_code,
    round(l.lat::numeric, 2)::double precision as lat,
    round(l.lon::numeric, 2)::double precision as lon,
    l.observed_at, l.expires_at,
    case when vl.show_on_map then vl.vessel_name end as vessel_name,
    case when vl.show_on_map then vl.mmsi end as mmsi,
    case when vl.show_on_map then vl.relationship end as vessel_relationship
  from visible vis
  join public.profiles pr on pr.id = vis.member_id and pr.is_active
  join public.crew_map_cards c on c.user_id = pr.id and (c.sharing_enabled or vis.is_self)
  left join public.crew_locations_current l on l.user_id = pr.id and l.expires_at > now()
  left join public.crew_vessel_links vl on vl.user_id = pr.id
  order by pr.id, vis.is_self desc
$$;

revoke all on function public.crew_map_snapshot() from public, anon;
grant execute on function public.crew_map_snapshot() to authenticated;
