# 05 — Launching on oregonccc.com and retiring the Wix site

oregonccc.com is currently a Wix site. Do these steps in order; nothing goes down until step 5.

## 1. Before you start (Jill)
- [ ] Find out **where the domain is registered**. Log into Wix → Domains. If oregonccc.com is listed there, Wix is the registrar. If not, run a WHOIS lookup (e.g. who.is/whois/oregonccc.com) to see the registrar (GoDaddy, etc.).
- [ ] Check whether **email** uses the domain (e.g., anything@oregonccc.com). If it does, write down the MX/TXT records so they survive the move. The Chamber currently uses a Gmail address, so there may be no domain email.
- [ ] Make sure the Chamber (not a former volunteer) owns the account the domain is registered in, and note when it renews.
- [ ] Download anything worth keeping from Wix: the sponsorship form PDF, past winners photos (2018, 2019, 2024), and the poster.

## 2. Build and review on Vercel
- Deploy to the Vercel project; review on the `*.vercel.app` URL and a preview on phones.
- Enter the real content in the admin (settings, 2027 lineup, sponsors).

## 3. Add the domain in Vercel
Vercel → Project → Settings → Domains → add `oregonccc.com` and `www.oregonccc.com`. Pick one as primary (recommended: `oregonccc.com`, with `www` redirecting). Vercel then shows the exact DNS records to create, typically:
- `A` record, host `@` → Vercel's IP (shown in the dashboard)
- `CNAME` record, host `www` → the target Vercel shows (e.g. `cname.vercel-dns.com`)

## 4. Point DNS (choose one)
**A. Domain registered at Wix:** Wix → Domains → oregonccc.com → Manage DNS Records. Replace the Wix A/CNAME records with Vercel's. Keep any MX/TXT email records. (Optionally transfer the domain out of Wix to another registrar later, which avoids paying Wix for the domain.)
**B. Domain registered elsewhere (GoDaddy etc.):** make the same record changes in that registrar's DNS, or switch nameservers to Vercel's if you prefer Vercel to manage DNS.

This is the same pattern used for the Visit Reedsport app (a CNAME on GoDaddy), but here the **root** domain moves too.

## 5. Go live
DNS usually updates within an hour, occasionally up to 48 hours. Vercel issues the HTTPS certificate automatically. Check:
- [ ] https://oregonccc.com and https://www.oregonccc.com load the new site
- [ ] The old URLs below redirect
- [ ] The signup form works; the admin login works on the real domain (add `https://oregonccc.com` to Supabase Auth → URL Configuration → Site URL and Redirect URLs)

## 6. Retire Wix (after about a week of the new site running)
- Cancel the Wix Premium plan, but **don't delete the domain** if Wix is the registrar. Either keep the domain there with the Vercel DNS records, or transfer it out first.
- Update the links on Facebook, Travel Oregon listings, the Chamber site, the Visit Reedsport app, and printed materials. The short link **oregonccc.com/sponsor** goes to the sponsorship page.

## Old Wix URLs → new (301 redirects in `next.config`)
| Old | New |
|---|---|
| `/event-information` | `/` |
| `/schedule` | `/schedule` |
| `/event-history` | `/our-story` |
| `/2018-winners` (and any `/*-winners`) | `/our-story#winners` |
| `/carvers` | `/carvers` |
| `/pro-carvers` | `/carvers#pro` |
| `/semi-pro-carvers` | `/carvers#semi` |
| `/sponsors` | `/sponsors` |
| `/vendors` | `/visit` (or a vendors page when one exists) |
| `/contact-us` | `/visit#contact` |
| `/sponsor` | `/sponsorship` |
