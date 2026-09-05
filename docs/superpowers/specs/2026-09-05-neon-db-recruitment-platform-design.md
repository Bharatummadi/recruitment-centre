# Aurelis Recruitment Center — Platform Design

**Date:** 2026-09-05
**Status:** Approved

## Overview

A clinical/research study recruitment platform built on Next.js + Neon (serverless Postgres). Public visitors browse studies and submit interest; an AI agent screens submissions and surfaces recommendations; admins review and approve/reject; approved participants access a personal portal.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Database | Neon (serverless Postgres) |
| ORM | Drizzle |
| Auth | NextAuth.js |
| AI Agent | Claude API |
| Deployment | Vercel |

---

## User Roles

| Role | Description |
|---|---|
| Public Visitor | Unauthenticated. Can browse studies and create an account to submit interest. |
| Participant | Authenticated. Has been approved for at least one study. Accesses `/portal`. |
| Admin | Authenticated. Manages studies, reviews submissions, approves/rejects candidates. |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Next.js App (App Router)            │
│                                                     │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────┐ │
│  │  Public Pages│  │ Participant    │  │  Admin   │ │
│  │  /           │  │ Portal /portal│  │ /admin   │ │
│  │  /studies    │  │               │  │          │ │
│  └──────────────┘  └───────────────┘  └──────────┘ │
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │         Server Actions + API Routes              ││
│  │  (data mutations, agent trigger, auth)           ││
│  └─────────────────────────────────────────────────┘│
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
   ┌─────▼──────┐         ┌──────▼──────┐
   │  Neon DB   │         │  Claude API │
   │ (Postgres) │         │ (Screening  │
   │  Drizzle   │         │   Agent)    │
   └────────────┘         └─────────────┘
```

---

## Data Model

### `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| email | text | unique |
| name | text | |
| role | enum | `participant`, `admin` |
| created_at | timestamp | |

### `studies`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| title | text | |
| slug | text | unique, used in URLs |
| description | text | full detail |
| summary | text | short blurb for cards |
| status | enum | `draft`, `active`, `closed` |
| eligibility_criteria | jsonb | structured criteria the agent reads |
| contact_email | text | |
| created_by | uuid | FK → users.id |
| created_at | timestamp | |
| updated_at | timestamp | |

### `interest_submissions`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| study_id | uuid | FK → studies.id |
| user_id | uuid | FK → users.id |
| answers | jsonb | participant form responses |
| status | enum | `pending`, `screened`, `approved`, `rejected`, `withdrawn` |
| submitted_at | timestamp | |

### `screening_results`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| submission_id | uuid | FK → interest_submissions.id |
| recommendation | enum | `eligible`, `ineligible`, `needs_review` |
| confidence | float | 0.0 – 1.0 |
| reasoning | text | shown to admin |
| screened_at | timestamp | |

### `enrollments`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| study_id | uuid | FK → studies.id |
| submission_id | uuid | FK → interest_submissions.id |
| enrolled_at | timestamp | |

---

## Page Routes

### Public (no auth)
| Route | Purpose |
|---|---|
| `/` | Landing page, featured studies |
| `/studies` | Browse all active studies |
| `/studies/[slug]` | Study detail + "Submit Interest" CTA |
| `/auth/signin` | Sign in |
| `/auth/signup` | Create account |

### Participant Portal (`role: participant`)
| Route | Purpose |
|---|---|
| `/portal` | My studies, enrollment status |
| `/portal/studies/[slug]` | Study detail, contact info, status |

### Admin Dashboard (`role: admin`)
| Route | Purpose |
|---|---|
| `/admin` | Metrics: consent rate, enrollment rate, eligible/ineligible counts |
| `/admin/studies` | All studies list |
| `/admin/studies/new` | Create study |
| `/admin/studies/[id]` | Edit study + view applicants |
| `/admin/submissions` | All interest submissions (filterable by status) |
| `/admin/submissions/[id]` | Review submission + AI recommendation + Approve/Reject |

**Route protection:** NextAuth middleware redirects unauthorized access. `/portal/*` → participants only. `/admin/*` → admins only.

---

## AI Screening Agent Flow

1. Participant submits interest form
2. Server Action creates `interest_submission` with status `pending`
3. API route `POST /api/agent/screen` is triggered asynchronously
4. Agent fetches `study.eligibility_criteria` + `submission.answers`
5. Claude API call returns `{ recommendation, confidence, reasoning }`
6. Result saved to `screening_results`; submission status updated to `screened`
7. Admin reviews submission at `/admin/submissions/[id]` with AI recommendation panel
8. Admin clicks Approve → creates `enrollment` record, sets `user.role = 'participant'`
9. Admin clicks Reject → submission status set to `rejected`

**Constraints:**
- Agent is read-only — never auto-approves
- If screening fails (API error), submission remains `pending` for manual admin review
- Agent can re-screen if eligibility criteria change

---

## Admin Dashboard Metrics

Derived from DB aggregates at query time:

- Total submissions per study
- Eligible / ineligible count
- Pending review count
- Enrollment rate (enrollments / approved submissions)
- Consent rate (placeholder for future consent tracking)
- Active participants per study

---

## Out of Scope (v1)

- Document uploads / consent form signing
- Appointment / visit scheduling
- Messaging between participant and team
- Multi-site support
- External system integrations (REDCap, Epic, CTMS)
