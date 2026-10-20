-- supabase/migrations/00007_rls_policies.sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_suppressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pathway_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_starts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retention_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_reasons ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_coach_of(member_uuid uuid)
RETURNS boolean AS $$
SELECT EXISTS (
  SELECT 1 FROM public.coach_assignments
  WHERE coach_id = auth.uid()
  AND member_id = member_uuid
  AND ended_at IS NULL
);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role AS $$
SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY profiles_select_coach ON public.profiles FOR SELECT USING (
  public.current_user_role() = 'coach' AND (id = auth.uid() OR public.is_coach_of(id))
);
CREATE POLICY profiles_select_admin ON public.profiles FOR SELECT USING (public.current_user_role() = 'admin');
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update_coach ON public.profiles FOR UPDATE USING (
  public.current_user_role() = 'coach' AND public.is_coach_of(id)
);

-- ASSESSMENTS
CREATE POLICY assessments_select_own ON public.assessments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY assessments_select_coach ON public.assessments FOR SELECT USING (
  public.current_user_role() IN ('coach', 'admin') AND public.is_coach_of(user_id)
);
CREATE POLICY assessments_insert_own ON public.assessments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY assessments_update_own ON public.assessments FOR UPDATE USING (user_id = auth.uid() AND status = 'in_progress');
CREATE POLICY assessments_update_coach ON public.assessments FOR UPDATE USING (
  public.current_user_role() = 'coach' AND public.is_coach_of(user_id)
);

-- DOCUMENTS — Members see own; coaches see assigned; NEVER searchable vault
CREATE POLICY documents_select_own ON public.documents FOR SELECT USING (user_id = auth.uid());
CREATE POLICY documents_select_coach ON public.documents FOR SELECT USING (
  public.current_user_role() IN ('coach', 'admin') AND public.is_coach_of(user_id)
);
CREATE POLICY documents_insert_own ON public.documents FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY documents_update_own ON public.documents FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY documents_update_coach ON public.documents FOR UPDATE USING (
  public.current_user_role() = 'coach' AND public.is_coach_of(user_id)
);

-- CV VERSIONS
CREATE POLICY cv_select_own ON public.cv_versions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY cv_select_coach ON public.cv_versions FOR SELECT USING (
  public.current_user_role() IN ('coach', 'admin') AND public.is_coach_of(user_id)
);
CREATE POLICY cv_insert_own ON public.cv_versions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY cv_update_own ON public.cv_versions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY cv_update_coach ON public.cv_versions FOR UPDATE USING (
  public.current_user_role() = 'coach' AND public.is_coach_of(user_id)
);

-- REQUIREMENTS — Public read
CREATE POLICY requirements_select_all ON public.requirements FOR SELECT USING (true);
CREATE POLICY requirements_manage ON public.requirements FOR ALL USING (public.current_user_role() IN ('coach', 'admin'));

-- PATHWAYS & MILESTONES
CREATE POLICY pathway_select_own ON public.pathway_versions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY pathway_select_coach ON public.pathway_versions FOR SELECT USING (
  public.current_user_role() IN ('coach', 'admin') AND public.is_coach_of(user_id)
);

CREATE POLICY milestones_select_own ON public.milestones FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pathway_versions pv WHERE pv.id = pathway_id AND pv.user_id = auth.uid())
);
CREATE POLICY milestones_select_coach ON public.milestones FOR SELECT USING (
  public.current_user_role() IN ('coach', 'admin') AND EXISTS (
    SELECT 1 FROM public.pathway_versions pv WHERE pv.id = pathway_id AND public.is_coach_of(pv.user_id)
  )
);

-- OPPORTUNITIES & APPLICATIONS
CREATE POLICY opportunities_select ON public.opportunities FOR SELECT USING (is_active = true);
CREATE POLICY opportunities_manage ON public.opportunities FOR ALL USING (public.current_user_role() IN ('coach', 'admin'));

CREATE POLICY applications_select_own ON public.applications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY applications_select_coach ON public.applications FOR SELECT USING (
  public.current_user_role() IN ('coach', 'admin') AND public.is_coach_of(user_id)
);
CREATE POLICY applications_insert_own ON public.applications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY applications_update_own ON public.applications FOR UPDATE USING (user_id = auth.uid());

-- CONSENT RECORDS
CREATE POLICY consent_select_own ON public.consent_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY consent_insert_own ON public.consent_records FOR INSERT WITH CHECK (user_id = auth.uid());

-- LEARNING
CREATE POLICY programmes_select ON public.programmes FOR SELECT USING (is_active = true);
CREATE POLICY lessons_select_enrolled ON public.lessons FOR SELECT USING (
  is_published = true AND EXISTS (
    SELECT 1 FROM public.cohort_members cm
    JOIN public.cohorts c ON c.id = cm.cohort_id
    WHERE cm.user_id = auth.uid() AND c.programme_id = lessons.programme_id AND cm.status = 'active'
  )
);
CREATE POLICY lessons_select_coach ON public.lessons FOR SELECT USING (public.current_user_role() IN ('coach', 'admin'));
CREATE POLICY submissions_select_own ON public.assignment_submissions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY submissions_select_coach ON public.assignment_submissions FOR SELECT USING (
  public.current_user_role() IN ('coach', 'admin') AND public.is_coach_of(user_id)
);
CREATE POLICY submissions_insert_own ON public.assignment_submissions FOR INSERT WITH CHECK (user_id = auth.uid());

-- OUTCOMES
CREATE POLICY offers_select_own ON public.offers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY offers_select_coach ON public.offers FOR SELECT USING (public.current_user_role() IN ('coach', 'admin'));
CREATE POLICY verified_starts_coach ON public.verified_starts FOR ALL USING (public.current_user_role() IN ('coach', 'admin'));
CREATE POLICY retention_checks_coach ON public.retention_checks FOR ALL USING (public.current_user_role() IN ('coach', 'admin'));
CREATE POLICY audit_select_admin ON public.audit_events FOR SELECT USING (public.current_user_role() = 'admin');
