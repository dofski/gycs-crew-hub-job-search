import React,{useEffect,useRef,useState} from 'react';
import {createClient,type Session} from '@supabase/supabase-js';
import {cleanIntake,intakeFields} from '../shared/ai-contract.mjs';
import {isCrewRole, isStaffRole} from './lib/roles';
import './portal.css';
type Row=Record<string,any>;
const url=import.meta.env.VITE_SUPABASE_URL?.trim();
const key=import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()||'';
function safeKey(k:string){if(k.startsWith('sb_publishable_'))return true;try{const s=k.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(s.padEnd(Math.ceil(s.length/4)*4,'='))).role==='anon';}catch{return false;}}
const db=url==='https://wfblxexdqlxeequvywfc.supabase.co'&&safeKey(key)?createClient(url,key):null;
const labels:Record<string,string>={experience_level:'Experience level',department:'Preferred department',goals:'Career goals',skills:'Transferable skills',availability:'Availability',training_status:'Training completed or planned',readiness:'Readiness questions',budget_band:'Budget planning (optional)'};
const message=(e:any)=>e?.message||'Request failed. Please retry.';
export default function AIWorkspace(){
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false),[profile,setProfile]=useState<Row|null>(null);
 const [intake,setIntake]=useState<Row>({}),[savedAt,setSavedAt]=useState<string|null>(null),[proposals,setProposals]=useState<Row[]>([]);
 const [apiKey,setApiKey]=useState(''),[models,setModels]=useState<Row[]>([]),[model,setModel]=useState(''),[verified,setVerified]=useState(false);
 const [consent,setConsent]=useState(false),[usage,setUsage]=useState(false),[question,setQuestion]=useState('Help me identify what is missing from my intake.');
 const [history,setHistory]=useState<Row[]>([]),[answer,setAnswer]=useState<Row|null>(null),[generated,setGenerated]=useState<Row|null>(null);
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[retry,setRetry]=useState(0);
 const [notes,setNotes]=useState<Record<string,string>>({});
 const epoch=useRef(0),lock=useRef(false),controller=useRef<AbortController|null>(null),user=useRef<string|undefined>(undefined);
 user.current=session?.user.id;
 function clearKey(){epoch.current++;controller.current?.abort();setApiKey('');setVerified(false);setModels([]);setModel('');setConsent(false);setUsage(false);}
 useEffect(()=>{
  if(!db){setReady(true);return;}let alive=true,events=0;
  const {data:{subscription}}=db.auth.onAuthStateChange((_event,next)=>{events++;if(alive){setSession(next);setReady(true);}});
  const start=events;db.auth.getSession().then(({data,error})=>{if(alive&&events===start){setSession(data.session);setReady(true);if(error)setError(error.message);}}).catch(e=>{if(alive){setError(message(e));setReady(true);}});
  return()=>{alive=false;controller.current?.abort();subscription.unsubscribe();};
 },[]);
 useEffect(()=>{clearKey();setAnswer(null);setGenerated(null);setHistory([]);setProfile(null);setIntake({});setSavedAt(null);setProposals([]);},[session?.user.id]);
 useEffect(()=>{
  if(!db||!session){setLoading(false);return;}let alive=true;setLoading(true);setError('');
  (async()=>{
   const p=await db.from('profiles').select('id,display_name,role,is_active,organisation_id').eq('id',session.user.id).single();if(p.error)throw p.error;if(!p.data.is_active)throw new Error('This account is inactive.');
   let draft:Row|null=null,original:Row|null=null;
   if(isCrewRole(p.data.role)){
    const results=await Promise.all([db.from('ai_intake_drafts').select('payload,updated_at').eq('user_id',session.user.id).maybeSingle(),db.from('onboarding_intakes').select('payload,status').eq('user_id',session.user.id).maybeSingle()]);
    for(const r of results)if(r.error)throw r.error;draft=results[0].data;original=results[1].data;
   }
   const rows=await db.from('ai_pathway_proposals').select('*').order('created_at',{ascending:false}).limit(30);if(rows.error)throw rows.error;
   if(alive){setProfile(p.data);setIntake(cleanIntake(draft?.payload||original?.payload||{}));setSavedAt(draft?.updated_at||null);setProposals(rows.data||[]);}
  })().catch(e=>{if(alive)setError(message(e));}).finally(()=>{if(alive)setLoading(false);});
  return()=>{alive=false;};
 },[session?.user.id,retry]);
 async function run(action:()=>Promise<void>){if(lock.current)return;lock.current=true;setBusy(true);setError('');setNotice('');try{await action();}catch(e){setError(message(e));}finally{lock.current=false;setBusy(false);}}
 async function ask(action:string){
  if(!session||!db)return;
  const current=epoch.current,uid=session.user.id,snapshot=cleanIntake(intake);
  if(action!=='verify'&&!verified)throw new Error('Verify your key first.');
  if(action!=='verify'&&!usage)throw new Error('Confirm use of your own Google quota.');
  if(['assist','propose'].includes(action)&&!consent)throw new Error('Consent to sending the displayed career fields and conversation to Google.');
  controller.current=new AbortController();
  const {data:auth,error:authError}=await db.auth.getSession();if(authError||!auth.session)throw new Error('Sign in again.');
  const r=await fetch('/api/gemini',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+auth.session.access_token},cache:'no-store',signal:controller.current.signal,body:JSON.stringify({action,apiKey,model,allowUsage:usage,consent,...(['assist','propose'].includes(action)?{intake:snapshot,question,history:history.slice(-6)}:{})})});
  const result=await r.json();if(!r.ok){if(r.status===403)setVerified(false);throw new Error(result.error||'Assistant request failed.');}
  if(epoch.current!==current||user.current!==uid)return;
  if(action==='verify'){setModels(result.models||[]);setModel(result.models?.[0]?.name||'');setVerified(true);setNotice(result.message+(result.moreAvailable?' Showing the first model pages.':''));}
  else if(action==='test')setNotice(result.message);
  else if(action==='assist'){setAnswer(result.output);setHistory(h=>[...h,{role:'user',text:question},{role:'assistant',text:result.output.reply}].slice(-6));}
  else{setGenerated({id:crypto.randomUUID(),proposal:result.output,intake_snapshot:snapshot,model:result.model});setNotice('Proposal generated but not saved or approved. Review it below.');}
 }
 async function saveDraft(){
  const uid=session!.user.id,payload=cleanIntake(intake);
  const query=savedAt?db!.from('ai_intake_drafts').update({payload}).eq('user_id',uid).eq('updated_at',savedAt):db!.from('ai_intake_drafts').insert({user_id:uid,payload});
  const {data,error}=await query.select('updated_at').single();if(error)throw new Error('Draft was not saved. Another tab may have changed it; reload and compare before retrying. '+error.message);
  if(user.current!==uid)return;setSavedAt(data.updated_at);setNotice('AI-assisted draft saved separately. Your original submitted intake and webhook have not been changed.');
 }
 async function saveProposal(){
  if(!generated||!session)return;const uid=session.user.id;
  const {error}=await db!.from('ai_pathway_proposals').insert({...generated,user_id:uid,consent_version:'gycs-gemini-v1'});
  if(error&&error.code!=='23505')throw error;
  const rows=await db!.from('ai_pathway_proposals').select('*').order('created_at',{ascending:false}).limit(30);if(rows.error)throw new Error('Save may have succeeded, but refreshing failed. Retry safely; this proposal keeps the same ID.');
  if(user.current!==uid)return;setProposals(rows.data||[]);setGenerated(null);setNotice('Unapproved proposal saved. Request coach review when ready.');
 }
 async function review(row:Row,action:string){
  if(action==='approve'&&!window.confirm('Approve this proposed pathway? This creates a new active pathway version with pending milestones, but does not verify credentials or advance journey status.'))return;
  const uid=session!.user.id;const {error}=await db!.rpc('gycs_review_ai_proposal',{p_id:row.id,p_action:action,p_notes:notes[row.id]||''});if(error)throw error;
  const rows=await db!.from('ai_pathway_proposals').select('*').order('created_at',{ascending:false}).limit(30);if(rows.error)throw new Error('Review may have been saved. Reload before repeating it.');
  if(user.current!==uid)return;setProposals(rows.data||[]);setNotice(action==='approve'?'Approved pathway created. Open Crew Hub → My pathway to view it.':action==='request_review'?'Review requested. No notification was sent; a coach must be assigned or an authorised administrator must review it.':'Changes requested.');
 }
 const showPlan=(plan:Row)=><><h3>{plan.target_role||'Proposed pathway'}</h3><p>{plan.summary}</p><p>Suggested department: {plan.department}</p><ol>{(plan.milestones||[]).map((m:Row,i:number)=><li key={i} className="border-t border-slate-700 py-3"><strong>{i+1}. {m.title}</strong><p>{m.description}</p><p>Evidence to discuss: {m.evidence_required}</p></li>)}</ol><h4>Questions for your coach</h4>{(plan.questions_for_coach||[]).map((q:string,i:number)=><p key={i}>• {q}</p>)}<h4>Limitations</h4>{(plan.limitations||[]).map((q:string,i:number)=><p key={i}>• {q}</p>)}</>;
 return <div className="gy-portal"><header className="gy-header"><a className="gy-brand" href="/">GYCS<span>AI INTAKE & PATHWAYS</span></a><nav><a href="/?workspace=1">Crew Hub</a><a href="/">Home / sign in</a>{session&&<button disabled={busy} onClick={()=>run(async()=>{clearKey();const {error}=await db!.auth.signOut();if(error)throw error;})}>Sign out</button>}</nav></header><main className="gy-main">
 <p className="gy-eyebrow">YOUR FACTS. AI ASSISTANCE. HUMAN REVIEW.</p><h1>Build a clearer next step.</h1>
 {error&&<p className="gy-error" role="alert">{error}</p>}{notice&&<p className="gy-notice" role="status">{notice}</p>}
 {!db?<p>Approved Supabase configuration is required.</p>:!ready||loading?<p role="status">Loading your workspace…</p>:!session?<section className="gy-card"><h2>Sign in to continue</h2><a className="gy-primary" href="/">Return to sign in</a></section>:!profile?<section className="gy-card"><h2>AI workflow is not available yet</h2><p>If database setup is pending, existing Crew Hub records remain available.</p><button onClick={()=>setRetry(retry+1)}>Retry</button></section>:<>
 {isCrewRole(profile.role)&&<><section className="gy-card"><h2>Connect your Gemini key</h2><p>Paste your own key from <a className="underline" href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">Google AI Studio</a>. It is held only in page memory, sent through the authenticated server endpoint to Google, and not saved to your profile or draft. Reloading, disconnecting or signing out clears it.</p><fieldset disabled={busy}><label>Gemini API key<input type="password" autoComplete="off" spellCheck={false} value={apiKey} maxLength={512} onChange={e=>{epoch.current++;setApiKey(e.target.value);setVerified(false);setModels([]);setModel('');}}/></label><button className="gy-primary" disabled={!apiKey} onClick={()=>run(()=>ask('verify'))}>Verify key</button>{verified&&<label>Available text models<select value={model} onChange={e=>setModel(e.target.value)}>{models.map(m=><option key={m.name} value={m.name}>{m.label}</option>)}</select></label>}{verified&&!models.length&&<p>No supported text models were returned for this key.</p>}<label className="gy-check"><input type="checkbox" checked={usage} onChange={e=>setUsage(e.target.checked)}/><span>I understand response tests and AI generation use my Google project's quota and may incur charges.</span></label><button className="gy-outline" disabled={!verified||!model||!usage} onClick={()=>run(()=>ask('test'))}>Test response (uses quota)</button></fieldset><button className="gy-outline" onClick={clearKey}>Disconnect and clear key</button><p className="gy-small">Key verification checks model access, not remaining generation quota. Your key must remain secret; do not type it into intake or chat fields.</p></section>
 <section className="gy-section" id="ai-intake"><h2>AI-assisted intake draft</h2><p>This starts from your saved onboarding career answers. Edits are separate from your original submission and will not resend the Boost.space webhook.</p><form className="gy-card" onSubmit={e=>{e.preventDefault();void run(saveDraft);}}><fieldset disabled={busy}>{intakeFields.map(field=><label key={field}>{labels[field]}{field==='department'?<select value={intake[field]||'undecided'} onChange={e=>setIntake({...intake,[field]:e.target.value})}>{['undecided','deck','interior','engineering','galley'].map(d=><option key={d} value={d}>{d}</option>)}</select>:<textarea rows={field==='goals'?4:2} maxLength={2000} value={intake[field]||''} onChange={e=>setIntake({...intake,[field]:e.target.value})}/>}</label>)}<button className="gy-primary" type="submit">Save separate draft</button><p className="gy-small">Last saved: {savedAt?new Date(savedAt).toLocaleString():'Not saved yet'}. Changes are not automatically saved.</p></fieldset></form></section>
 <section className="gy-card"><h2>Ask your intake assistant</h2><p>Google receives the eight displayed career fields, your question and up to six recent chat turns. Name, email, phone and documents are not added automatically. Do not put sensitive information in free text. Responses are suggestions, not verified advice.</p><fieldset disabled={busy}><label className="gy-check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I consent to sending this displayed content through GYCS to Google Gemini for AI assistance. I will review suggestions before saving or requesting coach review. Consent version: gycs-gemini-v1.</span></label><label>Your question<textarea maxLength={2000} rows={3} value={question} onChange={e=>setQuestion(e.target.value)}/></label><div className="gy-actions"><button className="gy-primary" disabled={!verified||!model||!consent||!usage} onClick={()=>run(()=>ask('assist'))}>Ask Gemini</button><button className="gy-outline" disabled={!verified||!model||!consent||!usage} onClick={()=>run(()=>ask('propose'))}>Generate proposed pathway</button><button onClick={()=>{setHistory([]);setAnswer(null);}}>Clear conversation</button></div></fieldset>{busy&&<p role="status">Working…</p>}{answer&&<article><h3>Assistant response</h3><p className="whitespace-pre-wrap">{answer.reply}</p>{answer.questions?.map((q:string,i:number)=><p key={i}>• {q}</p>)}{answer.suggestions?.map((s:Row,i:number)=><section className="gy-card" key={i}><h4>{labels[s.field]}</h4><p>Current: {intake[s.field]||'Not provided'}</p><p className="whitespace-pre-wrap">Suggested: {s.value}</p><p>{s.reason}</p><button className="gy-outline" disabled={busy} onClick={()=>{setIntake({...intake,[s.field]:s.value});setNotice('Suggestion applied to the editable draft only. Save the draft to keep it.');}}>Apply this suggestion</button></section>)}</article>}</section>
 {generated&&<section className="gy-section"><h2>New proposal — not saved or approved</h2>{showPlan(generated.proposal)}<details><summary>Intake snapshot used</summary><pre className="whitespace-pre-wrap">{JSON.stringify(generated.intake_snapshot,null,2)}</pre></details><button className="gy-primary" disabled={busy} onClick={()=>run(saveProposal)}>Save unapproved proposal</button><button className="gy-outline" disabled={busy} onClick={()=>setGenerated(null)}>Discard proposal</button></section>}</>}
 <section className="gy-section" id="proposals"><h2>{isCrewRole(profile.role)?'My proposed pathways':'Pathway review queue'}</h2><p>Draft → review requested → approved or changes requested. AI never approves a pathway. Showing the latest 30 accessible proposals.</p>{isCrewRole(profile.role)&&!profile.organisation_id&&<p className="gy-error">Your profile is not assigned to a coaching organisation. You can save proposals, but an administrator must arrange organisation membership and reviewer access before a staff review can happen.</p>}{!proposals.length&&<p>No proposals yet. Generate and save a proposed pathway to begin.</p>}{proposals.map(row=><article key={row.id} className="gy-card my-5"><p className="gy-eyebrow">{row.status.replaceAll('_',' ')}</p><p className="gy-small">{new Date(row.created_at).toLocaleString()} · {row.model}{!isCrewRole(profile.role)?' · Member '+row.user_id:''}</p>{showPlan(row.proposal)}<details><summary>Intake snapshot for review</summary><pre className="whitespace-pre-wrap">{JSON.stringify(row.intake_snapshot,null,2)}</pre></details>{row.review_notes&&<p>Reviewer notes: {row.review_notes}</p>}{row.status==='approved'&&<p>Approved pathway: {row.approved_pathway_id}. Milestones remain pending; approval does not verify qualifications or advance journey status.</p>}{isCrewRole(profile.role)&&['draft','changes_requested'].includes(row.status)&&<><button className="gy-primary" disabled={busy} onClick={()=>run(()=>review(row,'request_review'))}>Request coach review</button>{row.status==='changes_requested'&&<p>To change the proposal, edit the intake and generate a new proposal. Request review here only if you want this same version reconsidered.</p>}</>}{isCrewRole(profile.role)&&row.status==='review_requested'&&<p>Review requested. No coach notification is sent automatically; review requires an assigned coach or an authorised same-organisation administrator.</p>}{isStaffRole(profile.role)&&row.status==='review_requested'&&<><label>Review notes<textarea maxLength={4000} value={notes[row.id]||''} onChange={e=>setNotes({...notes,[row.id]:e.target.value})}/></label><div className="gy-actions"><button className="gy-primary" disabled={busy} onClick={()=>run(()=>review(row,'approve'))}>Approve as active pathway</button><button className="gy-outline" disabled={busy} onClick={()=>run(()=>review(row,'request_changes'))}>Request changes</button></div></>}</article>)}</section>
 </>}
 </main></div>;
}
