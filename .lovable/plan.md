
# Directory Backlink Builder

Ship a system that queues 15 SaaS/startup directories per week, auto-submits to the ones with usable APIs/forms, and gives you a one-click "Open & submit" dashboard for the rest.

## What ships

**1. Seed directory list (~200 entries)**
- Curated JSON at `src/data/directories.ts` — name, URL, submit URL, category, tier, submission method (`api` | `form` | `email` | `manual`), auto-submit config, DA estimate.
- Categories: SaaS, AI tools, startup, launch platforms (Product Hunt-alikes), indie hackers, no-code, tools directories.

**2. Database (one migration)**
- `directories` — the catalog, seeded from the JSON on first run.
- `directory_submissions` — one row per (workspace, directory): status (`queued` | `auto_submitted` | `pending_action` | `submitted` | `live` | `rejected` | `skipped`), scheduled_for, submitted_at, live_url, notes.
- `directory_submission_queue_runs` — weekly cron log.
- All tables workspace-scoped, RLS, standard GRANTs.

**3. Weekly queue job**
- `pg_cron` → `POST /api/public/queue-directories` (Bearer `CRON_SECRET`) every Monday 9am UTC.
- Picks the top 15 unsubmitted directories per workspace (by tier, then DA), inserts `queued` rows.
- When seed list runs low (<30 unsubmitted remaining per workspace), flags the workspace so the UI shows a "refreshing seed list" banner and I add more manually. No AI discovery yet — you said "we're going to keep looking for new ones", so I'll drop new curated batches into `directories.ts` as we go. If you later want an AI discovery cron, we bolt it on.

**4. Auto-submit path**
- `src/lib/directory-submit.server.ts` handles the ~15-20% of directories with usable endpoints:
  - `api` — POST to their public submission API (e.g. some indie directories accept JSON).
  - `form` — server-side form POST with your workspace's saved profile (name, tagline, URL, logo, category, email).
  - Failures → mark `pending_action` so it falls back to the manual queue.
- Rate-limited per directory host.

**5. Workspace directory profile**
- New `workspace_directory_profile` row (name, tagline 60ch, description 160ch + long, logo URL, category, contact email, pricing model, launch date).
- Filled once, reused for every submission. Auto-submit fails without it.

**6. Dashboard: `/backlinks`**
- **This week** — 15 cards, each: directory name/logo, DA, status badge, primary action.
  - Auto-submitted → "View listing" link.
  - Pending action → "Open & submit" (opens submit URL in new tab, pre-fills clipboard with your profile fields, then a "Mark submitted" button).
  - Rejected → reason + retry.
- **All time** — filterable table with live_url, submitted_at, status.
- **Profile** — edit the shared submission profile.
- Counters roll up into the existing SEO Growth dashboard ("Backlinks in progress" / "Live").

**7. Semrush cross-check**
- Existing daily Semrush sync already pulls referring domains. Add a matcher: when a submitted directory's root domain appears in Semrush's referring domains list, auto-flip status to `live` and store the backlink URL.

## Cadence

15/week × ~200 seed = ~13 weeks of runway. I'll add curated batches (target: another 100 every 6-8 weeks) as we approach the tail. If you want continuous AI discovery instead, we swap the manual refresh for a discovery cron later — one file change.

## Not in this plan

- HARO/Qwoted responder (separate build if you want it).
- Broken-link outreach (separate build).
- Captcha solving for auto-submit (out of scope — those go to the manual queue).

Reply "go" and I'll ship it.
