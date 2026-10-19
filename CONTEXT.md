# CONTEXT.md — read this first

Session context for Claude (Cowork/Code) working on lisle.land. Chats can't see
each other, so this file is the memory. **Read it fully before touching anything,
and update it (same commit) whenever you change something it describes.**
`CLAUDE.md` has the basic stack/deploy facts; this file has the operational
truth learned across sessions.

## What this is

Lisle Abrahams' portfolio site (lisle.land) + private job-application pages at
`/for/<slug>`. She is actively sending application links to companies — treat
production as live client-facing work. Next.js 16 (App Router) + Sanity
(project `lmmr04bx`, dataset `production`) + Vercel auto-deploy from GitHub
`main` (~90s build). The GitHub repo is public.

## Hard rules from Lisle (non-negotiable)

1. **Code she provides gets used verbatim.** If she hands over a repo, snippet,
   CodePen or library, integrate the exact source — never re-implement a
   lookalike. Fetch the real files; only change what integration strictly
   requires, and say so.
2. **THE NO-CROP LAW (loader video, both breakpoints):** the character video
   always renders its FULL natural 16:9 frame — the file's own edges must sit
   off-screen. Never reintroduce cover-crops, width caps, or edge-fade masks;
   she rejected all three, angrily. The file's background is pure white so its
   edges are invisible on the white page. That is the whole mechanism.
3. **NEVER fetch `lisle.land/for/<slug>` to verify anything.** Every GET
   increments the pitch's Sanity `views` counter and, at previousViews===0,
   fires a one-shot Slack ping she re-arms before sending links to prospects.
   Verify via the homepage bundle, or clone the repo and run `next dev` in an
   isolated environment (tracking fails without env tokens; never add real
   tokens to a local .env).
4. **After every deploy she must hard-refresh (⌘⇧R) her open tabs** — site and
   Studio. Most "it's broken" reports are the stale tab; check the deploy is
   READY on Vercel, then ask her to hard-reload before debugging.
5. One step at a time when walking her through anything; paste-ready text
   always; concise by default.

## How sessions work on this repo

Two copies exist during a session: the real repo on her Mac
(`~/Desktop/lisle-land`, mounted in the Cowork device VM at
`$HOME/mnt/lisle-land`) and a throwaway cloud clone for testing. **The device
repo is the source of truth — commit and push there.** Keep the cloud clone
synced with `git reset --hard origin/main` after pushing.

- **`git commit` fatals in the device VM** (file deletes are blocked, so git
  can't unlink lockfiles). Recipe: `mv` any `.git/index.lock` / `.git/HEAD.lock`
  into `_to_delete/`, `git add <files>`, then with
  `GIT_AUTHOR_NAME="Lisle Abrahams"` / `GIT_AUTHOR_EMAIL="lisleabrahams.creative@gmail.com"`
  (and the COMMITTER pair): `tree=$(git write-tree); c=$(git commit-tree $tree -p HEAD -m "msg"); git update-ref HEAD $c`.
  Afterwards `mv` leftover locks and `.git/objects/*/tmp_obj_*` into
  `_to_delete/` (untracked; Lisle can trash it).
- **Push:** `git push origin main` from the device VM (the remote URL carries a
  scoped PAT; on auth failure it expired — Lisle regenerates and re-runs
  `git remote set-url`). If the VM's network 403s github.com (it flaps), retry
  over a few minutes; the known-good fallback is committing the changed file
  through github.com's web editor in her Chrome (clipboard-paste into the edit
  page — ask her first), then syncing both repos to the web commit by
  recreating the raw commit object (`git cat-file commit` → base64 →
  `git hash-object -t commit -w` → `git update-ref`).
- Transferring text files cloud↔device: base64 + heredoc decode, or a git patch
  applied with `git apply`. Never retype file contents from tool output.
- **Patch surgically.** Other sessions (and Lisle) also commit; never overwrite
  a whole file from a stale copy. Always work from the current `origin/main`.
