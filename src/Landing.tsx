import React, {useEffect, useState} from 'react';
import './landing.css';

type Stage = [string, string];
type Icp = {id: string; tab: string; eyebrow: string; hook: string; pain: string; stages: Stage[]; covers: string[]; cta: string};
type Props = {session: boolean; canStart: boolean; onStart: () => void; onSignIn: () => void; video: React.ReactNode};

const icps: Icp[] = [
  {id: 'school-leaver', tab: 'School leavers', eyebrow: 'JUST FINISHED SCHOOL', hook: 'Yachting sounds incredible. But where do you actually start?', pain: 'Courses, medicals, CVs, dockwalking, crew agencies — the advice online is endless and often contradictory. Before you spend money on training or flights, get clear on whether yachting suits you and what a sensible first step looks like.', stages: [['Explore the industry', 'Learn what entry-level deck and interior roles really involve, day to day.'], ['Book your discovery call', 'Talk through your goals, budget and timing with a GYCS coach.'], ['Get your first-step plan', 'Leave with clear priorities for entry-level training and preparation.'], ['Prepare in the Crew Hub', 'If coaching is a fit, track your plan, CV and readiness in one place.']], covers: ['Whether yachting fits your goals and lifestyle', 'Which entry-level training to research first, such as STCW Basic Safety Training and an ENG1 medical', 'Realistic costs and timing to plan for', 'What not to spend money on too early'], cta: 'Book my first-step call'},
  {id: 'career-changer', tab: 'Career changers', eyebrow: 'READY FOR A CHANGE', hook: 'Your experience counts. Let’s show you how to use it onboard.', pain: 'Hospitality, trades, culinary, fitness and customer-facing skills can transfer to yacht roles — but changing careers is a financial decision. You need a plan that respects your current income, commitments and timing.', stages: [['Map your skills', 'Identify which existing skills translate to deck, interior, galley or engineering.'], ['Book your discovery call', 'Discuss timing, finances and the department that suits your background.'], ['Plan the transition', 'Get a staged plan for training, CV repositioning and when to make the move.'], ['Build your yacht CV', 'Reframe your experience for yacht recruiters inside the Crew Hub.']], covers: ['Which department best suits your background', 'How to position transferable experience on a yacht CV', 'A transition timeline that fits your finances', 'Training priorities versus nice-to-haves'], cta: 'Book my career-change call'},
  {id: 'aspirant', tab: 'Ambitious but unsure', eyebrow: 'MOTIVATED, NO PLAN YET', hook: 'You’ve watched the videos. Now you need a plan.', pain: 'Plenty of motivation, scattered information. Without structure it’s easy to stall, overspend on the wrong courses or apply before you’re ready. Coaching turns ambition into an ordered set of next steps.', stages: [['Name the goal', 'Clarify the role, department and season you are aiming for.'], ['Book your discovery call', 'Work through what’s holding you back with a coach.'], ['Get a structured roadmap', 'Turn your goals into a sequenced plan with checkpoints.'], ['Stay accountable', 'Use the Crew Hub and coaching check-ins to keep momentum.']], covers: ['Turning a vague goal into a specific target role', 'The right order for training, documents and your CV', 'Common early mistakes that waste time and money', 'What structured coaching support could look like for you'], cta: 'Book my roadmap call'},
  {id: 'junior-crew', tab: 'Junior crew', eyebrow: 'ALREADY ONBOARD', hook: 'A season or two in. What’s your next move?', pain: 'Time served alone doesn’t decide your next role. Captains and recruiters look for demonstrated responsibility, relevant vessel experience and the right qualifications. Between contracts is the moment to get clear on what you’re ready for.', stages: [['Take stock', 'Review your sea time, responsibilities and references honestly.'], ['Book your discovery call', 'Discuss realistic next roles and what it takes to get there.'], ['Plan your progression', 'Prioritise qualifications, experience gaps and CV updates.'], ['Position yourself', 'Refresh your CV and track your progression in the Crew Hub.']], covers: ['Which next role you are realistically ready for', 'Qualification and experience gaps to close', 'How to show progression on your CV', 'Planning your next contract or season'], cta: 'Book my progression call'}
];

