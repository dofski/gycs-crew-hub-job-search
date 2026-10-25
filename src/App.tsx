/** @license SPDX-License-Identifier: Apache-2.0 */
import React, { useEffect, useRef, useState } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';
import { ApplicationTracker } from './components/applications/ApplicationTracker.tsx';
import { OpportunityBoard } from './components/opportunities/OpportunityBoard.tsx';
import { CrewMapLocationSettings } from './components/settings/CrewMapLocationSettings.tsx';
import type { Application, Opportunity } from './types/database.ts';

type Row = Record<string, any>;
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
function publicKey(value: string): boolean {
  if (value?.startsWith('sb_publishable_')) return true;
  try {
    const part = value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(part.padEnd(Math.ceil(part.length / 4) * 4, '='))).role === 'anon';
  } catch { return false; }
}
const configured = url === 'https://wfblxexdqlxeequvywfc.supabase.co' && publicKey(key || '');
const db = configured ? createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm';
const buttonClass = 'rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50';
const panelClass = 'rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4';
const errorText = (e: unknown) => e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String(e.message) : 'The request failed. Please retry.';
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className={panelClass}><h2 className="text-lg font-bold">{title}</h2>{children}</section>; }
function Empty({ children }: { children: React.ReactNode }) { return <p className="text-sm text-slate-400">{children}</p>; }
function dateText(value: string) { return value ? new Date(value).toLocaleString() : 'Not recorded'; }
async function checked(query: any): Promise<any> { const { data, error } = await query; if (error) throw new Error(error.message); return data; }

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recovery, setRecovery] = useState(false);
  useEffect(() => {
    if (!db) { setLoading(false); return; }
    let active = true, changes = 0;
    const { data: { subscription } } = db.auth.onAuthStateChange((event, next) => {
      changes++; if (!active) return;
      setSession(next); setLoading(false);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_OUT') setRecovery(false);
    });
    const initial = changes;
    db.auth.getSession().then(({ data, error }) => {
      if (!active || changes !== initial) return;
      if (error) setError(error.message);
      setSession(data.session); setLoading(false);
    }).catch(e => { if (active) { setError(errorText(e)); setLoading(false); } });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  if (!db) return <main className="min-h-screen bg-slate-950 p-8 text-white"><h1>GYCS configuration required</h1><p>Set VITE_SUPABASE_URL to the Green Yacht Crew Solutions project and VITE_SUPABASE_ANON_KEY to its publishable or anon key, then rebuild. Privileged server keys are not accepted.</p></main>;
  if (loading) return <main className="min-h-screen bg-slate-950 p-8 text-white">Restoring your session...</main>;
  return <div className="min-h-screen bg-slate-950 text-slate-100"><header className="border-b border-slate-800 px-5 py-4"><h1 className="text-xl font-bold">GYCS <span className="text-emerald-400">CREW HUB</span></h1><p className="text-xs text-slate-400">Green Yacht Crew Solutions</p></header><main className="max-w-7xl mx-auto p-5">{error && <p role="alert" className="mb-4 text-rose-300">{error}</p>}{session && !recovery ? <Workspace key={session.user.id} session={session} onSignOut={async () => { const { error } = await db!.auth.signOut(); if (error) setError(error.message); }} /> : <AuthForm recovery={recovery} onRecovered={() => setRecovery(false)} />}</main></div>;
}

function AuthForm({ recovery, onRecovered }: { recovery: boolean; onRecovered: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const lock = useRef(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (lock.current) return; lock.current = true; setBusy(true); setError(''); setNotice('');
    const form = new FormData(e.currentTarget), email = String(form.get('email') || '').trim(), password = String(form.get('password') || '');
    try {
      if (recovery) { const { error } = await db!.auth.updateUser({ password }); if (error) throw error; onRecovered(); }
      else if (mode === 'reset') { const { error } = await db!.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin }); if (error) throw error; setNotice('If an account exists for this email, check its inbox for a reset link.'); }
      else if (mode === 'signup') {
        const { data, error } = await db!.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { display_name: String(form.get('display_name') || '').trim() } } });
        if (error) throw error; if (!data.session) setNotice('Check your email to confirm your account, then sign in.');
      } else { const { error } = await db!.auth.signInWithPassword({ email, password }); if (error) throw error; }
    } catch (e) { setError(errorText(e)); } finally { lock.current = false; setBusy(false); }
  }
  return <div className="max-w-md mx-auto"><Panel title={recovery ? 'Choose a new password' : mode === 'signup' ? 'Create your member account' : mode === 'reset' ? 'Reset your password' : 'Sign in'}><form onSubmit={submit}><fieldset disabled={busy} className="space-y-4">{mode === 'signup' && !recovery && <label className="block">Display name<input name="display_name" required maxLength={120} autoComplete="name" className={inputClass} /></label>}{!recovery && <label className="block">Email<input name="email" type="email" required autoComplete="email" className={inputClass} /></label>}{(recovery || mode !== 'reset') && <label className="block">Password<input name="password" type="password" required minLength={recovery || mode === 'signup' ? 8 : undefined} autoComplete={recovery || mode === 'signup' ? 'new-password' : 'current-password'} className={inputClass} /></label>}{error && <p role="alert" className="text-sm text-rose-300">{error}</p>}{notice && <p role="status" className="text-sm text-emerald-300">{notice}</p>}<button className={buttonClass}>{busy ? 'Please wait...' : recovery ? 'Update password' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}</button>{!recovery && <div className="flex flex-wrap gap-4 text-sm">{(['signin', 'signup', 'reset'] as const).filter(x => x !== mode).map(x => <button key={x} type="button" onClick={() => { setMode(x); setError(''); setNotice(''); }} className="text-emerald-300 underline">{x === 'signin' ? 'Sign in' : x === 'signup' ? 'Create account' : 'Forgot password?'}</button>)}</div>}</fieldset></form></Panel></div>;
}

