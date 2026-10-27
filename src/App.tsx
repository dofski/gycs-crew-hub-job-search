/** @license SPDX-License-Identifier: Apache-2.0 */
import React, { useEffect, useRef, useState } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';
import { ApplicationTracker } from './components/applications/ApplicationTracker.tsx';
import { CVStudio } from './components/cv/CVStudio.tsx';
import { DocumentVault } from './components/documents/DocumentVault.tsx';
import { LearningHub } from './components/learn/LearningHub.tsx';
import { LiveRoom } from './components/live/LiveRoom.tsx';
import { OpportunityBoard } from './components/opportunities/OpportunityBoard.tsx';
import { MilestoneTimeline } from './components/pathway/MilestoneTimeline.tsx';
import { CrewMapLocationSettings } from './components/settings/CrewMapLocationSettings.tsx';
import { ProfileEditor } from './components/settings/ProfileEditor.tsx';
import { LaunchpadWorksheets } from './components/worksheets/LaunchpadWorksheets.tsx';
import { SOURCED_REQUIREMENTS, type Department, type Milestone, type ReadinessDimension, type Requirement } from './lib/constants.ts';
import { LAUNCHPAD_INFRASTRUCTURE, LAUNCHPAD_PHASES, PORT_RUNWAY_BENCHMARKS } from './lib/launchpad-syllabus.ts';
import { ThemeSwitcher } from './lib/theme.tsx';
import {
  COACHING_PROGRAMMES,
  PATHWAY_ROLE_OPTIONS,
  formatCoachingProgrammeLabel,
  formatUserRoleLabel,
  isStaffRole,
  isSuperAdminRole,
  resolvePathwayUserRole,
  type CoachingProgrammeType,
} from './lib/roles.ts';
import type { Application, CVData, Opportunity } from './types/database.ts';

type Row = Record<string, any>;
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
function publicKey(value: string): boolean {
  if (value?.startsWith('sb_publishable_')) return true;
  try {
    const part = value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(part.padEnd(Math.ceil(part.length / 4) * 4, '='))).role === 'anon';
  } catch {
    return false;
  }
}
const configured = url === 'https://wfblxexdqlxeequvywfc.supabase.co' && publicKey(key || '');
const db = configured
  ? createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;
const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm';
const buttonClass = 'rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50';
const panelClass = 'rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4';
const errorText = (e: unknown) =>
  e instanceof Error
    ? e.message
    : typeof e === 'object' && e && 'message' in e
      ? String(e.message)
      : 'The request failed. Please retry.';
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={panelClass}>
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-400">{children}</p>;
}
function dateText(value: string) {
  return value ? new Date(value).toLocaleString() : 'Not recorded';
}
async function checked(query: any): Promise<any> {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recovery, setRecovery] = useState(false);
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    let active = true,
      changes = 0;
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((event, next) => {
      changes++;
      if (!active) return;
      setSession(next);
      setLoading(false);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_OUT') setRecovery(false);
    });
    const initial = changes;
    db.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active || changes !== initial) return;
        if (error) setError(error.message);
        setSession(data.session);
        setLoading(false);
      })
      .catch(e => {
        if (active) {
          setError(errorText(e));
          setLoading(false);
        }
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  if (!db)
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <h1>GYCS configuration required</h1>
        <p>
          Set VITE_SUPABASE_URL to the Green Yacht Crew Solutions project and VITE_SUPABASE_ANON_KEY to its publishable
          or anon key, then rebuild. Privileged server keys are not accepted.
        </p>
      </main>
    );
  if (loading) return <main className="min-h-screen bg-slate-950 p-8 text-white">Restoring your session...</main>;
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <a href="/" aria-label="Green Yacht Crew Solutions landing page">
            <img src="/logo-mark.svg" alt="" width={32} height={32} />
          </a>
          <div>
            <h1 className="text-xl font-bold">
              GYCS <span className="text-emerald-400">CREW HUB</span>
            </h1>
            <p className="text-xs text-slate-400">Green Yacht Crew Solutions · Member &amp; Coaching Workspace</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <a href="/" className="text-emerald-300 underline">
            Sales &amp; Landing Page
          </a>
          <a href="/?ai=1#ai-intake" className="text-emerald-300 underline">
            AI Intake &amp; Pathways
          </a>
          <a
            href="https://searchengine.chaddewet.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-300 underline"
          >
            M/Y Eye Map ↗
          </a>
          <ThemeSwitcher />
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-5">
        {error && (
          <p role="alert" className="mb-4 text-rose-300">
            {error}
          </p>
        )}
        {session && !recovery ? (
          <Workspace
            key={session.user.id}
            session={session}
            onSignOut={async () => {
              const { error } = await db!.auth.signOut();
              if (error) setError(error.message);
            }}
          />
        ) : (
          <AuthForm recovery={recovery} onRecovered={() => setRecovery(false)} />
        )}
      </main>
    </div>
  );
}

