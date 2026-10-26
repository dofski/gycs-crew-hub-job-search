-- ============================================================================
-- Migration: User Roles Matched to Pathway Selection, Superadmin & Demo Deckhand,
--            and Single 1-on-1 + Group Coaching Programmes
-- ============================================================================

-- 1. Expand public.user_role enum with superadmin and pathway-matched crew roles
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'superadmin';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'deckhand';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'steward';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'engineer';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'chef';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'school_leaver';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'career_changer';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'aspirant';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'junior_crew';

-- 2. Add pathway_selection and coaching_programme columns to public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pathway_selection text,
  ADD COLUMN IF NOT EXISTS coaching_programme text DEFAULT 'group'
    CHECK (coaching_programme IS NULL OR coaching_programme IN ('one_on_one', 'group'));

-- 3. Add programme_type to public.programmes ('one_on_one' vs 'group')
ALTER TABLE public.programmes
  ADD COLUMN IF NOT EXISTS programme_type text NOT NULL DEFAULT 'group'
    CHECK (programme_type IN ('one_on_one', 'group'));

-- 4. Role classification & pathway-to-role helper functions
CREATE OR REPLACE FUNCTION public.is_staff_role(p_role public.user_role)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path TO ''
AS $$
  SELECT p_role::text IN ('superadmin', 'admin', 'coach');
$$;