- Sanity content is writable via the HTTP API with the Editor token stored in
  the device repo's local git config (`git config --local sanity.token`). When
  patching published docs, patch `drafts.<id>` too if a draft exists, or a
  Studio publish reverts the change. The Sanity MCP connector points at the
  wrong org — use the HTTP API.
- Cloud-side Playwright: `npm i playwright-core`, executablePath
  `/opt/pw-browsers/chromium`. That Chromium can't decode h264 and can't load
  cdn.sanity.io — verify DOM/computed styles, not video visuals.

## The character loader (components/CharacterLoader.js)

Global: mounted on the homepage (via `SiteChrome`, title "Lisle Abrahams
Creative Selection") and on every `/for/<slug>` page (title =
`pitch.loaderCopy` from Sanity, fallback "<Client> X Lisle Abrahams"). New
applications need zero code changes — Lisle sets Loader copy in Studio.

Asset: `/public/loader/character-white-boomerang.mp4` — h264 1440p, 8s baked
boomerang (4s forward + reversed, loops seamlessly), pure-white background,
plays in all browsers including Safari.

Geometry (all values obey the no-crop law):

- Desktop: 179.82vh × 101.15vh, `maxWidth:'none'` (Tailwind preflight caps
  `video` at 100% width and silently squashes vh-based widths — the override is
  load-bearing), hero left `-47.6vh` (face ~11vh from the edge), docked left
  `calc(74.8vw - 47.6vh)`, docked blur 34px.
- Mobile NO LONGER PLAYS THE VIDEO (since 15 Oct, Lisle-approved from a
  screengrab): the head's sway makes the character 2.19× the width of a phone
  screen at the smallest no-cut video size, so the face can never stay framed
  — every shrink/shift attempt failed (top-cut flagged 11+16 Sep, face cut
  flagged 15 Oct). Mobile now always renders the static still at the Figma
  IPHONE EDIT crop (see the Low Power Mode bullet below — same geometry, now
  the default, title 13px). The video is DESKTOP-ONLY. Do not remount the
  video on mobile unless Lisle supplies a re-rendered file with the head
  inside a portrait safe zone; the old mobile video geometry (181.4vh ×
  102vh, top -1vh, char centre 58vw, both file edges off-screen) is what
  you'd start from. Mobile keeps `transition:'none'` except the fade-out
  opacity — the desktop dock `left` transition otherwise tweens the mobile
  position during hydration (SSR renders desktop geometry first).
- The mobile still composition (originally the Low Power Mode fallback, the
  mobile DEFAULT since 15 Oct): `/loader/character-static.png` (transparent
  PNG, trimmed 735×1205) renders instead of any video. Its crop follows Figma 2405:876 "IPHONE EDIT": top 22.89vh, height
  96.7vh (width auto + `maxWidth:'none'` — preflight trap), left
  `calc(71.24vw - 29.48vh)`; the figure bleeds off the right and bottom. The
  6.5s safety timeout then fades the loader as usual. Desktop never swaps
  (width-guarded). NOTE: the loader VIDEO cannot be scaled down to that guide
  — the character's antennas are clipped by the video file's own top edge
  (verified: char bbox touches y=0 in every frame), so its top edge must stay
  off-screen or the flat-cut antennas reappear; matching the guide needs a
  re-rendered video with headroom.

Architecture that matters: the `<video>` is a BARE fixed element at root — any
wrapper div creates a stacking context that breaks `mix-blend-mode: multiply`
and paints the white background as an opaque box. White curtain = separate
fixed div at z 99997 above content; video z 99998 during the show, z -1 once
docked; title z 99999. `Portfolio.js`'s main container renders white as
`rgba(255,255,255,0)` and the parallax/horizontal-scroll module containers are
transparent so the docked character shows through (a picked colour paints
opaque over it). Dark mode is disabled site-wide in `globals.css` — the white
body canvas is load-bearing for the z -1 video; do not re-enable it.

