
# Operations Dashboard build plan

A protected `/ops-dashboard` route with three role-based experiences: department member (submission form), Operations Manager (full org view + funnel + issues log), and CEO (read-only executive summary).

## 1. Database

Extend `profiles` and add three tables (all with RLS + explicit GRANTs). Roles live on `profiles.department_role` — separate from the existing `user_roles.role` (which stays as the coarse `admin/team/user` gate used by `useUserRole`).

- `profiles.department_role` — enum: `ceo | ops_manager | marketing | curriculum | digital_services | finance | tech` (nullable — most users have none)
- `profiles.department` — text, mirrors the department for convenience
- `weekly_reports` — one row per (department, week_starting)
  - `department`, `submitted_by`, `week_starting` (date, Monday), `submitted_at`, `kpi_data` (jsonb), `notes`, `attachment_url`, `attachment_name`, `status` (green/amber/red)
  - unique(department, week_starting)
- `kpi_targets` — hardcoded seed rows per department/kpi (thresholds for traffic-light calc, editable later)
- `issues` — `title`, `description`, `assigned_department`, `priority` (high/medium/low), `created_by`, `resolved_at`

RLS:
- `weekly_reports`: any team member (has role admin/team) can read; a user can only insert/update their own department's rows for the current week
- `issues`: team members read; ops_manager + admin write/resolve
- `profiles.department_role`: only admin can change

Storage bucket `ops-attachments` (private) with folder policy `department/YYYY-Wnn/filename`, 10 MB, PDF/DOCX/JPG/PNG. Signed URLs used for downloads.

## 2. Edge function

`calculate-report-status` — invoked from the client after insert:
- Loads `kpi_targets` for that department, compares each numeric KPI, returns `green | amber | red` per the rules (Tech uses worst of its 4 status fields)
- Writes `status` back onto the `weekly_reports` row using the service role

## 3. Access control

- New hook `useDepartmentRole()` returns `{ departmentRole, department, loading }` from `profiles`
- `<OpsDashboardRoute>` guard: if not authenticated → `/auth`; if authenticated but no `department_role` → redirect `/journey`
- Renders one of three views based on role

## 4. UI structure

```
src/pages/OpsDashboard.tsx           # role router + shell (navy sidebar, cream bg)
src/components/ops/
  WeekSelector.tsx                   # week dropdown, default = current EAT week
  TrafficLight.tsx                   # coloured dot
  DepartmentBadge.tsx                # colour token per department
  AttachmentUpload.tsx               # 10 MB, format-guarded, uploads to bucket
  SubmissionClosedNotice.tsx         # after Fri 5pm EAT
  forms/
    MarketingForm.tsx
    CurriculumForm.tsx
    DigitalServicesForm.tsx
    FinanceForm.tsx
    TechForm.tsx
    OpsManagerForm.tsx               # auto-fills from Marketing/Curriculum/Finance
  views/
    DepartmentMemberView.tsx         # form + own 4-week sparklines + 6-dot org health
    OpsManagerView.tsx               # all forms, funnel, issues log
    CeoView.tsx                      # 6 metric cards, briefing note, per-dept rows, doc library
  IssuesLog.tsx                      # add / resolve issues
  PipelineFunnel.tsx                 # vertical funnel (SVG)
  Sparkline.tsx                      # small trend charts
src/lib/ops/
  departments.ts                     # colour + label tokens, KPI metadata
  week.ts                            # EAT week helpers (Monday start, Fri 5pm lock)
```

All forms validated with zod. Colour tokens added to `index.css` and referenced via inline style (fixed brand colours per spec) — theme kept intact.

## 5. Build order

1. Migration (schema + GRANTs + RLS + seed `kpi_targets`)
2. Storage bucket + RLS policies on `storage.objects`
3. Edge function `calculate-report-status`
4. Types regen + `useDepartmentRole` + route guard
5. Shared UI primitives (colours, week helpers, upload, week selector)
6. Submission forms (all six)
7. CEO view
8. Ops Manager view (adds funnel + issues log)
9. Department Member view (adds sparklines)

## 6. Deferred to a follow-up (need your confirmation)

- **User seeding** — you asked for "7 user accounts" pre-created. I can create the `profiles.department_role` slots + admin UI to assign roles, but I won't auto-create real auth users with passwords. You'll assign roles by editing `profiles.department_role` once each user signs up. Confirm if you'd rather I generate 7 magic-link invitations from a specific list of emails instead.
- **Editable KPI targets admin UI** — spec says "can be updated in an admin settings table later"; I'll ship the table + seeded defaults but not the editor.
- **CEO metric-card historical drilldown** — the "View Full Report" modal is in; multi-week comparison isn't.

Shall I proceed with the plan above, and how would you like the 7 user accounts handled (option A: assign roles after they sign up themselves, option B: give me 7 email addresses and I wire magic-link invites)?
