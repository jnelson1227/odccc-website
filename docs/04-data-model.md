# 04 — Data model (Supabase)

Schema: `supabase/migrations/0001_init.sql`. Starter content: `supabase/seed.sql`.

| Table | Purpose |
|---|---|
| `settings` | A single row: event year, admission, hero copy, presenting-sponsor toggle, featured carvers, contact, links |
| `carvers` | Carver profiles, which persist across years |
| `carver_years` | Per-year participation status (Confirmed / Invited / Not attending) |
| `sponsorship_levels` | Levels, prices, benefits, availability, display rules |
| `sponsors` | Sponsors per year, with level and status. `legacy_level` holds 2026's old level names |
| `schedule_items` | Daily schedule rows for weekday (Thu–Sat) and Sunday |
| `winners` | Past winners by year, division and place |
| `subscribers` | Newsletter signups |
| `media` | Uploaded image library |
| `admins` | Email allowlist with roles |

## Derived values (compute in code; don't store)
```ts
export function fathersDay(year: number) {       // 3rd Sunday of June
  const june1 = new Date(Date.UTC(year, 5, 1));
  const firstSunday = 1 + ((7 - june1.getUTCDay()) % 7);
  return new Date(Date.UTC(year, 5, firstSunday + 14));
}
export function eventDates(year: number) {       // Thu–Sun ending on Father's Day
  const end = fathersDay(year);
  const start = new Date(end); start.setUTCDate(end.getUTCDate() - 3);
  return { start, end };
}
export const edition = (year: number) => year - 2000;   // 2027 → 27
```
Unit-test these: 2026 → June 18–21 (matches the 2026 event); 2027 → June 17–20; 2028 → June 15–18. Settings override dates win when set.

## Security notes
- Public pages use the anon key (read-only by RLS).
- Newsletter inserts: a server action with the **service role key** (server-only env var), after validation, a honeypot field, and a simple per-IP rate limit (e.g., Vercel KV or an in-memory map).
- `is_admin()` checks the JWT email against `admins`. Seeded owner: jill@highwater.cafe.
- Storage bucket `media` is public-read and admin-write. Keep uploads under 5 MB; resize on upload where possible.

## Environment variables (Vercel)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `NEXT_PUBLIC_SITE_URL=https://oregonccc.com`.
