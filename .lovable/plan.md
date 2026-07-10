
# SocialFlow — port to Lovable Cloud + TanStack Start

Rebuild the app you designed for Next.js on this project's actual stack. The product concept, screens, and Zernio integration stay identical. The plumbing changes.

## What changes and why

| Original | Replacement | Reason |
|---|---|---|
| Next.js App Router + `"use client"` | TanStack Start file routes in `src/routes/` | This project's framework |
| NextAuth (Google) | Lovable Cloud auth: email/password + Google | Native to this stack; no external accounts |
| Prisma + self-hosted Postgres | Supabase Postgres via migrations, `has_role`, RLS | Managed DB with row-level security |
| S3 + presigned PUT | Supabase Storage (`media` private bucket) | Native to this stack |
| Redis + BullMQ worker | Supabase cron + `createServerFn` publish job | No persistent processes on Cloudflare Workers |
| FFmpeg via `child_process` | Deferred (see "Watermark rendering" below) | `child_process` doesn't work in the Worker runtime |
| Next `route.ts` API handlers | `createServerFn` (app-internal) + `/api/public/zernio` (webhook) | Native TSS pattern |

## Watermark rendering — decision needed after slice 1

FFmpeg cannot run in this project's server runtime. Three options — I'll ask which one you want before slice 3:

- **A. External render worker** you host (a small Fly.io / Railway container) that this app calls over HTTPS. Keeps the exact FFmpeg pipeline. Requires a second deploy target.
- **B. Skip burn-in watermark**, publish the original video as-is. Ship faster; loses the watermarking feature.
- **C. Zernio-side overlay** if their API supports a logo/watermark parameter — I'll check their docs during slice 2. If yes, no separate service needed.

## Delivery slices

Each slice ends with a working, testable app. I'll pause between slices for you to click through the preview.

**Slice 1 — Foundation** (this slice, no confirmation needed)
- Enable Lovable Cloud
- Auth: email/password + Google, `/auth` public route, `_authenticated` gate, sign-out
- Schema + RLS: `workspaces`, `workspace_members` (with `role` enum), `user_roles` (app-level admin), `has_role()` SECURITY DEFINER, `current_workspace` per-user pointer
- `WorkspaceSwitcher` + `/api/workspaces` server fns
- Dashboard shell: sidebar nav, all 8 routes as stubs, design tokens (`mist`, `ink`, `signal`, Sora + Inter) wired into `styles.css`
- `Overview` page shows real workspace name and empty-state copy

**Slice 2 — Zernio connect + accounts**
- Secrets: `ZERNIO_SECRET_KEY`, `ZERNIO_WEBHOOK_SECRET` (I'll request via `add_secret` once slice 1 lands; demo/mock mode works without them)
- `connected_accounts` table + RLS
- Provider adapter (real + mock), capability list per platform
- `/accounts` page: `ConnectPanel`, OAuth start server fns per platform, Bluesky credentials modal, sync + disconnect
- `/api/public/zernio` webhook route with HMAC verify + `account.connected` / `account.disconnected` handling

**Slice 3 — Compose + publish**
- `media_assets` table, `media` private Storage bucket, signed URL helpers
- `/media` library page
- `posts` + `post_targets` + `publish_attempts` tables
- `PostComposer` 3-step wizard (media/watermark/compose/review) — watermark UI conditional on chosen render path from decision above
- `/api/posts` + `/api/posts/:id/publish` server fns, per-platform validation
- Publish path calls Zernio directly for immediate publishes
- `/scheduled`, `/history`, `/history/:id` pages
- Webhook handles `post.published`, `post.partial`, `post.failed`, `post.cancelled`

**Slice 4 — Engagement + polish**
- `/engagement` dashboard: overview metrics, comments threads with reply, DM inbox (read-only)
- `/settings`, `/admin` config-status page
- Scheduled publishing via Supabase cron hitting a server fn (or drop scheduling if cron isn't practical — we'll decide)
- SEO metadata per route, error/notfound components everywhere

## Technical notes

- Server fns live in `src/lib/*.functions.ts`. Zernio + admin helpers in `*.server.ts`. Handlers read `process.env.*` inside `.handler()` only.
- Roles: workspace-scoped role on `workspace_members` for owner/admin/member; separate `user_roles` for app-level admin (per platform rules). Admin page uses `has_role`.
- `role` and workspace context resolved per request via a `requireWorkspace` server-fn middleware that reads the `current_workspace_id` off the auth user's row and checks membership.
- Storage: `media` bucket private, signed download URLs, direct upload via `supabase.storage.from('media').upload(...)` from the browser after a server fn issues a signed upload URL.
- No `.env` for secrets — I'll use `add_secret` / `generate_secret` when we reach the pieces that need them.

## What ships at the end

Same product you spec'd: multi-brand workspaces, connect 11 platforms via Zernio (or demo mode), compose once and publish everywhere, per-platform overrides, scheduling, unified engagement dashboard — running on this stack with no external Node host required (except optionally the FFmpeg worker if you pick option A).

## Confirm to start

Reply "go" and I'll ship slice 1. When it's up, I'll ask about the watermark render decision before starting slice 3.