function AuthForm({ recovery, onRecovered }: { recovery: boolean; onRecovered: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const lock = useRef(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    const form = new FormData(e.currentTarget),
      email = String(form.get('email') || '').trim(),
      password = String(form.get('password') || '');
    try {
      if (recovery) {
        const { error } = await db!.auth.updateUser({ password });
        if (error) throw error;
        onRecovered();
      } else if (mode === 'reset') {
        const { error } = await db!.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
        setNotice('If an account exists for this email, check its inbox for a reset link.');
      } else if (mode === 'signup') {
        const { data, error } = await db!.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: String(form.get('display_name') || '').trim() },
          },
        });
        if (error) throw error;
        if (!data.session) setNotice('Check your email to confirm your account, then sign in.');
      } else {
        const { error } = await db!.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      setError(errorText(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="max-w-md mx-auto">
      <Panel
        title={
          recovery
            ? 'Choose a new password'
            : mode === 'signup'
              ? 'Create your member account'
              : mode === 'reset'
                ? 'Reset your password'
                : 'Sign in'
        }
      >
        <form onSubmit={submit}>
          <fieldset disabled={busy} className="space-y-4">
            {mode === 'signup' && !recovery && (
              <label className="block">
                Display name
                <input name="display_name" required maxLength={120} autoComplete="name" className={inputClass} />
              </label>
            )}
            {!recovery && (
              <label className="block">
                Email
                <input name="email" type="email" required autoComplete="email" className={inputClass} />
              </label>
            )}
            {(recovery || mode !== 'reset') && (
              <label className="block">
                Password
                <input
                  name="password"
                  type="password"
                  required
                  minLength={recovery || mode === 'signup' ? 8 : undefined}
                  autoComplete={recovery || mode === 'signup' ? 'new-password' : 'current-password'}
                  className={inputClass}
                />
              </label>
            )}
            {error && (
              <p role="alert" className="text-sm text-rose-300">
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className="text-sm text-emerald-300">
                {notice}
              </p>
            )}
            <button className={buttonClass}>
              {busy
                ? 'Please wait...'
                : recovery
                  ? 'Update password'
                  : mode === 'signup'
                    ? 'Create account'
                    : mode === 'reset'
                      ? 'Send reset link'
                      : 'Sign in'}
            </button>
            {!recovery && (
              <div className="flex flex-wrap gap-4 text-sm">
                {(['signin', 'signup', 'reset'] as const)
                  .filter(x => x !== mode)
                  .map(x => (
                    <button
                      key={x}
                      type="button"
                      onClick={() => {
                        setMode(x);
                        setError('');
                        setNotice('');
                      }}
                      className="text-emerald-300 underline"
                    >
                      {x === 'signin' ? 'Sign in' : x === 'signup' ? 'Create account' : 'Forgot password?'}
                    </button>
                  ))}
              </div>
            )}
          </fieldset>
        </form>
      </Panel>
    </div>
  );
}

function Workspace({ session, onSignOut }: { session: Session; onSignOut: () => Promise<void> }) {
  const userId = session.user.id;
  const initialTab =
    typeof window !== 'undefined' && window.location.hash === '#location-sharing'
      ? 'location'
      : typeof window !== 'undefined' && window.location.hash === '#live-coaching'
        ? 'live'
        : 'today';
  const [tab, setTab] = useState(initialTab),
    [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [selectedPortId, setSelectedPortId] = useState<string>('antibes');
  const [runwaySavingsEur, setRunwaySavingsEur] = useState<number>(3500);
  const [eng1Status, setEng1Status] = useState<string>('Valid / Booked');
  const [visaStatus, setVisaStatus] = useState<string>('Schengen 90/180 & B1/B2 Audited');
  const [cabinReady, setCabinReady] = useState<boolean>(true);
  const lock = useRef(false),
    sequence = useRef(0),
    mounted = useRef(true);
  async function refresh() {
    const request = ++sequence.current;
    const queries: Record<string, any> = {
      profile: db!.from('profiles').select('*').eq('id', userId).single(),
      onboarding_intake: db!.from('onboarding_intakes').select('*').eq('user_id', userId).maybeSingle(),
      map_card: db!.from('crew_map_cards').select('*').eq('user_id', userId).maybeSingle(),
      current_location: db!.from('crew_locations_current').select('*').eq('user_id', userId).maybeSingle(),
      vessel_link: db!.from('crew_vessel_links').select('*').eq('user_id', userId).maybeSingle(),
      applications: db!
        .from('applications')
        .select('*,interviews(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      opportunities: db!
        .from('opportunities')
        .select('*,employers(id,name,is_verified)')
        .eq('is_active', true)
        .order('posted_at', { ascending: false }),
      cvs: db!.from('cv_versions').select('*').eq('user_id', userId).order('version', { ascending: false }).limit(1),
      documents: db!
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      assessments: db!
        .from('assessments')
        .select('id,status,motivation,department_fit,created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      pathways: db!
        .from('pathway_versions')
        .select('*,milestones(*)')
        .eq('user_id', userId)
        .order('version', { ascending: false }),
      requirements: db!.from('requirements').select('*').eq('is_active', true).order('code'),
      programmes: db!.from('programmes').select('*').eq('is_active', true).order('created_at'),
      cohorts: db!.from('cohorts').select('*').eq('is_active', true),
      lessons: db!
        .from('lessons')
        .select('*')
        .eq('is_published', true)
        .order('sort_order'),
      assignments: db!.from('assignments').select('*'),
      submissions: db!.from('assignment_submissions').select('*').eq('user_id', userId),
      progress: db!.from('lesson_progress').select('id,lesson_id,completed').eq('user_id', userId),
      sessions: db!.from('live_sessions').select('*').order('scheduled_at', { ascending: false }),
      questions: db!.from('session_questions').select('*').order('created_at', { ascending: true }),
      consents: db!
        .from('consent_records')
        .select('id,consent_type,status,created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      exports: db!.from('data_export_requests').select('id,status,requested_at').eq('user_id', userId),
      deletions: db!.from('data_deletion_requests').select('id,status,requested_at').eq('user_id', userId),
      outcomes: db!.from('verified_starts').select('id,start_date,evidence_type,verified_at').eq('user_id', userId),
      flags: db!.from('feature_flags').select('key,enabled,description'),
    };
    const entries = await Promise.all(
      Object.entries(queries).map(async ([name, q]) => {
        try {
          return [name, await checked(q)] as const;
        } catch (e) {
          throw new Error(`${name}: ${errorText(e)}`);
        }
      })
    );
    const next = Object.fromEntries(entries);
    if (!next.profile.is_active)
      throw new Error('This account is inactive. Contact your programme administrator.');
    if (isStaffRole(next.profile.role)) {
      const allProfilesRes = await db!.from('profiles').select('*').order('created_at');
      next.all_profiles = allProfilesRes.data || [];
    } else {
      next.all_profiles = [];
    }
    if (mounted.current && request === sequence.current) setData(next);
  }
  useEffect(() => {
    mounted.current = true;
    refresh()
      .catch(e => {
        if (mounted.current) setError(errorText(e));
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
    return () => {
      mounted.current = false;
      sequence.current++;
    };
  }, [userId]);
  async function run(action: () => Promise<unknown>, message = 'Saved to Supabase.') {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    let saved = false;
    try {
      await action();
      saved = true;
      await refresh();
      if (mounted.current) setNotice(message);
    } catch (e) {
      if (mounted.current)
        setError(
          `${saved ? 'The operation completed, but refreshing failed. Do not submit it again: ' : ''}${errorText(e)}`
        );
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  if (loading) return <p>Loading your Supabase records...</p>;
  if (!data)
    return (
      <Panel title="Your workspace could not load">
        <p role="alert" className="text-rose-300">
          {error}
        </p>
        <button className={buttonClass} onClick={() => run(refresh, 'Workspace loaded.')}>
          Retry
        </button>
        <button className="ml-4 underline" onClick={() => run(onSignOut)}>
          Sign out
        </button>
      </Panel>
    );
  const p = data.profile,
    cv = data.cvs[0];
  const activePathway = data.pathways?.[0];
  const activeMilestones: Milestone[] = ((activePathway?.milestones || []) as Row[])
    .slice()
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((m: Row) => ({
      id: m.id,
      pathwayId: m.pathway_id,
      requirementId: m.requirement_id || undefined,
      title: m.title,
      description: m.description || '',
      sortOrder: m.sort_order || 1,
      evidenceRequired: m.evidence_required || 'Completion evidence',
      status: m.status || 'pending',
      phase: m.phase || undefined,
      growAnchor: m.grow_anchor || undefined,
      platformTool: m.platform_tool || undefined,
      primaryOutput: m.primary_output || undefined,
      notes: m.notes || undefined,
    }));
  const mappedRequirements: Requirement[] =
    data.requirements && data.requirements.length > 0
      ? data.requirements.map((r: Row) => ({
          id: r.id,
          code: r.code,
          title: r.title,
          description: r.description || '',
          classification: r.classification || 'required_for_context',
          applicableFlags: Array.isArray(r.applicable_flags) ? r.applicable_flags : ['MCA', 'SAMSA'],
          applicableRoles: Array.isArray(r.applicable_roles) ? r.applicable_roles : ['All Crew'],
          applicableDepartments: (Array.isArray(r.applicable_departments)
            ? r.applicable_departments
            : ['deck', 'interior', 'engineering', 'galley']) as Department[],
          sourceAuthority: r.source_authority || 'IMO STCW / Flag State',
          sourceUrl: r.source_url || undefined,
          sourceVersion: r.source_version || 'Current',
          lastVerifiedDate: r.last_verified_date ? String(r.last_verified_date).slice(0, 10) : '2026-10-27',
          verifiedBy: r.verified_by_name || 'Chad de Wet',
          notes: r.notes || undefined,
        }))
      : SOURCED_REQUIREMENTS;

  const trainingDocs = (data.documents || []).filter((d: Row) => d.category === 'training' || d.category === 'qualification');
  const medicalDocs = (data.documents || []).filter((d: Row) => d.category === 'medical');
  const identityDocs = (data.documents || []).filter((d: Row) => d.category === 'identity' || d.category === 'travel');
  const completedLessonsCount = (data.progress || []).filter((pr: Row) => pr.completed).length;
  const approvedMilestonesCount = activeMilestones.filter(m => m.status === 'approved' || m.status === 'submitted').length;
  const readinessDimensions: ReadinessDimension[] = [
    {
      key: 'training',
      label: '1. Training Qualifications',
      level: trainingDocs.some((d: Row) => d.verification_status === 'verified')
        ? 'verified'
        : trainingDocs.length > 0
          ? 'in_progress'
          : 'not_started',
      measuredBy: 'STCW 2010 BST + PDSD + Department Tickets',
      sourceOfTruth: `Documents Vault (${trainingDocs.length} record${trainingDocs.length === 1 ? '' : 's'})`,
    },
    {
      key: 'medical',
      label: '2. Medical Clearance',
      level: medicalDocs.some((d: Row) => d.verification_status === 'verified')
        ? 'verified'
        : medicalDocs.length > 0
          ? 'in_progress'
          : 'not_started',
      measuredBy: 'Valid ENG1 or Flag-State Equivalent',
      sourceOfTruth: `Medical Records (${medicalDocs.length} record${medicalDocs.length === 1 ? '' : 's'})`,
    },
    {
      key: 'profile',
      label: '3. Professional Profile & CV',
      level: cv ? 'submitted' : 'not_started',
      measuredBy: '2-Page Compliant Maritime CV (<250KB)',
      sourceOfTruth: cv ? `CV Studio v${cv.version}` : 'CV Studio',
    },
    {
      key: 'practical_skills',
      label: '4. 8-Week Launchpad Modules',
      level:
        completedLessonsCount >= 6
          ? 'coach_approved'
          : completedLessonsCount > 0 || approvedMilestonesCount > 0
            ? 'in_progress'
            : 'not_started',
      measuredBy: 'Phase 1 (KNOW), Phase 2 (PREPARE), Phase 3 (EXECUTE)',
      sourceOfTruth: `${completedLessonsCount}/${(data.lessons || []).length || 8} Weeks Completed · ${approvedMilestonesCount}/${activeMilestones.length || 8} Milestones`,
    },
    {
      key: 'travel_work',
      label: '5. Travel & Visa Permissions',
      level: identityDocs.some((d: Row) => d.verification_status === 'verified')
        ? 'verified'
        : identityDocs.length > 0
          ? 'in_progress'
          : 'not_started',
      measuredBy: 'Passport (>18m), Schengen 90/180 & US B1/B2',
      sourceOfTruth: `Identity/Travel Vault (${identityDocs.length} record${identityDocs.length === 1 ? '' : 's'})`,
    },
    {
      key: 'search_prep',
      label: '6. M/Y Eye & CRM Outreach Pipeline',
      level: (data.applications || []).length >= 5 ? 'coach_approved' : (data.applications || []).length > 0 ? 'in_progress' : 'not_started',
      measuredBy: 'Agency Matrix + Direct Vessel AIS Outreach',
      sourceOfTruth: `${(data.applications || []).length} Tracked Applications`,
    },
    {
      key: 'employment_outcome',
      label: '7. Verified Employment Outcome',
      level: (data.outcomes || []).length > 0 ? 'verified' : 'not_started',
      measuredBy: 'MLC-Compliant SEA Contract / Daywork Start',
      sourceOfTruth: (data.outcomes || []).length > 0 ? 'Verified Start Recorded' : 'Outcomes Registry',
    },
  ];
  const selectedPort = PORT_RUNWAY_BENCHMARKS.find(b => b.id === selectedPortId) || PORT_RUNWAY_BENCHMARKS[0];
  const monthlyPortBurnEur = selectedPort.crewHouseNightlyEur * 30 + selectedPort.monthlyFoodTransportEur;
  const estimatedRunwayMonths = monthlyPortBurnEur > 0 ? +(runwaySavingsEur / monthlyPortBurnEur).toFixed(1) : 0;
  const estimatedRunwayWeeks = monthlyPortBurnEur > 0 ? Math.round((runwaySavingsEur / monthlyPortBurnEur) * 4.33) : 0;
  const opportunities: Opportunity[] = data.opportunities
    .filter((o: Row) => o.employers?.is_verified)
    .map((o: Row) => ({
      id: o.id,
      title: o.title,
      department: o.department,
      employerName: o.employers.name,
      location: o.location || '',
      vesselType: o.vessel_type || '',
      contractType: o.contract_type,
      description: o.description || '',
      externalUrl: /^https?:\/\//i.test(o.external_url || '') ? o.external_url : '',
      source: o.source,
      isVerifiedEmployer: true,
      postedDate: o.posted_at.slice(0, 10),
    }));
  const applications: Application[] = data.applications.map((a: Row) => ({
    id: a.id,
    userId: a.user_id,
    opportunityId: a.opportunity_id,
    title: a.external_title || 'Application',
    employer: a.external_employer || '',
    location: '',
    status: a.status,
    notes: a.notes || '',
    submittedAt: a.submitted_at,
    interviews: (a.interviews || []).map((i: Row) => ({
      id: i.id,
      scheduledAt: i.scheduled_at,
      format: i.format,
      notes: i.notes || '',
      outcome: i.outcome,
      coachDebrief: i.coach_debrief,
    })),
  }));
  const baseTabs: [string, string][] = [
    ['today', 'Today'],
    ['profile', 'My profile'],
    ['programs', 'Coaching programs'],
    ['location', 'Location sharing'],
    ['intake', 'Intake'],
    ['pathway', 'My pathway'],
    ['cv', 'CV'],
    ['documents', 'Documents'],
    ['opportunities', 'Opportunities'],
    ['applications', 'Applications'],
    ['learn', 'Learning'],
    ['worksheets', 'Worksheets & checklists'],
    ['live', 'Live sessions'],
    ['privacy', 'Privacy'],
    ['outcomes', 'Outcomes'],
    ['flags', 'Feature flags'],
  ];
  const tabs: [string, string][] = isStaffRole(p.role)
    ? [...baseTabs, ['superadmin', isSuperAdminRole(p.role) ? 'Superadmin console' : 'Coach / Admin']]
    : baseTabs;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <strong>{p.display_name}</strong>
          <p className="text-xs text-slate-400">
            {p.email} · Role: <strong className="text-emerald-400">{formatUserRoleLabel(p.role)}</strong> ({p.role}) ·
            Program:{' '}
            <strong className="text-amber-300">{formatCoachingProgrammeLabel(p.coaching_programme)}</strong>
          </p>
        </div>
        <div className="flex gap-3">
          <button disabled={busy} onClick={() => run(refresh, 'Records refreshed.')} className="underline">
            Refresh
          </button>
          <button disabled={busy} onClick={() => run(onSignOut)} className={buttonClass}>
            Sign out
          </button>
        </div>
      </div>
      <nav className="flex flex-wrap gap-2" aria-label="Workspace navigation">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            disabled={busy}
            onClick={() => {
              setTab(id);
              setNotice('');
              setError('');
            }}
            className={`rounded-lg px-3 py-2 text-xs ${tab === id ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300'}`}
          >
            {label}
          </button>
        ))}
      </nav>
      {error && (
        <p role="alert" className="rounded-lg border border-rose-700 p-3 text-rose-300">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-emerald-300">
          {notice}
        </p>
      )}
      {busy && <p role="status">Waiting for Supabase...</p>}
      <fieldset disabled={busy} className="min-w-0 space-y-5">
        {tab === 'today' && (
          <div className="space-y-5">
            <Panel title="Your career workspace · 8-Week Superyacht Career Launchpad">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-xs text-slate-400">Pathway User Role</p>
                  <p className="text-sm font-bold text-emerald-400">
                    {formatUserRoleLabel(p.role)} <span className="text-xs font-mono text-slate-400">({p.role})</span>
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-xs text-slate-400">Coaching Program</p>
                  <p className="text-sm font-bold text-amber-300">
                    {formatCoachingProgrammeLabel(p.coaching_programme)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-xs text-slate-400">Journey Stage</p>
                  <p className="text-sm font-bold text-sky-300">{p.journey_state || 'exploring'}</p>
                </div>
              </div>
              <p className="text-sm text-slate-300">
                {data.documents.length} documents · {data.applications.length} applications · {data.assessments.length}{' '}
                assessments · {data.pathways.length} pathway versions · {completedLessonsCount}/{(data.lessons || []).length || 8} syllabus weeks completed
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" onClick={() => setTab('learn')} className={buttonClass}>
                  Open 8-Week Launchpad Course
                </button>
                <button
                  type="button"
                  onClick={() => setTab('worksheets')}
                  className="rounded-lg border border-teal-500/40 bg-teal-950/30 px-3.5 py-2 text-xs font-semibold text-teal-300 hover:border-teal-400"
                >
                  Client Worksheets &amp; Checklists
                </button>
                <button
                  type="button"
                  onClick={() => setTab('pathway')}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-emerald-500"
                >
                  My Pathway &amp; Milestones ({approvedMilestonesCount}/{activeMilestones.length || 8})
                </button>
                <button
                  type="button"
                  onClick={() => setTab('programs')}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-emerald-500"
                >
                  Switch Coaching Program / Pathway
                </button>
                <button
                  type="button"
                  onClick={() => setTab('cv')}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-emerald-500"
                >
                  CV Studio (&lt;250KB)
                </button>
              </div>
              <Empty>
                This workspace shows database records only. An empty section means no records have been created or made
                available to your account. Coaching does not guarantee employment.
              </Empty>
              {!p.organisation_id && (
                <Empty>
                  Your account is not yet assigned to a coaching organisation. Your personal records remain available;
                  cohort access requires enrolment by your programme administrator.
                </Empty>
              )}
            </Panel>

            {/* 7-Dimension Readiness Scorecard (Web + Android Parity) */}
            <Panel title="7-Dimension Maritime Readiness Scorecard">
              <p className="text-xs text-slate-400">
                Synchronized across Web and Android from your live Supabase records (Documents Vault, CV Studio, 8-Week Launchpad Progress, Pathway Milestones, and CRM Pipeline).
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {readinessDimensions.map(dim => (
                  <div key={dim.key} className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">{dim.label}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          dim.level === 'verified' || dim.level === 'coach_approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : dim.level === 'submitted' || dim.level === 'in_progress'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {dim.level.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{dim.measuredBy}</p>
                    <p className="text-[10px] font-mono text-teal-400">{dim.sourceOfTruth}</p>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Week 1 Tech & Digital Deliverable: GYCS Baseline Constraints & Financial Runway Calculator */}
            <Panel title="Week 1 Deliverable: GYCS Baseline Constraints & Financial Runway Calculator">
              <p className="text-xs text-slate-300">
                <strong>Phase 1: KNOW (Week 1 — Career Reality Check)</strong> · Model your crew house living costs across Antibes, Palma, Fort Lauderdale, and St. Maarten and verify your baseline medical &amp; visa constraints before investing capital.
              </p>
              <div className="grid gap-4 md:grid-cols-4">
                <label className="block text-xs">
                  Target Launch Port Hub
                  <select
                    value={selectedPortId}
                    onChange={e => setSelectedPortId(e.target.value)}
                    className={`${inputClass} mt-1`}
                  >
                    {PORT_RUNWAY_BENCHMARKS.map(port => (
                      <option key={port.id} value={port.id}>
                        {port.port}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs">
                  Available Launch Savings (€ EUR)
                  <input
                    type="number"
                    min={500}
                    max={50000}
                    step={100}
                    value={runwaySavingsEur}
                    onChange={e => setRunwaySavingsEur(Number(e.target.value) || 0)}
                    className={`${inputClass} mt-1`}
                  />
                </label>
                <label className="block text-xs">
                  ENG1 Seafarer Medical Status
                  <select
                    value={eng1Status}
                    onChange={e => setEng1Status(e.target.value)}
                    className={`${inputClass} mt-1`}
                  >
                    <option value="Valid / Booked">Valid ENG1 / MCA Doctor Booked</option>
                    <option value="SAMSA Medical Held">SAMSA Medical Held (Confirming Flag)</option>
                    <option value="Needs Booking">Not Yet Booked (Action Required)</option>
                  </select>
                </label>
                <label className="block text-xs">
                  Flag State &amp; Visa Baseline
                  <select
                    value={visaStatus}
                    onChange={e => setVisaStatus(e.target.value)}
                    className={`${inputClass} mt-1`}
                  >
                    <option value="Schengen 90/180 & B1/B2 Audited">Schengen 90/180 &amp; B1/B2 Audited</option>
                    <option value="EU / Visa-Exempt Passport">EU / UK / Visa-Exempt Passport</option>
                    <option value="Visa Application Required">Schengen / B1/B2 Application Needed</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-4 pt-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[11px] text-slate-400">Crew House + Living Burn</span>
                  <p className="text-base font-bold text-white mt-0.5">€{monthlyPortBurnEur}/mo</p>
                  <span className="text-[10px] text-slate-400">
                    €{selectedPort.crewHouseNightlyEur}/night crew house + €{selectedPort.monthlyFoodTransportEur} food/local
                  </span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[11px] text-slate-400">Calculated Port Runway</span>
                  <p
                    className={`text-base font-bold mt-0.5 ${
                      estimatedRunwayWeeks >= selectedPort.recommendedRunwayWeeks ? 'text-emerald-400' : 'text-amber-300'
                    }`}
                  >
                    {estimatedRunwayWeeks} weeks ({estimatedRunwayMonths} mos)
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Recommended minimum: {selectedPort.recommendedRunwayWeeks} weeks
                  </span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[11px] text-slate-400">Peak Hiring Window</span>
                  <p className="text-xs font-semibold text-teal-300 mt-1">{selectedPort.peakSeason}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex flex-col justify-between">
                  <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cabinReady}
                      onChange={e => setCabinReady(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>Shared cabin, zero-tolerance &amp; 14–16h charter shift readiness confirmed</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <p className="text-xs text-slate-400">{selectedPort.notes}</p>
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() => {
                    const week1Lesson = (data.lessons || []).find((l: Row) => l.sort_order === 1) || data.lessons?.[0];
                    if (!week1Lesson) return;
                    const summary = `Week 1 Baseline Constraints & Financial Runway Audit: Port=${selectedPort.port} (€${monthlyPortBurnEur}/mo burn, €${runwaySavingsEur} savings = ${estimatedRunwayWeeks} weeks / ${estimatedRunwayMonths} months runway) | ENG1=${eng1Status} | Visa=${visaStatus} | Shared Cabin Readiness=${cabinReady ? 'Confirmed' : 'Pending'}`;
                    void run(async () => {
                      const assign = (data.assignments || []).find((a: Row) => a.lesson_id === week1Lesson.id);
                      const cohortId = data.cohorts?.[0]?.id;
                      if (assign && cohortId) {
                        const existingSub = (data.submissions || []).find((s: Row) => s.assignment_id === assign.id);
                        if (existingSub) {
                          await checked(
                            db!
                              .from('assignment_submissions')
                              .update({ content: summary, status: 'submitted', submitted_at: new Date().toISOString() })
                              .eq('id', existingSub.id)
                              .eq('user_id', userId)
                              .select('id')
                              .single()
                          );
                        } else {
                          await checked(
                            db!
                              .from('assignment_submissions')
                              .insert({
                                assignment_id: assign.id,
                                user_id: userId,
                                cohort_id: cohortId,
                                content: summary,
                                status: 'submitted',
                              })
                              .select('id')
                              .single()
                          );
                        }
                      }
                    }, 'Week 1 Baseline Constraints & Financial Runway Audit saved to your Week 1 deliverable.');
                  }}
                >
                  Save &amp; Submit Week 1 Runway Audit
                </button>
              </div>
            </Panel>
          </div>
        )}
        {tab === 'profile' && (
          <ProfileEditor
            db={db!}
            userId={userId}
            profile={p}
            mapCard={data.map_card}
            vesselLink={data.vessel_link}
            intakeRow={data.onboarding_intake}
            busy={busy}
            onRun={run}
            onNavigateToLocationTab={() => setTab('location')}
          />
        )}
        {tab === 'programs' && (
          <div className="space-y-5">
            <Panel title="GYCS Coaching Programs · 8-Week Superyacht Career Launchpad">
              <p className="text-sm text-slate-300">
                Choose between our <strong>Single 1-on-1 Coaching Program</strong> and{' '}
                <strong>Group Coaching Program</strong>. Both programs deliver the{' '}
                <strong>8-Week Superyacht Career Launchpad</strong> using the <strong>GROW Coaching Model</strong> (Goal, Reality, Obstacles, Way Forward).
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.values(COACHING_PROGRAMMES).map(prog => {
                  const isSelected = p.coaching_programme === prog.id;
                  return (
                    <article
                      key={prog.id}
                      className={`rounded-xl border p-4 space-y-3 ${
                        isSelected ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono uppercase text-emerald-400">{prog.eyebrow}</span>
                        {isSelected && (
                          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                            Selected Program
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white">{prog.title}</h3>
                      <p className="text-[11px] font-medium text-teal-300">
                        Instructor: {prog.instructor}
                      </p>
                      <p className="text-xs text-slate-300">{prog.summary}</p>
                      <ul className="space-y-1 text-xs text-slate-400">
                        {prog.highlights.map(h => (
                          <li key={h}>• {h}</li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        className={buttonClass}
                        onClick={() =>
                          void run(
                            () =>
                              checked(
                                db!.rpc('gycs_sync_member_pathway_role', {
                                  p_department: data.map_card?.department || data.onboarding_intake?.payload?.department || 'deck',
                                  p_pathway_selection: p.pathway_selection || p.role,
                                  p_coaching_programme: prog.id,
                                })
                              ),
                            `Coaching program updated to ${prog.title} and 8-Week Launchpad pathway synced.`
                          )
                        }
                      >
                        {isSelected ? `Active: ${prog.shortLabel}` : `Select ${prog.shortLabel}`}
                      </button>
                    </article>
                  );
                })}
              </div>
              {data.programmes?.length > 0 && (
                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <h3 className="text-sm font-bold text-slate-200">Active Database Programmes</h3>
                  {data.programmes.map((pr: Row) => (
                    <p key={pr.id} className="text-xs text-slate-300">
                      <strong>{pr.title}</strong> ({pr.programme_type || pr.slug}) — {pr.duration_weeks || 8} weeks ·{' '}
                      {pr.description}
                    </p>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Department Pathways & Tonnage Specializations (Week 2 Route Navigator)">
              <p className="text-xs text-slate-300">
                Select your target vessel department to synchronize your user role, mandatory vs. functional training route, and 8-Week Launchpad milestones across Web and Android.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {PATHWAY_ROLE_OPTIONS.map(opt => {
                  const isActiveRole = p.role === opt.role;
                  return (
                    <article
                      key={opt.role}
                      className={`rounded-xl border p-4 space-y-2.5 ${
                        isActiveRole ? 'border-teal-500 bg-teal-950/20' : 'border-slate-800 bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono uppercase text-teal-400">
                          {opt.department.toUpperCase()} DEPARTMENT · ROLE: {opt.role}
                        </span>
                        {isActiveRole && (
                          <span className="rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-semibold text-teal-300">
                            Active Pathway
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white">{opt.pathwayTitle}</h3>
                      <p className="text-xs text-slate-300">{opt.description}</p>
                      <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                        <p>
                          <strong className="text-slate-200">Mandatory Tickets:</strong> {opt.mandatoryTickets.join(' · ')}
                        </p>
                        <p>
                          <strong className="text-slate-200">Functional Additions:</strong> {opt.functionalAdditions.join(' · ')}
                        </p>
                        <p>
                          <strong className="text-emerald-300">Progression Route:</strong> {opt.progressionRoute}
                        </p>
                      </div>
                      <button
                        type="button"
                        className={buttonClass}
                        onClick={() =>
                          void run(
                            () =>
                              checked(
                                db!.rpc('gycs_sync_member_pathway_role', {
                                  p_department: opt.department === 'undecided' ? 'deck' : opt.department,
                                  p_pathway_selection: opt.role,
                                  p_coaching_programme: p.coaching_programme || 'group',
                                })
                              ),
                            `Pathway updated to ${opt.pathwayTitle} and 8-Week Launchpad milestones synced.`
                          )
                        }
                      >
                        {isActiveRole ? `Active: ${opt.label}` : `Select ${opt.pathwayTitle}`}
                      </button>
                    </article>
                  );
                })}
              </div>
            </Panel>
          </div>
        )}
        {tab === 'location' && (
          <CrewMapLocationSettings
            db={db!}
            userId={userId}
            profile={p}
            mapCard={data.map_card}
            currentLocation={data.current_location}
            vesselLink={data.vessel_link}
            busy={busy}
            onRun={run}
          />
        )}
        {tab === 'intake' && (
          <Panel title="Intake assessment">
            <form
              onSubmit={e => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const dept = String(f.get('department'));
                const prog = String(f.get('coaching_programme')) as CoachingProgrammeType;
                const matchedRole = resolvePathwayUserRole(dept, undefined, p.role);
                void run(async () => {
                  await checked(
                    db!
                      .from('assessments')
                      .insert({
                        user_id: userId,
                        status: 'in_progress',
                        motivation: { text: String(f.get('motivation')).trim() },
                        department_fit: dept,
                      })
                      .select('id')
                      .single()
                  );
                  await db!.rpc('gycs_sync_member_pathway_role', {
                    p_department: dept,
                    p_pathway_selection: matchedRole,
                    p_coaching_programme: prog,
                  });
                }, `Assessment saved and pathway role synced to ${formatUserRoleLabel(matchedRole)}.`);
              }}
              className="space-y-3"
            >
              <label className="block">
                Your background and career goals
                <textarea name="motivation" required maxLength={10000} className={inputClass} rows={5} />
              </label>
              <label className="block">
                Pathway selection (matches your user role)
                <select name="department" defaultValue={data.map_card?.department || 'deck'} className={inputClass}>
                  <option value="deck">Deck Pathway → Role: Deckhand</option>
                  <option value="interior">Interior Pathway → Role: Steward / Stewardess</option>
                  <option value="engineering">Engineering Pathway → Role: Engineer</option>
                  <option value="galley">Galley Pathway → Role: Chef</option>
                </select>
              </label>
              <label className="block">
                Coaching program
                <select
                  name="coaching_programme"
                  defaultValue={p.coaching_programme || 'group'}
                  className={inputClass}
                >
                  <option value="one_on_one">{COACHING_PROGRAMMES.one_on_one.title}</option>
                  <option value="group">{COACHING_PROGRAMMES.group.title}</option>
                </select>
              </label>
              <button className={buttonClass}>Save assessment &amp; sync pathway role</button>
            </form>
            {data.assessments.map((a: Row) => (
              <article key={a.id} className="border-t border-slate-800 pt-3">
                <p>
                  {a.department_fit} · {a.status} · {dateText(a.created_at)}
                </p>
                <p>{typeof a.motivation === 'string' ? a.motivation : a.motivation?.text || ''}</p>
              </article>
            ))}
          </Panel>
        )}
        {tab === 'pathway' && (
          <MilestoneTimeline
            milestones={activeMilestones}
            requirements={mappedRequirements}
            department={((activePathway?.department || data.map_card?.department || 'deck') as Department)}
            targetRole={activePathway?.target_role || formatUserRoleLabel(p.role)}
            pathwaySummary={activePathway?.summary || undefined}
            coachingProgrammeLabel={formatCoachingProgrammeLabel(p.coaching_programme)}
            isCoachMode={isStaffRole(p.role)}
            syncingPathway={busy}
            onSyncLaunchpadPathway={() =>
              void run(
                () =>
                  checked(
                    db!.rpc('gycs_sync_member_pathway_role', {
                      p_department: activePathway?.department || data.map_card?.department || 'deck',
                      p_pathway_selection: p.pathway_selection || p.role,
                      p_coaching_programme: p.coaching_programme || 'group',
                    })
                  ),
                '8-Week Superyacht Career Launchpad pathway and milestones synchronized.'
              )
            }
            onUpdateMilestoneStatus={(milestoneId, status) =>
              void run(
                () =>
                  checked(
                    db!
                      .from('milestones')
                      .update({ status })
                      .eq('id', milestoneId)
                      .select('id')
                      .single()
                  ),
                `Milestone updated to "${status.replace('_', ' ')}".`
              )
            }
          />
        )}
        {tab === 'cv' && (
          <CVStudio
            busy={busy}
            cvData={{
              id: cv?.id || 'new-cv',
              userId,
              version: cv?.version || 0,
              personalInfo: {
                fullName: cv?.personal_info?.fullName || p.display_name || '',
                nationality: cv?.personal_info?.nationality || '',
                location: cv?.personal_info?.location || '',
                dateOfBirth: cv?.personal_info?.dateOfBirth || '',
                email: cv?.personal_info?.email || p.email || '',
                phone: cv?.personal_info?.phone || p.phone || '',
                passportExpiry: cv?.personal_info?.passportExpiry || '',
                seamanBook: cv?.personal_info?.seamanBook || '',
                medicalFitness: cv?.personal_info?.medicalFitness || '',
                swimmingAbility: cv?.personal_info?.swimmingAbility || '',
                visas: Array.isArray(cv?.personal_info?.visas) ? cv.personal_info.visas : [],
                languages: Array.isArray(cv?.personal_info?.languages) ? cv.personal_info.languages : [],
                smoker: Boolean(cv?.personal_info?.smoker),
                tattoos: cv?.personal_info?.tattoos || 'None / Non-visible',
              },
              objective: {
                text: cv?.objective?.text || '',
                targetRole:
                  cv?.objective?.targetRole || cv?.additional?.targetRole || data.map_card?.headline || formatUserRoleLabel(p.role),
                targetDepartment:
                  cv?.objective?.targetDepartment || cv?.additional?.targetDepartment || data.map_card?.department || 'deck',
                label: cv?.objective?.label || 'claimed',
              },
              experience: Array.isArray(cv?.experience) ? cv.experience : [],
              qualifications: Array.isArray(cv?.qualifications) ? cv.qualifications : [],
              skills: Array.isArray(cv?.skills) ? cv.skills : [],
              references: Array.isArray(cv?.references) ? cv.references : [],
              additional: cv?.additional || {},
              coachComments: cv?.coach_comments || undefined,
              isCurrent: true,
              updatedAt: cv?.updated_at || new Date().toISOString(),
            }}
            onSaveCV={(nextCv: CVData) => {
              const claim = (x: any): any =>
                Array.isArray(x)
                  ? x.map(claim)
                  : x && typeof x === 'object'
                    ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, k === 'label' ? 'claimed' : claim(v)]))
                    : x;
              void run(
                () =>
                  checked(
                    db!
                      .from('cv_versions')
                      .insert({
                        user_id: userId,
                        version: (cv?.version || 0) + 1,
                        personal_info: claim(nextCv.personalInfo),
                        objective: {
                          text: nextCv.objective.text.trim(),
                          targetRole: nextCv.objective.targetRole || '',
                          targetDepartment: nextCv.objective.targetDepartment || 'deck',
                          label: 'claimed',
                        },
                        experience: claim(nextCv.experience.filter(e => e.role.trim() || e.employerOrVessel.trim())),
                        qualifications: claim(nextCv.qualifications.filter(q => q.name.trim())),
                        skills: claim(nextCv.skills.filter(s => s.name.trim())),
                        references: claim(nextCv.references.filter(r => r.name.trim())),
                        additional: claim(nextCv.additional || {}),
                      })
                      .select('id')
                      .single()
                  ),
                `CV version ${(cv?.version || 0) + 1} saved to Supabase.`
              );
            }}
          />
        )}
        {tab === 'documents' && (
          <DocumentVault
            documents={data.documents.map((d: Row) => ({
              id: d.id,
              userId: d.user_id || userId,
              category: d.category,
              title: d.title,
              description: d.description || undefined,
              issuingAuthority: d.issuing_authority || undefined,
              verificationStatus: d.verification_status,
              filePath: d.file_path || undefined,
              fileName: d.file_name || undefined,
              fileSizeBytes: d.file_size_bytes || undefined,
              mimeType: d.mime_type || undefined,
              documentHash: d.document_number_hash || undefined,
              expiryDate: d.expiry_date || undefined,
              reviewNotes: d.review_notes || undefined,
              isSensitive: Boolean(d.is_sensitive),
            }))}
            onUploadDocument={(doc, file) => {
              void run(
                async () => {
                  let storagePath: string | null = null;
                  let fileHash: string | null = null;
                  if (file) {
                    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                    storagePath = `${userId}/${Date.now()}_${safeName}`;
                    if (typeof crypto !== 'undefined' && crypto.subtle) {
                      const buf = await file.arrayBuffer();
                      const digest = await crypto.subtle.digest('SHA-256', buf);
                      fileHash = Array.from(new Uint8Array(digest))
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join('');
                    }
                    const { error: upErr } = await db!.storage.from('crew-documents').upload(storagePath, file, {
                      upsert: true,
                      contentType: file.type || 'application/octet-stream',
                    });
                    if (upErr) throw new Error(`File upload failed: ${upErr.message}`);
                  }
                  await checked(
                    db!
                      .from('documents')
                      .insert({
                        user_id: userId,
                        title: doc.title,
                        category: doc.category || 'training',
                        issuing_authority: doc.issuingAuthority || null,
                        expiry_date: doc.expiryDate || null,
                        verification_status: file ? 'uploaded' : 'claimed',
                        file_path: storagePath,
                        file_name: file ? file.name : doc.fileName || null,
                        file_size_bytes: file ? file.size : doc.fileSizeBytes || null,
                        mime_type: file ? file.type || null : null,
                        document_number_hash: fileHash,
                        is_sensitive: Boolean(doc.isSensitive),
                      })
                      .select('id')
                      .single()
                  );
                },
                file
                  ? 'Document file uploaded to private Storage and recorded in Supabase.'
                  : 'Document credential record saved to Supabase.'
              );
            }}
            onOpenDocument={doc => {
              if (!doc.filePath) return;
              void run(async () => {
                const { data: signed, error: signErr } = await db!.storage
                  .from('crew-documents')
                  .createSignedUrl(doc.filePath!, 300);
                if (signErr || !signed?.signedUrl) {
                  throw new Error(signErr?.message || 'Unable to generate signed download link.');
                }
                window.open(signed.signedUrl, '_blank', 'noopener,noreferrer');
              }, 'Opened signed private document link (valid for 5 minutes).');
            }}
          />
        )}
        {tab === 'opportunities' && (
          <OpportunityBoard
            opportunities={opportunities}
            accessToken={session.access_token}
            onSaveToApplications={o => {
              const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(o.id || '');
              const exists = applications.some(
                a => (isUuid && a.opportunityId === o.id) || (a.title === o.title && a.employer === o.employerName)
              );
              if (exists) {
                setTab('applications');
                return;
              }
              void run(
                () =>
                  checked(
                    db!
                      .from('applications')
                      .insert({
                        user_id: userId,
                        opportunity_id: isUuid ? o.id : null,
                        external_title: o.title,
                        external_employer: o.employerName,
                        external_url: o.externalUrl || null,
                        notes: o.location ? `Location: ${o.location}` : null,
                        status: 'saved',
                      })
                      .select('id')
                      .single()
                  ),
                'Opportunity saved to your applications.'
              );
            }}
          />
        )}
        {tab === 'applications' && (
          <ApplicationTracker
            applications={applications}
            onUpdateStatus={(id, status) => {
              void run(() =>
                checked(db!.from('applications').update({ status }).eq('id', id).eq('user_id', userId).select('id').single())
              );
            }}
            onAddInterview={(id, date, notes) => {
              void run(
                () =>
                  checked(
                    db!
                      .from('interviews')
                      .insert({ application_id: id, scheduled_at: new Date(date).toISOString(), format: 'video', notes })
                      .select('id')
                      .single()
                  ),
                'Interview saved. You can update the application status separately.'
              );
            }}
            onAddApplication={app => {
              void run(
                () =>
                  checked(
                    db!
                      .from('applications')
                      .insert({
                        user_id: userId,
                        external_title: app.title,
                        external_employer: app.employer,
                        external_url: app.externalUrl || null,
                        notes: app.notes || null,
                        status: app.status,
                      })
                      .select('id')
                      .single()
                  ),
                'Application logged to your pipeline.'
              );
            }}
          />
        )}
        {tab === 'learn' && (
          <LearningHub
            userId={userId}
            lessons={data.lessons.map((l: Row, idx: number) => {
              const prog = data.progress.find((v: Row) => v.lesson_id === l.id);
              const assign = (data.assignments || []).find((a: Row) => a.lesson_id === l.id);
              const sub = assign
                ? (data.submissions || []).find((s: Row) => s.assignment_id === assign.id)
                : undefined;
              return {
                id: l.id,
                programmeId: l.programme_id,
                week: l.sort_order || idx + 1,
                title: l.title,
                type: l.lesson_type || 'video',
                durationMins: l.duration_mins || 45,
                completed: Boolean(prog?.completed),
                content: l.content || '',
                phase: l.phase || undefined,
                phaseCode: l.phase_code || undefined,
                moduleFocus: l.module_focus || undefined,
                growAnchor: l.grow_anchor || undefined,
                coreObjective: l.core_objective || undefined,
                platformTool: l.platform_tool || undefined,
                operationalLessons: Array.isArray(l.operational_lessons) ? l.operational_lessons : undefined,
                techDeliverable: l.tech_deliverable || undefined,
                weeklyMilestone: l.weekly_milestone || undefined,
                primaryOutput: l.primary_output || undefined,
                deckUrl: l.deck_url || undefined,
                videoUrl: l.gumlet_embed_url || l.video_url || undefined,
                gumletAssetId: l.gumlet_asset_id || undefined,
                gumletPlaylistId: l.gumlet_playlist_id || undefined,
                gumletStatus: l.gumlet_status || undefined,
                thumbnailUrl: l.gumlet_thumbnail_url || undefined,
                assignment: assign
                  ? {
                      id: assign.id,
                      title: assign.title,
                      instructions: assign.instructions,
                      submissionType: assign.submission_type || 'text',
                      status: (sub?.status as any) || 'draft',
                      submittedContent: sub?.content || undefined,
                      coachFeedback: sub?.feedback || undefined,
                      score: sub?.score ?? undefined,
                    }
                  : undefined,
              };
            })}
            liveSessions={data.sessions.map((s: Row) => ({
              id: s.id,
              cohortName: data.cohorts?.[0]?.name || 'GYCS Coaching Cohort',
              title: s.title,
              scheduledAt: s.scheduled_at,
              durationMins: s.duration_mins || 60,
              coachName: 'Chad de Wet',
              meetingUrl:
                s.gumlet_embed_url ||
                s.meeting_url ||
                'https://play.gumlet.io/embed/live/6adec989e655cfbd8127b254',
              recordingUrl: s.recording_url || undefined,
              recordingConsentRequired: Boolean(s.recording_consent_required ?? true),
              questions: data.questions
                .filter((q: Row) => q.session_id === s.id)
                .map((q: Row) => ({
                  id: q.id,
                  user: q.user_id === userId ? p.display_name : 'Cohort Member',
                  text: q.question,
                  answered: Boolean(q.answered),
                })),
            }))}
            onAskQuestion={(sessionId, question) => {
              void run(
                () =>
                  checked(
                    db!
                      .from('session_questions')
                      .insert({ user_id: userId, session_id: sessionId, question: question.trim() })
                      .select('id')
                      .single()
                  ),
                'Question added to the live coaching queue.'
              );
            }}
            onToggleLessonComplete={lessonId => {
              const progress = data.progress.find((v: Row) => v.lesson_id === lessonId);
              const completed = !progress?.completed;
              const payload = { completed, completed_at: completed ? new Date().toISOString() : null };
              void run(() =>
                checked(
                  progress
                    ? db!
                        .from('lesson_progress')
                        .update(payload)
                        .eq('id', progress.id)
                        .eq('user_id', userId)
                        .select('id')
                        .single()
                    : db!
                        .from('lesson_progress')
                        .insert({ ...payload, user_id: userId, lesson_id: lessonId })
                        .select('id')
                        .single()
                )
              );
            }}
            onSubmitAssignment={(lessonId, text) => {
              const assign = (data.assignments || []).find((a: Row) => a.lesson_id === lessonId);
              const cohortId = data.cohorts?.[0]?.id;
              if (!assign || !cohortId) return;
              const existingSub = (data.submissions || []).find((s: Row) => s.assignment_id === assign.id);
              void run(
                () =>
                  checked(
                    existingSub
                      ? db!
                          .from('assignment_submissions')
                          .update({ content: text.trim(), status: 'submitted', submitted_at: new Date().toISOString() })
                          .eq('id', existingSub.id)
                          .eq('user_id', userId)
                          .select('id')
                          .single()
                      : db!
                          .from('assignment_submissions')
                          .insert({
                            assignment_id: assign.id,
                            user_id: userId,
                            cohort_id: cohortId,
                            content: text.trim(),
                            status: 'submitted',
                          })
                          .select('id')
                          .single()
                  ),
                'Assignment submitted to Coach Chad for review.'
              );
            }}
          />
        )}
        {tab === 'worksheets' && (
          <LaunchpadWorksheets
            memberName={p.display_name}
            targetRole={activePathway?.target_role || formatUserRoleLabel(p.role)}
            coachingProgramme={formatCoachingProgrammeLabel(p.coaching_programme)}
            lessons={data.lessons.map((l: Row, idx: number) => {
              const prog = data.progress.find((v: Row) => v.lesson_id === l.id);
              const assign = (data.assignments || []).find((a: Row) => a.lesson_id === l.id);
              const sub = assign
                ? (data.submissions || []).find((s: Row) => s.assignment_id === assign.id)
                : undefined;
              return {
                id: l.id,
                programmeId: l.programme_id,
                week: l.sort_order || idx + 1,
                title: l.title,
                type: l.lesson_type || 'video',
                durationMins: l.duration_mins || 45,
                completed: Boolean(prog?.completed),
                content: l.content || '',
                assignment: assign
                  ? {
                      id: assign.id,
                      title: assign.title,
                      instructions: assign.instructions,
                      submissionType: assign.submission_type || 'text',
                      status: (sub?.status as any) || 'draft',
                      submittedContent: sub?.content || undefined,
                      coachFeedback: sub?.feedback || undefined,
                      score: sub?.score ?? undefined,
                    }
                  : undefined,
              };
            })}
            onSaveWorksheet={(lessonId, serializedMarkdown, submitToCoach) => {
              const assign = (data.assignments || []).find((a: Row) => a.lesson_id === lessonId);
              const cohortId = data.cohorts?.[0]?.id;
              if (!assign || !cohortId) return;
              const existingSub = (data.submissions || []).find((s: Row) => s.assignment_id === assign.id);
              const nextStatus = submitToCoach ? 'submitted' : existingSub?.status || 'draft';
              void run(
                () =>
                  checked(
                    existingSub
                      ? db!
                          .from('assignment_submissions')
                          .update({
                            content: serializedMarkdown.trim(),
                            status: nextStatus,
                            submitted_at: new Date().toISOString(),
                          })
                          .eq('id', existingSub.id)
                          .eq('user_id', userId)
                          .select('id')
                          .single()
                      : db!
                          .from('assignment_submissions')
                          .insert({
                            assignment_id: assign.id,
                            user_id: userId,
                            cohort_id: cohortId,
                            content: serializedMarkdown.trim(),
                            status: nextStatus,
                          })
                          .select('id')
                          .single()
                  ),
                submitToCoach
                  ? 'Worksheet & Checklist submitted to Coach Chad for review.'
                  : 'Worksheet & Checklist progress saved to Supabase.'
              );
            }}
          />
        )}
        {tab === 'live' && (
          <LiveRoom
            sessions={data.sessions.map((s: Row) => ({
              id: s.id,
              cohortName: data.cohorts?.[0]?.name || 'GYCS Coaching Cohort',
              title: s.title,
              scheduledAt: s.scheduled_at,
              durationMins: s.duration_mins || 60,
              coachName: 'Chad de Wet',
              meetingUrl:
                s.gumlet_embed_url ||
                s.meeting_url ||
                'https://play.gumlet.io/embed/live/6adec989e655cfbd8127b254',
              recordingUrl: s.recording_url || undefined,
              recordingConsentRequired: Boolean(s.recording_consent_required ?? true),
              questions: data.questions
                .filter((q: Row) => q.session_id === s.id)
                .map((q: Row) => ({
                  id: q.id,
                  user: q.user_id === userId ? p.display_name : 'Cohort Member',
                  text: q.question,
                  answered: Boolean(q.answered),
                })),
            }))}
            onAddQuestion={(sessionId, question) => {
              void run(
                () =>
                  checked(
                    db!
                      .from('session_questions')
                      .insert({ user_id: userId, session_id: sessionId, question: question.trim() })
                      .select('id')
                      .single()
                  ),
                'Question added to the live coaching queue.'
              );
            }}
          />
        )}
        {tab === 'privacy' && (
          <Panel title="Privacy requests and consent">
            <form
              onSubmit={e => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void run(
                  () =>
                    checked(
                      db!
                        .from('consent_records')
                        .insert({ user_id: userId, consent_type: String(f.get('type')), status: String(f.get('status')) })
                        .select('id')
                        .single()
                    ),
                  'Consent record saved. No downstream CRM or messaging integration is enabled by this action.'
                );
              }}
              className="space-y-3"
            >
              <label className="block">
                Marketing channel
                <select name="type" className={inputClass}>
                  <option value="marketing_email">Email</option>
                  <option value="marketing_sms">SMS</option>
                  <option value="marketing_whatsapp">WhatsApp</option>
                </select>
              </label>
              <label className="block">
                Consent
                <select name="status" className={inputClass}>
                  <option value="withdrawn">Withdraw consent</option>
                  <option value="granted">Grant consent</option>
                </select>
              </label>
              <button className={buttonClass}>Record my choice</button>
            </form>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={buttonClass}
                onClick={() =>
                  run(
                    () => checked(db!.from('data_export_requests').insert({ user_id: userId }).select('id').single()),
                    'Export request recorded. No export file or email has been generated.'
                  )
                }
              >
                Request data export
              </button>
              <button
                type="button"
                className="rounded-lg border border-rose-500 px-4 py-2 text-sm"
                onClick={() =>
                  run(
                    () =>
                      checked(
                        db!
                          .from('data_deletion_requests')
                          .insert({ user_id: userId, reason: 'Requested by authenticated member in Crew Hub.' })
                          .select('id')
                          .single()
                      ),
                    'Deletion request recorded for review. Your account has not been deleted.'
                  )
                }
              >
                Request account deletion
              </button>
            </div>
            {data.consents.map((c: Row) => (
              <p key={c.id} className="text-sm">
                {c.consent_type}: {c.status} · {dateText(c.created_at)}
              </p>
            ))}
            {data.exports.map((r: Row) => (
              <p key={r.id}>
                Export request: {r.status} · {dateText(r.requested_at)}
              </p>
            ))}
            {data.deletions.map((r: Row) => (
              <p key={r.id}>
                Deletion request: {r.status} · {dateText(r.requested_at)}
              </p>
            ))}
          </Panel>
        )}
        {tab === 'outcomes' && (
          <Panel title="Verified employment records">
            {!data.outcomes.length && <Empty>No verified starts have been recorded for your account.</Empty>}
            {data.outcomes.map((o: Row) => (
              <p key={o.id}>
                Start: {o.start_date} · Evidence: {o.evidence_type} · Recorded: {dateText(o.verified_at)}
              </p>
            ))}
            <Empty>Credential verification and employment-outcome recording are not available as direct browser writes.</Empty>
          </Panel>
        )}
        {tab === 'flags' && (
          <Panel title="Database feature flags">
            {data.flags.map((f: Row) => (
              <p key={f.key}>
                <code>{f.key}</code>: {f.enabled ? 'Enabled' : 'Disabled'} — {f.description}
              </p>
            ))}
            <Empty>Flags are read-only here. Browser storage cannot override these database values.</Empty>
          </Panel>
        )}
        {tab === 'superadmin' && isStaffRole(p.role) && (
          <Panel title="Superadmin & User Role / Pathway Management">
            <p className="text-xs text-slate-300">
              Signed in as <strong>{p.email}</strong> ({formatUserRoleLabel(p.role)}). Manage user roles matched to
              pathway selections and assign Single 1-on-1 or Group Coaching Programs.
            </p>
            <div className="space-y-4">
              {(data.all_profiles || []).map((u: Row) => (
                <form
                  key={u.id}
                  onSubmit={e => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    const nextRole = String(f.get('role'));
                    const nextProgramme = String(f.get('coaching_programme'));
                    void run(
                      () =>
                        checked(
                          db!.rpc('gycs_admin_set_user_role_and_programme', {
                            p_target_user_id: u.id,
                            p_role: nextRole,
                            p_coaching_programme: nextProgramme,
                          })
                        ),
                      `Updated ${u.email} to role "${nextRole}" and program "${formatCoachingProgrammeLabel(nextProgramme)}".`
                    );
                  }}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4 grid gap-3 sm:grid-cols-4 items-end"
                >
                  <div>
                    <p className="font-bold text-sm text-white">{u.display_name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                    <p className="text-xs text-emerald-400 mt-1">
                      Current: {formatUserRoleLabel(u.role)} ({u.role})
                    </p>
                  </div>
                  <label className="block text-xs">
                    User Role (Pathway / System)
                    <select name="role" defaultValue={u.role} className={`${inputClass} mt-1`}>
                      <option value="superadmin">superadmin (Superadmin)</option>
                      <option value="admin">admin (Admin)</option>
                      <option value="coach">coach (Coach)</option>
                      <option value="deckhand">deckhand (Deck Pathway)</option>
                      <option value="steward">steward (Interior Pathway)</option>
                      <option value="engineer">engineer (Engineering Pathway)</option>
                      <option value="chef">chef (Galley Pathway)</option>
                      <option value="school_leaver">school_leaver (Leaving School Pathway)</option>
                      <option value="career_changer">career_changer (Career Changer Pathway)</option>
                      <option value="aspirant">aspirant (Aspirant Pathway)</option>
                      <option value="junior_crew">junior_crew (Junior Crew Pathway)</option>
                      <option value="member">member (General / Undecided)</option>
                    </select>
                  </label>
                  <label className="block text-xs">
                    Coaching Program
                    <select
                      name="coaching_programme"
                      defaultValue={u.coaching_programme || 'group'}
                      className={`${inputClass} mt-1`}
                    >
                      <option value="one_on_one">Single 1-on-1 Coaching Program</option>
                      <option value="group">Group Coaching Program</option>
                    </select>
                  </label>
                  <button type="submit" className={buttonClass}>
                    Save User Role
                  </button>
                </form>
              ))}
            </div>
          </Panel>
        )}
      </fieldset>
      <footer className="border-t border-slate-800 pt-5 text-xs text-slate-500">
        Authenticated Supabase workspace · Superadmin: mail@chaddewet.com · Demo Deckhand: yachting@chaddewet.com.
      </footer>
    </div>
  );
}
