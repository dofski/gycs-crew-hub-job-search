-- ============================================================================
-- Migration: 8-Week Superyacht Career Launchpad Course Syllabus,
--            Coaching Programs, Sourced Requirements & Caller-Scoped Pathway Sync
-- Target project: wfblxexdqlxeequvywfc (Green Yacht Crew Solutions)
-- ============================================================================

-- 1. Extend programmes, lessons, and milestones with structured Launchpad syllabus fields
ALTER TABLE public.programmes
  ADD COLUMN IF NOT EXISTS instructor text DEFAULT 'Chad de Wet (Yachtmaster Offshore 200GT, Enterprise AI/API Architect)',
  ADD COLUMN IF NOT EXISTS delivery_framework text DEFAULT 'The GROW Coaching Model (Goal, Reality, Obstacles, Way Forward)',
  ADD COLUMN IF NOT EXISTS tech_stack jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS phases jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS phase text,
  ADD COLUMN IF NOT EXISTS phase_code text,
  ADD COLUMN IF NOT EXISTS module_focus text,
  ADD COLUMN IF NOT EXISTS grow_anchor text,
  ADD COLUMN IF NOT EXISTS core_objective text,
  ADD COLUMN IF NOT EXISTS platform_tool text,
  ADD COLUMN IF NOT EXISTS operational_lessons jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tech_deliverable text,
  ADD COLUMN IF NOT EXISTS weekly_milestone text,
  ADD COLUMN IF NOT EXISTS primary_output text,
  ADD COLUMN IF NOT EXISTS deck_url text;

ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS phase text,
  ADD COLUMN IF NOT EXISTS grow_anchor text,
  ADD COLUMN IF NOT EXISTS platform_tool text,
  ADD COLUMN IF NOT EXISTS primary_output text;

GRANT SELECT (instructor, delivery_framework, tech_stack, phases) ON public.programmes TO authenticated;
GRANT SELECT (phase, phase_code, module_focus, grow_anchor, core_objective, platform_tool, operational_lessons, tech_deliverable, weekly_milestone, primary_output, deck_url) ON public.lessons TO authenticated;
GRANT SELECT (phase, grow_anchor, platform_tool, primary_output) ON public.milestones TO authenticated;

-- 2. Seed Sourced Statutory & Syllabus Requirements in public.requirements
CREATE UNIQUE INDEX IF NOT EXISTS requirements_code_unique_idx ON public.requirements (code);

INSERT INTO public.requirements (
  code, title, description, classification, applicable_flags, applicable_roles,
  applicable_departments, source_authority, source_url, source_version,
  last_verified_date, verified_by, notes, is_active
)
VALUES
  (
    'SEAFARER_MEDICAL_ENG1',
    'ENG1 Seafarer Medical Certificate (or SAMSA Accredited Equivalent)',
    'Statutory seafarer physical and eyesight fitness examination. Audits color vision (Ishihara/CAD), respiratory health, and physical fitness for sea service.',
    'required_for_context'::public.requirement_classification,
    ARRAY['MCA', 'SAMSA', 'Cayman Islands', 'Marshall Islands', 'Malta'],
    ARRAY['Deckhand', 'Steward/ess', 'Engineer', 'Chef', 'All Crew'],
    ARRAY['deck', 'interior', 'engineering', 'galley']::public.department[],
    'UK MCA MSN 1815 / SAMSA Marine Notice',
    'https://www.gov.uk/guidance/seafarers-medical-certification-guidance',
    'MSN 1815 (M+F) Amendment 2',
    '2026-10-01',
    'Chad de Wet (Yachtmaster Offshore 200GT)',
    'Week 1 Regulatory Floor: Identify disqualifiers (color blindness, respiratory conditions) early. Book only MCA-approved or SAMSA-recognized maritime doctors.',
    true
  ),
  (
    'VISA_SCHENGEN_B1B2',
    'Flag State & Visa Constraints (Schengen 90/180 & US B1/B2)',
    'Managing the Schengen 90/180-day countdown for non-EU crew and understanding B1/B2 visa vs. US Coast Guard flag restrictions for North American deployment.',
    'required_for_context'::public.requirement_classification,
    ARRAY['Schengen States', 'USCG', 'Foreign Flag Vessels'],
    ARRAY['All Non-EU / International Crew'],
    ARRAY['deck', 'interior', 'engineering', 'galley']::public.department[],
    'EU Schengen Borders Code / US Department of State FAM',
    'https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa_en',
    '2026 Border Compliance',
    '2026-10-01',
    'Chad de Wet (Yachtmaster Offshore 200GT)',
    'Week 1 Regulatory Floor: Biometric passport must have 6+ months validity and blank pages. Track Schengen days strictly unless signed onto an official vessel crew list.',
    true
  ),
  (
    'STCW_BASIC_SAFETY',
    'STCW 2010 Basic Safety Training (PST, PSSR, FPFF, EFA)',
    'Mandatory 5-module safety training required for all commercial and private superyacht crew over 24m: Personal Survival Techniques, Fire Prevention & Fire Fighting, Elementary First Aid, Personal Safety & Social Responsibilities.',
    'required_for_context'::public.requirement_classification,
    ARRAY['MCA', 'SAMSA', 'Marshall Islands', 'Cayman Islands'],
    ARRAY['Deckhand', 'Steward/ess', 'Engineer', 'Chef'],
    ARRAY['deck', 'interior', 'engineering', 'galley']::public.department[],
    'IMO STCW Convention',
    'https://www.imo.org/en/OurWork/HumanElement/Pages/STCW-Conv-LINK.aspx',
    '2010 Manila Amendments',
    '2026-10-01',
    'Chad de Wet (Yachtmaster Offshore 200GT)',
    'Week 2 Essential vs. Upsell Audit: Must be issued by an MCA-approved or SAMSA-accredited maritime training center. 5-year refresher cycle applies to PST and FPFF.',
    true
  ),
  (
    'STCW_PDSD',
    'Proficiency in Designated Security Duties (PDSD)',
    'Mandatory ISPS Code security awareness and designated security duties qualification under STCW Regulation VI/6.',
    'required_for_context'::public.requirement_classification,
    ARRAY['MCA', 'SAMSA', 'Marshall Islands', 'Cayman Islands'],
    ARRAY['Deckhand', 'Steward/ess', 'Engineer', 'Chef'],
    ARRAY['deck', 'interior', 'engineering', 'galley']::public.department[],
    'IMO ISPS Code / STCW Reg VI/6',
    'https://www.imo.org/en/OurWork/Security/Pages/ISPSCode.aspx',
    'Regulation VI/6, Para 4',
    '2026-10-01',
    'Chad de Wet (Yachtmaster Offshore 200GT)',
    'Week 2 Essential vs. Upsell Audit: Always take PDSD rather than basic Security Awareness so you are cleared for security watch rosters on 500GT+ vessels.',
    true
  ),
  (
    'RYA_POWERBOAT_LEVEL_2',
    'RYA Powerboat Level 2 (PB2) / Tender Operator',
    'Practical coastal powerboat handling, close-quarters maneuvering, man-overboard recovery, and tender guest transfer operations.',
    'employer_preference'::public.requirement_classification,
    ARRAY['RYA / MCA Commercial Endorsement Eligible'],
    ARRAY['Deckhand', 'Junior Engineer'],
    ARRAY['deck', 'engineering']::public.department[],
    'Royal Yachting Association (RYA)',
    'https://www.rya.org.uk/training/courses/powerboat-level-2-pb2',
    'RYA Powerboat Syllabus',
    '2026-10-01',
    'Chad de Wet (Yachtmaster Offshore 200GT)',
    'Week 2 Functional Addition: Essential employer requirement for entry-level Deckhands. Forms the first step on the officer progression route (PB2 to OOW 3000GT).',
    true
  ),
  (
    'RYA_SRC_VHF',
    'Marine VHF Short Range Certificate (SRC)',
    'Statutory radio operator license required to operate marine VHF DSC radios on yacht tenders and bridge watches.',
    'employer_preference'::public.requirement_classification,
    ARRAY['ITU', 'RYA', 'SAMSA'],
    ARRAY['Deckhand', 'Bridge Watchkeeper'],
    ARRAY['deck']::public.department[],
    'ITU Radio Regulations / RYA',
    'https://www.rya.org.uk/training/courses/marine-radio-src',
    'ITU Appendix 18',
    '2026-10-01',
    'Chad de Wet (Yachtmaster Offshore 200GT)',
    'Week 2 Functional Addition: High-ROI certificate for Deckhands operating guest tenders and standing anchor/bridge lookout watches.',
    true
  ),
  (
    'CIEH_FOOD_SAFETY_L2',
    'Food Safety & Hygiene Level 2 (Catering / Maritime)',
    'Mandatory food handling, allergen control, temperature logging, and galley/pantry sanitation certification under MLC 2006.',
    'required_for_context'::public.requirement_classification,
    ARRAY['MLC 2006 Standard A3.2', 'MCA'],
    ARRAY['Steward/ess', 'Chef', 'Sous Chef', 'Sole Cook'],
    ARRAY['interior', 'galley']::public.department[],
    'ILO Maritime Labour Convention 2006',
    'https://www.ilo.org/global/standards/maritime-labour-convention/lang--en/index.htm',
    'Title 3, Regulation 3.2',
    '2026-10-01',
    'Chad de Wet (Yachtmaster Offshore 200GT)',
    'Week 2 Functional Addition: Mandatory for all Interior Steward/esses and Galley Chefs handling guest or crew food and beverage service.',
    true
  ),
  (
    'MCA_AEC_1_2',
    'MCA Approved Engine Course (AEC 1 & AEC 2)',
    'Foundational marine diesel propulsion, electrical generation, fuel/water systems, and engine room watchkeeping qualification.',
    'employer_preference'::public.requirement_classification,
    ARRAY['MCA', 'Red Ensign Group'],
    ARRAY['Junior Engineer', 'Deck/Engineer', 'ETO'],
    ARRAY['engineering', 'deck']::public.department[],
    'UK Maritime & Coastguard Agency (MCA)',
    'https://www.gov.uk/guidance/certification-for-superyacht-engineers',
    'MIN 642 / MSN 1904',
    '2026-10-01',
    'Chad de Wet (Yachtmaster Offshore 200GT)',
    'Week 2 Engineering Specialization: Positions commercial mechanics, technicians, and dual-role Deck/Engineers for superyacht engineering progression.',
    true
  ),
  (
    'PREDATORY_BUNDLE_AUDIT',
    'Essential vs. Upsell Training Audit (Defer OOW / Yachtmaster)',
    'Audit local training schools to eliminate multi-thousand-dollar "guaranteed placement" bundles and defer advanced officer tickets until sea time is logged.',
    'defer'::public.requirement_classification,
    ARRAY['All Flags'],
    ARRAY['Entry-Level Crew', 'Career Changers', 'School Leavers'],
    ARRAY['deck', 'interior', 'engineering', 'galley']::public.department[],
    'GYCS Training Cost-Audit Standard & SA Employment Services Act',
    'https://hub.chaddewet.com',
    '2026 Launchpad Standard',
    '2026-10-27',
    'Chad de Wet (Yachtmaster Offshore 200GT)',
    'Week 2 Guardrail: DO NOT spend capital on multi-thousand-dollar "guaranteed placement" bundles or Yachtmaster/OOW modules before securing your first contract and logging qualifying sea time.',
    true
  ),
  (
    'MLC_SEA_CONTRACT',
    'MLC 2006 Seafarer Employment Agreement (SEA) Standard',
    'Statutory employment contract requirements: basic pay, paid leave allocations (38 to 60+ days/year), medical coverage, repatriation flights, and notice periods.',
    'required_for_context'::public.requirement_classification,
    ARRAY['MLC 2006 Ratified Flags', 'Red Ensign Group'],
    ARRAY['All Crew'],
    ARRAY['deck', 'interior', 'engineering', 'galley']::public.department[],
    'ILO Maritime Labour Convention 2006 Standard A2.1',
    'https://www.ilo.org/global/standards/maritime-labour-convention/lang--en/index.htm',
    'Standard A2.1',
    '2026-10-27',
    'Chad de Wet (Yachtmaster Offshore 200GT)',
    'Week 8 Contract Review: Audit every offer for flag state registration, P&I medical insurance, repatriation rights, and clear leave ratios before signing.',
    true
  )
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  classification = EXCLUDED.classification,
  applicable_flags = EXCLUDED.applicable_flags,
  applicable_roles = EXCLUDED.applicable_roles,
  applicable_departments = EXCLUDED.applicable_departments,
  source_authority = EXCLUDED.source_authority,
  source_url = EXCLUDED.source_url,
  source_version = EXCLUDED.source_version,
  last_verified_date = EXCLUDED.last_verified_date,
  verified_by = EXCLUDED.verified_by,
  notes = EXCLUDED.notes,
  is_active = true,
  updated_at = now();

