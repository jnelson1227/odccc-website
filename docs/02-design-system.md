# 02 — Design system ("Dark Fir")

## Colors (public site)
| Token | Hex | Use |
|---|---|---|
| fir-900 (bg) | `#10231a` | Page background, hero wash |
| fir-850 (bg-2) | `#15291f` | Cards and panels on dark |
| fir-950 | `#0c1b14` | Footer |
| line | `#2c4a39` | Hairlines, card borders |
| input-border | `#3d5e4b` | Inputs on dark |
| cream (ink) | `#f6f0e0` | Primary text (the logo's cream) |
| body | `#d2cdbb` | Paragraph text |
| sub | `#b3bba7` | Captions and secondary labels |
| gold (accent) | `#dca93e` | The logo's gold: accents, primary buttons, numbers |
| brown | `#2a1508` | Text on gold buttons (the logo's dark brown) |

Primary button: gold background with brown text, radius 2px, bold 17px, padding 18×30, and a hard shadow `4px 4px 0 #08130d` on hero buttons. Secondary: 2px cream outline with cream text.

## Admin colors (light UI)
bg `#f3f0e7`, card `#ffffff`, border `#ddd6c4`, text `#1c2a22`, muted `#5a6458`, sidebar `#10231a`, active nav gold `#dca93e` with brown text. Status pills: confirmed/paid `#e3efe2`/`#2f6b43`; invited/pledged `#fbf0d6`/`#8a5a0e`; not attending `#efe9e0`/`#6b5d4d`.

## Type
- Display: **Big Shoulders Display** 900 (headlines, numbers, names), 700 (eyebrows), uppercase.
- Body: **Archivo** 400/500/700.
- Scale (desktop → mobile via clamp): hero headline 188 → 84px; page H1 120 → 64; section H2 56 → 38; card names 24–26; eyebrow 13px, 3px tracking, uppercase, gold; body 17–26.

## Components (see the mockups)
- **Page header:** 380px, desaturated photo under a fir wash at 0.78 opacity; gold eyebrow with a 48×4 bar; huge H1; 22px subtitle.
- **Section head:** gold eyebrow + H2, bottom hairline; optional right-side link in gold.
- **Carver card:** 3:4 photo with a 2px line border, honor badge (gold with brown text), name, hometown (gold, bold 14), card line (body 14).
- **Level cards:** dark panel with a line border; the featured card gets a 2px gold border and a 10% gold tint.
- **Signup band:** 2px gold border on bg-2, two columns.
- **Oregon map:** inline SVG path (in Home.dc.html / Visit.dc.html). Reedsport pin at (58, 325) in a 740×545 viewBox.

## Imagery
Photos are the 2026 final carvings. Page headers use desaturated wide crops (color saturation ≈ 12%). Carver cards use full-color portrait crops. Originals (1067×1600) are in the Chamber Google Drive folder "Final Carvings Chainsaw 2026".
