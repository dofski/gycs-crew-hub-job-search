import React, { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface YachtingPort {
  id: string;
  label: string;
  countryCode: string;
  lat: number;
  lon: number;
}

export const YACHTING_PORTS: readonly YachtingPort[] = [
  { id: 'antibes', label: 'Antibes, France', countryCode: 'FR', lat: 43.58, lon: 7.12 },
  { id: 'palma', label: 'Palma de Mallorca, Spain', countryCode: 'ES', lat: 39.57, lon: 2.65 },
  { id: 'monaco', label: 'Monaco', countryCode: 'MC', lat: 43.73, lon: 7.42 },
  { id: 'fort-lauderdale', label: 'Fort Lauderdale, USA', countryCode: 'US', lat: 26.12, lon: -80.14 },
  { id: 'cape-town', label: 'Cape Town, South Africa', countryCode: 'ZA', lat: -33.91, lon: 18.42 },
  { id: 'la-ciotat', label: 'La Ciotat, France', countryCode: 'FR', lat: 43.17, lon: 5.61 },
  { id: 'barcelona', label: 'Barcelona, Spain', countryCode: 'ES', lat: 41.38, lon: 2.18 },
  { id: 'genoa', label: 'Genoa, Italy', countryCode: 'IT', lat: 44.41, lon: 8.93 },
  { id: 'viareggio', label: 'Viareggio, Italy', countryCode: 'IT', lat: 43.87, lon: 10.25 },
  { id: 'toulon', label: 'Toulon, France', countryCode: 'FR', lat: 43.12, lon: 5.93 },
  { id: 'gibraltar', label: 'Gibraltar', countryCode: 'GI', lat: 36.14, lon: -5.35 },
  { id: 'valletta', label: 'Valletta, Malta', countryCode: 'MT', lat: 35.9, lon: 14.51 },
  { id: 'sint-maarten', label: 'Simpson Bay, Sint Maarten', countryCode: 'SX', lat: 18.04, lon: -63.09 },
  { id: 'newport', label: 'Newport, RI, USA', countryCode: 'US', lat: 41.49, lon: -71.31 },
  { id: 'auckland', label: 'Auckland, New Zealand', countryCode: 'NZ', lat: -36.84, lon: 174.76 },
];

function privacyDisplayName(name: string): string {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'Crew Member';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]?.toUpperCase() || ''}.`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100';
const buttonClass = 'rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50';
const secondaryButtonClass = 'rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-200 disabled:opacity-50';
const panelClass = 'rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4';

export function CrewMapLocationSettings({
  db,
  userId,
  profile,
  mapCard,
  currentLocation,
  vesselLink,
  busy,
  onRun,
}: {
  db: SupabaseClient;
  userId: string;
  profile: Record<string, any>;
  mapCard: Record<string, any> | null;
  currentLocation: Record<string, any> | null;
  vesselLink: Record<string, any> | null;
  busy: boolean;
  onRun: (action: () => Promise<unknown>, message?: string) => Promise<void>;
}) {
  const sharingEnabled = Boolean(mapCard?.sharing_enabled);
  const [portQuery, setPortQuery] = useState('');
  const [selectedPortId, setSelectedPortId] = useState(YACHTING_PORTS[0].id);
  const [customCity, setCustomCity] = useState('');
  const [customCountry, setCustomCountry] = useState(profile?.country_code || 'FR');
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');
  const [useCustomCity, setUseCustomCity] = useState(false);

  const [headline, setHeadline] = useState(mapCard?.headline || '');
  const [department, setDepartment] = useState(mapCard?.department || 'deck');
  const [skillsInput, setSkillsInput] = useState(
    Array.isArray(mapCard?.skills) ? mapCard.skills.join(', ') : '',
  );
  const [availableFrom, setAvailableFrom] = useState(mapCard?.available_from || '');
  const [availabilityNote, setAvailabilityNote] = useState(mapCard?.availability_note || '');
  const [showPhoto, setShowPhoto] = useState(Boolean(mapCard?.show_photo));

  const filteredPorts = YACHTING_PORTS.filter((p) =>
    p.label.toLowerCase().includes(portQuery.trim().toLowerCase()),
  );
  const selectedPort =
    YACHTING_PORTS.find((p) => p.id === selectedPortId) || filteredPorts[0] || YACHTING_PORTS[0];

  const previewSkills = skillsInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);

  const deptLabel =
    department === 'deck'
      ? 'Deck'
      : department === 'interior'
        ? 'Interior'
        : department === 'engineering'
          ? 'Engineering'
          : department === 'galley'
            ? 'Galley'
            : 'Crew';

  const previewPlace = currentLocation?.place_label || 'Location not updated';
  const previewExpiry = currentLocation?.expires_at
    ? new Date(currentLocation.expires_at).toLocaleString()
    : null;

  async function toggleSharing(nextEnabled: boolean) {
    await onRun(
      async () => {
        const consentRes = await db.from('consent_records').insert({
          user_id: userId,
          consent_type: 'location_sharing',
          status: nextEnabled ? 'granted' : 'withdrawn',
        });
        if (consentRes.error) throw new Error(consentRes.error.message);

        const upsertRes = await db.from('crew_map_cards').upsert(
          {
            user_id: userId,
            headline: headline.trim().slice(0, 80) || null,
            department: department || 'deck',
            skills: previewSkills,
            available_from: availableFrom || null,
            availability_note: availabilityNote.trim().slice(0, 120) || null,
            sharing_enabled: nextEnabled,
            show_photo: showPhoto,
            consent_version: '2026-10-v1',
          },
          { onConflict: 'user_id' },
        );
        if (upsertRes.error) throw new Error(upsertRes.error.message);
      },
      nextEnabled
        ? 'Location sharing enabled and consent recorded. You can now check in at a port.'
        : 'Location sharing disabled, consent withdrawn, and your current map position has been deleted.',
    );
  }

  async function saveCardFields(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onRun(async () => {
      const res = await db.from('crew_map_cards').upsert(
        {
          user_id: userId,
          headline: headline.trim().slice(0, 80) || null,
          department: department || 'deck',
          skills: previewSkills,
          available_from: availableFrom || null,
          availability_note: availabilityNote.trim().slice(0, 120) || null,
          sharing_enabled: sharingEnabled,
          show_photo: showPhoto,
          consent_version: mapCard?.consent_version || '2026-10-v1',
        },
        { onConflict: 'user_id' },
      );
      if (res.error) throw new Error(res.error.message);
    }, 'Crew map card saved.');
  }

  async function handlePortCheckIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sharingEnabled) return;
    const placeLabel = useCustomCity ? customCity.trim() : selectedPort.label;
    const countryCode = useCustomCity
      ? customCountry.trim().toUpperCase()
      : selectedPort.countryCode;
    const lat = useCustomCity ? round2(Number(customLat)) : round2(selectedPort.lat);
    const lon = useCustomCity ? round2(Number(customLon)) : round2(selectedPort.lon);

    if (!placeLabel || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      return;
    }

    await onRun(async () => {
      const expiresAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
      const res = await db.from('crew_locations_current').upsert(
        {
          user_id: userId,
          source: 'port_checkin',
          place_label: placeLabel.slice(0, 80),
          country_code: countryCode.length === 2 ? countryCode : null,
          lat,
          lon,
          expires_at: expiresAt,
        },
        { onConflict: 'user_id' },
      );
      if (res.error) throw new Error(res.error.message);
    }, `Checked in at ${placeLabel} (rounded to ~1 km · expires in 72 hours).`);
  }

  async function handleClearCheckIn() {
    await onRun(async () => {
      const res = await db
        .from('crew_locations_current')
        .delete()
        .eq('user_id', userId);
      if (res.error) throw new Error(res.error.message);
    }, 'Current port check-in deleted.');
  }

  async function handleSaveVessel(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const vesselName = String(fd.get('vessel_name') || '').trim();
    const mmsi = String(fd.get('mmsi') || '').trim() || null;
    const imo = String(fd.get('imo') || '').trim() || null;
    const relationship = String(fd.get('relationship') || 'crew_onboard');
    const showOnMap = fd.get('show_on_map') === 'on';

    await onRun(async () => {
      const res = await db.from('crew_vessel_links').upsert(
        {
          user_id: userId,
          vessel_name: vesselName.slice(0, 80),
          mmsi,
          imo,
          relationship,
          show_on_map: showOnMap,
        },
        { onConflict: 'user_id' },
      );
      if (res.error) throw new Error(res.error.message);
    }, 'Declared vessel link saved.');
  }

  return (
    <div className="space-y-5" id="location-sharing">
      <section className={panelClass}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">M/Y Eye · Private Location Sharing</h2>
            <p className="text-xs text-slate-400">
              Share your current port/city with your assigned GYCS coach on searchengine.chaddewet.com
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            aria-pressed={sharingEnabled}
            onClick={() => void toggleSharing(!sharingEnabled)}
            className={
              sharingEnabled
                ? 'rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white'
                : buttonClass
            }
          >
            {sharingEnabled ? 'Turn sharing OFF' : 'Turn sharing ON'}
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300 space-y-2">
          <p>
            <strong>Who sees it:</strong> Only you and your active assigned GYCS coach. Administrators have no map access by default, and there is no cohort or public view.
          </p>
          <p>
            <strong>How long it lasts:</strong> Each port check-in is rounded to 2 decimal places (~1 km) and automatically expires after 72 hours. Only your current position is stored — no movement history is kept.
          </p>
          <p>
            <strong>How to delete it:</strong> Turning location sharing OFF immediately deletes your current position row from the database and records a consent withdrawal.
          </p>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className={panelClass}>
          <h3 className="text-base font-bold">1. Check in at a port</h3>
          <p className="text-xs text-slate-400">
            Select a superyacht port or enter a city. Uses the port&apos;s coordinates (rounded to ~1 km) and expires in 72 hours.
          </p>
          {!sharingEnabled && (
            <p className="rounded-lg border border-amber-700/60 bg-amber-950/40 p-3 text-xs text-amber-200">
              Turn location sharing ON above before checking in at a port.
            </p>
          )}
          <form onSubmit={handlePortCheckIn} className="space-y-3">
            <div className="flex gap-3 text-xs">
              <button
                type="button"
                onClick={() => setUseCustomCity(false)}
                className={!useCustomCity ? buttonClass : secondaryButtonClass}
              >
                Yachting port list
              </button>
              <button
                type="button"
                onClick={() => setUseCustomCity(true)}
                className={useCustomCity ? buttonClass : secondaryButtonClass}
              >
                Custom city
              </button>
            </div>

            {!useCustomCity ? (
              <>
                <label className="block text-sm">
                  Filter ports
                  <input
                    type="search"
                    placeholder="Search Antibes, Palma, Monaco, Fort Lauderdale, Cape Town..."
                    value={portQuery}
                    onChange={(e) => setPortQuery(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm">
                  Select yachting port
                  <select
                    value={selectedPort.id}
                    onChange={(e) => setSelectedPortId(e.target.value)}
                    className={inputClass}
                  >
                    {filteredPorts.map((port) => (
                      <option key={port.id} value={port.id}>
                        {port.label} ({port.lat.toFixed(2)}, {port.lon.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">
                  Port or city label
                  <input
                    required
                    maxLength={80}
                    placeholder="e.g. Imperia, Italy"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm">
                  Country code (2-letter)
                  <input
                    required
                    maxLength={2}
                    value={customCountry}
                    onChange={(e) => setCustomCountry(e.target.value.toUpperCase())}
                    className={inputClass}
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block text-sm">
                    Latitude
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="-90"
                      max="90"
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-sm">
                    Longitude
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="-180"
                      max="180"
                      value={customLon}
                      onChange={(e) => setCustomLon(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={busy || !sharingEnabled} className={buttonClass}>
                Check in (72h)
              </button>
              {currentLocation && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleClearCheckIn()}
                  className={secondaryButtonClass}
                >
                  Delete current check-in
                </button>
              )}
            </div>
          </form>
        </section>

        <section className={panelClass}>
          <h3 className="text-base font-bold">2. Link my vessel (declared by member)</h3>
          <p className="text-xs text-slate-400">
            Optional vessel declaration. On M/Y Eye, a linked vessel marker is labelled &ldquo;Vessel position (linked), not confirmed crew location&rdquo;.
          </p>
          <form onSubmit={handleSaveVessel} className="space-y-3">
            <label className="block text-sm">
              Vessel name *
              <input
                name="vessel_name"
                required
                maxLength={80}
                defaultValue={vesselLink?.vessel_name || ''}
                placeholder="e.g. M/Y Solaris"
                className={inputClass}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                MMSI (9 digits)
                <input
                  name="mmsi"
                  pattern="^[0-9]{9}$"
                  maxLength={9}
                  defaultValue={vesselLink?.mmsi || ''}
                  placeholder="319123456"
                  className={inputClass}
                />
              </label>
              <label className="block text-sm">
                IMO (7 digits)
                <input
                  name="imo"
                  pattern="^[0-9]{7}$"
                  maxLength={7}
                  defaultValue={vesselLink?.imo || ''}
                  placeholder="9876543"
                  className={inputClass}
                />
              </label>
            </div>
            <label className="block text-sm">
              Relationship
              <select
                name="relationship"
                defaultValue={vesselLink?.relationship || 'daywork'}
                className={inputClass}
              >
                <option value="crew_onboard">Permanent / seasonal crew onboard</option>
                <option value="daywork">Daywork</option>
                <option value="interviewing">Interviewing / trial</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="show_on_map"
                defaultChecked={Boolean(vesselLink?.show_on_map)}
              />
              Show declared vessel on coach map card
            </label>
            <button type="submit" disabled={busy} className={buttonClass}>
              Save vessel link
            </button>
          </form>
        </section>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <section className={panelClass}>
          <h3 className="text-base font-bold">3. Coach map card fields</h3>
          <form onSubmit={saveCardFields} className="space-y-3">
            <label className="block text-sm">
              Department
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={inputClass}
              >
                <option value="deck">Deck</option>
                <option value="interior">Interior</option>
                <option value="engineering">Engineering</option>
                <option value="galley">Galley</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block text-sm">
              Headline (max 80 chars)
              <input
                maxLength={80}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Deckhand · Seeking daywork"
                className={inputClass}
              />
            </label>
            <label className="block text-sm">
              Skills (comma-separated, up to 8)
              <input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Tender handling, Hospitality, Washdowns"
                className={inputClass}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Available from
                <input
                  type="date"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm">
                Availability note
                <input
                  maxLength={120}
                  value={availabilityNote}
                  onChange={(e) => setAvailabilityNote(e.target.value)}
                  placeholder="Ready in Antibes"
                  className={inputClass}
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showPhoto}
                onChange={(e) => setShowPhoto(e.target.checked)}
              />
              Show profile photo on coach map card (uses 10-minute signed URL)
            </label>
            <button type="submit" disabled={busy} className={buttonClass}>
              Save map card fields
            </button>
          </form>
        </section>

        <section className={panelClass} aria-label="Coach card preview">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">4. Preview: what your coach sees</h3>
            <span className="rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-0.5 text-xs text-emerald-300">
              {sharingEnabled ? 'Sharing ON' : 'Sharing OFF (hidden from coach)'}
            </span>
          </div>
          <div className="rounded-xl border border-cyan-500/30 bg-slate-950 p-4 space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/50 bg-slate-900 font-mono text-xs font-bold text-emerald-300">
                {showPhoto ? 'PHOTO' : privacyDisplayName(profile?.display_name).slice(0, 2).toUpperCase()}
              </div>
              <div>
                <strong className="block text-base text-white">
                  {privacyDisplayName(profile?.display_name)}
                </strong>
                <span className="text-xs text-slate-300">
                  {deptLabel}
                  {headline ? ` · ${headline}` : ''}
                </span>
              </div>
            </div>
            <p className="font-semibold text-cyan-200">{previewPlace}</p>
            <p className="text-xs text-slate-400">
              {currentLocation
                ? `Port check-in · expires ${previewExpiry}`
                : 'No active port check-in (card shows "Location not updated" and no globe marker)'}
            </p>
            <p className="text-xs text-slate-200">
              Skills: {previewSkills.length ? previewSkills.join(' · ') : 'none listed'}
            </p>
            <p className="text-xs text-slate-200">
              {availableFrom ? `Available from ${availableFrom}` : 'Availability: not specified'}
              {availabilityNote ? ` · ${availabilityNote}` : ''}
            </p>
            <p className="text-xs text-slate-200">
              Vessel:{' '}
              {vesselLink?.show_on_map && vesselLink?.vessel_name
                ? `${vesselLink.vessel_name}${vesselLink.mmsi ? ` (MMSI ${vesselLink.mmsi})` : ''} · declared by member`
                : 'none linked'}
            </p>
            <p className="text-[11px] text-slate-500 pt-1">
              Phone, email, passport, medical documents, and coaching notes are never returned to the map.
            </p>
          </div>
          <a
            href="https://searchengine.chaddewet.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-emerald-300 underline"
          >
            Open M/Y Eye map (searchengine.chaddewet.com) ↗
          </a>
        </section>
      </div>
    </div>
  );
}
