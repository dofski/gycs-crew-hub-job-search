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

const reviews: [string, string, string][] = [
  ["Ellen Kay-Shuttleworth", "Junior Stewardess", "Chad has designed an innovative and modern approach to finding a job onboard. I have full faith in him and his programme, anyone who is having doubts about how to find a job abroad - give Chad a call. He is passionate about helping you and I promise you won't regret it. Much love!"],
  ["Samuel Martins", "Junior Deckhand", "EDIT: I've landed my first job literally less than 24 hours after my meeting with Chad! His interview tips definitely helped me secure the position. Once again. highly recommend his services! Chad is an industry veteran. He is very knowledgable, he cares about his clients, and he genuinely wants to help new crew. Coming into the industry can be very overwhelming, and Chad is an expert to help navigate what exactly to avoid and what you want to get out of working in this industry"],
  ["Mj Strauss", "Junior Deckhand", "I joined Chad’s program as a “greenie” about three weeks ago. Up until now I had an amazing experience and already learned a lot. Couldn’t ask for a better life coach! I would highly recommend this program for anyone that wants to enter the industry."],
  ["Dani Lynn", "Lifestyle Marketer", "This guy right here!!!! BOMB. If you need any help or guidance (and I mean straight up, no beating around the bush guidance) you are at the right place! Listen, ask questions, and follow. He will help get you on the right path."],
  ["Gareth Mark Toerien", "Junior Deckhand", "Chad is an excellent learning facilitator, his classes are well structured and extremely informative. Anyone looking at getting into yachting should defiantly give him a shout, it is totally worth tour while, he even gives avenues and insights for you to pursue in future ventures Too bloke. Highly recommended"],
  ["Liam OSullivan", "Junior Deckhand", "Chad is a awesome guy and is really helpful with everything he does . His courses are very well run and he puts you in the best position you can be in to find a job . He goes completely out his way to benefit you . Thanks Chad"],
  ["Liam Davern Caffery", "Junior Deckhand", "I highly recommend Chad's course as it takes a fresh and modern take on finding a job and presenting yourself in the digital space. His experience and skills are invaluable!"],
  ["Cullen Wright", "Junior Deckhand", "Highly recommendable. Everything you need to know about getting a job and keeping it is covered in Chad’s courses which is invaluable information if you have limited experience. Definitely worth it and going to recommend to my mates that want to start out in the industry!"],
  ["Bizel ßv", "Commercial Officer", "This is a man with insight and innovation in a industry that is lacking this sort of initiative, I have been fortunate to meet and connect with Chad and what he is all about. He has great ideas moving forward and all make sense the way he connects each one. I told him no agency yet has got me a job and in his own words said 'Its because they lack vision!' and they do…"],
  ["Dayn Bruwer", "Experienced Bosun - In Couple", "Working with Chad is a great experience!!.He delivers the exact service that he advertises.I definitely prefer working with him if you are looking to land a job onboard."],
  ["Jadon Ferrier", "Junior Deckhand", "What a great experience. I have so much respect for Chad! He is an amazing guy, helpful and straightforward, nothing gets sugarcoated. You can see Chad’s passion in his work, his intensions is truly to give the best advice he possibly can. Highly recommend Chad’s service every second worth it Just want to give a huge thanks to you Chad for all your help!"],
  ["Afrika Masuku", "Chief Officer", "It is my pleasure to offer my unreserved recommendation for Chad for someone who is looking to start in the yachting industry. He has always demonstrated responsibility, and he has an exceptional expertise in leadership, coaching and motivation. If l may expand further, Chad has extensive strategies along with solid social media skills. I would welcome the opportunity to work with Chad again. #Loyal #insightful"],
  ["Noemi Santiago", "Junior Stewardess", "This is so informative. I thought I knew a little of what exactly you need to get into the yachting industry, but wow this really opened my eyes. I am so happy I read this. From start to finish there is so much information and step by step, of what is needed, and what you need to do. I wish I would have had this information before I started my courses, because it would have made my life so much easier. I am happy I have this now. Thank you for this information…"]
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
      <p className="gy-eyebrow">YACHT CAREER COACHING · DISCOVERY CALLS OPEN</p>
      <h1>Your yacht career.<br/><em>Planned, not guessed.</em></h1>
      <p className="gy-lead">Whether you’re leaving school, changing careers or already onboard, Green Yacht Crew Solutions coaching helps you choose the right first or next step — before you spend on courses, flights or applications.</p>
      <div className="gy-actions"><button className="gy-primary" onClick={() => book()}>Book a discovery call ↓</button><button className="gy-outline" disabled={!canStart} onClick={onStart}>{session ? 'Continue your journey' : 'Start your application'}</button>{!session && <button className="gy-link" onClick={onSignIn}>Member sign in</button>}</div>
      <p className="gy-small">Coached by Chad de Wet, former superyacht Chief Officer. <button className="gy-link" onClick={() => jump('reviews')}>Read 13 crew reviews</button></p>
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

    <section className="gy-section">
      <p className="gy-eyebrow">WHAT TO EXPECT</p>
      <h2>One call. A clear next step.</h2>
      <div className="gy-grid">{[['01', 'Pick a time', 'Choose a slot in the booking calendar below.'], ['02', 'Share your situation', 'Tell us your goals, experience, budget and timing.'], ['03', 'Get honest guidance', 'What’s realistic, what to do first and what to skip.'], ['04', 'Decide your next step', 'If coaching is a fit, we’ll explain the options. No pressure to commit on the call.']].map(([n, t, d]) => <article className="gy-card" key={n}><span className="gy-eyebrow">{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
    </section>

    <section className="gy-section" id="reviews" aria-labelledby="reviews-title">
      <p className="gy-eyebrow">WHAT CREW SAY</p>
      <h2 id="reviews-title">13 reviews from crew Chad has worked with.</h2>
      <div className="gy-reviews">{reviews.map(([name, role, text]) => <figure className="gy-review" key={name}><blockquote>{text}</blockquote><figcaption>{name}<span>{role}</span></figcaption></figure>)}</div>
      <p className="gy-small">Reviews shared by clients on chaddewet.com and shown as written. Individual experiences vary; coaching does not guarantee employment.</p>
      <div className="gy-actions"><button className="gy-primary" onClick={() => book()}>Book your discovery call</button></div>
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
      <details><summary>Who will I speak to?</summary><p>Discovery calls are with Chad de Wet, founder of Green Yacht Crew Solutions and a former superyacht Chief Officer.</p></details>
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
