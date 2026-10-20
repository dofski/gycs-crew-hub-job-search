# GYCS Crew Hub — Architecture Plan

## Executive Overview
GYCS Crew Hub is the digital member platform for Green Yacht Crew Solutions (founded by Chad de Wet).
Unlike job boards or certificate mills (Yotspot, Bluewater), GYCS operates as a **supervised career pathway** from exploratory readiness to post-hire first-season retention.

## Core Architectural Boundaries
1. **Zero Employment Guarantees**: Delivery, Readiness, and Employment Support are maintained as separate contracts.
2. **Payment Inactivation (ESA s.15)**: Gated via `payments_enabled = false` until formal South African legal sign-off.
3. **Versioned Requirements Engine**: Never hardcodes advice as universal truth; accepts accredited seafarer medical equivalents.
4. **Readiness Matrix**: 7-dimensional evaluation rather than a pseudo-scientific percentage score.
5. **Private Vault & Non-Searchable Talent Directory**: Employers cannot browse sensitive candidate files or medical documents.
6. **Provenance Tracking**: CV fields and certificates carry explicit labels: `claimed`, `uploaded`, `reviewed`, `verified`.

## Database Schema Groups
- **Group 1: Identity & Governance**: `organisations`, `profiles`, `coach_assignments`, `consent_records`, `marketing_suppressions`, `access_logs`.
- **Group 2: Pathways & Requirements Engine**: `assessments`, `pathway_versions`, `requirements`, `milestones`, `journey_transitions`.
- **Group 3: Learning & Cohorts**: `programmes`, `cohorts`, `cohort_members`, `lessons`, `assignments`, `assignment_submissions`, `lesson_progress`, `live_sessions`, `session_attendance`, `session_questions`.
- **Group 4: Evidence & Storage**: `documents`, `credential_verifications`, `audit_events`, `data_export_requests`, `data_deletion_requests`.
- **Group 5: Career & Opportunities**: `cv_versions`, `employers`, `opportunities`, `applications`, `interviews`.
- **Group 6: Outcomes & Retention**: `offers`, `verified_starts`, `retention_checks`, `withdrawal_reasons`.