CREATE OR REPLACE FUNCTION public.is_admin_role(p_role public.user_role)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path TO ''
AS $$
  SELECT p_role::text IN ('superadmin', 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_crew_role(p_role public.user_role)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path TO ''
AS $$
  SELECT p_role IS NOT NULL AND p_role::text NOT IN ('superadmin', 'admin', 'coach');
$$;

CREATE OR REPLACE FUNCTION public.pathway_to_user_role(
  p_department text,
  p_pathway text DEFAULT NULL
)
RETURNS public.user_role
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO ''
AS $$
DECLARE
  v_dept text := lower(btrim(coalesce(p_department, '')));
  v_path text := lower(btrim(coalesce(p_pathway, '')));
BEGIN
  IF v_dept = 'deck' OR v_path IN ('deck', 'deckhand') THEN
    RETURN 'deckhand'::public.user_role;
  ELSIF v_dept = 'interior' OR v_path IN ('interior', 'steward', 'stewardess') THEN
    RETURN 'steward'::public.user_role;
  ELSIF v_dept = 'engineering' OR v_path IN ('engineering', 'engineer') THEN
    RETURN 'engineer'::public.user_role;
  ELSIF v_dept = 'galley' OR v_path IN ('galley', 'chef') THEN
    RETURN 'chef'::public.user_role;
  ELSIF v_path IN ('school_leaver', 'school-leaver') THEN
    RETURN 'school_leaver'::public.user_role;
  ELSIF v_path IN ('career_changer', 'career-changer') THEN
    RETURN 'career_changer'::public.user_role;
  ELSIF v_path = 'aspirant' THEN
    RETURN 'aspirant'::public.user_role;
  ELSIF v_path IN ('junior_crew', 'junior-crew') THEN
    RETURN 'junior_crew'::public.user_role;
  ELSE
    RETURN 'member'::public.user_role;
  END IF;
END;
$$;

-- 5. Update core access and workflow functions to support superadmin & pathway crew roles
CREATE OR REPLACE FUNCTION public.is_coach_of(member_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles actor
    WHERE actor.id = auth.uid() AND actor.is_active AND actor.role::text = 'superadmin'
  ) OR EXISTS (
    SELECT 1 FROM public.coach_assignments ca
    JOIN public.profiles coach ON coach.id = ca.coach_id
    JOIN public.profiles member ON member.id = ca.member_id
    WHERE ca.coach_id = auth.uid() AND ca.member_id = member_uuid
      AND ca.ended_at IS NULL
      AND coach.role::text IN ('coach', 'admin', 'superadmin')
      AND coach.is_active AND member.is_active
      AND (coach.role::text = 'superadmin' OR (coach.organisation_id IS NOT NULL AND coach.organisation_id = member.organisation_id))
  );
$$;

CREATE OR REPLACE FUNCTION public.gycs_can_access_member(member_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles actor
    JOIN public.profiles target ON target.id = member_uuid
    WHERE actor.id = auth.uid() AND actor.is_active
      AND (
        actor.id = target.id
        OR actor.role::text = 'superadmin'
        OR (
          actor.organisation_id IS NOT NULL
          AND actor.organisation_id = target.organisation_id
          AND (
            actor.role::text = 'admin'
            OR (actor.role::text = 'coach' AND public.is_coach_of(target.id))
          )
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.gycs_can_read_cohort(cohort_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles actor
    JOIN public.cohorts c ON c.id = cohort_uuid
    LEFT JOIN public.profiles coach ON coach.id = c.coach_id
    WHERE actor.id = auth.uid() AND actor.is_active
      AND (
        actor.role::text = 'superadmin'
        OR c.coach_id = actor.id
        OR EXISTS (
          SELECT 1 FROM public.cohort_members cm
          WHERE cm.cohort_id = c.id AND cm.user_id = actor.id AND cm.status = 'active'
        )
        OR (
          actor.role::text = 'admin'
          AND actor.organisation_id IS NOT NULL
          AND actor.organisation_id = coach.organisation_id
        )
      )
  );
$$;

-- 6. RPC for members to sync their pathway-matched role and coaching programme
CREATE OR REPLACE FUNCTION public.gycs_sync_member_pathway_role(
  p_department text,
  p_pathway_selection text DEFAULT NULL,
  p_coaching_programme text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_actor public.profiles%ROWTYPE;
  v_next_role public.user_role;
  v_prog text := CASE
    WHEN p_coaching_programme IN ('one_on_one', 'group') THEN p_coaching_programme
    ELSE NULL
  END;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_actor FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND OR NOT v_actor.is_active THEN
    RAISE EXCEPTION 'Active profile required' USING ERRCODE = '42501';
  END IF;

  v_next_role := CASE
    WHEN public.is_staff_role(v_actor.role) THEN v_actor.role
    ELSE public.pathway_to_user_role(p_department, p_pathway_selection)
  END;

  UPDATE public.profiles
  SET
    role = v_next_role,
    pathway_selection = COALESCE(NULLIF(btrim(p_pathway_selection), ''), v_next_role::text),
    coaching_programme = COALESCE(v_prog, coaching_programme, 'group'),
    updated_at = now()
  WHERE id = v_uid
  RETURNING * INTO v_actor;

  RETURN jsonb_build_object(
    'id', v_actor.id,
    'role', v_actor.role,
    'pathway_selection', v_actor.pathway_selection,
    'coaching_programme', v_actor.coaching_programme
  );
END;
$$;

-- 7. RPC for superadmin / admin to manage user roles and coaching programme assignments
CREATE OR REPLACE FUNCTION public.gycs_admin_set_user_role_and_programme(
  p_target_user_id uuid,
  p_role text,
  p_coaching_programme text DEFAULT 'group'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_actor public.profiles%ROWTYPE;
  v_target public.profiles%ROWTYPE;
  v_role public.user_role;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_actor FROM public.profiles WHERE id = auth.uid();
  IF NOT FOUND OR NOT v_actor.is_active OR v_actor.role::text NOT IN ('superadmin', 'admin') THEN
    RAISE EXCEPTION 'Superadmin or administrator access required' USING ERRCODE = '42501';
  END IF;

  IF p_role = 'superadmin' AND v_actor.role::text <> 'superadmin' THEN
    RAISE EXCEPTION 'Only a superadmin can assign the superadmin role' USING ERRCODE = '42501';
  END IF;

  v_role := p_role::public.user_role;

  UPDATE public.profiles
  SET
    role = v_role,
    pathway_selection = CASE WHEN public.is_crew_role(v_role) THEN v_role::text ELSE pathway_selection END,
    coaching_programme = CASE WHEN p_coaching_programme IN ('one_on_one', 'group') THEN p_coaching_programme ELSE coaching_programme END,
    updated_at = now()
  WHERE id = p_target_user_id
  RETURNING * INTO v_target;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user not found';
  END IF;

  RETURN jsonb_build_object(
    'id', v_target.id,
    'email', v_target.email,
    'role', v_target.role,
    'pathway_selection', v_target.pathway_selection,
    'coaching_programme', v_target.coaching_programme
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.gycs_sync_member_pathway_role(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gycs_admin_set_user_role_and_programme(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff_role(public.user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_role(public.user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_crew_role(public.user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pathway_to_user_role(text, text) TO authenticated;

-- 8. Update gycs_save_onboarding so any crew role can save/submit intake and auto-sync role to pathway
CREATE OR REPLACE FUNCTION public.gycs_save_onboarding(
  p_payload jsonb,
  p_step integer DEFAULT 0,
  p_submit boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  uid uuid := auth.uid();
  actor public.profiles%ROWTYPE;
  intake public.onboarding_intakes%ROWTYPE;
  assessment uuid;
  stamp timestamptz := now();
  marketing boolean;
  v_matched_role public.user_role;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Sign in to continue' USING ERRCODE = '42501'; END IF;
  SELECT * INTO actor FROM public.profiles WHERE id = uid FOR UPDATE;
  IF NOT FOUND OR NOT actor.is_active OR NOT public.is_crew_role(actor.role) THEN
    RAISE EXCEPTION 'Active member account required' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = uid AND email_confirmed_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Verify your email before saving intake';
  END IF;
  SELECT * INTO intake FROM public.onboarding_intakes WHERE user_id = uid;
  IF FOUND AND intake.status = 'submitted' THEN RETURN to_jsonb(intake); END IF;
  IF p_payload IS NULL OR jsonb_typeof(p_payload) <> 'object' OR octet_length(p_payload::text) > 20000 OR p_step IS NULL OR p_step NOT BETWEEN 0 AND 4 OR p_submit IS NULL THEN
    RAISE EXCEPTION 'Invalid intake payload';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_each(p_payload) AS item
    WHERE item.key NOT IN ('display_name','country_code','timezone','phone','experience_level','department','goals','skills','availability','training_status','readiness','budget_band','participation','privacy_acknowledged','marketing_email')
      OR (item.key IN ('participation','privacy_acknowledged','marketing_email') AND jsonb_typeof(item.value) <> 'boolean')
      OR (item.key NOT IN ('participation','privacy_acknowledged','marketing_email') AND (jsonb_typeof(item.value) <> 'string' OR length(item.value #>> '{}') > 4000))
  ) THEN
    RAISE EXCEPTION 'Unsupported intake fields';
  END IF;

  v_matched_role := public.pathway_to_user_role(p_payload->>'department', p_payload->>'experience_level');

  IF p_submit THEN
    IF length(btrim(coalesce(p_payload->>'display_name',''))) NOT BETWEEN 1 AND 120 OR coalesce(p_payload->>'country_code','') !~ '^[A-Z]{2}$' OR NOT EXISTS (SELECT 1 FROM pg_catalog.pg_timezone_names WHERE name = p_payload->>'timezone') OR length(coalesce(p_payload->>'phone','')) > 40 THEN
      RAISE EXCEPTION 'Check your name, country, timezone and phone';
    END IF;
    IF coalesce(p_payload->>'experience_level','') NOT IN ('beginner','career_changer','experienced') OR coalesce(p_payload->>'department','') NOT IN ('deck','interior','engineering','galley','undecided') OR length(btrim(coalesce(p_payload->>'goals',''))) < 10 OR length(btrim(coalesce(p_payload->>'availability',''))) = 0 OR length(btrim(coalesce(p_payload->>'training_status',''))) = 0 THEN
      RAISE EXCEPTION 'Complete your career goals and readiness';
    END IF;
    IF p_payload->'participation' IS DISTINCT FROM 'true'::jsonb OR p_payload->'privacy_acknowledged' IS DISTINCT FROM 'true'::jsonb THEN
      RAISE EXCEPTION 'Please acknowledge the intake notice and request a programme review';
    END IF;
    marketing := coalesce((p_payload->>'marketing_email')::boolean,false);
    INSERT INTO public.assessments (user_id,status,motivation,department_fit,existing_experience,availability,documents_status,resources_runway,expectations)
    VALUES (
      uid,
      'completed',
      jsonb_build_object('text',p_payload->>'goals','source','gycs_onboarding_v1'),
      CASE WHEN p_payload->>'department' = 'undecided' THEN NULL ELSE (p_payload->>'department')::public.department END,
      jsonb_build_object('level',p_payload->>'experience_level','skills',p_payload->>'skills'),
      jsonb_build_object('text',p_payload->>'availability'),
      jsonb_build_object('training',p_payload->>'training_status','readiness',p_payload->>'readiness'),
      jsonb_build_object('budget_band',p_payload->>'budget_band'),
      jsonb_build_object('programme_acceptance','pending_review')
    )
    RETURNING id INTO assessment;

    UPDATE public.profiles
    SET
      display_name = btrim(p_payload->>'display_name'),
      country_code = p_payload->>'country_code',
      timezone = p_payload->>'timezone',
      phone = nullif(btrim(p_payload->>'phone'),''),
      role = v_matched_role,
      pathway_selection = v_matched_role::text,
      onboarded_at = coalesce(onboarded_at,stamp),
      updated_at = stamp
    WHERE id = uid;

    INSERT INTO public.consent_records (user_id,consent_type,status,granted_at,withdrawn_at)
    VALUES
      (uid,'programme_participation','granted',stamp,NULL),
      (uid,'marketing_email',CASE WHEN marketing THEN 'granted'::public.consent_status ELSE 'withdrawn'::public.consent_status END,CASE WHEN marketing THEN stamp ELSE NULL END,CASE WHEN marketing THEN NULL ELSE stamp END);
  ELSE
    UPDATE public.profiles
    SET
      role = v_matched_role,
      pathway_selection = v_matched_role::text,
      updated_at = stamp
    WHERE id = uid;
  END IF;

  INSERT INTO public.onboarding_intakes (user_id,payload,step,status,assessment_id,updated_at,submitted_at)
  VALUES (uid,p_payload,CASE WHEN p_submit THEN 4 ELSE p_step END,CASE WHEN p_submit THEN 'submitted' ELSE 'draft' END,assessment,stamp,CASE WHEN p_submit THEN stamp ELSE NULL END)
  ON CONFLICT (user_id) DO UPDATE SET
    payload=EXCLUDED.payload,
    step=EXCLUDED.step,
    status=EXCLUDED.status,
    assessment_id=EXCLUDED.assessment_id,
    updated_at=EXCLUDED.updated_at,
    submitted_at=EXCLUDED.submitted_at
  RETURNING * INTO intake;

  RETURN to_jsonb(intake);
END;
$$;

-- 9. Update RLS policies so superadmin and pathway crew roles work seamlessly
DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
CREATE POLICY profiles_select_admin ON public.profiles
  FOR SELECT USING (public.current_user_role()::text IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS audit_select_admin ON public.audit_events;
CREATE POLICY audit_select_admin ON public.audit_events
  FOR SELECT USING (public.current_user_role()::text IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS flags_manage ON public.feature_flags;
CREATE POLICY flags_manage ON public.feature_flags
  FOR ALL USING (public.current_user_role()::text IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS ai_proposal_insert ON public.ai_pathway_proposals;
CREATE POLICY ai_proposal_insert ON public.ai_pathway_proposals
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND public.is_crew_role(public.current_user_role())
    AND public.gycs_can_access_member(user_id)
  );

-- 10. Configure Superadmin (mail@chaddewet.com) & Demo Deckhand (yachting@chaddewet.com)
--     and seed Single 1-on-1 Coaching Program and Group Coaching Program
DO $$
DECLARE
  v_org_id uuid := '955e031f-5e85-4445-aaf1-2112811df66a';
  v_superadmin_id uuid := '0b3a3b2b-3c16-41eb-9836-47fcd94fbbf8';
  v_deckhand_id uuid := 'c098a48c-3ef6-40ea-b41c-9dbc8c83950d';
  v_prog_1on1_id uuid;
  v_prog_group_id uuid;
  v_cohort_1on1_id uuid;
  v_cohort_group_id uuid;
  v_pathway_id uuid;
  v_assessment_id uuid := '3bdb006a-21a2-475c-87a2-0a108e19adf5';
BEGIN
  -- Ensure organisation exists
  INSERT INTO public.organisations (id, name, slug)
  VALUES (v_org_id, 'Green Yacht Crew Solutions', 'green-yacht-crew-solutions')
  ON CONFLICT (id) DO NOTHING;

  -- 10a. Set mail@chaddewet.com as superadmin
  UPDATE public.profiles
  SET
    role = 'superadmin'::public.user_role,
    organisation_id = v_org_id,
    display_name = 'Chad de Wet',
    pathway_selection = 'superadmin',
    coaching_programme = 'one_on_one',
    is_active = true,
    updated_at = now()
  WHERE id = v_superadmin_id OR lower(email) = 'mail@chaddewet.com';

  -- 10b. Set yachting@chaddewet.com as Demo Profile of a Deckhand
  UPDATE public.profiles
  SET
    role = 'deckhand'::public.user_role,
    organisation_id = v_org_id,
    display_name = 'Chad Crew Account (Demo Deckhand)',
    pathway_selection = 'deckhand',
    coaching_programme = 'group',
    journey_state = 'pathway_agreed'::public.journey_state,
    is_active = true,
    updated_at = now()
  WHERE id = v_deckhand_id OR lower(email) = 'yachting@chaddewet.com';

  -- Ensure active coach assignment between Chad (superadmin/coach) and Demo Deckhand
  INSERT INTO public.coach_assignments (coach_id, member_id, notes)
  SELECT v_superadmin_id, v_deckhand_id, 'Assigned coach for Deckhand pathway demo profile'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.coach_assignments
    WHERE coach_id = v_superadmin_id AND member_id = v_deckhand_id AND ended_at IS NULL
  );

  -- Update Demo Deckhand onboarding_intakes payload so it reflects a Deckhand profile
  UPDATE public.onboarding_intakes
  SET
    payload = jsonb_build_object(
      'display_name', 'Chad Crew Account (Demo Deckhand)',
      'country_code', 'ZA',
      'timezone', 'Africa/Johannesburg',
      'phone', '066 268 6018',
      'experience_level', 'beginner',
      'department', 'deck',
      'goals', 'Secure a seasonal or permanent Deckhand role on a 40m–60m motor yacht in the Mediterranean or Caribbean.',
      'skills', 'Tender driving (RYA PB2), line handling, washdowns, chamois detailing, teak care, watersports support, lookout duties',
      'availability', 'Available immediately for Mediterranean and Caribbean seasons.',
      'training_status', 'STCW Basic Safety Training, PDSD, ENG1 Seafarer Medical, RYA Powerboat Level 2, RYA Marine VHF SRC',
      'readiness', 'Biometric passport valid, ENG1 and STCW completed, Deckhand CV structured.',
      'budget_band', 'Some budget available',
      'participation', true,
      'privacy_acknowledged', true,
      'marketing_email', true
    ),
    updated_at = now()
  WHERE user_id = v_deckhand_id;

  -- Update Demo Deckhand assessments to reflect Deckhand pathway
  UPDATE public.assessments
  SET
    department_fit = 'deck'::public.department,
    status = 'reviewed',
    coach_id = v_superadmin_id,
    recommended_pathway = 'Deckhand Pathway',
    pathway_rationale = 'Strong practical watersports and coastal handling foundation suited for Deckhand and Tender Driver roles.',
    do_not_spend_yet = 'Do not purchase advanced officer tickets before logging initial superyacht deck sea time.',
    motivation = jsonb_build_object(
      'text', 'Demo Deckhand profile targeting a Junior/Seasonal Deckhand role on a 40m–60m motor yacht with STCW, ENG1, RYA PB2, and VHF SRC.',
      'source', 'gycs_deckhand_demo_v1'
    ),
    reviewed_at = now(),
    updated_at = now()
  WHERE user_id = v_deckhand_id;

  -- Create or update active Deckhand pathway_versions & milestones for yachting@chaddewet.com
  SELECT id INTO v_pathway_id
  FROM public.pathway_versions
  WHERE user_id = v_deckhand_id AND version = 1;

  IF v_pathway_id IS NULL THEN
    INSERT INTO public.pathway_versions (
      user_id, assessment_id, version, department, target_role, summary, is_active, approved_by, approved_at
    )
    VALUES (
      v_deckhand_id,
      v_assessment_id,
      1,
      'deck'::public.department,
      'Deckhand',
      'Structured Deckhand pathway: mandatory STCW 2010 & ENG1 verification, RYA Powerboat Level 2 & Marine VHF SRC readiness, deck maintenance & tender ops preparation, CV Studio Deckhand profile, and M/Y Eye dockwalking routine.',
      true,
      v_superadmin_id,
      now()
    )
    RETURNING id INTO v_pathway_id;

    INSERT INTO public.milestones (pathway_id, title, description, sort_order, evidence_required, status)
    VALUES
      (v_pathway_id, '1. Mandatory STCW Basic Safety Training & PDSD', 'Complete STCW 95/2010 5-module safety training + Proficiency in Designated Security Duties.', 1, 'Accredited STCW & PDSD certificates', 'approved'),
      (v_pathway_id, '2. Seafarer Medical Fitness (ENG1 / SAMSA Approved)', 'Complete physical & eyesight examination with an MCA-approved or SAMSA maritime doctor.', 2, 'Valid ENG1 or SAMSA Medical Certificate', 'approved'),
      (v_pathway_id, '3. RYA Powerboat Level 2 & VHF SRC Radio', 'Essential employer preference for tender driving and deckhand operations.', 3, 'RYA PB2 & SRC certificates', 'in_progress'),
      (v_pathway_id, '4. Deckhand CV & Seamanship Evidence Portfolio', 'Structure truthful Deckhand CV highlighting tender handling, washdowns, line work, and watersports.', 4, 'Coach-reviewed CV Studio v1', 'in_progress'),
      (v_pathway_id, '5. M/Y Eye Hub Target & Dockwalking Plan', 'Configure port check-in and daily dockwalking route for Antibes / Palma / Fort Lauderdale.', 5, 'M/Y Eye location card & target yacht list', 'pending');
  END IF;

  -- Update Demo Deckhand crew_map_cards
  INSERT INTO public.crew_map_cards (
    user_id, department, headline, skills, available_from, availability_note, sharing_enabled, show_photo, consent_version
  )
  VALUES (
    v_deckhand_id,
    'deck',
    'Deckhand · STCW, ENG1 & RYA PB2 · Ready for Season',
    ARRAY['Tender Driving (PB2)', 'Line Handling', 'Washdowns & Detailing', 'Teak Care', 'Watersports Assist', 'VHF Radio'],
    CURRENT_DATE,
    'Demo Deckhand Profile · Ready for Med / Caribbean',
    true,
    true,
    '2026-10-v1'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    department = 'deck',
    headline = EXCLUDED.headline,
    skills = EXCLUDED.skills,
    available_from = EXCLUDED.available_from,
    availability_note = EXCLUDED.availability_note,
    updated_at = now();

  -- Update latest CV version for Demo Deckhand
  UPDATE public.cv_versions
  SET
    personal_info = jsonb_build_object(
      'fullName', 'Chad Crew Account (Demo Deckhand)',
      'nationality', 'South African',
      'location', 'Antibes / Cape Town',
      'email', 'yachting@chaddewet.com',
      'phone', '+27 66 268 6018',
      'seamanBook', 'SAMSA Seaman''s Record Book',
      'medicalFitness', 'ENG1 Valid (No restrictions)',
      'swimmingAbility', 'Strong swimmer & watersports competent',
      'visas', jsonb_build_array('Schengen C-Visa / Seafarer Transit', 'B1/B2 (In progress)'),
      'languages', jsonb_build_array('English (Native)', 'Afrikaans (Fluent)'),
      'smoker', false,
      'tattoos', 'None / Non-visible'
    ),
    objective = jsonb_build_object(
      'text', 'Physically disciplined, safety-focused Deckhand with STCW Basic Safety Training, ENG1 medical, RYA Powerboat Level 2, and hands-on tender and exterior maintenance experience. Seeking a seasonal or permanent Deckhand position on a 40m–60m private or charter motor yacht.',
      'targetRole', 'Deckhand',
      'targetDepartment', 'deck',
      'label', 'claimed'
    ),
    qualifications = jsonb_build_array(
      jsonb_build_object('name', 'STCW Basic Safety Training (PST, PSSR, FPFF, EFA)', 'issuer', 'SAMSA / MCA Accredited', 'date', '2026', 'label', 'claimed'),
      jsonb_build_object('name', 'Proficiency in Designated Security Duties (PDSD)', 'issuer', 'STCW Reg VI/6', 'date', '2026', 'label', 'claimed'),
      jsonb_build_object('name', 'ENG1 Seafarer Medical Certificate', 'issuer', 'MCA Approved Doctor', 'date', '2026', 'label', 'claimed'),
      jsonb_build_object('name', 'RYA Powerboat Level 2 (PB2)', 'issuer', 'Royal Yachting Association', 'date', '2026', 'label', 'claimed'),
      jsonb_build_object('name', 'Marine VHF Short Range Certificate (SRC)', 'issuer', 'RYA / ITU', 'date', '2026', 'label', 'claimed')
    ),
    skills = jsonb_build_array(
      jsonb_build_object('name', 'Tender Driving & Guest Transfers', 'label', 'claimed'),
      jsonb_build_object('name', 'Washdowns, Chamois & Stainless Detailing', 'label', 'claimed'),
      jsonb_build_object('name', 'Line Handling, Fender Work & Mooring', 'label', 'claimed'),
      jsonb_build_object('name', 'Teak Scrubbing & Exterior Maintenance', 'label', 'claimed'),
      jsonb_build_object('name', 'Watersports Setup & Guest Safety', 'label', 'claimed'),
      jsonb_build_object('name', 'Anchor Watch & Bridge Lookout', 'label', 'claimed')
    ),
    experience = jsonb_build_array(
      jsonb_build_object(
        'id', 'exp-deck-1',
        'role', 'Daywork & Seasonal Deckhand',
        'employerOrVessel', '42m M/Y Coastal Charter',
        'dates', '2026 Season',
        'description', 'Performed daily freshwater washdowns, chamois leather detailing, teak maintenance, line handling during stern-to med mooring, tender guest runs, and watersports equipment deployment.',
        'label', 'claimed'
      )
    ),
    additional = jsonb_build_object(
      'targetRole', 'Deckhand',
      'targetDepartment', 'deck',
      'contractPreference', 'seasonal',
      'preferredPorts', 'Antibes, Palma de Mallorca, Barcelona, Fort Lauderdale',
      'runwayMonths', 6,
      'hobbiesAndInterests', 'Watersports, small-boat handling, fitness, coastal navigation'
    ),
    updated_at = now()
  WHERE id = (
    SELECT id FROM public.cv_versions WHERE user_id = v_deckhand_id ORDER BY version DESC LIMIT 1
  );

  -- 10c. Seed Single 1-on-1 Coaching Program and Group Coaching Program
  INSERT INTO public.programmes (title, slug, description, department, duration_weeks, programme_type, is_active)
  VALUES (
    'Single 1-on-1 Coaching Program',
    'single-1on1-coaching',
    'Private, personalised 1-on-1 yacht career coaching with Chad de Wet tailored to your starting point, pathway role (Deckhand, Steward/ess, Engineer, or Chef), CV positioning, and active job search.',
    'deck'::public.department,
    8,
    'one_on_one',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    programme_type = EXCLUDED.programme_type,
    is_active = true,
    updated_at = now()
  RETURNING id INTO v_prog_1on1_id;

  INSERT INTO public.programmes (title, slug, description, department, duration_weeks, programme_type, is_active)
  VALUES (
    'Group Coaching Program',
    'group-coaching-program',
    'Structured 8-week cohort coaching programme combining weekly live strategy sessions, pathway-matched milestones, CV workshops, and M/Y Eye search execution.',
    'deck'::public.department,
    8,
    'group',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    programme_type = EXCLUDED.programme_type,
    is_active = true,
    updated_at = now()
  RETURNING id INTO v_prog_group_id;

  -- Seed active cohorts for both programs if not already present
  SELECT id INTO v_cohort_1on1_id FROM public.cohorts WHERE programme_id = v_prog_1on1_id LIMIT 1;
  IF v_cohort_1on1_id IS NULL THEN
    INSERT INTO public.cohorts (programme_id, name, starts_at, max_members, coach_id, is_active)
    VALUES (v_prog_1on1_id, '1-on-1 Private Coaching Roster', CURRENT_DATE, 20, v_superadmin_id, true)
    RETURNING id INTO v_cohort_1on1_id;
  END IF;

  SELECT id INTO v_cohort_group_id FROM public.cohorts WHERE programme_id = v_prog_group_id LIMIT 1;
  IF v_cohort_group_id IS NULL THEN
    INSERT INTO public.cohorts (programme_id, name, starts_at, max_members, coach_id, is_active)
    VALUES (v_prog_group_id, 'GYCS Group Coaching Cohort', CURRENT_DATE, 12, v_superadmin_id, true)
    RETURNING id INTO v_cohort_group_id;
  END IF;

  -- Enrol Demo Deckhand in the Group Coaching Cohort
  INSERT INTO public.cohort_members (cohort_id, user_id, status)
  VALUES (v_cohort_group_id, v_deckhand_id, 'active')
  ON CONFLICT (cohort_id, user_id) DO UPDATE SET status = 'active';
END;
$$;
