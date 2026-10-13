# 10 — Pre-build: brand, logo, coming-soon page, 3D

**Where this sits:** this is the first milestone. Before it, read [00-index.md](00-index.md), [01-running-the-sessions.md](01-running-the-sessions.md) (how to run a Claude Code session) and [02-how-we-work.md](02-how-we-work.md) (the question-round habit). After it comes [11-wireframes.md](11-wireframes.md).

## Goal

By the end of this milestone you have, for the new app:

1. A **brand kit** written down as numbers: colours (hex codes), fonts (names and weights), the logo files, the tagline and the voice. Claude will read this file at the start of every later milestone.
2. A **coming-soon page** live on the real domain (one HTML file, no build step), so the client has something to look at and you have the first working GitHub → Vercel pipeline.
3. Optionally, a **3D asset viewer** (one HTML file) if the app will show 3D models, so the 3D pipeline (generate → compress → view) is proven before anyone designs screens around it.
4. Three habits established with Claude: the question round, "show locally first, push after I verify", and the token-handling rules.

Everything here is **static HTML**: a single file that opens by double-click and deploys to Vercel with no build. That is deliberate. It keeps the pre-build cheap and lets you and the client iterate on taste without any engineering.

> **Why a coming-soon page first?** It forces every service account (domain, GitHub, Vercel) to exist and work before the real app needs them, and it gives the client something public within a day. Assemble's first page went live on 9 Jul 2026, five days before the first wireframe existed.

## Prerequisites checklist

Tick every box before opening the Claude session. Details of each service (where to create, what scopes, how to verify) are in [03-services-setup.md](03-services-setup.md).

- [ ] A folder for the client: `D:\...\Clients\<client-folder>\` with sub-folders `coming soon page\`, `3D\` (optional), `Wireframes\`, `UI\`. The guide calls this `<CLIENT_FOLDER>`.
- [ ] The **domain** bought and its DNS pointed at Vercel (or at least the registrar login at hand).
- [ ] A **GitHub account that owns the client repos** (the guide calls it `<GITHUB_OWNER>`). Check which account the machine's `gh` CLI is logged into — in Assemble it was a different account with no access, which cost three failed pushes.
- [ ] A **Vercel account/team** connected to that GitHub account. Note the plan: on the Hobby plan, **private repos can only deploy commits authored by the Vercel-linked account**.
- [ ] A **GitHub personal access token** ready to create when Claude needs to push (fine-grained, one repo, Contents read/write, short expiry). Read the token rules in [20-security.md](20-security.md) first: pasted tokens are compromised by definition and must be rotated after the session.
- [ ] Brand inputs from the client, or a decision that Claude will propose them: logo concept files (PDF, PNG, SVG or a design-tool export), colour preferences, font preferences, the app name, a tagline.
- [ ] If 3D is part of the product: a **3D generation tool account** (Assemble used Tripo AI) and one generated `.glb` model to test with.
- [ ] Python 3 installed and reachable as `py` (Windows) with `pillow` installed — Claude uses it for favicons and slicing. Node 22 installed.
- [ ] A local git identity plan: commits in client repos are authored as the owner account (`<GITHUB_OWNER> <ID+username@users.noreply.github.com>`), never your personal identity, and never with any AI attribution line.

## Step 1 — Write the brand kit (or have Claude extract it)

Plain English: the brand kit is a short text file that every later Claude session reads first. It stops colours drifting from screen to screen.

1. Put every brand file the client gave you into `<CLIENT_FOLDER>\Brand\`. If the client gave you nothing, skip to the question round below and let Claude propose a direction.
2. Open a Claude Code session in `<CLIENT_FOLDER>\coming soon page\` (create the folder first).
3. Paste the block below. Claude reads the files (it can pull text out of a PDF with Python even when the PDF viewer is missing) and writes `BRAND.md`.
4. Read `BRAND.md` yourself. Check the hex codes against the client's files. Correct anything wrong in one sentence ("the accent is #8F6EF2, not #9070F0") — Claude will fix the file and remember.

> **For Claude — paste this:**
> ```
> Read every file in ".\Brand\" (PDFs, images, design exports). Extract the full brand system and write it to BRAND.md in this folder:
> - App name, tagline, one-paragraph voice description (tone, who it speaks to)
> - Colours: every hex code with a role (background, surface, ink, muted, accent 1, accent 2) and where each is allowed
> - Fonts: family, weights available, which one is for display, body, labels/data
> - Logo: describe the mark geometry in words (so it can be rebuilt in CSS/SVG), list the source files and which is the master
> - Motion: any signature animation implied by the logo (e.g. an orbiting ring)
> - Do's and don'ts you can infer (e.g. "accent only on calls-to-action")
> Do not invent values. Where the files disagree or something is missing, list it under "Open questions" and ask me before assuming.
> Save the key tokens (hex codes, fonts, tagline) to your memory so later sessions start with them.
> ```

If there are no brand files yet, run a question round instead:

> **For Claude — paste this:**
> ```
> We have no brand yet for [APP NAME], a [one-line description of the app] for [audience]. Propose a brand direction.
> Before we proceed, ask me at least 10 questions so you can fully understand what I'm trying to achieve. Ask the questions one at a time, and for each question, give me multiple-choice options to choose from (include a small preview of the values in each option, e.g. the hex palette). Clearly highlight the option you recommend and briefly explain why. Based on my answers, we'll discuss the trade-offs and make the decisions together rather than you making assumptions on my behalf.
> Cover: dark or light first, personality (three adjectives), one accent colour and one rare second accent, a display font and a data/label font pair (not Inter by default), logo idea, tagline, motion level.
> After the last answer write BRAND.md as above and save the tokens to memory.
> ```

**Why the "small preview in each option" line:** in Assemble, the coming-soon palette went through lime → cyan → orange → none over one night (10 Jul 2026, eight commits) because options were words, not swatches. Previews in the options shortened later rounds a lot.

> **Assemble example.** The brand arrived on 22 Jul 2026 as a design-tool zip ("Logo slide design"): the "Double Take" mark — a thin ExtraLight capital **A** with a 3D orbit ring carrying the word "assemble" twice plus dashed arcs; fonts Plus Jakarta Sans (display) and Space Grotesk (labels/data); palette navy `#0F111F`, surface `#1E222A`, purple `#8F6EF2`, ice cyan `#C9F2FF`, ink `#F4F8FC`, muted `#8B93A5`; tagline "Where everything coordinates". Claude saved these to memory on 22 Jul and the same tokens carried unchanged into the UI prototype (5 Aug), the production apps (28 Aug) and the landing page (13 Sep). The coming-soon page's `:root` CSS variables became the canonical source every later phase copied from.

