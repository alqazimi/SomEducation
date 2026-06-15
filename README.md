# SomEducation

Premium online learning platform with manual payment verification, role-based access control, and enterprise-grade security.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Convex
- **Auth**: Clerk
- **Deployment**: Vercel + Convex Cloud

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local` in the project root (this file is **never** committed to git):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Fill in your real Clerk and Convex values from their dashboards.

### 3. Start Convex (required first time)

```bash
npx convex dev
```

This creates your Convex deployment and generates `convex/_generated/`.

Set in the Convex dashboard:
- `CLERK_JWT_ISSUER_DOMAIN` — from Clerk JWT template
- `ADMIN_EMAILS` — comma-separated admin emails

### 4. Start Next.js

In a second terminal:

```bash
npm run dev:frontend
```

Or run both together:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Vercel deployment

In **Vercel → Project → Settings → Environment Variables**, add these for **Production**:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_CONVEX_URL` | `https://precious-duck-100.eu-west-1.convex.cloud` (no trailing slash) |
| `NEXT_PUBLIC_APP_URL` | `https://www.someducation.com` (your live domain, no trailing slash) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From Clerk Dashboard |
| `CLERK_SECRET_KEY` | From Clerk Dashboard |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
| `GOOGLE_SITE_VERIFICATION` | `ca20de5c3c61d824` (optional — already built into the site) |

Redeploy after saving env vars. Use your **production** Convex URL (`precious-duck-100`), not the dev URL (`mild-seahorse-699`).

### Clerk + Convex auth (required for sign-in)

After switching to Clerk **Production** (`pk_live_` keys on Vercel), configure both sides:

**Clerk (Production instance):**
1. Open [Clerk Convex setup](https://dashboard.clerk.com/apps/setup/convex)
2. JWT template name must be exactly **`convex`** (Convex preset)

**Convex production (`precious-duck-100`):**

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://clerk.someducation.com --prod
```

Use your Clerk **Production** Frontend API URL (from Clerk → Production → API Keys).  
Do **not** use the dev URL (`https://stirring-grizzly-43.clerk.accounts.dev`).

Then sign out, sign in again, and test `/dashboard`.

## Google Search (show SomEducation in search results)

Google verification is already included in the repo:
- HTML file: `/googleca20de5c3c61d824.html`
- Meta tag: `ca20de5c3c61d824`

**You do not need a Vercel env var** for HTML-file verification. After deploy, open:
`https://your-domain.com/googleca20de5c3c61d824.html`

To appear when people search **SomEducation** or **someducation** (without typing `.com`):

1. Set `NEXT_PUBLIC_APP_URL` to your real domain (e.g. `https://som-education.vercel.app` or your custom domain)
2. **Redeploy** on Vercel
3. Go to [Google Search Console](https://search.google.com/search-console)
4. Add your site property (use the same URL as `NEXT_PUBLIC_APP_URL`)
5. Choose **HTML file** verification — file is already on your site
6. Click **Verify**
7. Submit your sitemap: `https://your-domain.com/sitemap.xml`
8. Request indexing for your homepage

The site already includes:
- Brand-focused page titles (`SomEducation — Premium Online Learning Platform`)
- JSON-LD structured data (Organization, WebSite, EducationalOrganization)
- `sitemap.xml` with public pages and published courses
- `robots.txt` allowing Google on public pages

**Tip:** A custom domain (e.g. `someducation.com`) helps Google show your brand more prominently than a `.vercel.app` URL.

## Admin Setup

1. Sign up with an email in `ADMIN_EMAILS`
2. Open **Dashboard → Admin → Settings** — set payment phone and instructions
3. Run `seed:seedCategories` in Convex dashboard to create default categories
4. Approve teacher requests and course submissions from the admin dashboard

## Project Structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full architecture, security design, and deployment guide.

```
src/
├── app/           # Next.js pages (App Router)
├── components/    # UI + layout
├── features/      # admin, teacher, student, messages
├── schemas/       # Zod validation
└── lib/           # Utilities

convex/
├── schema.ts      # Database schema
├── lib/           # Auth, audit, validation
└── *.ts           # Backend functions
```

## Testing

```bash
npm test
```

## Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Browse courses, purchase, view enrollments, request teacher access |
| **Teacher** | Create/edit courses, modules, lessons, view enrollments |
| **Admin** | User management, payment verification, course approval, analytics, settings |

## Payment Flow

1. Student clicks **Buy Course**
2. Fills payment form (name, phone, method, reference)
3. Views admin-configured payment instructions
4. Uploads payment screenshot (PNG/JPG/PDF only)
5. Admin reviews and approves/rejects
6. On approval → enrollment created → student gains access

## License

Private — All rights reserved.
