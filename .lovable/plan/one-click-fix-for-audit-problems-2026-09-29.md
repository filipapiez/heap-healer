# One-click "Fix" for audit problems

## What the customer sees
- Every row in **What to fix** gets a **Fix** button and a time estimate (for example "About 25 min").
- A **Fix all** button at the top shows the total estimate.
- After pressing Fix, the row shows **Fixing…**, then **Fix saved, checking site…**, then disappears once a fresh audit confirms it's gone. The score goes up by itself.
- If a fix can't be done automatically (for example "No Google Business Profile"), the row says **Needs you** with short steps instead of a Fix button. We never claim a fix that didn't happen.
- Fixes need a connected GitHub website. Without one, the button says **Connect GitHub to fix**.

## How fixing works
1. Each problem is matched to a fix type with its own time estimate:
   - Missing title / meta description / canonical / social preview tags: 10 min
   - No structured data (JSON-LD): 15 min
   - Missing or broken robots.txt / sitemap: 10 min
   - Missing FAQ page (AEO): 25 min
   - Missing alt text, headings, llms.txt and similar: 15-20 min
   - Anything unknown: AI-assisted fix, 25 min
2. We read the relevant files from the site's code, AI writes the change, and we check it's valid before saving.
3. The change is saved straight into the site's code, the same way daily pages are (Lovable sites still need Publish -> Update, shown with the existing yellow notice).
4. The live checker waits for the site to update, re-runs the audit, and marks the problem **Fixed** only when it's actually gone. If it's still there after a few checks, it's marked **Fix didn't take** in red.

## Technical details
- New table `seo_fix_jobs` (workspace_id, audit_run_id, issue text, category, fix_type, estimate_minutes, status queued/fixing/saved/verified/failed/needs_user, commit_sha, error, timestamps) with GRANTs + RLS for workspace members read-only; writes via server.
- `src/lib/seo-fix.ts`: pure issue -> fix_type + estimate classifier (shared with UI).
- `src/lib/seo-fix.server.ts`: per fix_type, uses `readRepositoryFile` / `commitRepositoryFiles` with the connection's stored framework config; AI via Lovable AI Gateway for content (JSON-LD, FAQ, meta copy); FAQ page reuses `renderPageFile` + route registration + sitemap upsert.
- `src/lib/seo-fix.functions.ts`: `startFix`, `startAllFixes`, `listFixJobs` (requireSupabaseAuth).
- Verification step added to `maintenance.server.ts` and triggered after a fix: re-run audit for the site, mark jobs verified/failed.
- `seo-audit.tsx`: Fix / Fix all buttons, estimates, per-row status.
