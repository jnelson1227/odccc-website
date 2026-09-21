# 01 — Public site spec

Design source of truth: `design-reference/`. Everything in *italics* below is dynamic, read from Supabase and editable in the admin.

## Global
**Nav** (every page except the Home hero, which has its own nav row): logo (links home) + "*June 17–20, 2027* / Reedsport, Oregon". Links: The Event (/our-story), Carvers, Schedule, Visit, Sponsors. Plus a "Get Passes" button that goes to *ticket link* if one is set, otherwise to /visit#passes.
The Home nav row has a text lockup on the left: "Reedsport · The Chainsaw Carving Capital of Oregon".

**Newsletter signup band** (above the footer on every page): "Stay in the loop / Get championship updates". The copy is in the mockup. Fields: first name (optional), email (required). Button: "Sign me up". Success state replaces the form with "You're on the list — see you in June." Stores `source` = page path.

**Footer**: logo + Chamber line; The Event (Schedule, Carvers, History & past winners); Get Involved (Plan your visit, Our sponsors, Become a sponsor → /sponsorship, Vendor application, Carver application); Contact: call 541-271-3495, text 541-662-2154, reedsportchamberofcommerce@gmail.com, 2741 Frontage Road, Reedsport, OR 97467. The contact details come from settings.

## Routes
| Route | Mockup | Notes |
|---|---|---|
| `/` | Home.dc.html | Hero + Meet the carvers + signup + footer |
| `/carvers` | Carvers.dc.html | Pro and Semi-Pro grids |
| `/carvers/[slug]` | (no mockup; build in the same style) | Photo(s), bio, hometown, studio, website, honors |
| `/schedule` | Schedule.dc.html | 4 day cards + admission |
| `/visit` | Visit.dc.html | Getting here, what to expect, around Reedsport |
| `/sponsors` | Sponsors.dc.html | Thank-you page, in the main nav |
| `/sponsorship` | Sponsorship.dc.html | Levels and pricing. Not in the main nav; linked from /sponsors, the Home hero button and the footer. Also add `/sponsor` as a redirect to it (short URL for printed material). |
| `/our-story` | History.dc.html | Timeline + past winners |
| `/admin/*` | Admin-*.dc.html | See 03-admin-spec |

## Home
- Background: `hero-bg.jpg` (desaturated wolf carving) under a `#10231a` wash at *opacity 0.80* (admin slider 0.5–0.95), fading to solid at the bottom.
- Left column (≈ 2/3 width): gold eyebrow "*27th Annual* · *June 17–20, 2027*" (Big Shoulders 700, 40px); headline "*Four days.* / *80 tons* (gold) / *of logs.*" (Big Shoulders 900, 188px, line-height .84); paragraph 1 and paragraph 2 (26px Archivo; `**bold**` markup renders as cream bold lead-ins).
- Right column: the logo (≈390px wide) is the page `<h1>` (`alt` = full championship name). Under it, when a presenting sponsor is enabled, a "PRESENTED BY" lockup with the sponsor logo (see Home-with-presenting-sponsor.dc.html). Then the location panel (Oregon outline SVG with Reedsport pin, "Reedsport, OR", "Rainbow Plaza · Hwy 101"), then two full-width buttons: "Plan your visit" (gold → /visit) and "Sponsor the championship" (outline → /sponsorship).
- "Meet the carvers": the *6 featured carvers* (admin-chosen), with "See all 30+ carvers →". The "30+" number comes from the count of carvers confirmed or invited for the current year, rounded down to a multiple of 5, with "+".

## Carvers
Header image, then **Pro division** and **Semi-Pro division** grids (6 columns on desktop, 2 on mobile). Card: 3:4 photo (or an initials placeholder reading "Photo coming"), optional gold honor badge (e.g. "2025 Champion", "Co-founder", "International"), name, hometown (gold), card line. Show carvers whose status for the current year is Confirmed or Invited. Before the lineup is announced, admins can mark the page "2027 lineup coming soon" and show last year's carvers under a "2026 carvers" heading (setting: `carvers_page_mode` = `current` | `previous`).
Carver CTA box: "Are you a carver?" → the carver application link (setting).

## Schedule
Four day cards, Thursday–Sunday, with computed dates. Rows are from the `schedule_items` table (day_type `weekday` for Thu–Sat, `sunday`); highlighted rows get the gold tint. Admission cards show *daily price* and *4-day pass price*; the third card has location, gate time and the "Plan your visit" button.

## Visit
As in the mockup. Directions link: Google Maps for "Rainbow Plaza, Reedsport, OR 97467". Parking copy comes from a setting (placeholder until provided). The Chamber's visitor guide at visitreedsport.com gets a feature panel under "Around Reedsport" (URL in settings).

**Changed 2026-09-20:** the sculpture-trail section was removed — there is no official trail to map. "Sculptures around town" may come back later as its own thing.

## Sponsors (/sponsors)
1. Presenting sponsor block: if one is set, show their logo and a thank-you; otherwise show the dashed "This could be your name" box linking to /sponsorship.
2. Current year's sponsors, grouped by level in display order. Logo tiles for levels with `show_logo = true`, a name list for the others. If the current year has none yet, show last year's under "*2026* sponsors — thank you".
3. Gold band → /sponsorship.

## Sponsorship (/sponsorship)
Stats row (editable in settings): 4,000+ visitors · 4 days · *27* years (computed) · 2011 Ovation Award. Levels from `sponsorship_levels`: the first level (Presenting) renders as the wide featured card, the next two side by side, the rest in rows of three. Each card shows availability ("1 available" / "Open" / "Sold" when `max_available` is reached by committed sponsors), price, and benefits. "Download the sponsorship form (PDF)" appears when a PDF has been uploaded. Contact band.

## Our Story
Intro text, timeline (static content in code is fine for v1, since it rarely changes), then a **Past winners** table from `winners` (year, division, 1st, 2nd, 3rd), newest first.

## SEO / sharing
Per-page titles like "Carvers — Oregon Divisional Chainsaw Carving Championship". Default OG image: logo on Dark Fir with the dates. Event JSON-LD on Home and Schedule.
