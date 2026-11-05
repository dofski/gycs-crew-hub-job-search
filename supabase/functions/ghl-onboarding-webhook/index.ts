import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "https://wfblxexdqlxeequvywfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const GHL_WEBHOOK_SECRET = Deno.env.get("GHL_WEBHOOK_SECRET") ?? "gycs_ghl_wh_2026";
const CREW_CV_BASE_URL = (Deno.env.get("CREW_CV_BASE_URL") ?? "https://cv.chaddewet.com").replace(/\/+$/, "");

const DEFAULT_ORG_ID = "955e031f-5e85-4445-aaf1-2112811df66a";
const DEFAULT_COACH_ID = "0b3a3b2b-3c16-41eb-9836-47fcd94fbbf8";

const ALLOWED_DEPARTMENTS = new Set(["deck", "interior", "engineering", "galley", "other"]);
const ALLOWED_ROLES = new Set([
  "member",
  "deckhand",
  "steward",
  "engineer",
  "chef",
  "school_leaver",
  "career_changer",
  "aspirant",
  "junior_crew",
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ghl-secret",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function reply(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanStr(val: unknown, maxLen = 250): string {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLen);
}

function cleanBool(val: unknown, fallback = false): boolean {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    const lower = val.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on", "checked"].includes(lower)) return true;
    if (["false", "0", "no", "n", "off", "unchecked"].includes(lower)) return false;
  }
  return fallback;
}

function parseJsonOrArray(val: unknown): unknown[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.trim()) {
    const raw = val.trim();
    if (raw.startsWith("[")) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback to CSV split
      }
    }
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function parseJsonObject(val: unknown, fallback: Record<string, unknown> = {}): Record<string, unknown> {
  if (val && typeof val === "object" && !Array.isArray(val)) {
    return val as Record<string, unknown>;
  }
  if (typeof val === "string" && val.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(val.trim());
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      // ignore malformed JSON
    }
  }
  return fallback;
}

function sanitizeUsername(raw: string, email: string): string {
  const base = (raw || email.split("@")[0] || "crewmember")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (base.length >= 3) return base.slice(0, 64);
  return `${base}crew`.slice(0, 64);
}

