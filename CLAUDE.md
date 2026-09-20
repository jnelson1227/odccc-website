# ODCCC Website — Build Brief for Claude Code

You are building the new website and admin console for the **Oregon Divisional Chainsaw Carving Championship (ODCCC)**. It's held every Father's Day weekend at Rainbow Plaza in Reedsport, Oregon, and produced by the Reedsport/Winchester Bay Chamber of Commerce. The new site replaces the current Wix site at **oregonccc.com**.

The owner is Jill Nelson (Chamber board). She is technical, and she already runs apps on **GitHub + Vercel + Supabase**. Chamber volunteers will maintain the content through the admin console, so it has to be simple enough for non-technical people.

## Read these first
1. `docs/01-product-spec.md`: public pages, content and behavior
2. `docs/02-design-system.md`: colors, type, components (exact values)
3. `docs/03-admin-spec.md`: admin console
4. `docs/04-data-model.md`: Supabase schema, RLS, storage
5. `docs/05-domain-cutover.md`: launch on oregonccc.com and retire Wix
6. `design-reference/*.dc.html`: **approved designs**. Treat them as the visual source of truth. They are static HTML mockups with inline styles, one file per screen. The `<x-dc>`, `<helmet>` and `<script type="text/x-dc">` wrappers come from the design tool; ignore them and read the markup inside. Image paths already point at `public/images/...`.
7. `supabase/migrations/0001_init.sql` and `supabase/seed.sql`: schema and 2026/2027 starter content.

## Stack (decided)
- **Next.js (App Router, TypeScript)** on **Vercel**. Server-render the public pages for SEO; this site lives on search traffic and shared links.
- **Tailwind CSS**, with the design tokens from `docs/02-design-system.md` in the theme. Match the mockups exactly, and don't invent a new style.
- **Supabase**: Postgres for content, Auth (email magic link) for admins, Storage for photos and logos.
- Fonts from Google via `next/font`: **Big Shoulders Display** (700, 900) and **Archivo** (400, 500, 600, 700).
- Images: `next/image`. Seed photos are in `public/images`. Photos uploaded through the admin go to Supabase Storage.
- Code lives in a new GitHub repo (suggested name `odccc-website`), connected to a Vercel project.

## Non-negotiables
- **Always Rainbow Plaza, always Father's Day weekend.** Never store event dates by hand. Compute them from the year:
  - Father's Day = 3rd Sunday of June. The event runs **Thursday–Sunday**, ending on Father's Day.
  - Edition = `year − 2000` (2027 → "27th annual"). Use proper ordinal suffixes (21st, 22nd, 23rd, 27th…).
  - An optional `date_override_start/end` exists in settings for emergencies only.
- Admins edit content; **public pages read from Supabase** and revalidate on save (`revalidatePath` / tags). There is no draft/publish workflow in v1: saving goes live and the admin shows a "Saved — live on site" toast. Change the mockup's "Changes save as a draft…" line and the "Publish changes" button to match (the button becomes "View site").
- Mobile matters: most visitors will come from phones and social links. The mockups are desktop (1440px), so build the responsive versions faithfully: stack the columns, keep the big type big (use `clamp()`), and keep tap targets at least 44px.
- Accessibility: real buttons, links and labels, alt text on every sculpture photo, 4.5:1 text contrast.
- Every sculpture/carver photo needs alt text. The seed provides it where known, and the admin requires it on upload.
- Keep the old-URL redirects in `docs/05-domain-cutover.md` in `next.config` (301s).

## Build order
1. Scaffold Next.js + Tailwind + Supabase clients; apply the migration and seed to a Supabase project.
2. Shared layout: nav, footer, newsletter signup band, design tokens, date/edition helpers (with unit tests).
3. Public pages: Home → Carvers → Schedule → Visit → Sponsors → Sponsorship → Our Story.
4. Newsletter signup (server action, validation, honeypot, basic rate limit).
5. Admin: auth + allowlist → Event & homepage → Carvers → Sponsors & levels → Subscribers (CSV export) → Schedule → Past winners → Photos → Admins.
6. SEO: metadata, Open Graph image (logo on Dark Fir), Event JSON-LD (schema.org `Event` with computed dates and Rainbow Plaza address), sitemap, robots.
7. Deploy to a Vercel preview URL for Jill's review, then follow the domain cutover doc.

## Open items (use visible placeholders; don't invent)
- Parking details; the ticket/pass purchase link; when carver applications open; vendor and carver application forms (links or PDFs).
- Names and extra benefits for the $500 and $250 sponsorship levels; extra benefits for the Pro, Semi-Pro and Community levels.
- 2025 2nd/3rd place and 2026 results; older winners.
- The 2027 carver lineup (seeded from 2026 with status "Invited").
- A higher-resolution logo (SVG or a large PNG) is coming. The current logo is 296×197.
- The email platform for the newsletter (v1 stores subscribers plus CSV export only).
