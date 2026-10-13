# Phone retest guide — template

> Every push to staging ends with this in chat: 3–9 numbered steps a person can follow on a real phone, each "do X → you should see Y". A real device is the only check that catches install banners, forced dark mode, push badges, camera behaviour, clipboard rules and cache — automation caught none of Assemble's Samsung, cache or back-loop bugs. Keep the App and Admin lists separate, and list what was **not** tested live with manual steps.

## What Claude writes (the format)

> **For Claude — paste this:**
```text
After every staging push, end your report with a "Phone retest" section in exactly this shape:
- Account to use: [demo profile | a throwaway account, not your main one] on [staging app URL].
- Before you start: [clear site data / reinstall the PWA / update the app] when the manifest, service worker or icons changed.
- App — numbered steps, each "Go to [screen] → do [action] → you should see [exact result]". Include the expected wording in quotes and the credit change if any.
- Admin — the same, on [staging admin URL].
- Not tested live — what I could not exercise (no suitable photo, needs a second real phone, needs the client's key) with the manual steps to do it.
- Reset note — whether I reset the staging demo after my run, or left it because you said it was in use.
Keep each step one line. No more than 9 steps per list.
```

## Example (Assemble, 2026-09-16 pushes A + B, generalised)

Use a throwaway account on the staging app; deletion and suspension are real.

**App**
1. Sign in → Home → tap "Match" → pick an occasion → you should see the first look drawn automatically and the second as a pieces collage with "See it on you · [N] credits".
2. Tap "See it on you" → the second look renders and your balance drops by exactly [N] (check Credits → the newest ledger row).
3. Preferences → Budget → pick "$$" → start a match → the match screen shows "$$" preselected; change it to "$" for this match → Preferences still shows "$$".
4. Closet → add a pair of pyjama trousers (photo of any elastic-waist bottom) → run a match around it → no belt appears in the look; the "Why it works" line does not mention a belt.
5. Profile → Manage subscription (yearly plan account) → the line reads "[credits] for the year, added when you paid · renews on [date]".

**Admin**
1. Sign in → the 2FA code arrives only at the owner address (and the CC addresses, if set) → Notifications shows a badge for [the alert raised in step 1 of the app list].
2. Monetize → change a credit price → you are asked for a code → a wrong code five times locks saving for an hour ("Saving is locked until …").
3. Enter the emailed code → the save goes through → Notifications shows "[field] changed by [you]: old → new" and the field shows the same audit line.
4. Profitability → this month → revenue reads "simulated until payments go live"; the cost per feature line for "Match" is non-zero after the app steps above.
5. Broadcast → audience "Inactive 7+ days" → the preview count shows a number before you send; History shows delivered/failed counts after.

**Not tested live**
- Watch removal from the avatar photo: the demo photo wears no watch. Take a full-body photo wearing a watch, set it as your avatar photo, render any look without a watch in it → no watch in the render.

**Reset note**
- Staging demo reset after my run (28 items, 13 looks).

## Common "before you start" lines
- Manifest/icon/service-worker change: *Settings → Site settings → [app] → Clear data, then reinstall from Chrome.*
- Samsung Internet dark-mode fix: *turn phone dark mode on; the logo and wordmark must stay pure white.*
- Push badge: *pull down the notification shade; the small status-bar icon must be the monochrome mark, not a white square.*
- Cache confusion: *hard refresh or a private tab; the version toast should say the new build.*
