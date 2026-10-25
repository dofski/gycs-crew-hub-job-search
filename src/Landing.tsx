import React, {useEffect, useState} from 'react';
import './landing.css';
import Reviews, {reviewCount} from './Reviews';

type Stage = [string, string];
type Icp = {id: string; tab: string; eyebrow: string; hook: string; pain: string; stages: Stage[]; covers: string[]; cta: string};
type Props = {session: boolean; canStart: boolean; onStart: () => void; onSignIn: () => void; video: React.ReactNode};

const icps: Icp[] = [
  {id: 'school-leaver', tab: 'Leaving school', eyebrow: 'FIRST YACHT ROLE', hook: 'Leaving school and looking for your first yacht role?', pain: 'You don’t need to pretend you’ve already worked at sea. Start by exploring suitable roles, identifying what you need to verify and finding honest examples of responsibility in your work, sport or school experience.', stages: [['Explore suitable roles', 'Learn what entry-level deck and interior roles really involve, day to day.'], ['Book your discovery call', 'Talk through your goals, budget and timing with Chad.'], ['Get your first-step plan', 'Leave with clear priorities for entry-level training and preparation.'], ['Prepare in the Crew Hub', 'If coaching is a fit, track your plan, CV and readiness in one place.']], covers: ['Whether yachting fits your goals and lifestyle', 'Which entry-level training to research first, such as STCW Basic Safety Training and an ENG1 medical', 'Realistic costs and timing to plan for', 'What not to spend money on too early'], cta: 'Book my first-step call'},
  {id: 'career-changer', tab: 'Changing careers', eyebrow: 'FROM ANOTHER INDUSTRY', hook: 'Changing careers from another industry?', pain: 'Your working life doesn’t disappear because you’re new to yachting. Connect the experience you already have to your target role, while being clear about the practical skills and maritime experience you still need to develop.', stages: [['Map your experience', 'Identify which existing skills translate to deck, interior, galley or engineering.'], ['Book your discovery call', 'Discuss timing, finances and the department that suits your background.'], ['Plan the transition', 'Get a staged plan for training, CV repositioning and when to make the move.'], ['Build your yacht CV', 'Reframe your experience for yacht recruiters inside the Crew Hub.']], covers: ['Which department best suits your background', 'How to position transferable experience on a yacht CV', 'A transition timeline that fits your finances', 'Training priorities versus nice-to-haves'], cta: 'Book my career-change call'},
  {id: 'aspirant', tab: 'Stuck in research', eyebrow: 'KEEN TO ENTER YACHTING', hook: 'Keen to enter yachting, but stuck in research?', pain: 'Before you resign, book flights or choose a training package, put your options in order. Explore role fit, preparation costs and a realistic timeline around your current commitments.', stages: [['Name the goal', 'Clarify the role, department and season you are aiming for.'], ['Book your discovery call', 'Work through what’s holding you back with Chad.'], ['Get a structured roadmap', 'Turn your goals into a sequenced plan with checkpoints.'], ['Stay accountable', 'Use the Crew Hub and coaching check-ins to keep momentum.']], covers: ['Turning a vague goal into a specific target role', 'The right order for training, documents and your CV', 'Common early mistakes that waste time and money', 'What structured coaching support could look like for you'], cta: 'Book my roadmap call'},
  {id: 'junior-crew', tab: 'Already crew', eyebrow: 'READY FOR MORE', hook: 'Already crew, but ready for more?', pain: 'Make your next contract a deliberate career decision. Identify the responsibility you want, the evidence you can show and the development that belongs between your current role and your next one.', stages: [['Take stock', 'Review your sea time, responsibilities and references honestly.'], ['Book your discovery call', 'Discuss realistic next roles and what it takes to get there.'], ['Plan your progression', 'Prioritise qualifications, experience gaps and CV updates.'], ['Position yourself', 'Refresh your CV and track your progression in the Crew Hub.']], covers: ['Which next role you are realistically ready for', 'Qualification and experience gaps to close', 'How to show progression on your CV', 'Planning your next contract or season'], cta: 'Book my progression call'}
];

const method: [string, string][] = [
  ['Assess your starting point.', 'Look at your goals, experience, circumstances and preferred type of work. Give your preparation a direction before committing to a route.'],
  ['Plan your priorities.', 'Put the decisions in order: role, requirements to verify, budget, timing and next actions. Separate what needs attention now from what can wait.'],
  ['Prepare for the gaps.', 'Identify what needs further checking, practical development or formal training. Keep required qualifications separate from optional development and personal strengths.'],
  ['Present your experience.', 'Build a clear, truthful account of what you’ve done, what you can demonstrate and what you’re ready to learn. No invented sea time. No inflated responsibilities.'],
  ['Pursue suitable opportunities.', 'Give your job search a routine. Keep track of relevant vacancies, contacts, applications and follow-ups instead of relying on memory and screenshots.'],
  ['Review your next move.', 'Revisit the plan as your circumstances change. Use actual feedback and progress to decide what needs adjusting.']
];

