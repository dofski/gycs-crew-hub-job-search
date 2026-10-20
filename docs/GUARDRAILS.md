# GYCS Crew Hub — Non-Negotiable Guardrails

These rules are hardcoded into the platform architecture, data schema, user copy, and coach workflows.

## 1. Zero Employment Guarantees
- **Rule**: Never market or state "100% guaranteed employment" or promise hiring timelines.
- **Architecture**: Separate the 3 distinct promises:
  1. **Delivery**: Coaching curriculum, live weekly sessions, and assignment feedback delivered per syllabus.
  2. **Readiness**: Coach-reviewed qualification checklist (evidence-based assessment, not a maritime credential).
  3. **Employment Support**: Defined 90-day post-training search mentorship and SLA.

## 2. Payments Gated Under South African Law
- **Rule**: South Africa's Employment Services Act (ESA) section 15 restricts charging work-seekers for placement or employment services. The business charging model is currently under formal legal review.
- **Architecture**: The payment module is **strictly feature-flagged OFF (`payments_enabled: false`)**. The application runs in pilot/sponsored mode by default. Failed payments (when enabled in future) must NEVER delete qualification records or tamper with readiness history.

## 3. Versioned Requirements Engine (No Hardcoded Truths)
- **Rule**: Never hardcode course advice or maritime requirements as permanent truth. Never auto-reject non-ENG1 medical certificates (SAMSA accredited equivalents and flag-state mutual recognitions exist).
- **Classification**: Every course or certificate recommendation MUST be classified into one of:
  - `Required for this context`
  - `Employer preference`
  - `Useful development`
  - `Defer`
  - `Requires professional confirmation`
- Every requirement record stores: `source_authority`, `source_url`, `source_version`, `last_verified_date`, and `verified_by`.

## 4. Multi-Dimensional Readiness Matrix (No Vanity Single Percentages)
- Employability cannot be reduced to a single score (e.g. "87% ready").
- The platform evaluates across 7 discrete qualitative dimensions:
  1. **Training** (STCW, PB2, Food Safety, etc.)
  2. **Medical** (ENG1 / SAMSA accredited / valid sea medical)
  3. **Profile** (Structured CV, references, coach-reviewed bio)
  4. **Practical Skills** (Line handling, deck maintenance, silver service, wine knowledge)
  5. **Travel / Work Permissions** (Passport validity >= 6 months, Schengen B1/B2 feasibility)
  6. **Search Preparation** (Port selection, boat-walking etiquette, recruiter protocol)
  7. **Employment Outcome** (Offer review, contract verification, verified start)
- Allowed values: `Not started` · `In progress` · `Submitted` · `Coach approved` · `Verified`.

## 5. CV Data Integrity & Provenance Labels
- Every item on a member CV must carry one of four provenance labels:
  - `claimed`: Member entered it.
  - `uploaded`: Certificate / document file has been uploaded to storage.
  - `reviewed`: GYCS coach has inspected the document.
  - `verified`: Formally verified with issuing school, maritime authority, or employer.
- AI drafting assistance is strictly prohibited from fabricating certifications, dates, or references.

## 6. Privacy & Medical Protection (POPIA)
- Sensitive medical files and identity documents are stored in private buckets and NEVER transmitted to public AI models.
- Marketing consent is strictly decoupled from coaching programme participation.