-- 3. Update Coaching Programmes & Seed the 8-Week Superyacht Career Launchpad Syllabus
DO $$
DECLARE
  v_prog_1on1_id uuid;
  v_prog_group_id uuid;
  v_deckhand_pathway_id uuid := '428ec993-29f5-44eb-a514-d795a1a45a24';
  v_req_eng1 uuid;
  v_req_stcw uuid;
  v_req_pb2 uuid;
  v_req_sea uuid;
  v_tech_stack jsonb := jsonb_build_array(
    jsonb_build_object('name', 'GYCS Crew Hub', 'url', 'https://hub.chaddewet.com', 'description', 'Central dashboard for course modules, asset management, and coach feedback.'),
    jsonb_build_object('name', 'CV Studio', 'url', 'https://hub.chaddewet.com/?workspace=1', 'description', 'Specialized builder engineered to produce lightweight (<250KB), compliant 2-page PDFs aligned with Captain & HOD review habits.'),
    jsonb_build_object('name', 'Candidate Landing Page & Scheduling Funnel', 'url', 'https://chaddewet.com', 'description', 'Branded, mobile-first web presence showcasing your 60-second intro video, credential vault, and live calendar booking.'),
    jsonb_build_object('name', 'M/Y Eye Maritime Intelligence', 'url', 'https://searchengine.chaddewet.com', 'description', 'Maritime intelligence combining AIS vessel tracking, port arrival schedules, and dockwalking logs.'),
    jsonb_build_object('name', 'CRM Opportunity Pipeline', 'url', 'https://hub.chaddewet.com/?workspace=1', 'description', 'Personal tracking system to log every vessel, management agency, HOD contact, conversation, and follow-up.')
  );
  v_phases jsonb := jsonb_build_array(
    jsonb_build_object('phase', 'Phase 1: KNOW', 'weeks', 'Weeks 1–2', 'subtitle', 'Establishing operational baselines, regulatory compliance, and precision department targeting.', 'modules', jsonb_build_array('Week 1: Career Reality Check', 'Week 2: Route & Training Navigator')),
    jsonb_build_object('phase', 'Phase 2: PREPARE', 'weeks', 'Weeks 3–5', 'subtitle', 'Transforming your background into maritime-compliant assets, interactive digital funnels, and deployment logistics.', 'modules', jsonb_build_array('Week 3: Experience-to-CV Builder', 'Week 4: Professional Profile Polish & Conversion Funnel', 'Week 5: Launch Readiness Planner')),
    jsonb_build_object('phase', 'Phase 3: EXECUTE', 'weeks', 'Weeks 6–8', 'subtitle', 'Deploying direct intelligence systems, securing interviews, and turning daywork into permanent employment.', 'modules', jsonb_build_array('Week 6: Job Search Strategist & Direct Vessel Outreach', 'Week 7: Interview Confidence Lab', 'Week 8: Career Action Blueprint & Daywork Deployment'))
  );
  v_les1_id uuid := '9b123a33-185b-4d95-bfb4-1bf2978fa198';
  v_les2_id uuid := 'e9f46b49-0a4a-48fe-bfb6-d95df5ebbf8c';
  v_les3_id uuid := 'd84e31d8-6ee4-4519-b7f2-edd575d86437';
  v_les4_id uuid := '92ecc371-715e-423c-9e1a-22921cc8a859';
  v_les5_id uuid := '55110005-8888-4000-a005-000000000005';
  v_les6_id uuid := '66110006-8888-4000-a006-000000000006';
  v_les7_id uuid := '77110007-8888-4000-a007-000000000007';
  v_les8_id uuid := '88110008-8888-4000-a008-000000000008';
