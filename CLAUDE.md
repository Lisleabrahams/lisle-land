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

## Connecting GitHub for push-to-deploy

The Vercel CLI returned `Failed to link Lisleabrahams/lisle-land. You need to add a Login Connection to your GitHub account first.` when trying to wire the repo to the Vercel project. To enable auto-deploy on push to `main`:

1. Open https://vercel.com/account/login-connections (logged in as the Vercel account that owns `lisle-abrahams-projects`).
2. Add the GitHub login connection for the `Lisleabrahams` GitHub account.
3. In the Vercel project → Settings → Git → connect the `Lisleabrahams/lisle-land` repo.

Until that's done, deploys are manual via `vercel --prod`.

## Commands

```bash
npm run dev    # local dev server
npm run build  # production build (verified passing 2026-05-15)
npm run lint
vercel --prod  # deploy
```
