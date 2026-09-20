# START HERE — building the ODCCC site with Claude Code

## What's in this folder
- `CLAUDE.md`: the build brief. Claude Code reads it automatically.
- `docs/`: page specs, design system, admin spec, data model, and the domain-cutover checklist.
- `design-reference/`: the approved designs (Home, Carvers, Schedule, Visit, Sponsors, Sponsorship, Our Story, and 4 admin screens). Open them in a browser for a rough look; the real reference is the design canvas.
- `supabase/`: the database schema and starter content (2026 carvers and sponsors, 2027 levels, the schedule, known winners).
- `public/images/`: the logo, hero and header backgrounds, and 25 carver photos, sized for the web.

## Steps
1. Create an empty GitHub repo, e.g. `odccc-website`. Clone it and copy this folder's contents into it.
2. Create a new Supabase project, e.g. "odccc". You'll need its URL, anon key and service role key.
3. Open the repo in Claude Code and paste this:

> Read CLAUDE.md and everything in docs/. Build the ODCCC website and admin console exactly as specified, matching the designs in design-reference/. Use Next.js (App Router, TypeScript), Tailwind and Supabase. Start by scaffolding the project and showing me the plan. Then apply supabase/migrations/0001_init.sql and supabase/seed.sql to my Supabase project, and build in the order listed in CLAUDE.md. Ask me for the Supabase keys when you need them. Commit to GitHub as you go.

4. Connect the repo to a new Vercel project and add the environment variables listed in `docs/04-data-model.md`.
5. Review the site on the Vercel preview link. Once it's right, follow `docs/05-domain-cutover.md` to move oregonccc.com over and retire Wix.

## Still needed from you (shown as [brackets] on the site until filled in)
Parking details · the ticket link · when carver applications open · names for the $500/$250 levels · extra benefits for the lower levels · 2025 2nd/3rd place and the 2026 results · the 2027 lineup · a high-resolution logo · which email tool to use for the newsletter