Choreography: scroll-locked hero → dock when `currentTime >= duration/2`
(forward pass of the boomerang) + 350ms beat, 6.5s safety timeout → one
continuous 1.4s slide, blur ramping in, curtain fading beneath → z -1 at slide
end, playbackRate 0.85, looping. Docked hover (mousemove hit-test, character
region only, ≥29% of frame width) sharpens to blur 0 over 600ms. Mobile fades
out instead of docking. prefers-reduced-motion docks instantly. No
repeat-visitor fast path.

## Module system (Portfolio.js + Sanity schema)

- Parallax intensity: shared curve — linear ≤5 (5 = 1×), quadratic above
  (10 = 4×, 20 = 16×), sign preserved for reverse. Existing content values were
  remapped in Sanity when the curve landed; don't remap again.
- Parallax module: Desktop/Mobile fieldsets; mobile combined slots
  `backgroundMobile`/`foregroundMobile` (image or video by mimeType) +
  `mobileLayerGap` (% gap between the two arts; negative overlaps; blank =
  classic overlay). Legacy mobile fields hidden but still render as fallbacks.
- Both GROQ projections (`lib/pitch.js`, `app/page.tsx`) spread `...` so new
  scalar fields flow automatically; only asset derefs need explicit lines.
  Pitch pages render through the same `Portfolio.js` as the homepage.
- PER-PAGE MODULE VISIBILITY — "Hide on pages" (since 19 Oct, replaced the
  pitchOnly/fork system Lisle found too complex; pitchOnly and the fork
  document actions are REMOVED). Every module type carries a `hideOnPages`
  field (array of pitchPage references, shared def in
  sanity/schemaTypes/objects/hideOnPages.ts): add an application page there
  and that module disappears on that page ONLY — the main site and every
  other page keep it. Enforced server-side in lib/pitch.js getPitchPage
  (media filtered where hideOnPages contains pitch._id); the homepage never
  filters. This is how "edit a project's modules for one page" works — no
  duplicating documents. NOTE: deleting a module in the Studio is still a
  GLOBAL edit; the per-page tool is hiding, not deleting. First use:
  the five "gaming" modules of Highsnobiety MISC are hidden on the On page
  (pitch 29585108-f9c8-4782-b2e6-f134be66c6bb). When verifying, dev-mode
  payloads contain Next debug copies of unfiltered data — test against
  `next build && next start`, never trust dev-server HTML grep.
- Also present: spacer appliesTo + mobile scale, opt-in negativeSpacer mobile
  pull, per-media parallax and L/C/R position, horizontalImage mobile slide,
  fluid-type Next Project link, colour-picker bg triggers, oversized inverted
  cursor (off in /studio), MediaProtection right-click/drag blocking (off in
  /studio).
- Video modules with mobileFullHeight (since 20 Oct, the Marshall fix): a
  DEDICATED mobile video renders its full natural frame at 100vw, uncropped —
  portrait phone exports must never be letterboxed into the 70vh cover box.
  Only the desktop-video fallback (no mobileVideo set) keeps the 70vh cover
  crop (intended full-bleed look, e.g. Highsnobiety).

## Video pipeline (for new loader/portfolio footage)

ComfyUI Desktop on her Mac (graphs saved): bg-removal (RembgByBiRefNet →
Video Combine, ProRes profile MUST be 4444 or alpha silently drops) and
upscale (Load Upscale Model `RealESRGAN_x2plus.pth` in
`~/ComfyUI-Shared/models/upscale_models` → Upscale Image (using Model) → Video
Combine h264, frame_rate matching source). Output lands in
`~/ComfyUI-Shared/output`. Greyish AI "white" backgrounds: measure corner luma,
snap with ffmpeg `colorlevels` (rimax≈0.81) and verify pure 255. Boomerang:
ffmpeg split + reverse + concat — the file ends on its first frame so
`loop=true` is seamless. Fiddly Comfy widget changes: hand to Lisle rather than
fighting remote clicks.

## Standing offers / loose ends

- Reset a pitch's Views to 0 (Sanity API) before she sends its link, so the
  first-view Slack ping re-arms — she asks per application.
- Loader video assets could be CMS-ified as Sanity fields (currently hardcoded
  paths in `app/for/[slug]/page.tsx` LOADER_ASSETS and `SiteChrome.js`).
