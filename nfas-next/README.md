# National Flatpack Assembly Service

UK flatpack assembly marketplace built with Next.js 14, Supabase, Stripe and Resend.

---

## Stack

| Layer        | Tech                          |
|--------------|-------------------------------|
| Framework    | Next.js 14 (App Router)       |
| Database     | Supabase (Postgres + RLS)     |
| Auth         | Supabase Auth                 |
| Realtime     | Supabase Realtime (messages)  |
| Payments     | Stripe Checkout               |
| Email        | Resend                        |
| Hosting      | Vercel                        |
| Styles       | Tailwind CSS + inline styles  |
| Fonts        | Syne (headings) + DM Sans     |

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
```
Fill in your Supabase, Stripe and Resend keys.

### 3. Set up Supabase

#### Option A — Supabase Cloud (recommended)
1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL editor
3. Run `supabase/seed/seed.sql` to populate inventory items and credit packs
4. Copy your project URL and anon key into `.env.local`

#### Option B — Local Supabase
```bash
npx supabase start
npx supabase db push
# then seed:
npx supabase db reset
```

### 4. Set up Stripe
1. Create a product/price in Stripe (or let the checkout API create them dynamically)
2. Set up a webhook pointing to `https://yourdomain.com/api/stripe/webhook`
3. Listen for `checkout.session.completed`
4. For local dev: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### 5. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                     ← Homepage
│   ├── layout.tsx                   ← Root layout
│   ├── globals.css                  ← Global styles + Tailwind
│   ├── auth/
│   │   ├── login/                   ← Login page
│   │   ├── register-customer/       ← Customer registration
│   │   └── register-fitter/         ← Fitter registration
│   ├── dashboard/
│   │   ├── customer/                ← Customer dashboard
│   │   ├── fitter/                  ← Fitter dashboard
│   │   └── admin/                   ← Admin panel
│   ├── jobs/
│   │   ├── page.tsx                 ← Browse open jobs
│   │   └── [id]/                    ← Single job + unlock
│   └── api/
│       ├── auth/logout/             ← Sign out
│       ├── messages/                ← Send message
│       ├── reviews/                 ← Submit review
│       ├── leads/
│       │   ├── unlock/              ← Unlock a lead (deducts credits)
│       │   └── status/              ← Update fitter job status
│       ├── admin/docs/              ← Approve/reject fitter documents
│       └── stripe/
│           ├── checkout/            ← Create Stripe checkout session
│           └── webhook/             ← Handle Stripe events (credit account)
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── home/
│   │   └── index.tsx                ← All homepage sections
│   ├── dashboard/
│   │   ├── DashboardShell.tsx       ← Shared sidebar layout
│   │   ├── JobsList.tsx             ← Job cards with messaging/review
│   │   ├── DashboardComponents.tsx  ← PostJobForm, ProfileForm, NewLeads, etc.
│   │   └── PostJobForm.tsx          ← Re-export
│   ├── messaging/
│   │   ├── MessageThread.tsx        ← Realtime chat (Supabase Realtime)
│   │   └── MessagesPanel.tsx        ← Messages tab
│   ├── reviews/
│   │   ├── ReviewForm.tsx           ← Star rating + submit
│   │   └── ReviewsPanel.tsx         ← Fitter's reviews tab
│   └── ui/
│       └── index.tsx                ← Button, Input, Badge, Stars, etc.
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                ← Browser client
│   │   └── server.ts                ← Server client + admin client
│   └── utils.ts                     ← formatTime, geocodePostcode, haversine, etc.
│
├── types/
│   └── index.ts                     ← TypeScript types matching DB schema
│
├── middleware.ts                     ← Auth guards + role-based redirects
│
supabase/
├── migrations/
│   └── 001_initial_schema.sql       ← Full schema, RLS policies, DB functions
└── seed/
    └── seed.sql                     ← Inventory items + credit packs
```

---

## Database Functions

These run in Postgres for atomicity:

| Function | What it does |
|---|---|
| `unlock_lead(fitter_id, job_id)` | Deducts credits, creates unlock, marks job claimed |
| `complete_job(fitter_id, job_id)` | Closes job, fires affiliate commission |
| `get_unread_count(user_id)` | Returns unread message count |
| `get_avg_rating(user_id)` | Returns fitter's average star rating |
| `handle_new_user()` | Trigger: auto-creates profile on signup |

---

## User Roles

| Role | Description |
|---|---|
| `customer` | Posts jobs, gets matched with fitters |
| `fitter` | Browses leads, unlocks with credits, messages customers |
| `affiliate` | Posts jobs on behalf of furniture retailers, earns cashback |
| `admin` | Full access — approves fitter documents, manages platform |

---

## Key Flows

### Customer posts a job
1. Register/login → Customer dashboard → Post a Job
2. Select furniture items from inventory catalogue
3. Confirm address, optional date and notes
4. Job goes live as `open`, geocoded automatically via postcodes.io

### Fitter unlocks a lead
1. Set service radius → leads filtered by distance
2. Browse new leads, preview job details
3. Click Unlock → `unlock_lead()` DB function runs atomically
4. Job moves to `claimed`, contact details revealed
5. Fitter messages customer, updates status, marks completed

### Payment (credit purchase)
1. Fitter clicks Buy Now → Stripe Checkout created
2. Payment completed → Stripe fires `checkout.session.completed` webhook
3. Webhook calls Supabase to credit account + record transaction

### Messaging (realtime)
- Supabase Realtime subscribed to `messages` table per job
- New message INSERT triggers immediate UI update — no polling

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@nationalflatpackassembly.co.uk

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Deploying to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add all env variables
4. Deploy — Vercel auto-detects Next.js

For the Stripe webhook, set the endpoint to `https://yourdomain.vercel.app/api/stripe/webhook`.

---

## What's Left to Build

- [ ] Email notifications via Resend (job posted, fitter matched, message received)
- [ ] Fitter document upload UI (Supabase Storage)
- [ ] Affiliate dashboard
- [ ] Full admin CRUD for jobs, fitters, inventory, credit packs
- [ ] Fitter public profile page `/fitters/[id]`
- [ ] Map view on jobs browse page (Leaflet + postcodes.io)
- [ ] Password reset flow
