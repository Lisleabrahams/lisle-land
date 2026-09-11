# lisle-land

Lisle Abrahams' personal portfolio site. Next.js 16 + Sanity CMS.

> **START HERE: read `CONTEXT.md` in this folder before doing anything.**
> Sessions can't see each other's chats, so `CONTEXT.md` carries the working
> context: Lisle's hard rules (use provided code verbatim; the loader video's
> no-crop law; never fetch `/for/<slug>` pages — they track views and ping
> Slack), the commit/push recipes that actually work from a Cowork session,
> and the current state of the loader, module system and video pipeline.
> When your changes make anything in `CONTEXT.md` stale, update it in the
> same commit.

## Origin

Cloned from [Lisleabrahams/lisleandpool](https://github.com/Lisleabrahams/lisleandpool) on 2026-05-15 and adapted into a personal site.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Sanity CMS — project `lmmr04bx`, dataset `production` (shared with the original `lisleandpool` repo; no schema changes)
- Tailwind CSS v4

## Environment

`.env.local` (gitignored):

```
NEXT_PUBLIC_SANITY_PROJECT_ID=lmmr04bx
NEXT_PUBLIC_SANITY_DATASET=production
```

The Sanity client (`lib/sanity.js`) currently uses hardcoded values; env vars are present for parity and future use.

## Deployment

- **GitHub repo:** https://github.com/Lisleabrahams/lisle-land
- **Vercel project:** `lisle-land` under scope `lisle-abrahams-projects` (Lisle's account, `fractalpdf-7657`)
- **Production URL:** https://lisle.land (also https://www.lisle.land)
- **Vercel preview URL:** https://lisle-land-lisle-abrahams-projects.vercel.app

Framework preset is `Next.js` (must be — the project was briefly created with framework `Other` when linked from the wrong directory, which produced a 404 on the custom domain because Vercel didn't know to serve from `.next/`; recreating the project from inside `lisle-land/` fixed it).

## What changed from the source repo

The fork is a clean trim, not a redesign. The portfolio chrome, scroll modules, and Sanity data shape are identical to `lisleandpool`. Differences:

- **Duck easter egg removed entirely.** Deleted `components/DuckCanvas.js`, the `app/api/proxy-model/` route (only consumed by the duck), the duck buttons and `ducks` state in `Portfolio.js`, the duck fetch in `app/page.tsx`, and the three.js / @react-three dependencies in `package.json`. No replacement easter egg.
- **Intro copy replaced.** New `actualIntroText` in `components/Portfolio.js` — short bio for Lisle as an AI-augmented creative director, no Pool-application framing.
- **Metadata + footer updated.** Page title, OG description, and footer copy now reference `lisle.land` instead of `pool.day`.
- **Package renamed** from `pool-portfolio-frontend` to `lisle-land`.

## Deploying

Push-to-deploy is wired up: any push to `main` auto-deploys to production on
Vercel (~90s build). No manual `vercel --prod` needed. Committing and pushing
from a Cowork session needs the plumbing recipe in `CONTEXT.md` (the device VM
blocks git's lockfile deletes, and porcelain `git commit` fatals).

After a deploy, Lisle's already-open tabs run the stale app — ask her to
hard-refresh (⌘⇧R) before treating a "broken" report as a bug.

## Commands

```bash
npm run dev    # local dev server
npm run build  # production build
npm run lint
```
