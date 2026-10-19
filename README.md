# Adv. Belayhun website

Static site (HTML, CSS, JS) + Supabase. No build step.

## Database files: run in this order (Supabase > SQL Editor)
1. `supabase-schema.sql` 2. `supabase-roles.sql` 3. `supabase-reviews.sql` (optional) 4. `supabase-calendars.sql` 5. `supabase-documents.sql` 6. `supabase-notifications.sql` (optional). Then run `supabase-check.sql` to confirm everything installed.
If you re-run an earlier file, re-run the later ones afterwards. The website expects all of them except the two marked optional.

## 1. Supabase
1. Create a free project at supabase.com.
2. SQL Editor: paste and run `supabase-schema.sql` (safe to run again).
3. Run `supabase-roles.sql` (always run it last; if you ever re-run `supabase-schema.sql`, run the roles file again after it) (staff accounts and roles). Follow the FIRST ADMIN note at the top of that file.
4. Authentication > Providers > Email: keep "Confirm email" ON. Authentication > URL Configuration: set Site URL to your domain and add `https://YOUR-DOMAIN.com/admin.html` as a redirect URL.
5. Project Settings > API: copy the Project URL and the `anon` public key.

## 2. Configure
Edit `js/config.js`: name, phone, WhatsApp number (digits only, with 251), email, address, social links, licence number (shown in the footer when filled in), and the two Supabase values.
Replace `YOUR-DOMAIN.com` in `robots.txt` and `sitemap.xml`.
Add photos to `img/` (`lawyer.jpg`, `photo-1.jpg` to `photo-6.jpg`).

## 3. GitHub + Cloudflare Pages
1. Push this folder to a GitHub repo.
2. Cloudflare dashboard > Workers & Pages > Create > Pages > connect the repo.
3. Build command: none. Output directory: `/`.
4. Custom domains: add your domain (Cloudflare handles DNS and HTTPS).

## 4. Keep Supabase awake (free plan pauses after about a week of inactivity)
GitHub repo > Settings > Secrets and variables > Actions: add `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The workflow in `.github/workflows` pings the database every 3 days.

## Optional: Telegram alerts
Open `supabase-notifications.sql`, follow the steps at the top (create a bot with @BotFather, find your chat ID), paste both values and run it. The lawyer then gets a Telegram message for every new or cancelled booking. The token stays in a private database table, never in the website files.

## Client reviews (optional)
Run `supabase-reviews.sql` after the roles file. After a lawyer or receptionist marks a booking **Completed**, the client can leave a star rating and comment on `manage.html` using their reference and phone number. Admins approve or reject each review under Reviews; only approved ones appear on the home page. Check the Ethiopian Bar's rules on advertising and client testimonials before publishing reviews.

## Staff and roles
- **Admin:** everything. Adds, edits, deactivates and removes staff; sets opening hours and booking rules; blocks dates; writes articles; decides on, reschedules, assigns and deletes bookings.
- **Reception:** sees all bookings; adds phone and walk-in bookings; confirms, declines, reschedules and assigns lawyers; blocks dates.
- **Lawyer:** sees only bookings assigned to them; confirms, declines, marks completed or no-show; writes articles.
New staff: admin adds name, email and role under Staff. The person opens `admin.html`, chooses "First time? Create account" with that email, confirms the email link, then signs in.

## Staff dashboard
`/admin.html`: bookings, opening hours and booking rules (how far ahead, minimum notice), blocked dates, and articles for the Insights page. Only users listed in the `admins` table can sign in.
Without Supabase values the site runs in demo mode (data stays in each browser).

## Per-lawyer calendars
Each lawyer sets their own weekly hours ("My hours") and time off ("My time off"); a lawyer without own hours follows the firm default. Firm-wide blocks (holidays) apply to everyone. Clients choose a lawyer or "any available lawyer". Add each lawyer's title and short bio under Staff > Profile; they appear on the About page.

## Client documents
Clients attach up to 5 files (PDF, JPG, PNG, DOCX, 2 MB each) to a booking. Only admins and the assigned lawyer can download them. They are uploaded by outsiders: open them only on a computer with up-to-date security software.

## Languages
English and Amharic (EN / አማ). Switching to Amharic translates every public page, the booking flow and the footer using `js/i18n-am.js` (English text is the source; add or edit Amharic there). The staff dashboard stays in English. Articles the lawyer writes are shown in the language he wrote them. Have a native speaker review the Amharic text, especially the Terms and privacy page, before launch.

## Contact number
The office phone and WhatsApp number are set once in `js/config.js` (`phone` and `wa`) and used across the site.

## Tests
`node tests/i18n.js` checks that every English text on the public pages has an Amharic translation, and `node tests/translator.js` tests the translator itself. `node tests/smoke.js` runs the dashboard, booking and Manage pages for every role against a fake browser (no Supabase needed). It checks what each role sees, that client text is escaped, and that the main actions call the right functions. It does not test the SQL files; run those on a test Supabase project first.

## Confirmation emails go to localhost?
Supabase > Authentication > URL Configuration: set **Site URL** to your real site address (the default is http://localhost:3000), and under **Redirect URLs** add `https://YOUR-DOMAIN.com/**` (and `http://localhost:3000/**` while testing). The sign-up and reset-password requests now send the admin page address as the redirect, but Supabase only honours it if it matches the Redirect URLs list. To test locally: `cd lawyer-site && python3 -m http.server 3000`, then open http://localhost:3000/admin.html.
