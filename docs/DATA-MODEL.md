# GYCS Crew Hub — Data Model Specification

## 1. Identity & Governance
- `profiles`: Extends user auth with `role` (member, coach, admin), `country_code`, `timezone`, and current `journey_state`.
- `coach_assignments`: Tracks one-on-one and cohort coach allocation with audit timestamps.
- `consent_records`: Separate granular consent flags (POPIA compliance) for marketing channels, programme participation, recording, data export.
- `access_logs`: Immutable security audit log.

## 2. Pathways & Versioned Requirements
- `assessments`: Structured intake capturing motivation, department fit, existing experience, runway, and travel permissions. Stores coach rationale, uncertainties, and "what NOT to spend money on yet".
- `pathway_versions`: Immutable agreed pathway specifications.
- `requirements`: Sourced maritime compliance engine. Each row records `source_authority`, `source_version`, `applicable_flags`, `classification`, `last_verified_date`, and `verified_by`.
- `milestones`: Concrete milestones linked to requirements with evidence status.
- `journey_transitions`: Historical audit trail of state changes with evidence and reviewer ID.

## 3. Learning & Live Room
- `programmes` & `cohorts`: Cohort-based live tracks (e.g. 12 members cap).
- `lessons` & `assignments`: Multimedia lessons, assignments with draft/submitted/reviewed/resubmit statuses.
- `live_sessions` & `session_attendance`: Zoom/external links, recording consent opt-in, live question queue.

## 4. Evidence & Documents
- `documents`: Stored in private buckets. Stores verification status (`claimed`, `uploaded`, `reviewed`, `verified`), expiry dates, hash of doc number (never raw sensitive metadata).
- `credential_verifications`: Formal audit records of certificate confirmation.

## 5. Career & Applications
- `cv_versions`: Structured JSON blocks where every field is labeled with provenance (`claimed`, `uploaded`, `reviewed`, `verified`). Coach review commentary and PDF export path.
- `employers`: Approved partners with `is_verified` status.
- `opportunities`: Curated listings with outbound links and contract type (`seasonal`, `permanent`, `daywork`, `rotational`).
- `applications`: Application pipeline with status tracking and interview notes.

## 6. Outcomes & Retention
- `offers`: Offer review queue with coach commentary.
- `verified_starts`: Formal verified employment start requiring evidence (`redacted_contract`, `employer_confirmation`, `start_confirmation`).
- `retention_checks`: Post-placement check-ins at Week 1, Week 4, Month 3, and Season End.
- `withdrawal_reasons`: Structured reasons capturing withdrawals without distorting cohort denominators.