function Workspace({ session, onSignOut }: { session: Session; onSignOut: () => Promise<void> }) {
  const userId = session.user.id;
  const initialTab = typeof window !== 'undefined' && window.location.hash === '#location-sharing' ? 'location' : 'today';
  const [tab, setTab] = useState(initialTab), [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const lock = useRef(false), sequence = useRef(0), mounted = useRef(true);
  async function refresh() {
    const request = ++sequence.current;
    const queries: Record<string, any> = {
      profile: db!.from('profiles').select('*').eq('id', userId).single(),
      map_card: db!.from('crew_map_cards').select('*').eq('user_id', userId).maybeSingle(),
      current_location: db!.from('crew_locations_current').select('*').eq('user_id', userId).maybeSingle(),
      vessel_link: db!.from('crew_vessel_links').select('*').eq('user_id', userId).maybeSingle(),
      applications: db!.from('applications').select('*,interviews(*)').eq('user_id', userId).order('created_at', { ascending: false }),
      opportunities: db!.from('opportunities').select('*,employers(id,name,is_verified)').eq('is_active', true).order('posted_at', { ascending: false }),
      cvs: db!.from('cv_versions').select('*').eq('user_id', userId).order('version', { ascending: false }).limit(1),
      documents: db!.from('documents').select('id,title,category,verification_status,expiry_date,is_sensitive').eq('user_id', userId),
      assessments: db!.from('assessments').select('id,status,motivation,department_fit,created_at').eq('user_id', userId).order('created_at', { ascending: false }),
      pathways: db!.from('pathway_versions').select('*,milestones(*)').eq('user_id', userId).order('version', { ascending: false }),
      lessons: db!.from('lessons').select('id,title,content,lesson_type,video_url,sort_order').eq('is_published', true).order('sort_order'),
      progress: db!.from('lesson_progress').select('id,lesson_id,completed').eq('user_id', userId),
      sessions: db!.from('live_sessions').select('id,title,scheduled_at,duration_mins').order('scheduled_at'),
      questions: db!.from('session_questions').select('id,session_id,question,answered,answer').eq('user_id', userId),
      consents: db!.from('consent_records').select('id,consent_type,status,created_at').eq('user_id', userId).order('created_at', { ascending: false }),
      exports: db!.from('data_export_requests').select('id,status,requested_at').eq('user_id', userId),
      deletions: db!.from('data_deletion_requests').select('id,status,requested_at').eq('user_id', userId),
      outcomes: db!.from('verified_starts').select('id,start_date,evidence_type,verified_at').eq('user_id', userId),
      flags: db!.from('feature_flags').select('key,enabled,description')
    };
    const entries = await Promise.all(Object.entries(queries).map(async ([name, q]) => {
      try { return [name, await checked(q)] as const; } catch (e) { throw new Error(`${name}: ${errorText(e)}`); }
    }));
    const next = Object.fromEntries(entries);
    if (!next.profile.is_active) throw new Error('This account is inactive. Contact your programme administrator.');
    if (mounted.current && request === sequence.current) setData(next);
  }
  useEffect(() => {
    mounted.current = true;
    refresh().catch(e => { if (mounted.current) setError(errorText(e)); }).finally(() => { if (mounted.current) setLoading(false); });
    return () => { mounted.current = false; sequence.current++; };
  }, [userId]);
  async function run(action: () => Promise<unknown>, message = 'Saved to Supabase.') {
    if (lock.current) return; lock.current = true; setBusy(true); setError(''); setNotice(''); let saved = false;
    try { await action(); saved = true; await refresh(); if (mounted.current) setNotice(message); }
    catch (e) { if (mounted.current) setError(`${saved ? 'The operation completed, but refreshing failed. Do not submit it again: ' : ''}${errorText(e)}`); }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  }
  if (loading) return <p>Loading your Supabase records...</p>;
  if (!data) return <Panel title="Your workspace could not load"><p role="alert" className="text-rose-300">{error}</p><button className={buttonClass} onClick={() => run(refresh, 'Workspace loaded.')}>Retry</button><button className="ml-4 underline" onClick={() => run(onSignOut)}>Sign out</button></Panel>;
  const p = data.profile, cv = data.cvs[0];
  const opportunities: Opportunity[] = data.opportunities.filter((o: Row) => o.employers?.is_verified).map((o: Row) => ({ id: o.id, title: o.title, department: o.department, employerName: o.employers.name, location: o.location || '', vesselType: o.vessel_type || '', contractType: o.contract_type, description: o.description || '', externalUrl: /^https?:\/\//i.test(o.external_url || '') ? o.external_url : '', source: o.source, isVerifiedEmployer: true, postedDate: o.posted_at.slice(0, 10) }));
  const applications: Application[] = data.applications.map((a: Row) => ({ id: a.id, userId: a.user_id, opportunityId: a.opportunity_id, title: a.external_title || 'Application', employer: a.external_employer || '', location: '', status: a.status, notes: a.notes || '', submittedAt: a.submitted_at, interviews: (a.interviews || []).map((i: Row) => ({ id: i.id, scheduledAt: i.scheduled_at, format: i.format, notes: i.notes || '', outcome: i.outcome, coachDebrief: i.coach_debrief })) }));
  const tabs = [['today','Today'],['profile','My profile'],['location','Location sharing'],['intake','Intake'],['pathway','My pathway'],['cv','CV'],['documents','Documents'],['opportunities','Opportunities'],['applications','Applications'],['learn','Learning'],['live','Live sessions'],['privacy','Privacy'],['outcomes','Outcomes'],['flags','Feature flags']];
  return <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><strong>{p.display_name}</strong><p className="text-xs text-slate-400">{p.email} · {p.role}</p></div><div className="flex gap-3"><button disabled={busy} onClick={() => run(refresh, 'Records refreshed.')} className="underline">Refresh</button><button disabled={busy} onClick={() => run(onSignOut)} className={buttonClass}>Sign out</button></div></div><nav className="flex flex-wrap gap-2" aria-label="Workspace navigation">{tabs.map(([id,label]) => <button key={id} disabled={busy} onClick={() => { setTab(id); setNotice(''); setError(''); }} className={`rounded-lg px-3 py-2 text-xs ${tab === id ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300'}`}>{label}</button>)}</nav>{error && <p role="alert" className="rounded-lg border border-rose-700 p-3 text-rose-300">{error}</p>}{notice && <p role="status" className="text-emerald-300">{notice}</p>}{busy && <p role="status">Waiting for Supabase...</p>}<fieldset disabled={busy} className="min-w-0 space-y-5">
    {tab === 'today' && <Panel title="Your career workspace"><p>Journey stage: <strong>{p.journey_state || 'exploring'}</strong></p><p>{data.documents.length} documents · {data.applications.length} applications · {data.assessments.length} assessments</p><Empty>This workspace shows database records only. An empty section means no records have been created or made available to your account. Coaching does not guarantee employment.</Empty>{!p.organisation_id && <Empty>Your account is not yet assigned to a coaching organisation. Your personal records remain available; cohort access requires enrolment by your programme administrator.</Empty>}</Panel>}
    {tab === 'profile' && <Panel title="My profile"><form key={p.updated_at} onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); void run(() => checked(db!.from('profiles').update({ display_name: String(f.get('display_name')).trim(), phone: String(f.get('phone') || '') || null, timezone: String(f.get('timezone')).trim() }).eq('id', userId).select('id').single())); }} className="space-y-3"><label className="block">Display name<input name="display_name" required maxLength={120} defaultValue={p.display_name} className={inputClass} /></label><label className="block">Phone<input name="phone" type="tel" defaultValue={p.phone || ''} className={inputClass} /></label><label className="block">Timezone<input name="timezone" required defaultValue={p.timezone || 'Africa/Johannesburg'} className={inputClass} /></label><button className={buttonClass}>Save profile</button></form><div className="pt-2"><button type="button" onClick={() => setTab('location')} className="text-xs text-emerald-300 underline">Configure M/Y Eye location sharing &amp; coach map card →</button></div><Empty>Email is managed by Supabase Auth. Roles and organisation membership cannot be changed here.</Empty></Panel>}
    {tab === 'location' && <CrewMapLocationSettings db={db!} userId={userId} profile={p} mapCard={data.map_card} currentLocation={data.current_location} vesselLink={data.vessel_link} busy={busy} onRun={run} />}
    {tab === 'intake' && <Panel title="Intake assessment"><form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); void run(() => checked(db!.from('assessments').insert({ user_id: userId, status: 'in_progress', motivation: { text: String(f.get('motivation')).trim() }, department_fit: String(f.get('department')) }).select('id').single()), 'Assessment saved. Your journey stage has not been changed; pathway approval requires a coach.'); }} className="space-y-3"><label className="block">Your background and career goals<textarea name="motivation" required maxLength={10000} className={inputClass} rows={5} /></label><label className="block">Preferred department<select name="department" className={inputClass}><option value="deck">Deck</option><option value="interior">Interior</option></select></label><button className={buttonClass}>Save assessment</button></form>{data.assessments.map((a: Row) => <article key={a.id} className="border-t border-slate-800 pt-3"><p>{a.department_fit} · {a.status} · {dateText(a.created_at)}</p><p>{typeof a.motivation === 'string' ? a.motivation : a.motivation?.text || ''}</p></article>)}</Panel>}
    {tab === 'pathway' && <Panel title="Agreed pathways">{!data.pathways.length && <Empty>No pathway has been assigned yet. Saving an intake does not automatically approve a pathway.</Empty>}{data.pathways.map((v: Row) => <article key={v.id}><h3>{v.target_role} · version {v.version}</h3><p>{v.summary}</p><ul className="space-y-2">{(v.milestones || []).sort((a: Row,b: Row) => a.sort_order-b.sort_order).map((m: Row) => <li key={m.id}>{m.title} — {m.status}</li>)}</ul></article>)}</Panel>}
    {tab === 'cv' && <Panel title="Persistent CV draft"><Empty>Saving creates a new version. Its fields are self-reported claims, not proof of credential verification.</Empty><form key={cv?.id || 'new-cv'} onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); const claim = (x: any): any => Array.isArray(x) ? x.map(claim) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k,v]) => [k,k === 'label' ? 'claimed' : claim(v)])) : x; void run(() => checked(db!.from('cv_versions').insert({ user_id: userId, version: (cv?.version || 0)+1, personal_info: claim({ ...(cv?.personal_info || {}), fullName: String(f.get('fullName')), nationality: String(f.get('nationality')), location: String(f.get('location')) }), objective: { text: String(f.get('objective')), label: 'claimed' }, experience: claim(cv?.experience || []), qualifications: claim(cv?.qualifications || []), skills: claim(cv?.skills || []), references: claim(cv?.references || []), additional: claim(cv?.additional || {}) }).select('id').single()), 'A new CV version was saved to Supabase.'); }} className="space-y-3"><p>Latest saved version: {cv?.version || 'None'}</p><label className="block">Full name<input name="fullName" required defaultValue={cv?.personal_info?.fullName || p.display_name} className={inputClass} /></label><label className="block">Nationality<input name="nationality" defaultValue={cv?.personal_info?.nationality || ''} className={inputClass} /></label><label className="block">Current location<input name="location" defaultValue={cv?.personal_info?.location || ''} className={inputClass} /></label><label className="block">Professional objective<textarea name="objective" required maxLength={3000} defaultValue={cv?.objective?.text || ''} rows={5} className={inputClass} /></label><button className={buttonClass}>Save new CV version</button></form></Panel>}
    {tab === 'documents' && <Panel title="Document records"><Empty>File upload and download are not enabled in this patch. No private Storage bucket or signed-download flow has been provisioned. Do not upload sensitive documents through a demo control.</Empty>{!data.documents.length && <Empty>No document records yet.</Empty>}{data.documents.map((d: Row) => <p key={d.id}>{d.title} · {d.category} · {d.verification_status}{d.expiry_date ? ` · Expires ${d.expiry_date}` : ''}</p>)}</Panel>}
    {tab === 'opportunities' && (opportunities.length ? <OpportunityBoard opportunities={opportunities} onSaveToApplications={o => { const exists = applications.some(a => a.opportunityId === o.id); if (exists) { setTab('applications'); return; } void run(() => checked(db!.from('applications').insert({ user_id: userId, opportunity_id: o.id, external_title: o.title, external_employer: o.employerName, external_url: o.externalUrl || null, status: 'saved' }).select('id').single()), 'Opportunity saved to your applications.'); }} /> : <Panel title="Opportunities"><Empty>No active opportunities from verified employers are available. This view does not manufacture job listings or dispatch demo webhooks.</Empty></Panel>)}
    {tab === 'applications' && (applications.length ? <ApplicationTracker applications={applications} onUpdateStatus={(id,status) => { void run(() => checked(db!.from('applications').update({ status }).eq('id',id).eq('user_id',userId).select('id').single())); }} onAddInterview={(id,date,notes) => { void run(() => checked(db!.from('interviews').insert({ application_id:id, scheduled_at:new Date(date).toISOString(), format:'video', notes }).select('id').single()), 'Interview saved. You can update the application status separately.'); }} /> : <Panel title="Applications"><Empty>No applications saved yet.</Empty></Panel>)}
    {tab === 'learn' && <Panel title="Learning">{!data.lessons.length && <Empty>No published lessons are available to your current enrolment.</Empty>}{data.lessons.map((l: Row) => { const progress = data.progress.find((v: Row) => v.lesson_id === l.id); return <article key={l.id} className="border-t border-slate-800 pt-3 space-y-2"><h3>{l.title}</h3><p className="whitespace-pre-wrap text-sm text-slate-300">{l.content}</p><label className="flex gap-2"><input type="checkbox" checked={!!progress?.completed} onChange={e => { const completed=e.target.checked; const payload={completed,completed_at:completed?new Date().toISOString():null}; void run(() => checked(progress ? db!.from('lesson_progress').update(payload).eq('id',progress.id).eq('user_id',userId).select('id').single() : db!.from('lesson_progress').insert({...payload,user_id:userId,lesson_id:l.id}).select('id').single())); }} />Mark complete</label></article>; })}<Empty>Assignment submission is not enabled in this patch.</Empty></Panel>}
    {tab === 'live' && <Panel title="Live sessions">{!data.sessions.length && <Empty>No sessions are available to your current enrolment.</Empty>}{data.sessions.map((s: Row) => <article key={s.id} className="space-y-3 border-t border-slate-800 pt-3"><h3>{s.title}</h3><p>{dateText(s.scheduled_at)} · {s.duration_mins} minutes</p><form onSubmit={e => { e.preventDefault(); const f=new FormData(e.currentTarget); void run(() => checked(db!.from('session_questions').insert({user_id:userId,session_id:s.id,question:String(f.get('question')).trim()}).select('id').single())); }} className="space-y-2"><label className="block">Question<input name="question" required maxLength={4000} className={inputClass} /></label><button className={buttonClass}>Save question</button></form>{data.questions.filter((q: Row) => q.session_id===s.id).map((q: Row) => <p key={q.id}>{q.question} — {q.answered ? q.answer || 'Answered' : 'Awaiting answer'}</p>)}</article>)}<Empty>Joining recorded sessions is unavailable until persistent recording consent is implemented.</Empty></Panel>}
    {tab === 'privacy' && <Panel title="Privacy requests and consent"><form onSubmit={e => {e.preventDefault(); const f=new FormData(e.currentTarget); void run(() => checked(db!.from('consent_records').insert({user_id:userId,consent_type:String(f.get('type')),status:String(f.get('status'))}).select('id').single()), 'Consent record saved. No downstream CRM or messaging integration is enabled by this action.');}} className="space-y-3"><label className="block">Marketing channel<select name="type" className={inputClass}><option value="marketing_email">Email</option><option value="marketing_sms">SMS</option><option value="marketing_whatsapp">WhatsApp</option></select></label><label className="block">Consent<select name="status" className={inputClass}><option value="withdrawn">Withdraw consent</option><option value="granted">Grant consent</option></select></label><button className={buttonClass}>Record my choice</button></form><div className="flex flex-wrap gap-3"><button type="button" className={buttonClass} onClick={() => run(() => checked(db!.from('data_export_requests').insert({user_id:userId}).select('id').single()), 'Export request recorded. No export file or email has been generated.')}>Request data export</button><button type="button" className="rounded-lg border border-rose-500 px-4 py-2 text-sm" onClick={() => run(() => checked(db!.from('data_deletion_requests').insert({user_id:userId,reason:'Requested by authenticated member in Crew Hub.'}).select('id').single()), 'Deletion request recorded for review. Your account has not been deleted.')}>Request account deletion</button></div>{data.consents.map((c: Row) => <p key={c.id} className="text-sm">{c.consent_type}: {c.status} · {dateText(c.created_at)}</p>)}{data.exports.map((r: Row) => <p key={r.id}>Export request: {r.status} · {dateText(r.requested_at)}</p>)}{data.deletions.map((r: Row) => <p key={r.id}>Deletion request: {r.status} · {dateText(r.requested_at)}</p>)}</Panel>}
    {tab === 'outcomes' && <Panel title="Verified employment records">{!data.outcomes.length && <Empty>No verified starts have been recorded for your account.</Empty>}{data.outcomes.map((o: Row) => <p key={o.id}>Start: {o.start_date} · Evidence: {o.evidence_type} · Recorded: {dateText(o.verified_at)}</p>)}<Empty>Credential verification and employment-outcome recording are not available as direct browser writes.</Empty></Panel>}
    {tab === 'flags' && <Panel title="Database feature flags">{data.flags.map((f: Row) => <p key={f.key}><code>{f.key}</code>: {f.enabled ? 'Enabled' : 'Disabled'} — {f.description}</p>)}<Empty>Flags are read-only here. Browser storage cannot override these database values.</Empty></Panel>}
  </fieldset><footer className="border-t border-slate-800 pt-5 text-xs text-slate-500">Authenticated Supabase workspace · No demo personas or seeded example records.</footer></div>;
}
