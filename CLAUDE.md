# lisle-land

Lisle Abrahams' personal portfolio site. Next.js 16 + Sanity CMS.

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
- **Vercel project:** `lisle-land` under scope `ooo-8fbb30c6` (alison93290-3695)
- **Current production URL:** https://lisle-land-dwrs2k5wk-ooo-8fbb30c6.vercel.app
- **Intended domain:** lisle.land (registered via Vercel, but on a different Vercel account — needs to be attached manually, see below)

## What changed from the source repo

The fork is a clean trim, not a redesign. The portfolio chrome, scroll modules, and Sanity data shape are identical to `lisleandpool`. Differences:

- **Duck easter egg removed entirely.** Deleted `components/DuckCanvas.js`, the `app/api/proxy-model/` route (only consumed by the duck), the duck buttons and `ducks` state in `Portfolio.js`, the duck fetch in `app/page.tsx`, and the three.js / @react-three dependencies in `package.json`. No replacement easter egg.
- **Intro copy replaced.** New `actualIntroText` in `components/Portfolio.js` — short bio for Lisle as an AI-augmented creative director, no Pool-application framing.
- **Metadata + footer updated.** Page title, OG description, and footer copy now reference `lisle.land` instead of `pool.day`.
- **Package renamed** from `pool-portfolio-frontend` to `lisle-land`.

## Outstanding: attach lisle.land

The domain is registered through Vercel but sits on a different Vercel account than the one this project was deployed under. The CLI can't move it cross-account. To attach:

1. Open https://vercel.com/dashboard/domains under whichever account owns `lisle.land`.
2. Either:
   - **Transfer the project:** move the `lisle-land` Vercel project into the team that owns the domain, then run `vercel domains add lisle.land` again.
   - **Or transfer the domain:** move `lisle.land` into the `alison93290-3695` scope, then run `vercel domains add lisle.land`.
3. After it attaches, Vercel will auto-issue the TLS cert and the apex + www records will resolve.

## Commands

```bash
npm run dev    # local dev server
npm run build  # production build (verified passing 2026-05-15)
npm run lint
vercel --prod  # deploy
```
