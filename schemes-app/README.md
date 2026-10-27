# Kheti Sahay \u2014 government schemes for women farmers in North-East India

A small site that collects government schemes for women farmers across the
North-East, lets people filter by state and category, and flags newly
added schemes. Built with Next.js, deployable on Vercel's free (Hobby) tier.

- **Public site**: browse/search schemes by state, category, or "new only".
  No login needed.
- **Admin panel** (`/admin`): a single shared password protects adding,
  editing and deleting schemes, in English plus Assamese and Nagamese (easy
  to add more languages \u2014 see below).
- **Daily scan** (optional): you give it a list of government pages and
  keywords; once a day it checks them and drops anything matching into a
  "Flagged for review" queue in the admin panel. **It never publishes
  anything automatically** \u2014 you read each flagged excerpt and decide.

---

## 1. Before you deploy: read this

A few honest caveats, so there are no surprises:

- **The seeded schemes are a starting point, not verified facts.**
  `scripts/seed.js` includes six real, long-standing schemes (PM-KISAN,
  MKSP, PMFBY, Kisan Credit Card, MOVCDNER, Stand-Up India) with
  descriptions I wrote from general knowledge, not a live lookup. Benefit
  amounts, eligibility rules and procedures change. **Open each one in
  `/admin` and check it against the linked source before you tell anyone
  to rely on it.**
- **The Assamese and Nagamese translations are a first draft**, done
  without a native speaker's review. Please have someone fluent check them
  before the site goes out to the people who'll actually use it \u2014
  especially Nagamese, which varies a lot by area and doesn't have one
  fixed spelling convention.
- **The daily scanner is a blunt instrument.** Government websites don't
  follow one format, so it works by fetching a page's text and flagging any
  line containing a keyword you chose. Expect it to miss real updates and
  flag irrelevant ones. Treat it as "here's something to go look at," not
  as a feed of truth. It only runs once a day because that's the limit on
  Vercel's free Cron tier.
- **The admin password is a single shared secret**, not individual
  accounts. Fine for a small team; if several people need their own
  logins and an audit trail later, that's a bigger change.

## 2. One-time setup

### a. Push this to GitHub

Create a new repository and push this folder to it (GitHub Desktop, or:
`git init && git add -A && git commit -m "Initial commit"` then follow
GitHub's instructions to push to a new repo).

### b. Import into Vercel

1. Go to vercel.com, "Add New... Project", and import that GitHub repo.
2. Don't deploy yet \u2014 first add the database (next step), then come back.

### c. Add a Postgres database

1. In your Vercel project, open the **Storage** tab.
2. Create a new Postgres database (this is Neon under the hood; the free
   tier is enough to start). Connect it to this project.
3. This automatically sets a `DATABASE_URL` environment variable for you.
4. Open the database's **Query** tab (or connect with `psql`) and run the
   contents of `sql/schema.sql` once, to create the three tables.

### d. Set the remaining environment variables

In Project Settings -> Environment Variables, add:

| Variable | What it is |
|---|---|
| `ADMIN_SESSION_SECRET` | Any long random string. Run `openssl rand -hex 32` to generate one. |
| `ADMIN_PASSWORD` | The password you'll type in at `/admin`. |
| `CRON_SECRET` | Any long random string (only needed if you'll use the daily scanner). Run `openssl rand -hex 32`. |

### e. Deploy

Trigger a deploy (push to GitHub, or click Deploy in Vercel). It should
build cleanly.

### f. Seed some starting schemes (optional but recommended)

From your own machine, with this repo checked out:

```bash
npm install
vercel env pull .env.local   # pulls DATABASE_URL etc. from your Vercel project
npm run seed
```

Then open `https://your-site.vercel.app/admin`, sign in, and go through
each seeded scheme \u2014 check the facts, add translations, fix anything
that's out of date.

## 3. Using the admin panel day to day

- **Add a scheme**: `/admin/dashboard` -> "Add a scheme". Fill in English;
  other languages are optional and fall back to English if left blank.
- **Flagged for review**: `/admin/pending` shows anything the daily scan
  found. "Publish this" turns it into a draft scheme (pre-filled with the
  raw scraped text) that opens straight into the edit form so you can
  rewrite it properly before it's truly ready to show people. "Dismiss"
  throws it away.
- **Scan sources**: `/admin/sources` is where you tell the scanner which
  pages to check and which keywords to look for (e.g. a state
  agriculture department's "latest schemes" page, keywords like "subsidy",
  "women farmer", or the current year).

## 4. Adding another language

1. Copy `lib/i18n/locales/en.json` to `lib/i18n/locales/<code>.json` and
   translate the values (keep the keys as they are).
2. In `lib/i18n/index.js`, import it and add one line to `DICTIONARIES`
   and one entry to `LANGUAGES`.
3. That's it \u2014 the language switcher, admin form tabs, and fallback
   logic all pick it up automatically. Scheme content translations are
   filled in per-scheme from the admin edit form.

Good candidates for this region: Khasi, Mizo, Manipuri (Meitei), Bodo.

## 5. Local development

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and the others
npm run dev
```

## 6. Project layout

```
app/                   Pages and API routes (Next.js App Router)
  admin/               Admin-only pages (protected by middleware.js)
  api/                 API routes: public schemes, admin CRUD, cron scan
  schemes/             Public listing + detail pages
components/            Shared React components
lib/
  db.js                All database queries (Postgres via @neondatabase/serverless)
  auth.js              Admin session cookie signing/verification
  scraper.js           The daily scan logic
  i18n/                Translation dictionaries + helpers
  constants.js          States, categories, "new" badge window
sql/schema.sql         Run this once against your database
scripts/seed.js        Optional starting data
vercel.json             Cron schedule for the daily scan
```