BEGIN
  -- 3a. Upsert Single 1-on-1 Coaching Program
  INSERT INTO public.programmes (
    title, slug, description, department, duration_weeks, programme_type,
    instructor, delivery_framework, tech_stack, phases, is_active
  )
  VALUES (
    'Single 1-on-1 Coaching Program (8-Week Launchpad)',
    'single-1on1-coaching',
    'Private 1-on-1 execution of the 8-Week Superyacht Career Launchpad with Chad de Wet (Yachtmaster Offshore 200GT, Enterprise AI/API Architect). Delivered via the GROW Coaching Model across Phase 1: KNOW (Weeks 1–2), Phase 2: PREPARE (Weeks 3–5), and Phase 3: EXECUTE (Weeks 6–8).',
    'deck'::public.department,
    8,
    'one_on_one',
    'Chad de Wet (Yachtmaster Offshore 200GT, Enterprise AI/API Architect)',
    'The GROW Coaching Model (Goal, Reality, Obstacles, Way Forward)',
    v_tech_stack,
    v_phases,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    duration_weeks = 8,
    programme_type = 'one_on_one',
    instructor = EXCLUDED.instructor,
    delivery_framework = EXCLUDED.delivery_framework,
    tech_stack = EXCLUDED.tech_stack,
    phases = EXCLUDED.phases,
    is_active = true,
    updated_at = now()
  RETURNING id INTO v_prog_1on1_id;

  -- 3b. Upsert Group Coaching Program
  INSERT INTO public.programmes (
    title, slug, description, department, duration_weeks, programme_type,
    instructor, delivery_framework, tech_stack, phases, is_active
  )
  VALUES (
    'Group Coaching Program (8-Week Superyacht Career Launchpad)',
    'group-coaching-program',
    'Structured 8-Week Superyacht Career Launchpad cohort programme delivered via the GROW Coaching Model (Goal, Reality, Obstacles, Way Forward): Phase 1 KNOW (Weeks 1–2), Phase 2 PREPARE (Weeks 3–5), and Phase 3 EXECUTE (Weeks 6–8), powered by GYCS Crew Hub, CV Studio, Candidate Funnels, M/Y Eye, and CRM Pipeline.',
    'deck'::public.department,
    8,
    'group',
    'Chad de Wet (Yachtmaster Offshore 200GT, Enterprise AI/API Architect)',
    'The GROW Coaching Model (Goal, Reality, Obstacles, Way Forward)',
    v_tech_stack,
    v_phases,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    duration_weeks = 8,
    programme_type = 'group',
    instructor = EXCLUDED.instructor,
    delivery_framework = EXCLUDED.delivery_framework,
    tech_stack = EXCLUDED.tech_stack,
    phases = EXCLUDED.phases,
    is_active = true,
    updated_at = now()
  RETURNING id INTO v_prog_group_id;

  -- 4. Upsert the 8 Weekly Launchpad Lessons into public.lessons
  -- Week 1: Career Reality Check
  INSERT INTO public.lessons (
    id, programme_id, title, slug, lesson_type, sort_order, duration_mins, is_published,
    phase, phase_code, module_focus, grow_anchor, core_objective, platform_tool,
    operational_lessons, tech_deliverable, weekly_milestone, primary_output, deck_url, content
  )
  VALUES (
    v_les1_id,
    v_prog_group_id,
    'Week 1 — Career Reality Check',
    'week-1-career-reality-check',
    'video'::public.lesson_type,
    1,
    45,
    true,
    'Phase 1: KNOW (Weeks 1–2)',
    'know',
    'Baseline Reality Check',
    'Reality & Goal Calibration',
    'Strip away generic industry myths and audit your individual baseline constraints (passports, medical status, financial runway, and lifestyle suitability) before investing time or capital.',
    'Crew Hub Constraints Engine',
    jsonb_build_array(
      jsonb_build_object(
        'title', '1. The Maritime Regulatory Floor',
        'points', jsonb_build_array(
          'ENG1 Seafarer Medical Audit: Requirements, identifying disqualifiers (color blindness, respiratory conditions), and booking authorized MCA doctors.',
          'Flag State & Visa Constraints: Managing the Schengen 90/180-day countdown for non-EU crew; understanding B1/B2 vs. US Coast Guard flag restrictions for North American deployment.'
        )
      ),
      jsonb_build_object(
        'title', '2. Cabin Life & Psychological Readiness',
        'points', jsonb_build_array(
          'Shared cabin dynamics, chain of command, zero-tolerance policies (contraband, conduct), and working 14–16 hour charter days.'
        )
      ),
      jsonb_build_object(
        'title', '3. Financial Runway Modeling',
        'points', jsonb_build_array(
          'Calculating living costs in crew houses across Antibes, Palma, and Fort Lauderdale against your required runway before landing paid daywork or a permanent contract.'
        )
      )
    ),
    'Complete the GYCS Baseline Constraints & Financial Runway Calculator inside the Crew Hub.',
    'Verified eligibility checklist (ENG1, passport/visa eligibility map) and clear timeline clearance.',
    'Eligibility & Runway Audit Passed',
    'https://canva.link/3bhhn1hph1oiyry',
    'Phase 1: KNOW (Week 1) · GROW Anchor: Reality & Goal Calibration. Strip away generic industry myths and audit your individual baseline constraints (passports, ENG1 medical status, Schengen 90/180 & B1/B2 visa constraints, cabin life readiness, and financial runway across Antibes, Palma, and Fort Lauderdale) before investing time or capital.'
  )
  ON CONFLICT (id) DO UPDATE SET
    programme_id = EXCLUDED.programme_id,
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    sort_order = EXCLUDED.sort_order,
    duration_mins = EXCLUDED.duration_mins,
    is_published = true,
    phase = EXCLUDED.phase,
    phase_code = EXCLUDED.phase_code,
    module_focus = EXCLUDED.module_focus,
    grow_anchor = EXCLUDED.grow_anchor,
    core_objective = EXCLUDED.core_objective,
    platform_tool = EXCLUDED.platform_tool,
    operational_lessons = EXCLUDED.operational_lessons,
    tech_deliverable = EXCLUDED.tech_deliverable,
    weekly_milestone = EXCLUDED.weekly_milestone,
    primary_output = EXCLUDED.primary_output,
    deck_url = EXCLUDED.deck_url,
    content = EXCLUDED.content,
    updated_at = now();

  -- Week 2: Route & Training Navigator
  INSERT INTO public.lessons (
    id, programme_id, title, slug, lesson_type, sort_order, duration_mins, is_published,
    phase, phase_code, module_focus, grow_anchor, core_objective, platform_tool,
    operational_lessons, tech_deliverable, weekly_milestone, primary_output, deck_url, content
  )
  VALUES (
    v_les2_id,
    v_prog_group_id,
    'Week 2 — Route & Training Navigator',
    'week-2-route-and-training-navigator',
    'video'::public.lesson_type,
    2,
    50,
    true,
    'Phase 1: KNOW (Weeks 1–2)',
    'know',
    'Route & Training Navigator',
    'Goal Precision & Obstacle Elimination',
    'Select your target vessel department, identify mandatory qualifications, and eliminate predatory or overpriced training packages.',
    'Department Route Selector',
    jsonb_build_array(
      jsonb_build_object(
        'title', '1. Department & Tonnage Specialization',
        'points', jsonb_build_array(
          'Deck Department: Translating trades (carpentry, detailing, watersports, mechanics) into entry-level deckhand assets; officer progression routes (PB2 to OOW 3000GT).',
          'Interior Department: Translating fine dining, boutique hospitality, private households, and mixology into junior steward/ess roles; understanding Chief Stewardess operational expectations.',
          'Engineering & Galley: Positioning commercial mechanics, ETOs, and culinary professionals for rotational salaries; highlighting tonnage, generator capacities, and provisioning metrics.'
        )
      ),
      jsonb_build_object(
        'title', '2. The "Essential vs. Upsell" Training Audit',
        'points', jsonb_build_array(
          'Mandatory tickets: STCW 2010 (Basic Safety Training) and PDSD (Proficiency in Designated Security Duties).',
          'Functional additions: RYA Powerboat Level 2, Food Safety Level 2, or Tender Operator modules.',
          'Auditing local schools to avoid predatory multi-thousand-dollar "guaranteed placement" course bundles.'
        )
      ),
      jsonb_build_object(
        'title', '3. Global Port Selection',
        'points', jsonb_build_array(
          'Deciding where to base yourself (Antibes vs. Palma vs. Fort Lauderdale vs. St. Maarten) based on departure dates, vessel refit cycles, and seasonal fleet migrations.'
        )
      )
    ),
    'Personalized Target Department Blueprint & Training Cost-Audit Sheet.',
    'Training schedule locked with certified schools; zero capital spent on non-essential certificates.',
    'Target Role & Certified Training Plan',
    'https://canva.link/6rmh1zxrtgcopgc',
    'Phase 1: KNOW (Week 2) · GROW Anchor: Goal Precision & Obstacle Elimination. Select your target vessel department (Deck, Interior, Engineering, or Galley), audit mandatory STCW 2010 & PDSD tickets versus high-ROI additions (PB2, SRC, Food Safety L2, AEC), eliminate predatory training bundles, and select your launch port.'
  )
  ON CONFLICT (id) DO UPDATE SET
    programme_id = EXCLUDED.programme_id,
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    sort_order = EXCLUDED.sort_order,
    duration_mins = EXCLUDED.duration_mins,
    is_published = true,
    phase = EXCLUDED.phase,
    phase_code = EXCLUDED.phase_code,
    module_focus = EXCLUDED.module_focus,
    grow_anchor = EXCLUDED.grow_anchor,
    core_objective = EXCLUDED.core_objective,
    platform_tool = EXCLUDED.platform_tool,
    operational_lessons = EXCLUDED.operational_lessons,
    tech_deliverable = EXCLUDED.tech_deliverable,
    weekly_milestone = EXCLUDED.weekly_milestone,
    primary_output = EXCLUDED.primary_output,
    deck_url = EXCLUDED.deck_url,
    content = EXCLUDED.content,
    updated_at = now();

  -- Week 3: Experience-to-CV Builder
  INSERT INTO public.lessons (
    id, programme_id, title, slug, lesson_type, sort_order, duration_mins, is_published,
    phase, phase_code, module_focus, grow_anchor, core_objective, platform_tool,
    operational_lessons, tech_deliverable, weekly_milestone, primary_output, deck_url, content
  )
  VALUES (
    v_les3_id,
    v_prog_group_id,
    'Week 3 — Experience-to-CV Builder',
    'week-3-experience-to-cv-builder',
    'practical'::public.lesson_type,
    3,
    60,
    true,
    'Phase 2: PREPARE (Weeks 3–5)',
    'prepare',
    'Experience-to-CV Builder',
    'Way Forward: Reframing Non-Yachting Pedigree',
    'Translate land-based work history into superyacht Standard Operating Procedure (SOP) language and build a compliant, two-page maritime CV.',
    'CV Studio',
    jsonb_build_array(
      jsonb_build_object(
        'title', '1. Superyacht Translation Formula',
        'points', jsonb_build_array(
          'Converting land-based service, trades, or sports into safety consciousness, discreet service, high-end finishing, and high-pressure stamina.',
          'Removing land-based formatting mistakes (objective statements, dense prose, non-relevant timelines).'
        )
      ),
      jsonb_build_object(
        'title', '2. CV Studio Production Standards',
        'points', jsonb_build_array(
          '2-page hard limit, satellite-optimized PDF size (under 250KB).',
          'Exact maritime hierarchy: Personal details, visa/medical status, maritime certificates, marine-relevant work experience, and verified references.'
        )
      ),
      jsonb_build_object(
        'title', '3. AI-Assisted Evidence Mapping',
        'points', jsonb_build_array(
          'Using prompt frameworks inside the GYCS Crew Hub to extract actionable accomplishments from previous job roles while preserving authenticity.'
        )
      )
    ),
    'Maritime-compliant 2-Page Master CV built, reviewed, and finalized in CV Studio.',
    'Head of Department-ready CV approved by your GYCS coach.',
    'Two-Page Compliant Maritime CV (<250KB)',
    'https://canva.link/zimcuo866se1ohk',
    'Phase 2: PREPARE (Week 3) · GROW Anchor: Way Forward: Reframing Non-Yachting Pedigree. Translate land-based work history into superyacht Standard Operating Procedure (SOP) language and build a compliant, two-page maritime CV (<250KB) in CV Studio with verified provenance labels.'
  )
  ON CONFLICT (id) DO UPDATE SET
    programme_id = EXCLUDED.programme_id,
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    sort_order = EXCLUDED.sort_order,
    duration_mins = EXCLUDED.duration_mins,
    is_published = true,
    phase = EXCLUDED.phase,
    phase_code = EXCLUDED.phase_code,
    module_focus = EXCLUDED.module_focus,
    grow_anchor = EXCLUDED.grow_anchor,
    core_objective = EXCLUDED.core_objective,
    platform_tool = EXCLUDED.platform_tool,
    operational_lessons = EXCLUDED.operational_lessons,
    tech_deliverable = EXCLUDED.tech_deliverable,
    weekly_milestone = EXCLUDED.weekly_milestone,
    primary_output = EXCLUDED.primary_output,
    deck_url = EXCLUDED.deck_url,
    content = EXCLUDED.content,
    updated_at = now();

  -- Week 4: Professional Profile Polish & Conversion Funnel
  INSERT INTO public.lessons (
    id, programme_id, title, slug, lesson_type, sort_order, duration_mins, is_published,
    phase, phase_code, module_focus, grow_anchor, core_objective, platform_tool,
    operational_lessons, tech_deliverable, weekly_milestone, primary_output, deck_url, content
  )
  VALUES (
    v_les4_id,
    v_prog_group_id,
    'Week 4 — Professional Profile Polish & Conversion Funnel',
    'week-4-professional-profile-polish-and-conversion-funnel',
    'video'::public.lesson_type,
    4,
    55,
    true,
    'Phase 2: PREPARE (Weeks 3–5)',
    'prepare',
    'Digital Profile & Funnel Polish',
    'Way Forward: Bypassing the Static PDF Inbox Trap',
    'Move beyond the static resume by deploying a dedicated candidate landing page with embedded scheduling and high-impact media.',
    'Candidate Landing Page Builder',
    jsonb_build_array(
      jsonb_build_object(
        'title', '1. Candidate Funnel Engineering',
        'points', jsonb_build_array(
          'Why static PDFs get lost in Captains'' and Chief Stews'' WhatsApp chats and inboxes.',
          'Structuring a mobile-first Candidate Landing Page with interactive links, verified credentials, and digital references.'
        )
      ),
      jsonb_build_object(
        'title', '2. Multimedia Presentation & Digital Hygiene',
        'points', jsonb_build_array(
          'Crafting a 60-second video introduction: lighting, attire, framing, tone, and crew-mess cultural fit.',
          'Professional photo grading: clean maritime polo, natural lighting, neat grooming, no sunglasses or distracting backgrounds.',
          'Social media security audit: scrubbing personal accounts, configuring privacy settings, and professionalizing public presences.'
        )
      ),
      jsonb_build_object(
        'title', '3. Calendar Booking Automation',
        'points', jsonb_build_array(
          'Embedding a friction-free booking engine (Zoom, Google Meet, dockside daywork slots) that eliminates email scheduling back-and-forth.'
        )
      )
    ),
    'Live Candidate Landing Page & Calendar Scheduling Funnel on chaddewet.com/candidate/your-name.',
    'Published, interactive landing page tested across mobile and desktop devices.',
    'Live Candidate Funnel with Video & Booking',
    'https://canva.link/lhzd8ucz53izrc3',
    'Phase 2: PREPARE (Week 4) · GROW Anchor: Way Forward: Bypassing the Static PDF Inbox Trap. Move beyond the static resume by deploying a dedicated mobile-first candidate landing page with a 60-second intro video, professional maritime photo grading, digital hygiene audit, and embedded calendar scheduling.'
  )
  ON CONFLICT (id) DO UPDATE SET
    programme_id = EXCLUDED.programme_id,
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    sort_order = EXCLUDED.sort_order,
    duration_mins = EXCLUDED.duration_mins,
    is_published = true,
    phase = EXCLUDED.phase,
    phase_code = EXCLUDED.phase_code,
    module_focus = EXCLUDED.module_focus,
    grow_anchor = EXCLUDED.grow_anchor,
    core_objective = EXCLUDED.core_objective,
    platform_tool = EXCLUDED.platform_tool,
    operational_lessons = EXCLUDED.operational_lessons,
    tech_deliverable = EXCLUDED.tech_deliverable,
    weekly_milestone = EXCLUDED.weekly_milestone,
    primary_output = EXCLUDED.primary_output,
    deck_url = EXCLUDED.deck_url,
    content = EXCLUDED.content,
    updated_at = now();

  -- Week 5: Launch Readiness Planner
  INSERT INTO public.lessons (
    id, programme_id, title, slug, lesson_type, sort_order, duration_mins, is_published,
    phase, phase_code, module_focus, grow_anchor, core_objective, platform_tool,
    operational_lessons, tech_deliverable, weekly_milestone, primary_output, deck_url, content
  )
  VALUES (
    v_les5_id,
    v_prog_group_id,
    'Week 5 — Launch Readiness Planner',
    'week-5-launch-readiness-planner',
    'practical'::public.lesson_type,
    5,
    50,
    true,
    'Phase 2: PREPARE (Weeks 3–5)',
    'prepare',
    'Launch Readiness Planner',
    'Obstacle Neutralization & Travel Strategy',
    'Organize housing, documentation, and packing logistics before boarding a flight to your launch hub.',
    'Document Vault & Hub Logistics',
    jsonb_build_array(
      jsonb_build_object(
        'title', '1. Crew House Operations & Marina Proximity',
        'points', jsonb_build_array(
          'Booking verified crew houses within walking distance of key ports (e.g., Antibes Old Town / Port Vauban, Palma Old Town / Paseo Marítimo, Harbordale / 17th St Causeway).',
          'Crew house etiquette, networking dynamics, and safeguarding mental focus from party culture.'
        )
      ),
      jsonb_build_object(
        'title', '2. Physical & Digital Document Vault',
        'points', jsonb_build_array(
          'Preparing watertight physical folders: original passport, ENG1, STCW, discharge books, reference letters, printed CV copies.',
          'Offline-ready, encrypted cloud storage backups accessible from any smartphone.'
        )
      ),
      jsonb_build_object(
        'title', '3. Seafarer Kit & Packing Essentials',
        'points', jsonb_build_array(
          'Dress codes: proper dockwalking attire, neutral-colored shorts/skorts, UV polos, non-marking boat shoes.',
          'Compact, soft-sided duffel luggage policies for small shared crew cabins.'
        )
      )
    ),
    'Complete Hub Deployment Vault containing verified certificate scans, travel bookings, and crew house reservations.',
    '100% deployment-ready sign-off: tickets booked, crew house confirmed, packing list audited.',
    'Deployment Vault, Crew House & Travel Set',
    'https://canva.link/wt86tyumbxaypb7',
    'Phase 2: PREPARE (Week 5) · GROW Anchor: Obstacle Neutralization & Travel Strategy. Organize verified crew house accommodation near key marinas, complete your physical & encrypted digital Document Vault, and audit your soft-sided seafarer kit and dockwalking attire before departure.'
  )
  ON CONFLICT (id) DO UPDATE SET
    programme_id = EXCLUDED.programme_id,
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    lesson_type = EXCLUDED.lesson_type,
    sort_order = EXCLUDED.sort_order,
    duration_mins = EXCLUDED.duration_mins,
    is_published = true,
    phase = EXCLUDED.phase,
    phase_code = EXCLUDED.phase_code,
    module_focus = EXCLUDED.module_focus,
    grow_anchor = EXCLUDED.grow_anchor,
    core_objective = EXCLUDED.core_objective,
    platform_tool = EXCLUDED.platform_tool,
    operational_lessons = EXCLUDED.operational_lessons,
    tech_deliverable = EXCLUDED.tech_deliverable,
    weekly_milestone = EXCLUDED.weekly_milestone,
    primary_output = EXCLUDED.primary_output,
    deck_url = EXCLUDED.deck_url,
    content = EXCLUDED.content,
    updated_at = now();

  -- Week 6: Job Search Strategist & Direct Vessel Outreach
  INSERT INTO public.lessons (
    id, programme_id, title, slug, lesson_type, sort_order, duration_mins, is_published,
    phase, phase_code, module_focus, grow_anchor, core_objective, platform_tool,
    operational_lessons, tech_deliverable, weekly_milestone, primary_output, deck_url, content
  )
  VALUES (
    v_les6_id,
    v_prog_group_id,
    'Week 6 — Job Search Strategist & Direct Vessel Outreach',
    'week-6-job-search-strategist-and-direct-vessel-outreach',
    'practical'::public.lesson_type,
    6,
    60,
    true,
    'Phase 3: EXECUTE (Weeks 6–8)',
    'execute',
    'Job Search Strategist',
    'Way Forward: Bypassing Agency Gatekeepers',
    'Launch a dual-track job search combining targeted agency submissions with direct-to-vessel AIS intelligence and CRM tracking.',
    'M/Y Eye + CRM Pipeline',
    jsonb_build_array(
      jsonb_build_object(
        'title', '1. The Modern Crew Agency Protocol',
        'points', jsonb_build_array(
          'High-priority registration with MLC-compliant placement agencies (The Crew Network, YPI Crew, Bluewater, Cotton Crews, Luxury Yacht Group, Northrop & Johnson).',
          'Checking in professionally with recruiters without spamming their communication channels.'
        )
      ),
      jsonb_build_object(
        'title', '2. Maritime Intelligence via M/Y Eye',
        'points', jsonb_build_array(
          'Tracking AIS vessel arrivals, shipyard refit turnarounds, and repositioning cycles into key marinas.',
          'Distinguishing between charter vessels (high turnover, sudden requirements) and private programs.'
        )
      ),
      jsonb_build_object(
        'title', '3. Dockwalking & CRM Opportunity Management',
        'points', jsonb_build_array(
          'The 07:30–09:00 dockwalking protocol: passing security checkpoints, approaching passerelles, identifying hiring decision-makers.',
          'Logging contacts, HOD names, and follow-up reminders inside the GYCS CRM Opportunity Pipeline.'
        )
      )
    ),
    'Active access to M/Y Eye Maritime Intelligence and a pre-populated CRM Opportunity Pipeline.',
    '10+ agency registrations submitted; 20+ target vessels cataloged in your CRM with follow-up triggers set.',
    'Live Agency Matrix & AIS Port Target Log',
    NULL,
    'Phase 3: EXECUTE (Week 6) · GROW Anchor: Way Forward: Bypassing Agency Gatekeepers. Launch a dual-track job search combining MLC-compliant agency registrations (YPI, Bluewater, TCN, Cotton Crews, LYG, N&J) with M/Y Eye AIS vessel tracking, 07:30–09:00 dockwalking protocols, and CRM Opportunity Pipeline logging.'
  )
  ON CONFLICT (id) DO UPDATE SET
    programme_id = EXCLUDED.programme_id,
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    lesson_type = EXCLUDED.lesson_type,
    sort_order = EXCLUDED.sort_order,
    duration_mins = EXCLUDED.duration_mins,
    is_published = true,
    phase = EXCLUDED.phase,
    phase_code = EXCLUDED.phase_code,
    module_focus = EXCLUDED.module_focus,
    grow_anchor = EXCLUDED.grow_anchor,
    core_objective = EXCLUDED.core_objective,
    platform_tool = EXCLUDED.platform_tool,
    operational_lessons = EXCLUDED.operational_lessons,
    tech_deliverable = EXCLUDED.tech_deliverable,
    weekly_milestone = EXCLUDED.weekly_milestone,
    primary_output = EXCLUDED.primary_output,
    deck_url = EXCLUDED.deck_url,
    content = EXCLUDED.content,
    updated_at = now();

  -- Week 7: Interview Confidence Lab
  INSERT INTO public.lessons (
    id, programme_id, title, slug, lesson_type, sort_order, duration_mins, is_published,
    phase, phase_code, module_focus, grow_anchor, core_objective, platform_tool,
    operational_lessons, tech_deliverable, weekly_milestone, primary_output, deck_url, content
  )
  VALUES (
    v_les7_id,
    v_prog_group_id,
    'Week 7 — Interview Confidence Lab',
    'week-7-interview-confidence-lab',
    'live'::public.lesson_type,
    7,
    60,
    true,
    'Phase 3: EXECUTE (Weeks 6–8)',
    'execute',
    'Interview Confidence Lab',
    'Way Forward: Interview Conversion & Value Demonstration',
    'Prepare for high-pressure screening calls and in-person passerelle interviews through roleplay and live feedback.',
    'Interview Simulator',
    jsonb_build_array(
      jsonb_build_object(
        'title', '1. Captains & Chief Stews Screening Scenarios',
        'points', jsonb_build_array(
          'Preparing for standard superyacht interview questions: handling isolation, taking direction from younger officers, and managing shared cabin lifestyle.',
          'Handling common sensitive topics: tattoos, relationship status, dietary needs, and previous land-based salaries.'
        )
      ),
      jsonb_build_object(
        'title', '2. Passerelle & Daywork Conversions',
        'points', jsonb_build_array(
          'How to approach a boat looking for daywork and convert a one-day chamois-down or laundry shift into a permanent trial.',
          'Asking smart operational questions about vessel itineraries, program longevity, and team culture without focusing solely on leave packages.'
        )
      ),
      jsonb_build_object(
        'title', '3. Live Mock Interview Sessions',
        'points', jsonb_build_array(
          '1-on-1 coach simulation with real-time feedback on delivery, body language, and response frameworks.'
        )
      )
    ),
    'Access to the GYCS Interview Simulator Library & personalized recorded mock interview debrief.',
    'Passing score in the live GYCS Passerelle & Video Interview Evaluation.',
    'Mock Captain/Chief Stew Interview Passed',
    NULL,
    'Phase 3: EXECUTE (Week 7) · GROW Anchor: Way Forward: Interview Conversion & Value Demonstration. Master Captain and Chief Stewardess screening scenarios, passerelle daywork-to-permanent conversions, and live 1-on-1 mock interview simulations with Coach Chad de Wet.'
  )
  ON CONFLICT (id) DO UPDATE SET
    programme_id = EXCLUDED.programme_id,
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    lesson_type = EXCLUDED.lesson_type,
    sort_order = EXCLUDED.sort_order,
    duration_mins = EXCLUDED.duration_mins,
    is_published = true,
    phase = EXCLUDED.phase,
    phase_code = EXCLUDED.phase_code,
    module_focus = EXCLUDED.module_focus,
    grow_anchor = EXCLUDED.grow_anchor,
    core_objective = EXCLUDED.core_objective,
    platform_tool = EXCLUDED.platform_tool,
    operational_lessons = EXCLUDED.operational_lessons,
    tech_deliverable = EXCLUDED.tech_deliverable,
    weekly_milestone = EXCLUDED.weekly_milestone,
    primary_output = EXCLUDED.primary_output,
    deck_url = EXCLUDED.deck_url,
    content = EXCLUDED.content,
    updated_at = now();

  -- Week 8: Career Action Blueprint & Daywork Deployment
  INSERT INTO public.lessons (
    id, programme_id, title, slug, lesson_type, sort_order, duration_mins, is_published,
    phase, phase_code, module_focus, grow_anchor, core_objective, platform_tool,
    operational_lessons, tech_deliverable, weekly_milestone, primary_output, deck_url, content
  )
  VALUES (
    v_les8_id,
    v_prog_group_id,
    'Week 8 — Career Action Blueprint & Daywork Deployment',
    'week-8-career-action-blueprint-and-daywork-deployment',
    'practical'::public.lesson_type,
    8,
    60,
    true,
    'Phase 3: EXECUTE (Weeks 6–8)',
    'execute',
    'Career Action Blueprint',
    'Execution & Sustained Performance',
    'Lock in a rolling 30-day daywork plan, manage initial offers, and build an onboard playbook for your first 90 days.',
    '30-Day Sprint Scheduler',
    jsonb_build_array(
      jsonb_build_object(
        'title', '1. Contract Review & Sea Employment Agreements (SEA)',
        'points', jsonb_build_array(
          'Deciphering standard MLC-compliant contracts: basic pay, paid leave allocations (e.g., 38 to 60+ days/year), healthcare coverage, flights, and probationary clauses.',
          'Red flags: unflagged vessels, missing medical coverage, and vague salary/leave terms.'
        )
      ),
      jsonb_build_object(
        'title', '2. The "First 90 Days Onboard" Playbook',
        'points', jsonb_build_array(
          'Integrating smoothly into the crew mess: hierarchy, off-duty behavior, and watchstanding etiquette.',
          'Maintaining daily task lists, logbooks, and sea-time documentation for your next career step.'
        )
      ),
      jsonb_build_object(
        'title', '3. Rolling 30-Day Execution Sprints',
        'points', jsonb_build_array(
          'Sustaining dockwalking schedules, agency check-ins, and direct reach-outs during quiet weeks.',
          'Managing the Schengen clock or US visa validity if initial placement takes 3–4 weeks.'
        )
      )
    ),
    'Final Rolling 30-Day Launchpad Calendar & First 90 Days Sea-Survival Guide.',
    'Complete operational deployment readiness sign-off across systems, CV assets, funnels, and dockside execution strategy.',
    'Signed SEA Contract / Active Daywork Deployment',
    NULL,
    'Phase 3: EXECUTE (Week 8) · GROW Anchor: Execution & Sustained Performance. Decipher MLC-compliant Seafarer Employment Agreements (SEA), execute your Rolling 30-Day Launchpad Calendar, and lock in your First 90 Days Onboard playbook and sea-time documentation.'
  )
  ON CONFLICT (id) DO UPDATE SET
    programme_id = EXCLUDED.programme_id,
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    lesson_type = EXCLUDED.lesson_type,
    sort_order = EXCLUDED.sort_order,
    duration_mins = EXCLUDED.duration_mins,
    is_published = true,
    phase = EXCLUDED.phase,
    phase_code = EXCLUDED.phase_code,
    module_focus = EXCLUDED.module_focus,
    grow_anchor = EXCLUDED.grow_anchor,
    core_objective = EXCLUDED.core_objective,
    platform_tool = EXCLUDED.platform_tool,
    operational_lessons = EXCLUDED.operational_lessons,
    tech_deliverable = EXCLUDED.tech_deliverable,
    weekly_milestone = EXCLUDED.weekly_milestone,
    primary_output = EXCLUDED.primary_output,
    deck_url = EXCLUDED.deck_url,
    content = EXCLUDED.content,
    updated_at = now();

  -- 5. Upsert all 8 Weekly Assignments in public.assignments
  INSERT INTO public.assignments (id, lesson_id, title, instructions, due_offset_days, submission_type, max_score)
  VALUES
    (
      '7ad571f8-2017-4116-be44-9ddd8814cb2e',
      v_les1_id,
      'Week 1 Deliverable: Baseline Constraints & Financial Runway Audit',
      'Complete your GYCS Baseline Constraints & Financial Runway Calculator (ENG1 medical eligibility, Schengen 90/180 or B1/B2 visa status, and monthly crew house runway for Antibes, Palma, or Fort Lauderdale) and submit your verified eligibility summary.',
      7,
      'text',
      100
    ),
    (
      '78261104-27f0-4d74-9907-8fb3046fbe1a',
      v_les2_id,
      'Week 2 Deliverable: Target Department Blueprint & Training Cost-Audit',
      'Submit your target vessel department (Deck, Interior, Engineering, or Galley), mandatory STCW 2010 & PDSD school verification, functional additions (PB2/SRC/Food Safety L2/AEC), and target launch port selection.',
      14,
      'text',
      100
    ),
    (
      'fa46191d-6205-47c0-8c24-a62df6732b1c',
      v_les3_id,
      'Week 3 Deliverable: 2-Page Maritime Master CV (<250KB) in CV Studio',
      'Finalize your 2-page maritime-compliant Master CV in CV Studio translating land-based experience into superyacht SOP language, and submit your CV Studio summary or review notes for HOD readiness sign-off.',
      21,
      'text',
      100
    ),
    (
      '0c48b564-10c8-4930-8e74-f45e56fd1dbe',
      v_les4_id,
      'Week 4 Deliverable: Candidate Landing Page & Scheduling Funnel',
      'Share the link or readiness checklist for your mobile-first Candidate Landing Page, 60-second intro video script/link, social media security audit, and embedded calendar booking funnel.',
      28,
      'text',
      100
    ),
    (
      '55220005-8888-4000-b005-000000000005',
      v_les5_id,
      'Week 5 Deliverable: Hub Deployment Vault & Crew House Logistics',
      'Confirm your uploaded Document Vault records (Passport, ENG1, STCW, PDSD, References), verified crew house reservation near port, and soft-sided seafarer kit audit.',
      35,
      'text',
      100
    ),
    (
      '66220006-8888-4000-b006-000000000006',
      v_les6_id,
      'Week 6 Deliverable: Live Agency Matrix & M/Y Eye AIS Port Target Log',
      'Submit your list of 10+ MLC-compliant agency registrations and 20+ target vessels logged in your CRM Opportunity Pipeline using M/Y Eye AIS port intelligence.',
      42,
      'text',
      100
    ),
    (
      '77220007-8888-4000-b007-000000000007',
      v_les7_id,
      'Week 7 Deliverable: Passerelle & Captain/Chief Stew Mock Interview Debrief',
      'Submit your response frameworks for Captain/Chief Stew screening questions, daywork-to-permanent trial conversion pitch, and mock interview self-assessment.',
      49,
      'text',
      100
    ),
    (
      '88220008-8888-4000-b008-000000000008',
      v_les8_id,
      'Week 8 Deliverable: Rolling 30-Day Launchpad Calendar & First 90 Days Playbook',
      'Submit your Rolling 30-Day Dockwalking & Outreach Sprint Schedule, MLC Seafarer Employment Agreement (SEA) review checklist, and First 90 Days Onboard survival plan.',
      56,
      'text',
      100
    )
  ON CONFLICT (id) DO UPDATE SET
    lesson_id = EXCLUDED.lesson_id,
    title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    due_offset_days = EXCLUDED.due_offset_days,
    submission_type = EXCLUDED.submission_type,
    max_score = EXCLUDED.max_score;

  -- 6. Enrich existing Demo Deckhand pathway milestones (Weeks 1–5 metadata + add Weeks 6–8 milestones if not present)
  SELECT id INTO v_req_eng1 FROM public.requirements WHERE code = 'SEAFARER_MEDICAL_ENG1' LIMIT 1;
  SELECT id INTO v_req_stcw FROM public.requirements WHERE code = 'STCW_BASIC_SAFETY' LIMIT 1;
  SELECT id INTO v_req_pb2 FROM public.requirements WHERE code = 'RYA_POWERBOAT_LEVEL_2' LIMIT 1;
  SELECT id INTO v_req_sea FROM public.requirements WHERE code = 'MLC_SEA_CONTRACT' LIMIT 1;

  IF EXISTS (SELECT 1 FROM public.pathway_versions WHERE id = v_deckhand_pathway_id) THEN
    UPDATE public.pathway_versions
    SET summary = '8-Week Superyacht Career Launchpad (Deckhand Pathway): Phase 1 KNOW (Weeks 1–2: Baseline Reality Check & Route/Training Navigator) → Phase 2 PREPARE (Weeks 3–5: CV Studio 2-Page Master CV, Candidate Conversion Funnel & Launch Readiness Vault) → Phase 3 EXECUTE (Weeks 6–8: M/Y Eye AIS Outreach, Interview Confidence Lab & 30-Day Action Blueprint).'
    WHERE id = v_deckhand_pathway_id;

    UPDATE public.milestones SET
      requirement_id = v_req_eng1,
      phase = 'Phase 1: KNOW',
      grow_anchor = 'Reality & Goal Calibration',
      platform_tool = 'Crew Hub Constraints Engine',
      primary_output = 'Eligibility & Runway Audit Passed'
    WHERE pathway_id = v_deckhand_pathway_id AND sort_order = 1;

    UPDATE public.milestones SET
      requirement_id = v_req_stcw,
      phase = 'Phase 1: KNOW',
      grow_anchor = 'Goal Precision & Obstacle Elimination',
      platform_tool = 'Department Route Selector',
      primary_output = 'Target Role & Certified Training Plan'
    WHERE pathway_id = v_deckhand_pathway_id AND sort_order = 2;

    UPDATE public.milestones SET
      requirement_id = v_req_pb2,
      phase = 'Phase 2: PREPARE',
      grow_anchor = 'Way Forward: Reframing Non-Yachting Pedigree',
      platform_tool = 'CV Studio',
      primary_output = 'Two-Page Compliant Maritime CV (<250KB)'
    WHERE pathway_id = v_deckhand_pathway_id AND sort_order = 3;

    UPDATE public.milestones SET
      phase = 'Phase 2: PREPARE',
      grow_anchor = 'Way Forward: Bypassing the Static PDF Inbox Trap',
      platform_tool = 'Candidate Landing Page Builder',
      primary_output = 'Live Candidate Funnel with Video & Booking'
    WHERE pathway_id = v_deckhand_pathway_id AND sort_order = 4;

    UPDATE public.milestones SET
      phase = 'Phase 2: PREPARE',
      grow_anchor = 'Obstacle Neutralization & Travel Strategy',
      platform_tool = 'Document Vault & Hub Logistics',
      primary_output = 'Deployment Vault, Crew House & Travel Set'
    WHERE pathway_id = v_deckhand_pathway_id AND sort_order = 5;

    IF NOT EXISTS (SELECT 1 FROM public.milestones WHERE pathway_id = v_deckhand_pathway_id AND sort_order = 6) THEN
      INSERT INTO public.milestones (pathway_id, title, description, sort_order, evidence_required, status, phase, grow_anchor, platform_tool, primary_output)
      VALUES (
        v_deckhand_pathway_id,
        '6. Week 6: Job Search Strategist & Direct Vessel Outreach (M/Y Eye)',
        'Submit 10+ MLC-compliant crew agency registrations and catalog 20+ target vessels in your CRM Opportunity Pipeline using M/Y Eye AIS port intelligence.',
        6,
        'Live Agency Matrix & AIS Port Target Log',
        'pending',
        'Phase 3: EXECUTE',
        'Way Forward: Bypassing Agency Gatekeepers',
        'M/Y Eye + CRM Pipeline',
        'Live Agency Matrix & AIS Port Target Log'
      );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.milestones WHERE pathway_id = v_deckhand_pathway_id AND sort_order = 7) THEN
      INSERT INTO public.milestones (pathway_id, title, description, sort_order, evidence_required, status, phase, grow_anchor, platform_tool, primary_output)
      VALUES (
        v_deckhand_pathway_id,
        '7. Week 7: Interview Confidence Lab & Passerelle Conversion',
        'Complete Captain & Chief Officer screening scenarios, daywork-to-permanent conversion pitch, and 1-on-1 live mock interview simulation.',
        7,
        'Passing score in GYCS Passerelle & Video Interview Evaluation',
        'pending',
        'Phase 3: EXECUTE',
        'Way Forward: Interview Conversion & Value Demonstration',
        'Interview Simulator',
        'Mock Captain/Chief Stew Interview Passed'
      );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.milestones WHERE pathway_id = v_deckhand_pathway_id AND sort_order = 8) THEN
      INSERT INTO public.milestones (pathway_id, requirement_id, title, description, sort_order, evidence_required, status, phase, grow_anchor, platform_tool, primary_output)
      VALUES (
        v_deckhand_pathway_id,
        v_req_sea,
        '8. Week 8: Career Action Blueprint & Daywork Deployment',
        'Audit MLC-compliant Seafarer Employment Agreements (SEA), execute your Rolling 30-Day Launchpad Calendar, and lock in your First 90 Days Onboard playbook.',
        8,
        'Signed SEA Contract / Active Daywork Deployment Plan',
        'pending',
        'Phase 3: EXECUTE',
        'Execution & Sustained Performance',
        '30-Day Sprint Scheduler',
        'Signed SEA Contract / Active Daywork Deployment'
      );
    END IF;
  END IF;
