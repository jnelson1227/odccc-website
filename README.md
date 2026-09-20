# ODCCC website

The website and admin console for the **Oregon Divisional Chainsaw Carving Championship** —
held every Father's Day weekend at Rainbow Plaza in Reedsport, Oregon, and produced by the
Reedsport/Winchester Bay Chamber of Commerce.

This replaces the Wix site at [oregonccc.com](https://oregonccc.com).

## Running it

```bash
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and fill in the keys (see **Environment** below).

| Command | What it does |
|---|---|
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm test` | Unit tests for the date and edition helpers |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |

## Environment

| Variable | Where it's used |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Everywhere |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public page reads and admin sign-in |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only.** The newsletter signup action, and nothing else |
| `NEXT_PUBLIC_SITE_URL` | Metadata, sitemap, Open Graph, auth redirects |

Without `SUPABASE_SERVICE_ROLE_KEY` everything works except newsletter signups, which show
"Signups aren't switched on yet" rather than failing.

## How it fits together

**Public pages** (`src/app/(site)/`) are prerendered for SEO and read Supabase through a
cookie-free anon client (`src/lib/supabase/public.ts`). Reading cookies would make them
dynamic, so freshness comes from cache tags instead: an admin save calls `updateTag`, which
expires the affected pages immediately.

**The admin** (`src/app/admin/`) is a light UI gated by `requireAdmin()`, which checks both a
Supabase session *and* the `admins` allowlist. Both checks matter: this Supabase project is
shared with the Visit Reedsport app, so a valid session proves only that someone owns an email
address. The allowlist is what RLS enforces in the database too.

There is no draft/publish step. Saving publishes, and the toast says so.

## The rules that don't bend

**Dates are never stored.** They're computed from the year in `src/lib/dates.ts`:
Father's Day is the third Sunday of June, the event runs Thursday–Sunday ending on it, and
the edition is `year − 2000`. `settings.date_override_start/end` exist for emergencies and
only apply when both are set. 26 unit tests cover 2000–2060.

**Always Rainbow Plaza.** The venue is not a setting.

**Every photo needs alt text.** The admin won't save a carver photo or a library image
without it.

## Database

One Supabase project, `reedsport-chamber`, shared with the Visit Reedsport app. No table names
collide, but two things are namespaced so the two apps can't step on each other:

- the RLS helpers are `odccc_is_admin()` / `odccc_is_owner()`, not the very generic
  `is_admin()` — a later `create or replace function is_admin()` from the other app would
  otherwise silently rewrite this site's access rules;
- the storage bucket is `odccc-media`, beside the Chamber app's `place-photos`.

Migrations are in `supabase/migrations/`, starter content in `supabase/seed.sql`.

## Reference

- `CLAUDE.md` — the build brief
- `docs/01-product-spec.md` … `docs/05-domain-cutover.md` — pages, design system, admin,
  data model, and the plan for moving oregonccc.com off Wix
- `design-reference/*.dc.html` — the approved designs

## Still waiting on the Chamber

These show as honest placeholders on the site rather than invented content: parking details,
the ticket/pass link, when carver applications open, the vendor and carver application forms,
names and benefits for the $500 and $250 sponsorship levels, extra benefits for the Pro,
Semi-Pro and Community levels, the 2025 2nd/3rd places and 2026 results, older winners, the
2027 carver lineup, a higher-resolution logo, and which email platform runs the newsletter.
