# Skindrug Gist

Skindrug Gist is a skincare guidance and marketplace website built for the brand. The public experience introduces the service, offers consultation and skin-assessment flows, and lists products and approved vendor shops. It also includes a vendor application/inventory portal and a password-protected staff workspace.

## What is in the repo

- **Brand website (`/`)** — editable homepage copy, services, editorial/education section, product highlights, consultation calls to action, and links to marketplace and vendor features.
- **Consultation request (`/api/consultations`)** — validates requests and emails the team through Resend.
- **Skin assessment (`/assessment`, `/api/skin-assessment`)** — a nine-part intake form, including optional photos. On a self-hosted Node server, submissions are written to a private local `data/` directory.
- **Marketplace (`/shops`, `/shops/[slug]`)** — public vendor store and product pages.
- **Vendor portal (`/vendors/*`)** — application, email-confirmed sign-in, profile/dashboard, and inventory management. Vendor changes to products are held for staff approval.
- **Admin workspace (`/admin`)** — password-protected homepage editor and vendor/product review tools. Its consultation dashboard currently shows sample preview records; it is not wired to a live consultation inbox.
- **Supabase schema (`supabase-schema.sql`)** — homepage content and marketplace tables, grants, RLS policies, and product-moderation triggers.

Payments are intentionally not implemented: the README and code describe checkout as disabled until Paystack split payments and vendor settlement/commission rules are agreed. Prescription-only products are out of scope for this initial marketplace.

## Requirements and local development

Use **Node.js 22 or newer** (the Supabase client dependency requires it). `.nvmrc` is set to 22.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Useful checks:

```bash
npm run lint
npm run build
```

## Configuration

### Consultation email

Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `CONSULTATION_NOTIFICATION_EMAIL` in `.env.local` and in the production server environment. The `from` address must use a domain verified in Resend. Keep the API key server-side; do not prefix it with `NEXT_PUBLIC_`.

### Admin workspace and homepage editor

Set `ADMIN_PASSWORD` to a unique password of at least 12 characters and `ADMIN_SESSION_SECRET` to a random secret of at least 32 characters. Generate the session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Homepage content persists through Supabase. Create a Supabase project, run `supabase-schema.sql` in its SQL editor, and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Never expose the service-role key to the browser. The `/admin` session expires after eight hours.

### Vendor marketplace

Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for browser authentication, plus `SUPABASE_URL` and the server-only `SUPABASE_SERVICE_ROLE_KEY` for staff actions. Set these in `.env.local` for development and in the deployment host's server environment. Never commit `.env.local` or expose the service-role key in a `NEXT_PUBLIC_*` variable.

The initial schema is available as a Supabase CLI migration in `supabase/migrations/20261120134511_initial_skindrug_gist_schema.sql` and as a SQL Editor copy in `supabase-schema.sql`. For a **new or verified non-production project**, authenticate and link the CLI, then apply it:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npm run db:status
npm run db:push
```

The Supabase database password may be requested by the CLI; enter it only in the local terminal, never in chat or a checked-in file. In Supabase Auth, enable email confirmation and allow the callback URL `https://YOUR-DOMAIN/vendors/auth/callback` (plus `http://localhost:3000/vendors/auth/callback` for local development). The local Supabase config also enables confirmation and permits localhost redirects. Configure a working SMTP/email provider for hosted Auth confirmation emails. The schema has not been applied to production; test it in a non-production project and review the policies before applying it to production.

## Important deployment and privacy note

The current consultation and assessment routes use local filesystem storage for submissions (and skin-assessment photos); this is suitable only for local/self-hosted Node deployments with a private, durable disk. Consultation email delivery uses Resend, but the admin consultation dashboard contains sample preview records and is not connected to submissions; assessment submissions are not sent to staff or exposed in an admin inbox. Serverless filesystems are usually ephemeral or read-only, so these routes are **not production-ready on a serverless host** until private durable storage and an operational workflow are configured. Skin assessments may contain sensitive health information: keep `data/` private, access-restricted, backed up securely, and out of public assets. The API currently limits photo uploads to three JPEG, PNG, or WebP files of up to 5 MB each, validates their file signatures, and uses restrictive local file permissions. Before collecting real customer information in production, use an appropriate private storage/database service and establish retention, access, and deletion procedures.

## Deployment

Deploy as a Node.js 22+ Next.js application. Set the environment variables above in the host, apply and test the Supabase schema, configure the Resend sender domain, and verify both intake flows and vendor email confirmation. Do not enable checkout until payment splits and settlement rules are implemented and tested.