END;
$$;

-- 7. Caller-scoped RPCs for Milestone Progress & Assignment Submission (Web & Android parity)
CREATE OR REPLACE FUNCTION public.gycs_update_milestone_status(
  p_milestone_id uuid,
  p_status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_actor public.profiles%ROWTYPE;
  v_milestone public.milestones%ROWTYPE;
  v_pathway public.pathway_versions%ROWTYPE;
  v_safe_status text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_actor FROM public.profiles WHERE id = v_uid;
  IF NOT FOUND OR NOT v_actor.is_active THEN
    RAISE EXCEPTION 'Active profile required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_milestone FROM public.milestones WHERE id = p_milestone_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Milestone not found';
  END IF;

  SELECT * INTO v_pathway FROM public.pathway_versions WHERE id = v_milestone.pathway_id;
  IF NOT FOUND OR NOT public.gycs_can_access_member(v_pathway.user_id) THEN
    RAISE EXCEPTION 'Access denied for this pathway milestone' USING ERRCODE = '42501';
  END IF;

  IF p_status NOT IN ('pending', 'in_progress', 'submitted', 'approved', 'deferred', 'not_applicable') THEN
    RAISE EXCEPTION 'Invalid milestone status: %', p_status;
  END IF;

  -- Only staff (coach, admin, superadmin) can mark 'approved'; member attempts become 'submitted'
  IF p_status = 'approved' AND NOT public.is_staff_role(v_actor.role) THEN
    v_safe_status := 'submitted';
  ELSE
    v_safe_status := p_status;
  END IF;

  UPDATE public.milestones
  SET
    status = v_safe_status,
    approved_by = CASE WHEN v_safe_status = 'approved' THEN v_uid ELSE approved_by END,
    approved_at = CASE WHEN v_safe_status = 'approved' THEN now() ELSE approved_at END,
    updated_at = now()
  WHERE id = p_milestone_id
  RETURNING * INTO v_milestone;

  RETURN to_jsonb(v_milestone);
END;
$$;

CREATE OR REPLACE FUNCTION public.gycs_submit_lesson_assignment(
  p_lesson_id uuid,
  p_content text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_actor public.profiles%ROWTYPE;
  v_assign public.assignments%ROWTYPE;
  v_cohort_id uuid;
  v_prog_slug text;
  v_sub public.assignment_submissions%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF length(btrim(coalesce(p_content, ''))) < 3 THEN
    RAISE EXCEPTION 'Please enter your assignment response before submitting.';
  END IF;

  SELECT * INTO v_actor FROM public.profiles WHERE id = v_uid;
  IF NOT FOUND OR NOT v_actor.is_active THEN
    RAISE EXCEPTION 'Active profile required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_assign FROM public.assignments WHERE lesson_id = p_lesson_id ORDER BY created_at ASC LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No assignment found for this lesson module.';
  END IF;

  SELECT cm.cohort_id INTO v_cohort_id
  FROM public.cohort_members cm
  WHERE cm.user_id = v_uid AND cm.status = 'active'
  ORDER BY cm.enrolled_at DESC
  LIMIT 1;

  IF v_cohort_id IS NULL THEN
    v_prog_slug := CASE WHEN v_actor.coaching_programme = 'one_on_one' THEN 'single-1on1-coaching' ELSE 'group-coaching-program' END;
    SELECT c.id INTO v_cohort_id
    FROM public.cohorts c
    JOIN public.programmes p ON p.id = c.programme_id
    WHERE p.slug = v_prog_slug AND c.is_active = true
    ORDER BY c.created_at ASC
    LIMIT 1;

    IF v_cohort_id IS NULL THEN
      SELECT id INTO v_cohort_id FROM public.cohorts WHERE is_active = true ORDER BY created_at ASC LIMIT 1;
    END IF;
  END IF;

  SELECT * INTO v_sub
  FROM public.assignment_submissions
  WHERE assignment_id = v_assign.id AND user_id = v_uid
  ORDER BY submitted_at DESC
  LIMIT 1;

  IF FOUND THEN
    UPDATE public.assignment_submissions
    SET
      content = btrim(p_content),
      status = 'submitted',
      submitted_at = now()
    WHERE id = v_sub.id AND user_id = v_uid
    RETURNING * INTO v_sub;
  ELSE
    INSERT INTO public.assignment_submissions (
      assignment_id, user_id, cohort_id, content, status, submitted_at
    )
    VALUES (
      v_assign.id, v_uid, v_cohort_id, btrim(p_content), 'submitted', now()
    )
    RETURNING * INTO v_sub;
  END IF;

  RETURN to_jsonb(v_sub);
END;
$$;

REVOKE ALL ON FUNCTION public.gycs_update_milestone_status(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.gycs_submit_lesson_assignment(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gycs_update_milestone_status(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gycs_submit_lesson_assignment(uuid, text) TO authenticated;
