import React, { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  COACHING_PROGRAMMES,
  formatCoachingProgrammeLabel,
  formatUserRoleLabel,
  isCrewRole,
  resolvePathwayUserRole,
  type CoachingProgrammeType,
} from '../../lib/roles';

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none';
const buttonClass =
  'rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition';
const panelClass = 'rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-5';

export interface ProfileEditorProps {
  db: SupabaseClient;
  userId: string;
  profile: Record<string, any>;
  mapCard: Record<string, any> | null;
  vesselLink: Record<string, any> | null;
  intakeRow: Record<string, any> | null;
  busy: boolean;
  onRun: (action: () => Promise<unknown>, message?: string) => Promise<void>;
  onNavigateToLocationTab: () => void;
}

export function ProfileEditor({
  db,
  userId,
  profile,
  mapCard,
  vesselLink,
  intakeRow,
  busy,
  onRun,
  onNavigateToLocationTab,
}: ProfileEditorProps) {
  const intakePayload = (intakeRow?.payload || {}) as Record<string, any>;

  // 1. Core Identity & Contact Parameters (public.profiles)
  const [displayName, setDisplayName] = useState<string>(profile?.display_name || '');
  const [phone, setPhone] = useState<string>(profile?.phone || '');
  const [countryCode, setCountryCode] = useState<string>(profile?.country_code || 'ZA');
  const [timezone, setTimezone] = useState<string>(profile?.timezone || 'Africa/Johannesburg');
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatar_url || '');

  // 2. Career Direction, Availability & Coach Map Card Parameters (public.crew_map_cards)
  const [department, setDepartment] = useState<string>(
    mapCard?.department || intakePayload?.department || 'deck'
  );
  const [coachingProgramme, setCoachingProgramme] = useState<CoachingProgrammeType>(
    profile?.coaching_programme === 'one_on_one' ? 'one_on_one' : 'group'
  );
  const matchedPathwayRole = resolvePathwayUserRole(department, profile?.pathway_selection, profile?.role);
  const [headline, setHeadline] = useState<string>(
    mapCard?.headline || ''
  );
  const [skillsText, setSkillsText] = useState<string>(
    Array.isArray(mapCard?.skills) && mapCard.skills.length
      ? mapCard.skills.join(', ')
      : String(intakePayload?.skills || '')
  );
  const [availableFrom, setAvailableFrom] = useState<string>(mapCard?.available_from || '');
  const [availabilityNote, setAvailabilityNote] = useState<string>(
    mapCard?.availability_note || String(intakePayload?.availability || '')
  );
  const [sharingEnabled, setSharingEnabled] = useState<boolean>(Boolean(mapCard?.sharing_enabled));
  const [showPhoto, setShowPhoto] = useState<boolean>(Boolean(mapCard?.show_photo));

  // 3. Declared Vessel Link Parameters (public.crew_vessel_links)
  const [vesselName, setVesselName] = useState<string>(vesselLink?.vessel_name || '');
  const [vesselMmsi, setVesselMmsi] = useState<string>(vesselLink?.mmsi || '');
  const [vesselImo, setVesselImo] = useState<string>(vesselLink?.imo || '');
  const [vesselRelationship, setVesselRelationship] = useState<string>(
    vesselLink?.relationship || 'daywork'
  );
  const [showVesselOnMap, setShowVesselOnMap] = useState<boolean>(Boolean(vesselLink?.show_on_map));

  async function handleSaveAllProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalizedCountry = countryCode.trim().toUpperCase().slice(0, 2) || 'ZA';
    const parsedSkills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 12);

    await onRun(async () => {
      // 1. Update public.profiles (exact 5 member-writable columns)
      const profRes = await db
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          phone: phone.trim() || null,
          country_code: normalizedCountry,
          timezone: timezone.trim() || 'Africa/Johannesburg',
          avatar_url: avatarUrl.trim() || null,
        })
        .eq('id', userId)
        .select('id')
        .single();
      if (profRes.error) throw new Error(profRes.error.message);

      // 2. Upsert public.crew_map_cards (career profile & availability parameters)
      const validDept = ['deck', 'interior', 'engineering', 'galley', 'other'].includes(department)
        ? department
        : 'deck';
      const cardRes = await db.from('crew_map_cards').upsert(
        {
          user_id: userId,
          department: validDept,
          headline: headline.trim().slice(0, 80) || null,
          skills: parsedSkills,
          available_from: availableFrom || null,
          availability_note: availabilityNote.trim().slice(0, 120) || null,
          sharing_enabled: sharingEnabled,
          show_photo: showPhoto,
          consent_version: mapCard?.consent_version || '2026-10-v1',
        },
        { onConflict: 'user_id' }
      );
      if (cardRes.error) throw new Error(cardRes.error.message);

      // 2b. Sync pathway-matched user role and coaching programme
      const syncRole = resolvePathwayUserRole(validDept, undefined, profile?.role);
      await db.rpc('gycs_sync_member_pathway_role', {
        p_department: validDept,
        p_pathway_selection: syncRole,
        p_coaching_programme: coachingProgramme,
      });

      // 3. Upsert public.crew_vessel_links if a vessel name is provided
      if (vesselName.trim()) {
        const vesselRes = await db.from('crew_vessel_links').upsert(
          {
            user_id: userId,
            vessel_name: vesselName.trim().slice(0, 80),
            mmsi: vesselMmsi.trim() || null,
            imo: vesselImo.trim() || null,
            relationship: vesselRelationship || 'daywork',
            show_on_map: showVesselOnMap,
          },
          { onConflict: 'user_id' }
        );
        if (vesselRes.error) throw new Error(vesselRes.error.message);
      }
    }, 'All profile, career availability, and vessel parameters saved to Supabase.');
  }

  return (
    <section className={panelClass}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-12 w-12 rounded-full border border-emerald-500/40 object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/40 bg-slate-950 font-mono text-sm font-bold text-emerald-300">
              {(displayName || 'CM').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-white">My Profile &amp; Career Parameters</h2>
            <p className="text-xs text-slate-400">
              Account Email: <strong className="text-slate-200">{profile?.email}</strong> · Role:{' '}
              <span className="uppercase font-mono text-emerald-400">
                {formatUserRoleLabel(isCrewRole(profile?.role) ? matchedPathwayRole : profile?.role)} ({profile?.role})
              </span>{' '}
              · Program:{' '}
              <span className="font-mono text-amber-300">
                {formatCoachingProgrammeLabel(profile?.coaching_programme || coachingProgramme)}
              </span>{' '}
              · Stage: <span className="font-mono text-sky-300">{profile?.journey_state || 'exploring'}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToLocationTab}
          className="text-xs font-semibold text-emerald-300 underline"
        >
          Open Port Check-In &amp; M/Y Eye Map Controls →
        </button>
      </div>

      <form onSubmit={handleSaveAllProfile} className="space-y-6">
        {/* Section 1: Identity & Contact Parameters (public.profiles) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            1. Personal Identity &amp; Contact Details
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-300">
              Display / Full Name *
              <input
                name="display_name"
                required
                maxLength={120}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Chad de Wet"
                className={`${inputClass} mt-1`}
              />
            </label>

            <label className="block text-xs font-semibold text-slate-300">
              Phone / WhatsApp Number
              <input
                name="phone"
                type="tel"
                maxLength={40}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +27 82 555 1234"
                className={`${inputClass} mt-1`}
              />
            </label>

            <label className="block text-xs font-semibold text-slate-300">
              Country Code (2-Letter ISO) *
              <input
                name="country_code"
                required
                maxLength={2}
                pattern="[A-Za-z]{2}"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                placeholder="ZA, GB, FR, US"
                className={`${inputClass} mt-1 uppercase`}
              />
            </label>

            <label className="block text-xs font-semibold text-slate-300">
              Timezone *
              <input
                name="timezone"
                required
                maxLength={80}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Africa/Johannesburg or Europe/Paris"
                className={`${inputClass} mt-1`}
              />
            </label>

            <label className="block text-xs font-semibold text-slate-300 sm:col-span-2">
              Profile Photo / Avatar URL
              <input
                name="avatar_url"
                type="url"
                maxLength={500}
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/your-profile-photo.jpg"
                className={`${inputClass} mt-1`}
              />
            </label>
          </div>
        </div>

        {/* Section 2: Career Direction, Skills & Availability (public.crew_map_cards) */}
        <div className="space-y-3 border-t border-slate-800 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            2. Department, Target Role, Skills &amp; Availability
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-300">
              Pathway Selection &amp; Matched User Role
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`${inputClass} mt-1`}
              >
                <option value="deck">Deck Pathway → Role: Deckhand</option>
                <option value="interior">Interior Pathway → Role: Steward / Stewardess</option>
                <option value="engineering">Engineering Pathway → Role: Engineer</option>
                <option value="galley">Galley / Culinary Pathway → Role: Chef</option>
                <option value="other">Other / Undecided → Role: Crew Member</option>
              </select>
            </label>

            <label className="block text-xs font-semibold text-slate-300">
              Coaching Program Selection
              <select
                value={coachingProgramme}
                onChange={(e) => setCoachingProgramme(e.target.value as CoachingProgrammeType)}
                className={`${inputClass} mt-1`}
              >
                <option value="one_on_one">{COACHING_PROGRAMMES.one_on_one.title}</option>
                <option value="group">{COACHING_PROGRAMMES.group.title}</option>
              </select>
            </label>

            <label className="block text-xs font-semibold text-slate-300 sm:col-span-2">
              Target Role &amp; Career Headline (max 80 chars)
              <input
                maxLength={80}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Junior Deckhand · RYA PB2 · Seeking Med Season"
                className={`${inputClass} mt-1`}
              />
            </label>

            <label className="block text-xs font-semibold text-slate-300 sm:col-span-2">
              Key Crew Skills (comma-separated, up to 12)
              <input
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="e.g. Tender handling, Line splicing, Teak maintenance, Washdowns, Silver service"
                className={`${inputClass} mt-1`}
              />
            </label>

            <label className="block text-xs font-semibold text-slate-300">
              Available From Date
              <input
                type="date"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                className={`${inputClass} mt-1`}
              />
            </label>

            <label className="block text-xs font-semibold text-slate-300">
              Availability, Port Hub &amp; Runway Notes (max 120 chars)
              <input
                maxLength={120}
                value={availabilityNote}
                onChange={(e) => setAvailabilityNote(e.target.value)}
                placeholder="e.g. 6 months runway · Relocating to Antibes in May"
                className={`${inputClass} mt-1`}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-6 pt-2 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sharingEnabled}
                onChange={(e) => setSharingEnabled(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span>Enable private coach profile card sharing on M/Y Eye</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPhoto}
                onChange={(e) => setShowPhoto(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span>Show my profile photo on my coach card</span>
            </label>
          </div>
        </div>

        {/* Section 3: Declared Vessel Link (public.crew_vessel_links) */}
        <div className="space-y-3 border-t border-slate-800 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            3. Declared Vessel Link (Optional)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-300">
              Vessel Name
              <input
                maxLength={80}
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
                placeholder="e.g. M/Y Solaris (45m Feadship)"
                className={`${inputClass} mt-1`}
              />
            </label>

            <label className="block text-xs font-semibold text-slate-300">
              Vessel Relationship
              <select
                value={vesselRelationship}
                onChange={(e) => setVesselRelationship(e.target.value)}
                className={`${inputClass} mt-1`}
              >
                <option value="crew_onboard">Permanent / Seasonal Crew Onboard</option>
                <option value="daywork">Daywork</option>
                <option value="interviewing">Interviewing / Sea Trial</option>
              </select>
            </label>

            <label className="block text-xs font-semibold text-slate-300">
              Vessel MMSI (9 digits, optional)
              <input
                pattern="^[0-9]{9}$"
                maxLength={9}
                value={vesselMmsi}
                onChange={(e) => setVesselMmsi(e.target.value)}
                placeholder="e.g. 319123456"
                className={`${inputClass} mt-1`}
              />
            </label>

            <label className="block text-xs font-semibold text-slate-300">
              Vessel IMO (7 digits, optional)
              <input
                pattern="^[0-9]{7}$"
                maxLength={7}
                value={vesselImo}
                onChange={(e) => setVesselImo(e.target.value)}
                placeholder="e.g. 9876543"
                className={`${inputClass} mt-1`}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 pt-1 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showVesselOnMap}
              onChange={(e) => setShowVesselOnMap(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <span>Display declared vessel on my private coach map card</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-4">
          <p className="text-xs text-slate-400">
            Email, account role, and organisation membership are managed by Supabase Auth &amp; governance policies.
          </p>
          <button type="submit" disabled={busy} className={buttonClass}>
            {busy ? 'Saving Profile...' : 'Save Complete Profile'}
          </button>
        </div>
      </form>
    </section>
  );
}