const myEyeFeatures: [string, string][] = [
  ['See where the yachts are.', 'The live ship layer shows vessel activity around the world’s yachting hubs. Check which marinas are busy before you leave, and spend your morning where the boats actually are.'],
  ['Research a yacht before you walk up to it.', 'Vessel cards show you a yacht’s details before you approach. Know her name and size, and make your introduction and follow-up specific instead of generic.'],
  ['Find every useful stop in a new port.', 'Search the map for crew agencies, shipyards, chandleries and crew houses. Arrive in Antibes, Palma or Fort Lauderdale with a full picture of where crew work, meet and hire.'],
  ['Plan a smarter dockwalking route.', 'Map the marinas in a sensible order before you set off. Less backtracking means more yachts in the right time windows.'],
  ['Remember every yacht you visit.', 'Drop notes on the map as you go: who you spoke to, where you left a CV, when to follow up. Share your map with your coach so your next session starts from real progress.'],
  ['Plan hands-free with voice.', 'Ask the built-in voice assistant questions while you walk between marinas, with live traffic and weather on the same map.']
];

const myEyeRoutine: [string, string][] = [
  ['Pick your season and port.', 'Target the Med from April to June and the Caribbean from November to January. Off-season, focus on refit yards in hubs like Antibes, Palma and Fort Lauderdale.'],
  ['Plan the night before.', 'Check which marinas are busy, map your route and add the crew agencies you’ll visit around midday.'],
  ['Hit the dock at the right time.', 'Aim for about 08:15 to 08:30, after the deck crew’s morning meeting. Avoid break times.'],
  ['Approach the right boats.', 'Look for yachts where crew are visibly working. Ask for daywork, not a full-time role. Never board uninvited.'],
  ['Go again in the afternoon.', 'Between 15:00 and 17:00, crew often know tomorrow’s workload and may need an extra pair of hands.'],
  ['Follow up the same evening.', 'Send your CV to every good contact and log it on your map. Your coach can see what’s working and help you adjust.']
];