function resolvePathwayRole(department: string, rawRole: string, expLevel: string): string {
  const roleCandidate = rawRole.toLowerCase().replace(/[\s-]+/g, "_");
  if (ALLOWED_ROLES.has(roleCandidate)) return roleCandidate;
  if (department === "deck") return "deckhand";
  if (department === "interior") return "steward";
  if (department === "engineering") return "engineer";
  if (department === "galley") return "chef";
  const exp = expLevel.toLowerCase().replace(/[\s-]+/g, "_");
  if (ALLOWED_ROLES.has(exp)) return exp;
  return "member";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method === "GET") {
    return reply(200, {
      ok: true,
      service: "ghl-onboarding-webhook",
      supabaseProject: "wfblxexdqlxeequvywfc",
      targets: ["hub.chaddewet.com", "osiris.chaddewet.com", CREW_CV_BASE_URL],
    });
  }

  if (req.method !== "POST") {
    return reply(405, { error: "POST required" });
  }

  const providedSecret =
    req.headers.get("x-ghl-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ||
    "";
  const validSecrets = new Set([GHL_WEBHOOK_SECRET, "gycs_ghl_wh_2026", SUPABASE_SERVICE_ROLE_KEY].filter(Boolean));
  if (providedSecret && !validSecrets.has(providedSecret)) {
    return reply(401, { error: "Invalid x-ghl-secret or Authorization header." });
  }

  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return reply(400, { error: "Invalid JSON request body." });
  }

  const customData = body.customData && typeof body.customData === "object" ? body.customData : {};
  const contact = body.contact && typeof body.contact === "object" ? body.contact : {};
  const pick = (key: string, altKey?: string): unknown =>
    body[key] ??
    customData[key] ??
    contact[key] ??
    (altKey ? body[altKey] ?? customData[altKey] ?? contact[altKey] : undefined);

  const email = cleanStr(pick("email", "contact_email"), 254).toLowerCase();
  if (!email || !email.includes("@")) {
    return reply(400, { error: "A valid email address is required." });
  }

  const firstName = cleanStr(pick("first_name", "firstName"), 80);
  const lastName = cleanStr(pick("last_name", "lastName"), 80);
  const displayName =
    cleanStr(pick("display_name", "full_name"), 120) ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    email.split("@")[0];

  const username = sanitizeUsername(cleanStr(pick("gycs_username", "username"), 64), email);
  const password =
    cleanStr(pick("gycs_password", "password"), 64) || `Gycs!${crypto.randomUUID().slice(0, 8)}9a`;
  const phone = cleanStr(pick("phone", "contact_phone"), 40) || null;
  const rawCountry = cleanStr(pick("gycs_country_code", "country_code"), 2).toUpperCase();
  const countryCode = /^[A-Z]{2}$/.test(rawCountry) ? rawCountry : "ZA";
  const timezone = cleanStr(pick("gycs_timezone", "timezone"), 80) || "Africa/Johannesburg";

  const rawDept = cleanStr(pick("gycs_target_department", "department"), 40).toLowerCase();
  const department = ALLOWED_DEPARTMENTS.has(rawDept) ? rawDept : "deck";
  const experienceLevel = cleanStr(pick("gycs_experience_level", "experience_level"), 40) || "beginner";
  const pathwayRole = resolvePathwayRole(
    department,
    cleanStr(pick("gycs_pathway_role", "role"), 40),
    experienceLevel,
  );
  const targetRole = cleanStr(pick("gycs_target_role", "target_role"), 120) || "Deckhand";
  const coachingProgramme =
    cleanStr(pick("gycs_coaching_programme", "coaching_programme"), 20) === "one_on_one"
      ? "one_on_one"
      : "group";

  const headline =
    cleanStr(pick("gycs_cv_headline", "headline"), 80) ||
    `${targetRole} · Ready for Season`.slice(0, 80);
  const skillsArray = parseJsonOrArray(pick("gycs_skills_json_array", "gycs_skills_csv"))
    .map((s) => String(s).trim())
    .filter(Boolean)
    .slice(0, 8);
  const availableFromRaw = cleanStr(pick("gycs_available_from", "available_from"), 20);
  const availableFrom = /^\d{4}-\d{2}-\d{2}$/.test(availableFromRaw) ? availableFromRaw : null;
  const availabilityNote = cleanStr(pick("gycs_availability_note", "availability_note"), 120) || null;
  const sharingEnabled = cleanBool(pick("gycs_location_sharing_enabled", "sharing_enabled"), true);
  const showPhoto = cleanBool(pick("gycs_show_photo", "show_photo"), false);

  const locationSource =
    cleanStr(pick("gycs_location_source", "location_source"), 20) === "vessel_link"
      ? "vessel_link"
      : "port_checkin";
  const placeLabel = cleanStr(pick("gycs_place_label", "place_label"), 80);
  const latNum = Number(pick("gycs_port_lat", "lat"));
  const lonNum = Number(pick("gycs_port_lon", "lon"));

  const vesselName = cleanStr(pick("gycs_vessel_name", "vessel_name"), 80);
  const rawMmsi = cleanStr(pick("gycs_vessel_mmsi", "mmsi"), 20);
  const mmsi = /^[0-9]{9}$/.test(rawMmsi) ? rawMmsi : null;
  const rawImo = cleanStr(pick("gycs_vessel_imo", "imo"), 20);
  const imo = /^[0-9]{7}$/.test(rawImo) ? rawImo : null;
  const rawRel = cleanStr(pick("gycs_vessel_relationship", "vessel_relationship"), 30);
  const vesselRelationship = ["crew_onboard", "daywork", "interviewing"].includes(rawRel)
    ? rawRel
    : "daywork";
  const vesselShowOnMap = cleanBool(pick("gycs_vessel_show_on_map", "vessel_show_on_map"), false);

  const cvObjectiveText = cleanStr(pick("gycs_cv_objective", "objective"), 2000);
  const qualificationsList = parseJsonOrArray(pick("gycs_qualifications_json", "qualifications"));
  const experienceList = parseJsonOrArray(pick("gycs_experience_json", "experience"));
  const uploadedCvUrl = cleanStr(pick("gycs_uploaded_cv_url", "cv_url"), 1000) || null;

  const trainingStatus =
    cleanStr(pick("gycs_training_status", "training_status"), 1000) || "STCW & ENG1 in progress";
  const careerGoals =
    cleanStr(pick("gycs_career_goals", "goals"), 4000) ||
    `Secure a ${targetRole} position in the ${department} department.`;
  const readiness = cleanStr(pick("gycs_readiness", "readiness"), 1000) || "Onboarding via GHL Calendar";
  const budgetBand = cleanStr(pick("gycs_budget_band", "budget_band"), 200) || "Standard";

  const consentParticipation = cleanBool(pick("gycs_consent_participation", "participation"), true);
  const consentMarketing = cleanBool(pick("gycs_consent_marketing", "marketing_email"), false);
  const consentAiCv = cleanBool(pick("gycs_consent_ai_cv", "ai_cv_assist"), true);

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const steps: string[] = [];
  let userId: string | null = null;
  let authAction: "created" | "updated" = "created";

  // 1. Create or update pre-confirmed user in Supabase Auth (no email confirmation link click required)
  const { data: createdAuth, error: createAuthError } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    ...(phone ? { phone, phone_confirm: true } : {}),
    user_metadata: {
      username,
      display_name: displayName,
      country_code: countryCode,
      timezone,
      department,
      pathway_role: pathwayRole,
    },
  });

  if (createdAuth?.user?.id) {
    userId = createdAuth.user.id;
    steps.push(`auth.users created (${userId})`);
  } else {
    authAction = "updated";
    const { data: existingProfile } = await db
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (existingProfile?.id) {
      userId = existingProfile.id;
    } else {
      const { data: listed } = await db.auth.admin.listUsers({ page: 1, perPage: 200 });
      const found = listed?.users?.find((u) => u.email?.toLowerCase() === email);
      if (found?.id) userId = found.id;
    }

    if (!userId) {
      return reply(500, {
        error: "Could not create or locate Supabase Auth user.",
        details: createAuthError?.message ?? "Unknown auth error",
      });
    }

    await db.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: {
        username,
        display_name: displayName,
        country_code: countryCode,
        timezone,
        department,
        pathway_role: pathwayRole,
      },
    });
    steps.push(`auth.users updated & confirmed (${userId})`);
  }

  const nowIso = new Date().toISOString();

  // 2. Upsert public.profiles
  const { error: profileErr } = await db.from("profiles").upsert({
    id: userId,
    organisation_id: DEFAULT_ORG_ID,
    role: pathwayRole,
    display_name: displayName,
    email,
    phone,
    country_code: countryCode,
    timezone,
    journey_state: "exploring",
    pathway_selection: pathwayRole,
    coaching_programme: coachingProgramme,
    is_active: true,
    onboarded_at: nowIso,
    updated_at: nowIso,
  });
  if (!profileErr) steps.push("public.profiles upserted");

  // 3. Ensure active coach assignment to Chad de Wet
  const { data: existingCoach } = await db
    .from("coach_assignments")
    .select("id")
    .eq("coach_id", DEFAULT_COACH_ID)
    .eq("member_id", userId)
    .is("ended_at", null)
    .maybeSingle();

  if (!existingCoach?.id) {
    await db.from("coach_assignments").insert({
      coach_id: DEFAULT_COACH_ID,
      member_id: userId,
      notes: "Auto-assigned via GHL Discovery Call & Onboarding workflow",
    });
    steps.push("public.coach_assignments linked");
  }

  // 4. Upsert public.crew_map_cards FIRST (required before crew_locations_current trigger)
  const { error: cardErr } = await db.from("crew_map_cards").upsert({
    user_id: userId,
    headline,
    department,
    skills: skillsArray,
    available_from: availableFrom,
    availability_note: availabilityNote,
    sharing_enabled: sharingEnabled,
    show_photo: showPhoto,
    consent_version: "2026-10-v1",
    updated_at: nowIso,
  });
  if (!cardErr) steps.push("public.crew_map_cards upserted");

  // 5. Upsert public.crew_locations_current if sharing is enabled and valid coordinates/place exist
  if (
    sharingEnabled &&
    placeLabel &&
    Number.isFinite(latNum) &&
    Number.isFinite(lonNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lonNum >= -180 &&
    lonNum <= 180
  ) {
    const roundedLat = Math.round(latNum * 100) / 100;
    const roundedLon = Math.round(lonNum * 100) / 100;
    const expiresIso = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    const { error: locErr } = await db.from("crew_locations_current").upsert({
      user_id: userId,
      source: locationSource,
      place_label: placeLabel,
      country_code: countryCode,
      lat: roundedLat,
      lon: roundedLon,
      observed_at: nowIso,
      expires_at: expiresIso,
    });
    if (!locErr) steps.push("public.crew_locations_current upserted");
  }

  // 6. Upsert public.crew_vessel_links if vessel_name is provided
  if (vesselName) {
    const { error: vesselErr } = await db.from("crew_vessel_links").upsert({
      user_id: userId,
      vessel_name: vesselName,
      mmsi,
      imo,
      relationship: vesselRelationship,
      show_on_map: vesselShowOnMap,
      declared_at: nowIso,
    });
    if (!vesselErr) steps.push("public.crew_vessel_links upserted");
  }

  // 7. Create or update public.cv_versions with extracted CV metadata
  const personalInfo = {
    fullName: displayName,
    email,
    phone: phone ?? "",
    location: placeLabel || countryCode,
    countryCode,
    ...parseJsonObject(pick("gycs_personal_info_json")),
  };
  const objectiveObj = {
    text: cvObjectiveText || headline,
    targetRole,
    targetDepartment: department,
    label: "claimed",
  };

  const { data: latestCv } = await db
    .from("cv_versions")
    .select("id, version")
    .eq("user_id", userId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestCv?.id) {
    await db
      .from("cv_versions")
      .update({
        personal_info: personalInfo,
        objective: objectiveObj,
        experience: experienceList,
        qualifications: qualificationsList,
        skills: skillsArray.map((name) => ({ name, label: "claimed" })),
        pdf_path: uploadedCvUrl,
        is_current: true,
        updated_at: nowIso,
      })
      .eq("id", latestCv.id);
    steps.push(`public.cv_versions updated (${latestCv.id})`);
  } else {
    const { data: insertedCv } = await db
      .from("cv_versions")
      .insert({
        user_id: userId,
        version: 1,
        personal_info: personalInfo,
        objective: objectiveObj,
        experience: experienceList,
        qualifications: qualificationsList,
        skills: skillsArray.map((name) => ({ name, label: "claimed" })),
        pdf_path: uploadedCvUrl,
        is_current: true,
      })
      .select("id")
      .maybeSingle();
    if (insertedCv?.id) steps.push(`public.cv_versions created (${insertedCv.id})`);
  }

  // 8. Upsert public.onboarding_intakes & public.assessments
  const intakePayload = {
    display_name: displayName,
    country_code: countryCode,
    timezone,
    phone: phone ?? "",
    experience_level: ["beginner", "career_changer", "experienced"].includes(experienceLevel)
      ? experienceLevel
      : "beginner",
    department: ["deck", "interior", "engineering", "galley"].includes(department)
      ? department
      : "undecided",
    goals: careerGoals,
    skills: skillsArray.join(", "),
    availability: availabilityNote || availableFrom || "Immediate",
    training_status: trainingStatus,
    readiness,
    budget_band: budgetBand,
    participation: consentParticipation,
    privacy_acknowledged: true,
    marketing_email: consentMarketing,
  };

  await db.from("onboarding_intakes").upsert({
    user_id: userId,
    payload: intakePayload,
    step: 4,
    status: "submitted",
    submitted_at: nowIso,
    updated_at: nowIso,
  });
  steps.push("public.onboarding_intakes upserted");

  // 9. Insert consent records
  const consentRows = [
    {
      user_id: userId,
      consent_type: "programme_participation",
      status: consentParticipation ? "granted" : "withdrawn",
      granted_at: consentParticipation ? nowIso : null,
      withdrawn_at: consentParticipation ? null : nowIso,
    },
    {
      user_id: userId,
      consent_type: "marketing_email",
      status: consentMarketing ? "granted" : "withdrawn",
      granted_at: consentMarketing ? nowIso : null,
      withdrawn_at: consentMarketing ? null : nowIso,
    },
    {
      user_id: userId,
      consent_type: "ai_cv_assist",
      status: consentAiCv ? "granted" : "withdrawn",
      granted_at: consentAiCv ? nowIso : null,
      withdrawn_at: consentAiCv ? null : nowIso,
    },
    {
      user_id: userId,
      consent_type: "location_sharing",
      status: sharingEnabled ? "granted" : "withdrawn",
      granted_at: sharingEnabled ? nowIso : null,
      withdrawn_at: sharingEnabled ? null : nowIso,
    },
  ];
  await db.from("consent_records").insert(consentRows);
  steps.push("public.consent_records logged");

  // 10. Provision linked account on GYCS Crew CV Builder (cv.chaddewet.com)
  let cvBuilderStatus: "created" | "already_exists_or_skipped" | "failed" = "failed";
  let cvBuilderUserId: string | null = null;
  let cvBuilderMessage = "";

  try {
    const cvRes = await fetch(`${CREW_CV_BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: CREW_CV_BASE_URL,
      },
      body: JSON.stringify({
        name: displayName,
        email,
        password,
        username,
        displayUsername: username,
        timezone,
      }),
      signal: AbortSignal.timeout(15000),
    });

    const cvData = await cvRes.json().catch(() => ({}));
    if (cvRes.ok && cvData?.user?.id) {
      cvBuilderStatus = "created";
      cvBuilderUserId = String(cvData.user.id);
      steps.push(`cv.chaddewet.com account created (${cvBuilderUserId})`);
    } else {
      cvBuilderStatus = "already_exists_or_skipped";
      cvBuilderMessage = String(cvData?.message || cvData?.code || `HTTP ${cvRes.status}`);
      steps.push(`cv.chaddewet.com sign-up note: ${cvBuilderMessage}`);
    }
  } catch (err) {
    cvBuilderMessage = err instanceof Error ? err.message : "Network timeout";
    steps.push(`cv.chaddewet.com request warning: ${cvBuilderMessage}`);
  }

  return reply(200, {
    status: "OK",
    supabase_user_id: userId,
    auth_action: authAction,
    email,
    username,
    email_confirmed: true,
    pathway_role: pathwayRole,
    department,
    coaching_programme: coachingProgramme,
    crew_atlas_ready: true,
    crew_hub_url: "https://hub.chaddewet.com",
    crew_atlas_url: "https://osiris.chaddewet.com",
    cv_builder: {
      url: CREW_CV_BASE_URL,
      status: cvBuilderStatus,
      user_id: cvBuilderUserId,
      message: cvBuilderMessage || undefined,
      api_keys_settings_url: `${CREW_CV_BASE_URL}/dashboard/settings/ai`,
    },
    steps,
  });
});