## Step 2 — Create the repo and Vercel project for the coming-soon page

Plain English: you create an **empty** repository on GitHub and connect it to Vercel yourself (Claude has no login to either dashboard). Claude then pushes the page into it and Vercel publishes it automatically on every push.

1. On GitHub, as `<GITHUB_OWNER>`, create a new repository, e.g. `<app>-coming-soon-page`. Leave it **empty** (no README, no .gitignore, no licence) so the first push lands cleanly. Public is fine for a coming-soon page; use private for anything containing a real person's likeness.
2. In Vercel: Add New → Project → import that repo. Framework preset **Other**, no build command, output directory `.` (a static site). Deploy once (it will 404 until `index.html` exists — that is fine).
3. In Vercel → Project → Settings → Domains, add the domain (apex and `www`). Set the DNS records the dashboard shows at your registrar (apex A record to Vercel's IP; `www` CNAME to `cname.vercel-dns.com`). Propagation takes minutes.
4. Create a GitHub token for the push: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained → only this repository → Contents: read and write → expiry 7 days. Copy it once. (Where it goes is Step 3.)
5. Decide the commit author for this repo: the owner account's noreply address, or an agency identity such as `<AGENCY>-Dev <<AGENCY>-Dev@users.noreply.github.com>` if the client should see the agency name in the history. **No AI attribution lines, ever.**

## Step 3 — Build and deploy the coming-soon page

Plain English: Claude writes one `index.html`, you look at it locally, then Claude pushes it. Your job is taste; Claude's job is code and verification.

1. Paste the build block below. If you have a design-tool export, attach it with `@"path"`; Claude will rebuild it cleanly rather than patch a minified export (patching one-line exports was error-prone in Assemble).
2. Claude starts a tiny local server and gives you `http://127.0.0.1:<port>/`. Open it on desktop **and** on your phone (same Wi-Fi: use the machine's LAN IP, or ask Claude for a screenshot at 390 px). Check: wordmark on one line, nothing overlapping the bottom ticker, motion visible, reduced-motion still shows the brand.
3. Say what you don't like in one sentence each ("too much lime", "make the mark bigger", "nothing flashy"). Claude edits, you refresh with the cache-buster `?v=2`, `?v=3`… (the in-app browser and phones cache aggressively).
4. When you are happy: "push". Claude pushes with the token **inline in the push URL only**, checks `.git/config` holds no token, reminds you to rotate it, and tells you which commit is live. Check Vercel → Deployments shows that commit as Ready, then hard-refresh the live domain.
5. Rotate (delete) the token when the session ends.

> **For Claude — paste this:**
> ```
> Build the coming-soon page for [APP NAME] as ONE self-contained index.html in this folder (no build step, no framework, fonts from Google Fonts only, everything else inline).
> Inputs: BRAND.md in this folder [and @"path to design export" if any — rebuild it cleanly, do not patch the minified export].
> Requirements:
> - Hero: the logo mark [animated: describe, e.g. orbit ring spinning ~14s] and the wordmark, tagline under it, "Coming soon" line. Wordmark must stay on ONE line down to 360px wide.
> - [Dark / light / both with a toggle] — brand tokens as CSS variables in :root.
> - Ambient background from the brand (e.g. drifting gradient blobs + grain + vignette) but restrained: "premium, nothing flashy".
> - A bottom marquee ticker with the tagline, GPU-composited (will-change: transform).
> - prefers-reduced-motion: keep the brand-defining motion (logo ring), calm only ambient drift — my devices have reduced motion ON and a frozen page looks broken.
> - Size the mark by viewport height as well as width; reserve clearance above the ticker; handle short landscape viewports.
> - Favicon: resize my exact artwork [path] to 256×256 with Pillow (never hand-write base64) and link it.
> - Optional: a dev-credit easter egg — hovering a small ◵ mark bottom-left shows "developed by [AGENCY]", clicking opens a full-screen overlay; Esc / click outside closes it; keyboard accessible.
> Process:
> 1. Serve it locally (py -m http.server <port> --bind 127.0.0.1) and give me the URL. Do NOT push until I say "push".
> 2. Verify yourself before showing me: no horizontal overflow at 360/390/768/1440 and a 1000×600 landscape; computed transform of the mark is not "none" (an invalid calc() drops the whole transform); animations report playState running; console clean; reduced-motion on and off.
> 3. When I say "push": commit as [AUTHOR NAME <noreply email>], one clean commit message, no AI attribution anywhere. Push with the token inline in the URL only, never -u, never into .git/config; redact the token from any output; check git config afterwards; then remind me to revoke the token.
> 4. Tell me the live commit hash and how to confirm Vercel shows it as Ready.
> ```

> **Assemble example.** 9 Jul 2026, 23:15: the first version was a design-tool export pushed to the pre-connected public repo; the first push was denied (403) because the machine's `gh` account was not the owner, and succeeded only with an owner token pasted at 23:23. Vercel deployed within a minute. The same night: wordmark wrapped on a 390 px phone (fixed with `13.5vw`, tighter letter-spacing and `white-space: nowrap`), the marquee stuttered (fixed with `will-change: transform` + `backface-visibility: hidden`), the custom cursor was removed, and the palette was tried four ways. On 22 Jul the page was rebuilt from the real logo handoff: light and dark first, then "delete light, keep dark" within the same minute — Claude followed the latest instruction and squashed to one clean commit `cf95c35` authored by the agency identity with no README, as asked. A CSS bug found only by reading the computed style: `scale(calc(var(--size)/640))` divides a length by a number, which is invalid, so the mark rendered unscaled and overlapped the wordmark; the fix was `/640px`. A later "premium look" refinement (22 Jul 05:12) was planned in plan mode, built, shown locally and **never pushed**, because the session ended without a decision — see Pitfalls.

## Step 4 — Optional: prove the 3D pipeline with a one-file viewer

Skip this step if the app has no 3D. If it does, doing it now answers three questions before any screen is designed: how heavy are the files, how do they look outside the generator's own viewer, and what does compression do to them.

Plain English: you generate one model in the 3D tool, Claude builds a viewer page around it, and together you settle the "look" (lighting, background, matte vs shiny) that the real app will copy later.

1. Generate one model in the 3D tool (Assemble: Tripo AI, image-to-3D from photos). Save the `.glb` into `<CLIENT_FOLDER>\3D\`. Take a screenshot of how it looks in the tool's viewer — Claude will match that look.
2. Create an **empty private** GitHub repo for it (private: it is a real person's likeness). Connect it to Vercel as in Step 2.
3. Paste the block below in a session opened in `<CLIENT_FOLDER>\3D\`.
4. Look at it locally. Typical taste corrections from Assemble, in the words that worked: "no shadows", "it looks better on Tripo with their dark bg, check screenshot", "why is it shining?", "still too shiny", "make it look brighter".
5. Ask Claude to **Draco-compress** the model before pushing (Assemble's 56 MB file became 5.9 MB, the same look, loads in seconds on a phone). Push only the compressed copy if the repo is public; keep originals out of git.

> **For Claude — paste this:**
> ```
> Be a product designer. I have [N] 3D model(s) in this folder (.glb from [TOOL]) and a screenshot of how they look in the tool's own viewer [path]. Build a single self-contained index.html viewer (Three.js from a CDN, pinned version; GLTFLoader + DRACOLoader; OrbitControls).
> First inspect the .glb read-only (parse the GLB header + JSON chunk: mesh/material/texture/animation counts) and tell me what is in it. Ask me the questions that change what you build (categories? showcase vs configurator?) — one at a time, multiple choice, recommended option marked.
> Requirements: auto-centre and auto-fit the camera (no manual field-of-view); dark studio radial backdrop matching the screenshot with a CSS fallback colour so there is no flash; hemisphere + key/fill/rim lights, no cast shadows; MATTE material (roughness 1, metalness 0 — keep the model's normal/AO maps, do not swap to a material that discards them); ACES tone mapping with exposure ~1.8; a CATEGORIES config block at the top of the script so new models need no code changes; "Coming soon" state when a listed file is missing; loading progress; auto-rotate, reset and fullscreen buttons; only one WebGL context at a time.
> Compress the model with Draco (npx @gltf-transform/cli draco in.glb out.glb) and load the compressed copy; report sizes before/after. If texture compression fails on this machine, skip it — geometry-only is fine.
> Serve locally, verify (loads, triangle count, no console errors, mobile 390px layout, control buttons don't collide at narrow widths), and wait for my feedback before pushing. Same push rules as the coming-soon page. Add a README with run instructions and a .gitignore that excludes .claude/, reference screenshots and any uncompressed originals.
> ```

> **Assemble example.** 25 Jul 2026, 20:10–22:47 (one session, 2h37m, three commits). Claude read the 56 MB GLB header with a PowerShell BinaryReader (1 mesh, 1 material, 3 textures, 1.9 M triangles, no animation), built the viewer with Three.js r160, and went through: lights removed then restored; white/green-screen backgrounds added then removed; PBR material swapped for a purely diffuse material to kill the shine (later, in production, the matte look was redone with `MeshStandardMaterial` roughness 1 / metalness 0 so the 4K normal and AO maps survived — the diffuse swap had thrown them away); exposure raised 1.15 → 1.8. The ~108 MB push needed `git config http.postBuffer 524288000`. Vercel then **blocked the deploy**: the commit author was the machine's personal identity, and the Hobby plan does not allow non-collaborator authors on private repos. Fix: look up the owner's numeric GitHub ID, set the repo-local identity to `<ID>+<owner>@users.noreply.github.com`, `git commit --amend --reset-author`, force-push. The 3D lighting rig and matte decision made here were ported verbatim into the UI prototype (5 Aug) and the production app (28 Aug).

## Step 5 — Close the milestone

- [ ] `BRAND.md` exists and is correct; tokens saved to Claude's memory.
- [ ] Coming-soon page live on the domain; Vercel shows the latest commit as Ready; hard-refresh on a phone shows it.
- [ ] `.git/config` in every repo contains no token; every token used this milestone is revoked.
- [ ] Repo-local git identity set in every client repo (`git config user.name` / `user.email`), so the Vercel author check never blocks again.
- [ ] If 3D: compressed model in the repo, original kept outside git, the "look" (lighting/backdrop/matte) written into `BRAND.md` under "3D look".
- [ ] Ask Claude for a two-line "state of the folder" and check `git status` is clean. Anything uncommitted is either committed or deliberately discarded — do not leave it hanging.
- [ ] Take a screenshot of the live page for the client; send with one sentence.

> **For Claude — paste this (end of session):**
> ```
> End of session checklist: run git status in each repo here and list anything uncommitted or unpushed; confirm no token is stored in any .git/config or file; list which tokens I pasted this session so I can revoke them; update your memory with the brand tokens, the live URL, the repo names and the commit author rule for each repo. Stop any local servers you started unless I said to keep one running.
> ```

## Pitfalls (pre-build)

| Symptom | Cause | Fix |
|---|---|---|
| `git push` denied (403) "Permission to … denied to <account>" | The machine's `gh` login is not the repo owner or a collaborator | Use an owner-account token inline for one push; before starting, `gh auth status` and `gh api repos/<owner>/<repo> --jq .permissions` |
| "Repository not found" (404) on push | Token belongs to a different account than the URL, or the repo does not exist yet | Create the empty repo on the owner account; check which account the token authenticates as (`curl -H "Authorization: Bearer <GITHUB_PAT>" https://api.github.com/user`) |
| "Invalid username or token" days later | You rotated the token (correctly) | Commit locally, create a fresh token; Claude should curl-check any token before a push |
| Vercel: "deployment was blocked because the commit author did not have contributing access" | Commit authored by the global personal git identity; Hobby plan + private repo | Set the repo-local identity to the owner's noreply address, `git commit --amend --reset-author`, force-push with lease; set the identity right after `git init` next time |
| Vercel 404 NOT_FOUND on a static site | No `index.html` at the repo root (main file had spaces in its name) | Add a root `index.html` (or a 10-line redirect page pointing at the real file) |
| "You forgot to change it" — the fix is not visible | Vercel still building, or the browser/in-app pane served cached HTML | Check Deployments for the commit; hard refresh / private window; cache-buster `?v=N`; no-cache meta tags on prototype pages; ask Claude to grep the live HTML for a marker only present in the new commit |
| Logo mark invisible or unscaled | `scale(calc(var(--size)/640))` divides a length by a number — invalid CSS, the whole transform is dropped | Use `/640px`, or an explicit unitless `--scale` variable; verify with the computed `transform` (not `none`) |
| Everything looks frozen on the client's phone | `prefers-reduced-motion` is on and the reduced-motion CSS disabled every animation | Keep essential brand motion under reduced motion; calm only ambient drift; test with reduced motion on |
| Favicon broken or wrong | Claude hand-transcribed base64, or redrew the mark instead of using the artwork | Save the real file to disk, resize with Pillow to 256×256; "exactly the attachment, don't make any changes" |
| Saved image has a double extension (`.png.png`) | The generator's save dialog | Have Claude list the folder after "saved" and normalise names |
| Claude edits the wrong project or over-builds (an HDRI panel when you meant "brighter") | A request referenced another project or a tool feature as an example | Interrupt and restate the goal in one line: "add it to *this* site, the other one was only the example" |
| Shiny, plastic-looking 3D | Glossy PBR + image-based lighting on an AI-generated model | Matte material (roughness 1, metalness 0, keep maps), studio rig, raise exposure instead of adding highlights |
| GitHub warns about files over 50 MB; phones take ages to load the model | Uncompressed GLB | Draco-compress (≈90% smaller); never commit the original to a public repo |
| A refinement was built, shown locally, and lost | Session ended with uncommitted work and no decision | End every session with the checklist block above; commit, stash or discard explicitly |
| Screenshot tool times out | Heavy `blur(100px)` filters or the browser pane hidden | Reduce blur; verify by DOM measurements (`getBoundingClientRect`, computed styles) instead of pictures |
| `python` "Permission denied" in Git Bash on Windows | The Microsoft Store stub shadows Python | Use `py` or the full path to `python.exe`; write scripts as `.py` files, never inline in PowerShell |

## What to carry forward

- `BRAND.md` (tokens + logo geometry + 3D look) → read first in [11-wireframes.md](11-wireframes.md) and [12-ui.md](12-ui.md).
- The coming-soon `index.html` → becomes `apps/site` in the monorepo in [13-fullstack-frontend.md](13-fullstack-frontend.md), byte-for-byte, and is replaced by the launch page in [16-growth.md](16-growth.md).
- The 3D viewer's lighting and material settings → the app's 3D component in [13-fullstack-frontend.md](13-fullstack-frontend.md).
- The push rules → the standing rules in `templates/CLAUDE.md` and [20-security.md](20-security.md).
- Every prompt above, generalised → [30-prompt-library.md](30-prompt-library.md).