const myEyeSoon: [string, string][] = [
  ['Dockwalk planner:', 'choose a port and get its marinas, yards, crew agencies and crew houses pre-loaded, with a suggested route and the best times to approach.'],
  ['Yacht shortlist and contact log:', 'save yachts straight from the map and track each one from visited to CV left to follow-up due, synced to your Crew Hub.'],
  ['Port activity summary:', 'see which marinas are busiest today before you leave the crew house.'],
  ['Daywork log to CV:', 'every daywork shift becomes a ready-made line on your yacht CV.'],
  ['Coach view:', 'share your port and vessel with your coach only, so they can support you wherever you are.']
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
  const jump = (target: string) => {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(target)?.scrollIntoView({behavior: smooth ? 'smooth' : 'auto', block: 'start'});
  };
  const book = (id?: string) => { if (id) setChosen(id); jump('book-call'); };
  return <>
    <section className="gy-hero"><div>
      <p className="gy-eyebrow">FIND YOUR DIRECTION. PRIORITISE YOUR PREPARATION. PRESENT YOUR VALUE. ORGANISE YOUR SEARCH.</p>
      <h1>Your yacht career needs a clear next step.<br/><em>Not another conflicting opinion.</em></h1>
      <p className="gy-lead">Chad's Coaching helps you make sense of your options, identify preparation priorities and present your experience honestly—so your next move is a considered decision, not another guess.</p>
      <div className="gy-actions"><button className="gy-primary" onClick={() => book()}>Book My Discovery Call ↓</button><button className="gy-outline" disabled={!canStart} onClick={onStart}>{session ? 'Continue your journey' : 'Start your application'}</button>{!session && <button className="gy-link" onClick={onSignIn}>Member sign in</button>}</div>
      <p className="gy-small">Tell us where you’re starting. Let’s explore what support makes sense.</p>
      <p className="gy-small">Coached by Chad de Wet. <button className="gy-link" onClick={() => jump('reviews')}>Read {reviewCount} client & crew reviews</button> · <button className="gy-link" onClick={() => jump('my-eye')}>Discover M/Y Eye</button></p>
    </div>{video}</section>

    <section className="gy-section" aria-labelledby="problem-title">
      <p className="gy-eyebrow">SOUND FAMILIAR?</p>
      <h2 id="problem-title">Plenty of advice. Still unsure what to do next?</h2>
      <p className="gy-lead">You’ve read the guides, compared courses and looked at yacht jobs. But the questions that matter are still unanswered. Which role fits you? What do you need before you apply? How do you show your value without yacht experience—or prove you’re ready for more responsibility when you already have it? The next step isn’t always another course, another CV template or another batch of applications. Start by understanding which problem you actually need to solve.</p>
    </section>

    <section className="gy-section" aria-labelledby="pathways-title">
      <p className="gy-eyebrow">FIND YOUR PATHWAY</p>
      <h2 id="pathways-title">Start with the situation that sounds like you.</h2>
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
          <button className="gy-outline" onClick={() => book(icp.id)}>Book My Discovery Call</button>
        </aside>
      </div>
    </section>

    <section className="gy-section" aria-labelledby="method-title">
      <p className="gy-eyebrow">HOW CHAD’S COACHING WORKS</p>
      <h2 id="method-title">From starting point to next move.</h2>
      <div className="gy-grid gy-grid-3">{method.map(([t, d], n) => <article className="gy-card" key={t}><span className="gy-eyebrow">{String(n + 1).padStart(2, '0')}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
      <div className="gy-actions"><button className="gy-primary" onClick={() => book()}>Book My Discovery Call</button></div>
    </section>

    <section className="gy-section gy-about" id="about-coach" aria-labelledby="about-title">
      <div>
        <p className="gy-eyebrow">ABOUT YOUR COACH</p>
        <h2 id="about-title">Meet Chad de Wet.</h2>
        <p className="gy-about-lead">Chad didn’t learn yachting from a brochure. He learned it the way you will — starting at the bottom of the deck team.</p>
        <p>His career began in 2013 as a deckhand and tender driver on the 67m M/Y Golden Shadow in French Polynesia, where he was diver top man on a coral-reef research programme, keeping up to ten divers safe, five dives a day.</p>
        <p>He worked his way up: three Mediterranean seasons on M/Y Hermitage, bosun on the 40m charter yacht Sarita Si and the 60m Perini Navi sailing yacht Zenji, and shipyard bosun in Malta, leading a complete in-house repaint.</p>
        <p>As Chief Officer of the 47m M/Y Sea Falcon 2 he was responsible for ten crew, safety, navigation and passage planning — and stepped in as relief captain for 45 days. Delivery crossings followed, including a Panama Canal transit, then Chief Officer roles on M/Y Lady L and M/Y JEMS.</p>
        <p>Along the way he watched talented newcomers stall for lack of straight answers. Green Yacht Crew Solutions is the honest, structured guidance he wishes he’d had on day one — backed by the digital tools he now builds for crew.</p>
      </div>
      <aside className="gy-card">
        <h3>Chad at a glance</h3>
        <ul className="gy-ticks"><li>Deckhand to Chief Officer on superyachts</li><li>Yachtmaster Offshore</li><li>45 days as relief captain on a 47m motor yacht</li><li>Ocean deliveries, including a Panama Canal transit</li><li>Founder of Superyacht CRM, building tech for crew and yacht operations</li></ul>
        <button className="gy-primary" onClick={() => book()}>Book a call with Chad</button>
      </aside>
    </section>

    <Reviews onBook={() => book()}/>

    <section className="gy-section" id="my-eye" aria-labelledby="my-eye-title">
      <p className="gy-eyebrow">M/Y EYE · FOR GYCS CREW</p>
      <h2 id="my-eye-title">M/Y Eye: Find Yacht Jobs With a Plan, Not Guesswork</h2>
      <p className="gy-lead">Most new crew look for their first yacht job the hard way: walking random docks, missing the busy marinas and forgetting who they spoke to. M/Y Eye turns your yacht job search into a plan. It’s a live, interactive map of the world’s yachting ports. Use it to see where yachts are, plan your dockwalking route, research boats before you approach them and keep track of every contact. That way every day on the dock counts.</p>
      <p>M/Y Eye works alongside your GYCS coaching. Your coach helps you decide what to aim for. M/Y Eye helps you get out there and do it.</p>
      <h3>What M/Y Eye helps you do</h3>
      <div className="gy-grid gy-grid-3">{myEyeFeatures.map(([t, d]) => <article className="gy-card" key={t}><h3>{t}</h3><p>{d}</p></article>)}</div>
      <div className="gy-myeye-panel">
        <p className="gy-eyebrow">A DAILY DOCKWALKING ROUTINE</p>
        <h3>How GYCS crew use M/Y Eye</h3>
        <ol className="gy-stages">{myEyeRoutine.map(([t, d], n) => <li key={t}><span className="gy-stage-n">{String(n + 1).padStart(2, '0')}</span><div><h4>{t}</h4><p>{d}</p></div></li>)}</ol>
        <p>Want help using M/Y Eye to plan your first season?</p>
        <button className="gy-primary" onClick={() => book()}>Book My Discovery Call</button>
      </div>
      <h3>Coming soon to M/Y Eye<span className="gy-badge">IN DEVELOPMENT</span></h3>
      <ul className="gy-ticks">{myEyeSoon.map(([t, d]) => <li key={t}><strong>{t}</strong> {d}</li>)}</ul>
      <h3>Walk the docks with a plan.</h3>
      <p>Combine GYCS coaching with M/Y Eye and make every day in port count: the right marinas, the right time and a follow-up for every contact.</p>
      <div className="gy-actions"><button className="gy-primary" onClick={() => book()}>Book My Discovery Call</button></div>
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
        <h2 id="book-title">Tell us where you’re starting.</h2>
        <p>Let’s explore what support makes sense. Pick a slot that works for your timezone; the booking calendar confirms your call once it’s scheduled.</p>
        {chosenIcp && <p className="gy-notice" role="status">You selected <strong>{chosenIcp.tab}</strong>. Mention it in your booking so Chad can prepare.</p>}
        <ul className="gy-ticks"><li>Bring your questions about roles, training, costs and timing</li><li>Have a rough idea of your availability for the coming months</li><li>No passport, medical or banking details needed</li></ul>
        <p className="gy-small">If the calendar doesn’t load, refresh the page or pause content blockers for this site.</p>
      </div>
      <div className="gy-book-frame"><Booking/></div>
    </section>

    <section className="gy-section gy-faq">
      <h2>Questions before you book</h2>
      <details><summary>Who are discovery calls for?</summary><p>School leavers, career changers, people stuck in research and crew who are ready for more responsibility. If you’re considering or progressing a yacht career, you’re in the right place.</p></details>
      <details><summary>Who will I speak to?</summary><p>Discovery calls are with Chad de Wet, founder of Green Yacht Crew Solutions.</p></details>
      <details><summary>Does booking a call or coaching guarantee a job?</summary><p>No. Coaching helps you prepare and make better decisions. Hiring decisions are made by captains, management companies and recruiters, and no qualification, visa or job offer is implied.</p></details>
      <details><summary>Do I need yachting experience?</summary><p>No. Beginners, career changers and experienced crew can all book. Your answers help establish an appropriate next step.</p></details>
      <details><summary>What happens after the call?</summary><p>You leave with a clear next step. If coaching is a good fit, we explain how it works and what’s involved; any programme, delivery arrangements or costs are agreed separately.</p></details>
      <details><summary>Can I also apply through the Crew Hub?</summary><p>Yes. Create an account and complete your intake at any time. Booking a call is separate from programme admission.</p></details>
      <details><summary>Should I share my passport or medical records?</summary><p>No. Please don’t include passport numbers, medical details or financial account information when booking or in your intake.</p></details>
      <details><summary>Does M/Y Eye find me a yacht job?</summary><p>No tool can promise you a job. M/Y Eye helps you look for one in a smarter, more organised way. Hiring decisions stay with captains, heads of department and crew agencies.</p></details>
      <details><summary>Can M/Y Eye help with entry-level yacht jobs?</summary><p>Yes. It’s built for greenies and junior crew who are dockwalking and looking for daywork, as well as crew planning their next contract.</p></details>
      <details><summary>Is every yacht shown on the M/Y Eye map?</summary><p>No. Ship-tracking data isn’t complete, and some yachts may be missing or out of date. Use M/Y Eye to plan, then confirm in person on the dock.</p></details>
      <details><summary>Can I dockwalk at any marina?</summary><p>Not always. Some marinas and shipyards have strict security, and some ports don’t allow dockwalking. Check local rules before you go.</p></details>
      <details><summary>Who can see my location on M/Y Eye?</summary><p>When coach view launches, your port and vessel will be visible only to you and your assigned coach.</p></details>
    </section>

    <section className="gy-band">
      <p className="gy-eyebrow">YOUR NEXT CHAPTER</p>
      <h2>Make your next move a considered decision, not another guess.</h2>
      <p>Tell us where you’re starting. Let’s explore what support makes sense.</p>
      <div className="gy-actions"><button className="gy-primary" onClick={() => book()}>Book My Discovery Call</button><button className="gy-outline" disabled={!canStart} onClick={onStart}>{session ? 'Continue your journey' : 'Start your application'}</button></div>
    </section>
    <button className="gy-primary gy-sticky" onClick={() => book()}>Book My Discovery Call</button>
  </>;
}
