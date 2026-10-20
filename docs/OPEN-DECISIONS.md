# GYCS Crew Hub — Open Decisions Requiring a Human

> **CRITICAL ARCHITECTURAL NOTICE**
> These questions cannot be resolved by engineering alone. Each requires a named decision-maker (business owner, legal advisor, or domain expert) and must not be resolved with assumptions or hardcoded shortcuts.

---

## 1. Legal / Regulatory Decisions

| # | Question | Decision-Maker | Status / Impact |
|---|---|---|---|
| **L1** | **Employment Services Act s.15 (South Africa)**: What is the exact legal position on charging members? Can we charge for live vocational coaching (skills development) versus placement? What documentation and audit trail are required? | **Legal Advisor** | **Payments Feature-Flagged OFF**. App runs in free/sponsored pilot mode until formal legal clearance. |
| **L2** | **POPIA Compliance Review**: Do we need a registered Information Officer? What is the strict data retention period for member records, uploaded verification documents, and audit logs after completion or withdrawal? | **Legal Advisor** | Marketing consent records are isolated from programme records. Opt-out and deletion mechanisms provisioned. |
| **L3** | **ENG1 Medical Equivalents**: Which non-ENG1 medical certificates are currently accepted by MCA, SAMSA, and major yacht employers (e.g. South African SAMSA-accredited seafarer medicals, Maltese, Norwegian)? | **Maritime Medical Advisor** | **Never auto-reject non-ENG1**. System flags for coach review and manual authority verification. |
| **L4** | **STCW Requirement Versions**: Are we tracking STCW 2010 Manila Amendments or have there been recent flag-state amendments (e.g. SAMSA Marine Notices, MCA MINs) affecting entry-level deck and interior crew? | **SAMSA / MCA Liaison** | Requirements engine is fully versioned with source authority and last-verified date fields. |
| **L5** | **Recording Consent (SA Law)**: Does South African law apply one-party or all-party consent to group coaching video recordings? How does this interact with POPIA section 11 consent? | **Legal Advisor** | Explicit per-session opt-in consent checkbox enforced before session join / playback access. |

---

## 2. Business / Product Decisions

| # | Question | Decision-Maker | Status / Impact |
|---|---|---|---|
| **B1** | **Pilot Pricing Model**: Is the first cohort fully free, sponsored, or deposit-refundable? This affects whether the payment module is needed at launch. | **Chad de Wet (Founder)** | Defaulted to sponsored pilot cohort. |
| **B2** | **Coach Capacity**: How many members per coach? This affects cohort size caps, assignment review SLAs, and coach console alert thresholds. | **Chad de Wet (Founder)** | Defaults: max 12 members per cohort, 48h assignment SLA, 7-day blocker escalation. |
| **B3** | **Cohort Schedule**: What are the target launch dates for the inaugural "Zero to First Contract" Deck and Interior cohorts? | **Chad de Wet (Founder)** | Deckhand & Steward/ess 8-week tracks seeded with Q1/Q2 cohorts. |
| **B4** | **External Meeting Provider**: Confirm Zoom Meeting SDK vs direct launch links (Google Meet, Zoom Web Client, Teams). | **Chad de Wet (Founder)** | Hybrid support: external authenticated join link with in-app agenda and queue. |
| **B5** | **Tile Provider for MapLibre**: Mapbox, Maptiler, Protomaps, or OpenStreetMap vector tiles? License and cost implications. | **Chad de Wet (Founder)** | Feature-flagged `map_directory`. |
| **B6** | **GoHighLevel Scope**: Which fields sync to GHL? Only consented marketing contacts, or journey state changes as well? | **Chad de Wet (Founder)** | GHL treated strictly as downstream marketing sync; Hub remains student master record. |
| **B7** | **Outcome Definition Precision**: Is "daywork" counted as a primary employment outcome or tracked separately? | **Chad de Wet (Founder)** | Daywork is reported separately from seasonal and permanent contracts. |
| **B8** | **Domain and Hosting**: Confirm production domain name and hosting infrastructure. | **Chad de Wet (Founder)** | Scalable configuration ready. |
| **B9** | **Employer Verification Process**: Who verifies yacht employers/agencies, and what evidence is required? | **Chad de Wet (Founder)** | Strict `is_verified` boolean; no employer can browse unshared candidate vaults. |

---

## 3. Technical Architecture Decisions

| # | Question | Decision-Maker | Status / Impact |
|---|---|---|---|
| **T1** | **Supabase Project Setup**: Local Supabase CLI vs Cloud Managed project provisioning. | **Chad de Wet / Lead Eng** | Client architecture supports both hosted Supabase and deterministic local mock. |
| **T2** | **AI Provider for CV Assist**: Gemini 2.5 Flash vs alternatives. Strictly server-side only; no PII or sensitive medical records transmitted. | **Chad de Wet / Lead Eng** | Feature-flagged `ai_cv_assist`, strict anti-hallucination prompt. |
| **T3** | **PDF Generation**: Client-side (HTML Canvas/PDF) vs server-side headless browser. | **Engineering** | Client-side print/PDF engine with structured CV data labels. |
