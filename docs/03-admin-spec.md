# 03 — Admin console spec

Keep it much simpler than a full CMS: a handful of forms and tables for Chamber volunteers. Mockups: `design-reference/Admin-*.dc.html`.

## Access
- `/admin` requires a Supabase Auth session (email magic link). After login, check the `admins` table (email allowlist). If the email isn't on the list, sign the user out with a friendly message.
- Roles: `owner` (can manage admins) and `editor`. Seed Jill (jill@highwater.cafe) as owner.
- All writes go through server actions using the user's session. RLS enforces `is_admin()`.

## Layout
Left sidebar (fir green): logo, "Site admin", nav — Event & homepage · Carvers · Sponsors · Subscribers · Schedule · Past winners · Photos · Admins; the signed-in user at the bottom. The top bar has the page title and "View site". Saving shows a toast ("Saved — live on the site") and triggers revalidation.

## Screens
**Event & homepage** (`settings`, a single row)
- Year (select). Edition and dates are computed and shown read-only in green "locked" boxes, labeled "Auto", "Father's Day weekend" and "Always" (Rainbow Plaza). "Override dates this year" checkbox reveals two date inputs.
- Admission: daily price, 4-day pass price, ticket link.
- Homepage hero: headline lines 1–3, paragraph 1, paragraph 2 (supports `**bold**`), background photo (upload/replace), wash opacity slider.
- Presenting sponsor: "Show 'Presented by' on the homepage" toggle + select from this year's sponsors at the Presenting level.
- Featured carvers: pick exactly 6 (searchable multi-select with thumbnails, ordered by drag).
- Also here (collapsible "More settings"): contact phone/text/email/address, parking copy, Visit Reedsport URL, carver/vendor application links, sponsorship stats row, carvers page mode.

**Carvers**
- Table: thumbnail, name, hometown, division, status for the selected year (Confirmed / Invited / Not attending), Featured. Search plus filters (division, status). "+ Add carver".
- Edit panel: photo (upload, 3:4 crop guidance, **alt text required**), name, hometown, country, division, studio/business, website, card line (60 chars max), full bio, honor badge, feature on homepage.
- Carvers persist across years. Participation per year lives in `carver_years`, so "status for 2027" is a row there. Add a "Copy last year's lineup as Invited" button.

**Sponsors**
- Left: sponsorship levels (drag to reorder): name, price label (text, e.g. "$1,000+"), price amount (number, nullable), max available (nullable = open), show logo on the Sponsors page (bool), on the poster (bool), benefits (one per line). Upload/replace the sponsorship form PDF.
- Right: sponsors for the selected year: logo (upload; hint "white or one-color logo for the dark site"), name, level, status (Pledged / Paid), website, in-kind note. "+ Add sponsor" and "Copy last year's sponsors as Pledged".
- A notice when the Presenting level has no sponsor for the year.

**Subscribers**
- Counts (total, last 30 days, unsubscribed), search, status filter, table (first name, email, source page, date, status), **Export CSV**. Unsubscribe/delete per row.

**Schedule**: edit `schedule_items` for the two day types (weekday Thu–Sat, Sunday): time label, title, description, highlight, sort order.

**Past winners**: table editor (year, division, place 1–3, carver name, and an optional link to a carver record).

**Photos**: simple media library (Supabase Storage bucket `media`) for reusing images; upload with alt text.

**Admins** (owners only): add/remove emails, set role.