function Booking() {
  useEffect(() => {
    const id = 'gycs-ghl-form-embed';
    if (document.getElementById(id)) return;
    const s = document.createElement('script');
    s.id = id; s.type = 'text/javascript'; s.async = true; s.src = 'https://link.msgsndr.com/js/form_embed.js';
    document.body.appendChild(s);
  }, []);
  return <iframe src="https://api.leadconnectorhq.com/widget/booking/Zmc1LSz3KSp5Cn5AMySu" allow="payment" style={{width: '100%', border: 'none', overflow: 'hidden'}} scrolling="no" id="Zmc1LSz3KSp5Cn5AMySu_1792860517950" title="Book a GYCS coaching discovery call" />;
}

export default function Landing({session, canStart, onStart, onSignIn, video}: Props) {
  const [active, setActive] = useState(icps[0].id);
  const [chosen, setChosen] = useState('');
  const icp = icps.find(i => i.id === active) || icps[0];
  const chosenIcp = icps.find(i => i.id === chosen);
  const book = (id?: string) => {
    if (id) setChosen(id);
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('book-call')?.scrollIntoView({behavior: smooth ? 'smooth' : 'auto', block: 'start'});
  };
  return <>
    <section className="gy-hero"><div>
      <p className="gy-eyebrow">YACHT CAREER COACHING · DISCOVERY CALLS OPEN</p>
      <h1>Your yacht career.<br/><em>Planned, not guessed.</em></h1>
      <p className="gy-lead">Whether you’re leaving school, changing careers or already onboard, Green Yacht Crew Solutions coaching helps you choose the right first or next step — before you spend on courses, flights or applications.</p>
      <div className="gy-actions"><button className="gy-primary" onClick={() => book()}>Book a discovery call ↓</button><button className="gy-outline" disabled={!canStart} onClick={onStart}>{session ? 'Continue your journey' : 'Start your application'}</button>{!session && <button className="gy-link" onClick={onSignIn}>Member sign in</button>}</div>
      <p className="gy-small">Pick a time that suits your timezone. Coaching supports your preparation; it does not guarantee employment.</p>
    </div>{video}</section>

    <section className="gy-section" aria-labelledby="pathways-title">
      <p className="gy-eyebrow">FIND YOUR PATHWAY</p>
      <h2 id="pathways-title">Where are you starting from?</h2>
      <p>Pick the description closest to you. Every pathway leads to the same first step: a discovery call with a GYCS coach.</p>
      <div className="gy-tabs" role="tablist" aria-label="Choose your starting point">{icps.map(i => <button key={i.id} role="tab" id={`tab-${i.id}`} aria-controls="pathway-panel" aria-selected={i.id === active} onClick={() => setActive(i.id)}>{i.tab}</button>)}</div>
      <div className="gy-pathway" role="tabpanel" id="pathway-panel" aria-labelledby={`tab-${icp.id}`}>
        <div>
          <p className="gy-eyebrow">{icp.eyebrow}</p>
          <h3>{icp.hook}</h3>
          <p>{icp.pain}</p>
          <ol className="gy-stages">{icp.stages.map(([t, d], n) => <li key={t} className={n === 1 ? 'gy-call' : ''}><span className="gy-stage-n">{String(n + 1).padStart(2, '0')}</span><div><h4>{t}</h4><p>{d}</p></div></li>)}</ol>
          <button className="gy-primary" onClick={() => book(icp.id)}>{icp.cta} ↓</button>
        </div>
        <aside className="gy-card">
          <h3>On your discovery call we’ll cover</h3>
          <ul className="gy-ticks">{icp.covers.map(c => <li key={c}>{c}</li>)}</ul>
          <p className="gy-small">Not sure which description fits? Book anyway — working that out is part of the call.</p>
          <button className="gy-outline" onClick={() => book(icp.id)}>Choose a time</button>
        </aside>
      </div>
    </section>

    <section className="gy-section">
      <p className="gy-eyebrow">WHAT TO EXPECT</p>
      <h2>One call. A clear next step.</h2>
      <div className="gy-grid">{[['01', 'Pick a time', 'Choose a slot in the booking calendar below.'], ['02', 'Share your situation', 'Tell us your goals, experience, budget and timing.'], ['03', 'Get honest guidance', 'What’s realistic, what to do first and what to skip.'], ['04', 'Decide your next step', 'If coaching is a fit, we’ll explain the options. No pressure to commit on the call.']].map(([n, t, d]) => <article className="gy-card" key={n}><span className="gy-eyebrow">{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
    </section>

    <section className="gy-section">
      <p className="gy-eyebrow">FIND YOUR DEPARTMENT</p>
      <h2>Deck, interior, engineering or galley?</h2>
      <div className="gy-grid">{[['Deck', 'Practical work, seamanship and life on deck.'], ['Interior', 'Hospitality, guest service and attention to detail.'], ['Engineering', 'Technical interests and an engineering career direction.'], ['Galley', 'Food, kitchen experience and a culinary direction.']].map(([t, d]) => <article className="gy-card" key={t}><h3>{t}</h3><p>{d}</p></article>)}</div>
      <p>Not sure yet? That’s exactly what the discovery call is for. <button className="gy-link" onClick={() => book()}>Book a call</button></p>
    </section>

    <section className="gy-section gy-book" id="book-call" aria-labelledby="book-title">
      <div>
        <p className="gy-eyebrow">BOOK YOUR DISCOVERY CALL</p>
        <h2 id="book-title">Choose a time to talk.</h2>
        <p>Pick a slot that works for your timezone. The booking calendar confirms your call once it’s scheduled.</p>
        {chosenIcp && <p className="gy-notice" role="status">You selected the <strong>{chosenIcp.tab}</strong> pathway. Mention it in your booking so your coach can prepare.</p>}
        <ul className="gy-ticks"><li>Bring your questions about training, costs and timing</li><li>Have a rough idea of your availability for the coming months</li><li>No passport, medical or banking details needed</li></ul>
        <p className="gy-small">If the calendar doesn’t load, refresh the page or pause content blockers for this site.</p>
      </div>
      <div className="gy-book-frame"><Booking/></div>
    </section>

    <section className="gy-section gy-faq">
      <h2>Questions before you book</h2>
      <details><summary>Who are discovery calls for?</summary><p>School leavers, career changers, motivated beginners without a plan and junior crew deciding on their next role. If you’re considering a yacht career, you’re in the right place.</p></details>
      <details><summary>Does booking a call or coaching guarantee a job?</summary><p>No. Coaching helps you prepare and make better decisions. Hiring decisions are made by captains, management companies and recruiters, and no qualification, visa or job offer is implied.</p></details>
      <details><summary>Do I need yachting experience?</summary><p>No. Beginners, career changers and experienced crew can all book. Your answers help establish an appropriate next step.</p></details>
      <details><summary>What happens after the call?</summary><p>You leave with a clear next step. If coaching is a good fit, we explain how it works and what’s involved; any programme, delivery arrangements or costs are agreed separately.</p></details>
      <details><summary>Can I also apply through the Crew Hub?</summary><p>Yes. Create an account and complete your intake at any time. Booking a call is separate from programme admission.</p></details>
      <details><summary>Should I share my passport or medical records?</summary><p>No. Please don’t include passport numbers, medical details or financial account information when booking or in your intake.</p></details>
    </section>

    <section className="gy-band">
      <p className="gy-eyebrow">YOUR NEXT CHAPTER</p>
      <h2>Ready to plan your yacht career properly?</h2>
      <p>One conversation can save you months of guesswork and money spent on the wrong things.</p>
      <div className="gy-actions"><button className="gy-primary" onClick={() => book()}>Book a discovery call</button><button className="gy-outline" disabled={!canStart} onClick={onStart}>{session ? 'Continue your journey' : 'Start your application'}</button></div>
    </section>
    <button className="gy-primary gy-sticky" onClick={() => book()}>Book a discovery call</button>
  </>;
}
