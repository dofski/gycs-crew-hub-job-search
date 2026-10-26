import React, {useEffect, useRef, useState} from 'react';
import {createClient, type Session} from '@supabase/supabase-js';
import Landing from './Landing';
import {GumletLiveEmbed, useGumletLiveStatus} from './components/live/GumletLiveStream';
import './portal.css';

type Payload = Record<string, string | boolean>;
type Intake = {payload: Payload; step: number; status: string; submitted_at?: string};
type Profile = {display_name: string; country_code: string; timezone: string; phone?: string; role: string; is_active: boolean};
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';
function publicKey(value: string) {
  if (value.startsWith('sb_publishable_')) return true;
  try { const s = value.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'); return JSON.parse(atob(s.padEnd(Math.ceil(s.length/4)*4,'='))).role === 'anon'; } catch { return false; }
}
const db = url === 'https://wfblxexdqlxeequvywfc.supabase.co' && publicKey(key) ? createClient(url, key) : null;
const blank: Payload = {display_name:'',country_code:'ZA',timezone:'Africa/Johannesburg',phone:'',experience_level:'beginner',department:'undecided',goals:'',skills:'',availability:'',training_status:'',readiness:'',budget_band:'Prefer not to say',participation:false,privacy_acknowledged:false,marketing_email:false};
const steps = ['About you','Career direction','Readiness','Your choices','Review'];
const labels: Record<string,string> = {display_name:'Full name',country_code:'Country code',timezone:'Timezone',phone:'Phone (optional)',experience_level:'Experience level',department:'Preferred department',goals:'Your career goals',skills:'Transferable skills (optional)',availability:'Availability and timing',training_status:'Training completed or planned',readiness:'Document readiness (optional)',budget_band:'Budget planning',participation:'Request programme review',privacy_acknowledged:'Intake notice acknowledged',marketing_email:'Optional email marketing'};
const errorText = (e: unknown) => e && typeof e === 'object' && 'message' in e ? String(e.message) : 'Something went wrong. Please retry.';

function Video() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [playing,setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [sound,setSound] = useState(false);
  const command = (func: string) => frame.current?.contentWindow?.postMessage(JSON.stringify({event:'command',func,args:[]}), 'https://www.youtube-nocookie.com');
  return <section className="gy-video" aria-label="Yachting video">
    {playing ? <iframe ref={frame} title="Yachting inspiration — YouTube video" src={`https://www.youtube-nocookie.com/embed/SSbY0xVW42Q?autoplay=1&mute=1&loop=1&playlist=SSbY0xVW42Q&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <div className="gy-video-fallback"><span>YOUR NEXT CHAPTER</span><p>A career beyond the ordinary.</p></div>}
    <div className="gy-video-controls"><button type="button" onClick={() => {setPlaying(!playing);setSound(false);}}>{playing ? 'Stop video' : 'Play video'}</button>{playing && <button type="button" aria-pressed={sound} onClick={() => {command(sound ? 'mute' : 'unMute');command('playVideo');setSound(!sound);}}>{sound ? 'Mute sound' : 'Enable sound'}</button>}<a href="https://www.youtube.com/watch?v=SSbY0xVW42Q" target="_blank" rel="noreferrer">Watch on YouTube ↗</a></div>
    <p className="gy-small">If autoplay or embedding is blocked, use the player controls or watch on YouTube. Sound requires interaction on many browsers.</p>
  </section>;
}

export default function Portal() {
  const [view,setView] = useState(() => typeof window !== 'undefined' && window.location.hash === '#live-coaching' ? 'live' : 'home');
  const {isLive} = useGumletLiveStatus();
  const [session,setSession] = useState<Session|null>(null);
  const [authReady,setAuthReady] = useState(false);
  const [profile,setProfile] = useState<Profile|null>(null);
  const [intake,setIntake] = useState<Intake|null>(null);
  const [payload,setPayload] = useState<Payload>({...blank});
  const [step,setStep] = useState(0);
  const [loading,setLoading] = useState(false);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [retry,setRetry] = useState(0);
  const lock = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const currentUser = useRef<string|undefined>(undefined);
  currentUser.current = session?.user.id;
  useEffect(() => {
    if (!db) {setAuthReady(true);return;}
    let alive = true, events = 0;
    const {data:{subscription}} = db.auth.onAuthStateChange((event,next) => {
      events++; if (!alive) return;
      setSession(next);setAuthReady(true);
      if (event === 'PASSWORD_RECOVERY') setView('password');
      if (event === 'SIGNED_OUT') {setView('home');setProfile(null);setIntake(null);setPayload({...blank});}
    });
    const initial = events;
    db.auth.getSession().then(({data,error}) => {if (alive && initial === events) {setSession(data.session);setAuthReady(true);if(error)setError(error.message);}}).catch(e => {if(alive){setError(errorText(e));setAuthReady(true);}});
    return () => {alive=false;subscription.unsubscribe();};
  },[]);
  useEffect(() => {
    setProfile(null);setIntake(null);setPayload({...blank});setStep(0);
    if (!session || !db) {setLoading(false);return;}
    let alive=true;setLoading(true);setError('');
    (async () => {
      const p = await db.from('profiles').select('display_name,country_code,timezone,phone,role,is_active').eq('id',session.user.id).single();
      if(p.error)throw p.error;
      if(!p.data.is_active)throw new Error('This account is inactive. Contact your programme administrator.');
      let saved: Intake|null = null;
      if(p.data.role === 'member') {
        const i = await db.from('onboarding_intakes').select('payload,step,status,submitted_at').eq('user_id',session.user.id).maybeSingle();
        if(i.error)throw i.error;saved=i.data as Intake|null;
      }
      if(alive){setProfile(p.data);setIntake(saved);setPayload({...blank,display_name:p.data.display_name,country_code:p.data.country_code||'ZA',timezone:p.data.timezone||'Africa/Johannesburg',phone:p.data.phone||'',...(saved?.payload||{})});setStep(Math.max(0,Math.min(4,saved?.step||0)));}
    })().catch(e=>{if(alive)setError(errorText(e));}).finally(()=>{if(alive)setLoading(false);});
    return ()=>{alive=false;};
  },[session?.user.id,retry]);
  function go(next:string){setError('');setNotice('');setView(next);window.scrollTo({top:0,behavior:'auto'});}
  async function auth(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();if(!db||lock.current)return;lock.current=true;setBusy(true);setError('');setNotice('');
    const f=new FormData(e.currentTarget), email=String(f.get('email')||'').trim(), password=String(f.get('password')||'');
    try {
      if(view==='password'){const r=await db.auth.updateUser({password});if(r.error)throw r.error;go('intake');setNotice('Password updated.');}
      else if(view==='reset'){const r=await db.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});if(r.error)throw r.error;setNotice('If an account exists, check your email for a reset link.');}
      else if(view==='signup'){
        const r=await db.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin,data:{display_name:String(f.get('name')||'').trim()}}});if(r.error)throw r.error;
        if(r.data.session)go('intake');else setNotice('Check your email to verify your account, then sign in to begin your intake.');
      } else {const r=await db.auth.signInWithPassword({email,password});if(r.error)throw r.error;go('intake');}
    }catch(e){setError(errorText(e));}finally{lock.current=false;setBusy(false);}
  }
  async function signout(){if(!db||lock.current)return;lock.current=true;setBusy(true);try{const r=await db.auth.signOut();if(r.error)throw r.error;}catch(e){setError(errorText(e));}finally{lock.current=false;setBusy(false);}}
  async function save(next:number,submit=false){
    if(!db||!session||lock.current)return;
    if(submit && (!String(payload.goals).trim() || !payload.participation || !payload.privacy_acknowledged)){setError('Complete your goals and required acknowledgements before submitting.');return;}
    const uid=session.user.id;lock.current=true;setBusy(true);setError('');setNotice('');
    try{const r=await db.rpc('gycs_save_onboarding',{p_payload:payload,p_step:next,p_submit:submit});if(r.error)throw r.error;
      if(currentUser.current!==uid)return;
      const saved=r.data as Intake;setIntake(saved);setStep(saved.step);setPayload({...blank,...saved.payload});setNotice(saved.status==='submitted'?'Your intake was submitted. Programme admission and coach assignment require review.':'Draft saved. You can sign out and resume later.');
    }catch(e){if(currentUser.current===uid)setError(errorText(e));}finally{lock.current=false;setBusy(false);}
  }
  const field=(name:string,required=false,multi=false)=> <label key={name}>{labels[name]}{required?' *':''}{multi?<textarea value={String(payload[name]||'')} required={required} maxLength={3000} rows={4} onChange={e=>setPayload({...payload,[name]:e.target.value})}/>:<input value={String(payload[name]||'')} required={required} type={name==='phone'?'tel':'text'} maxLength={name==='country_code'?2:name==='phone'?40:120} pattern={name==='country_code'?'[A-Z]{2}':undefined} onChange={e=>setPayload({...payload,[name]:name==='country_code'?e.target.value.toUpperCase():e.target.value})}/>}</label>;
  const select=(name:string,options:[string,string][])=> <label>{labels[name]}<select value={String(payload[name])} onChange={e=>setPayload({...payload,[name]:e.target.value})}>{options.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>;
  return <div className="gy-portal"><header className="gy-header"><a href="/" className="gy-brand" aria-label="Green Yacht Crew Solutions home"><img src="/logo-mark.svg" alt="" width={44} height={44}/><span className="gy-brand-text">GYCS<span>GREEN YACHT CREW SOLUTIONS</span></span></a><nav aria-label="Main navigation"><button disabled={busy} onClick={()=>go('home')}>Explore</button><button disabled={busy} onClick={()=>go('live')}>Live coaching</button>{session?<><button disabled={busy} onClick={()=>go('intake')}>My onboarding</button><a className="gy-outline" href="/?workspace=1">Open Crew Hub</a><button disabled={busy} onClick={signout}>Sign out</button></>:<button className="gy-outline" disabled={!authReady||busy} onClick={()=>go('signin')}>Member sign in</button>}</nav></header>
    <main className="gy-main">{!db&&<p role="alert" className="gy-error">The application needs its approved Supabase configuration before accounts or intake can be saved.</p>}{error&&<p role="alert" className="gy-error">{error}</p>}{notice&&<p role="status" className="gy-notice">{notice}</p>}
    {view==='home'&&<Landing session={!!session} canStart={!!db&&authReady} onStart={()=>go(session?'intake':'signup')} onSignIn={()=>go('signin')} video={<Video/>}/>}
    {view==='live'&&<section className="gy-section" id="live-coaching"><p className="gy-eyebrow">LIVE INTERACTIVE COACHING</p><h1>Live Coaching &amp; Strategy Room</h1><p className="gy-lead">Watch live coaching broadcasts and strategy breakdowns with Chad de Wet.</p>{isLive ? <GumletLiveEmbed /> : <div className="gy-card"><p>No live broadcast is actively streaming right now. The live video player will appear here automatically as soon as Chad goes live.</p></div>}</section>}
    {['signin','signup','reset','password'].includes(view)&&<section className="gy-auth"><div><p className="gy-eyebrow">YOUR NEXT CHAPTER</p><h1>{view==='signup'?'Start with you.':view==='reset'?'Reset your password.':view==='password'?'Choose a new password.':'Welcome aboard.'}</h1><p>One account for your intake, personal career records and Crew Hub.</p><p className="gy-small">New accounts are crew/member accounts. Coach and administrator access cannot be selected during signup.</p></div><form className="gy-card" onSubmit={auth}><fieldset disabled={busy||!db||!authReady}>{view==='signup'&&<label>Full name<input name="name" required maxLength={120} autoComplete="name"/></label>}{view!=='password'&&<label>Email<input name="email" type="email" required autoComplete="email"/></label>}{view!=='reset'&&<label>Password<input name="password" type="password" required minLength={view==='signin'?undefined:8} autoComplete={view==='signin'?'current-password':'new-password'}/></label>}<button className="gy-primary" type="submit">{busy?'Please wait…':view==='signup'?'Create account':view==='reset'?'Send recovery link':view==='password'?'Update password':'Sign in'}</button><div className="gy-actions">{view!=='password'&&<><button type="button" onClick={()=>go(view==='signup'?'signin':'signup')}>{view==='signup'?'Already registered? Sign in':'Create an account'}</button><button type="button" onClick={()=>go('reset')}>Forgot password?</button></>}</div>{view==='signup'&&<p className="gy-small">Creating an account is not programme admission. Email verification is required before saving an intake.</p>}</fieldset></form></section>}
    {view==='intake'&&(!session?<section className="gy-card"><h2>Sign in to save your progress</h2><button className="gy-primary" onClick={()=>go('signin')}>Sign in</button></section>:loading?<p role="status">Loading your saved onboarding…</p>:!profile?<section className="gy-card"><h2>We could not load your profile</h2><button className="gy-primary" onClick={()=>setRetry(retry+1)}>Retry</button></section>:profile.role!=='member'?<section className="gy-card"><h2>Your staff workspace</h2><p>This intake is for crew members. Your existing role has not been changed.</p><a className="gy-primary" href="/?workspace=1">Open Crew Hub</a></section>:intake?.status==='submitted'?<section className="gy-success gy-card"><p className="gy-eyebrow">INTAKE RECEIVED</p><h1>Thank you, {profile.display_name}.</h1><p>Your assessment and consent choices have been saved. Programme admission, cohort enrolment and coach assignment still require review.</p><p>Next: keep your profile up to date and prepare your career information in the Crew Hub. No qualification or job has been awarded by submitting this form.</p><a className="gy-primary" href="/?workspace=1">Continue to Crew Hub ↗</a><p className="gy-small">Submitted: {intake.submitted_at?new Date(intake.submitted_at).toLocaleString():'Recorded'}</p></section>:<section className="gy-intake"><p className="gy-eyebrow">YOUR STARTING POINT</p><h1>Let's chart your next chapter.</h1><p>Step {step+1} of 5 · Saved drafts stay with your account. Fields marked * are required.</p><ol className="gy-steps">{steps.map((s,i)=><li key={s} aria-current={i===step?'step':undefined} className={i===step?'active':''}>{i+1}. {s}</li>)}</ol><form ref={form} className="gy-card" onSubmit={e=>{e.preventDefault();void save(Math.min(4,step+1),step===4);}}><fieldset disabled={busy}><h2>{steps[step]}</h2>{step===0&&<>{field('display_name',true)}{field('country_code',true)}<p className="gy-small">Two-letter country code, for example ZA or GB.</p>{field('timezone',true)}<p className="gy-small">Use a timezone such as Africa/Johannesburg or Europe/London.</p>{field('phone')}</>}{step===1&&<>{select('experience_level',[['beginner','New to yachting'],['career_changer','Changing careers'],['experienced','Experienced crew']])}{select('department',[['undecided','Help me decide'],['deck','Deck'],['interior','Interior'],['engineering','Engineering'],['galley','Galley']])}{field('goals',true,true)}<p className="gy-small">Please use at least 10 characters to describe your goals.</p>{field('skills',false,true)}</>}{step===2&&<><p>No document uploads, passport numbers, diagnoses or bank details.</p>{field('availability',true,true)}{field('training_status',true,true)}{field('readiness',false,true)}{select('budget_band',[['Prefer not to say','Prefer not to say'],['Need planning support','Need planning support'],['Some budget available','Some budget available'],['Budget planned','Budget planned']])}</>}{step===3&&<><section className="gy-disclosure"><h3>Intake notice</h3><p>We store your account, contact details and intake answers in the GYCS Supabase backend to support your application and career preparation. Saved drafts are private to your account through the app. Submitting creates an assessment that authorised programme staff may access under the app's assignment and organisation rules.</p><p>Submitting requests a programme review; it does not confirm admission, a coach, training, travel eligibility or employment. Do not include sensitive identity, health or banking information. You can record marketing withdrawal and request export or deletion through the Crew Hub Privacy section; those requests require processing.</p><p>Email marketing is optional and not required to apply. No CRM or marketing messages are sent by this form.</p><p className="gy-small">Notice version: gycs-intake-2026-10-22</p></section>{[['participation','I request a programme review and understand that submission is not acceptance.'],['privacy_acknowledged','I have read the intake notice and understand how my answers are stored and used.'],['marketing_email','Optional: I would like GYCS programme news by email.']].map(([name,label])=><label className="gy-check" key={name}><input type="checkbox" required={name!=='marketing_email'} checked={payload[name]===true} onChange={e=>setPayload({...payload,[name]:e.target.checked})}/><span>{label}</span></label>)}</>}{step===4&&<><p>Review your answers. Use Back to make changes before submitting.</p><dl className="gy-review">{Object.entries(labels).map(([name,label])=><div key={name}><dt>{label}</dt><dd>{typeof payload[name]==='boolean'?(payload[name]?'Yes':'No'):String(payload[name]||'Not provided')}</dd></div>)}</dl><p>Submission saves your assessment, consent and onboarding completion together. It does not enrol you in a programme.</p></>}<div className="gy-actions">{step>0&&<button type="button" className="gy-outline" onClick={()=>setStep(step-1)}>Back</button>}<button type="button" className="gy-outline" onClick={()=>save(step)}>Save draft</button><button type="submit" className="gy-primary">{busy?'Saving…':step===4?'Submit intake':'Save and continue'}</button></div><p className="gy-small">Changes are not saved until you choose a save action. Do not close the page while saving.</p></fieldset></form></section>)}
    </main><footer className="gy-footer"><p className="gy-footer-brand"><img src="/logo-mark.svg" alt="" width={24} height={24}/>Green Yacht Crew Solutions · Crew Hub</p><p>Career preparation and coaching. No guaranteed employment.</p><button onClick={()=>go(session?'intake':'signin')}>{session?'My onboarding':'Member sign in'}</button></footer></div>;
}
