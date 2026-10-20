# GYCS Crew Hub — Feature Flags

Every external dependency, restricted legal pathway, or non-ready capability is controlled by runtime feature flags.

| Flag Key | Default | Rationale & Status |
|---|---|---|
| `payments_enabled` | `false` | **Disabled pending legal review** under South Africa Employment Services Act s.15. Zero checkout active. |
| `ai_cv_assist` | `false` | AI-assisted wording suggestions; disabled until strict anti-fabrication prompt filters and privacy approvals are complete. |
| `ai_lesson_search` | `false` | Semantic embeddings-based lesson search. Requires vector pipeline setup. |
| `ai_summarisation` | `false` | Audio/transcript session summarisation. Requires recording pipeline & consent compliance. |
| `cloudflare_stream` | `false` | Signed video playback on Cloudflare Stream. |
| `employer_portal` | `false` | Self-service employer candidate browsing. Gated to protect crew privacy; opportunities currently coach-curated. |
| `ghl_sync` | `false` | Downstream sync to GoHighLevel CRM. Only consented marketing records sync. |
| `map_directory` | `false` | MapLibre interactive directory; requires licensed tile provider (Mapbox / Protomaps). |
| `engineering_department` | `false` | Requires certified marine engineering coach specialist. |
| `galley_department` | `false` | Requires certified yacht chef coach specialist. |
