-- supabase/migrations/00008_functions.sql
-- Transition guard: validates allowed state transitions
CREATE OR REPLACE FUNCTION public.transition_journey_state(
  p_user_id uuid,
  p_new_state public.journey_state,
  p_reason text DEFAULT NULL,
  p_evidence jsonb DEFAULT '{}'
)
RETURNS void AS $$
DECLARE
  v_current_state public.journey_state;
  v_allowed boolean := false;
BEGIN
  SELECT journey_state INTO v_current_state
  FROM public.profiles WHERE id = p_user_id;

  -- Define allowed transitions
  v_allowed := CASE
    -- Forward progression
    WHEN v_current_state = 'exploring' AND p_new_state IN ('pathway_agreed', 'paused', 'alternative_route') THEN true
    WHEN v_current_state = 'pathway_agreed' AND p_new_state IN ('preparing', 'paused', 'needs_review', 'alternative_route') THEN true
    WHEN v_current_state = 'preparing' AND p_new_state IN ('training_complete', 'paused', 'needs_review') THEN true
    WHEN v_current_state = 'training_complete' AND p_new_state IN ('profile_ready', 'needs_review') THEN true
    WHEN v_current_state = 'profile_ready' AND p_new_state IN ('search_active', 'needs_review') THEN true
    WHEN v_current_state = 'search_active' AND p_new_state IN ('interviewing', 'paused', 'needs_review') THEN true
    WHEN v_current_state = 'interviewing' AND p_new_state IN ('offer', 'search_active', 'needs_review') THEN true
    WHEN v_current_state = 'offer' AND p_new_state IN ('employment_started', 'search_active', 'needs_review') THEN true
    WHEN v_current_state = 'employment_started' AND p_new_state IN ('first_season_supported', 'needs_review') THEN true
    -- Recovery from non-linear states
    WHEN v_current_state = 'paused' AND p_new_state IN ('exploring', 'pathway_agreed', 'preparing', 'search_active') THEN true
    WHEN v_current_state = 'needs_review' AND p_new_state IS NOT NULL THEN true -- Coach can move to any state
    WHEN v_current_state = 'alternative_route' AND p_new_state IN ('exploring', 'paused') THEN true
    ELSE false
  END;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Invalid transition from % to %', v_current_state, p_new_state;
  END IF;

  -- Record transition
  INSERT INTO public.journey_transitions (user_id, from_state, to_state, reason, evidence, reviewed_by)
  VALUES (p_user_id, v_current_state, p_new_state, p_reason, p_evidence, auth.uid());

  -- Update profile
  UPDATE public.profiles SET journey_state = p_new_state WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit trigger: logs all changes to sensitive tables
CREATE OR REPLACE FUNCTION public.audit_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_events (user_id, actor_id, event_type, resource, resource_id, details)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
