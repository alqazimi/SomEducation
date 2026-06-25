# SomEducation

Premium online learning platform with manual payment verification, role-based access control, and enterprise-grade security.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Convex
- **Auth**: [Convex Auth](https://labs.convex.dev/auth) (email + password, staff MFA)
- **Deployment**: Vercel + Convex Cloud

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local` in the project root (never committed to git):

```env
NEXT_PUBLIC_CONVEX_URL=https://your-dev-deployment.convex.cloud
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`NEXT_PUBLIC_CONVEX_URL` is written automatically when you run `npx convex dev`.

### 3. Initialize Convex Auth (first time)

```bash
npx convex dev
```

In a second terminal, if auth keys are not set yet:

```bash
npx @convex-dev/auth --web-server-url http://localhost:3000
```

This sets `SITE_URL`, `JWT_PRIVATE_KEY`, and `JWKS` on your **dev** deployment.

### 4. Convex environment variables

Set in the [Convex dashboard](https://dashboard.convex.dev) (dev and prod separately):

| Variable | Purpose |
|----------|---------|
| `SITE_URL` | App URL (`http://localhost:3000` dev, `https://www.someducation.com` prod) |
| `JWT_PRIVATE_KEY` / `JWKS` | Set by `npx @convex-dev/auth` |
| `OWNER_EMAILS` | Comma-separated emails promoted to **owner** on sign-up |
| `ADMIN_EMAILS` | Comma-separated emails promoted to **admin** on sign-up |
| `STRIPE_SECRET_KEY` | Optional — Stripe card checkout |
| `STRIPE_WEBHOOK_SECRET` | Optional — Stripe webhook signing secret |

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication

- **Sign up / sign in**: `/sign-up`, `/sign-in` (email + password, min 12 characters)
- **Sessions**: 3 hours for all users
- **Students**: one active device — new login revokes other sessions
- **Staff** (teacher, admin, owner): TOTP MFA required (`/mfa/setup`, `/mfa`)
- **Legacy users**: sign up again with the **same email** to link an existing profile

## Vercel deployment

**Vercel → Project → Settings → Environment Variables** (Production):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_CONVEX_URL` | `https://precious-duck-100.eu-west-1.convex.cloud` (no trailing slash) |
| `NEXT_PUBLIC_APP_URL` | `https://www.someducation.com` (no trailing slash) |
| `GOOGLE_SITE_VERIFICATION` | `ca20de5c3c61d824` (optional — built into the site) |

Redeploy after saving. Use the **production** Convex URL (`precious-duck-100`), not dev (`mild-seahorse-699`).

### Convex production

```bash
# Auth keys + SITE_URL for live domain
npx @convex-dev/auth --prod --web-server-url https://www.someducation.com

# Deploy backend
npx convex deploy
```

Remove any obsolete `CLERK_*` variables from Vercel and Convex if still present.

## Google Search

Verification is included in the repo:

- HTML file: `/googleca20de5c3c61d824.html`
- Meta tag: `ca20de5c3c61d824`

After deploy, verify in [Google Search Console](https://search.google.com/search-console) and submit `https://your-domain.com/sitemap.xml`.

## Admin setup

1. Add your email to `OWNER_EMAILS` or `ADMIN_EMAILS` in Convex, then sign up with that email
2. **Dashboard → Admin → Categories** — add course categories
3. **Dashboard → Admin → Payment Methods** — add mobile money / bank details
4. Approve teacher requests and course submissions from the admin dashboard

## Project structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for architecture, security, and deployment details.

```
src/
├── app/           # Next.js pages (App Router)
├── components/    # UI + layout
├── features/      # admin, teacher, student, messages
├── schemas/       # Zod validation
└── lib/           # Utilities

convex/
├── auth.ts        # Convex Auth (password, sessions, callbacks)
├── schema.ts      # Database schema
├── lib/           # Auth helpers, audit, validation
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
| **Owner** | Full platform control including admin accounts |

## Payment flow

### Manual (mobile money / bank)

1. Student clicks **Buy Course**
2. Chooses **Mobile money / Bank**
3. Fills payment form (name, phone, method, reference)
4. Views admin-configured payment instructions
5. Uploads payment screenshot (PNG/JPG/PDF only)
6. Admin reviews and approves/rejects
7. On approval → enrollment created → student gains access

### Stripe (card — optional)

1. Admin enables **Stripe checkout** in **Dashboard → Admin → Settings**
2. Add Stripe keys in Convex (see below)
3. Student chooses **Card (Stripe)** on the purchase page
4. Pays on Stripe Checkout → webhook confirms payment → instant enrollment

#### Stripe setup (test mode)

1. Create a [Stripe account](https://dashboard.stripe.com/register) and stay in **Test mode**
2. **Convex** (`npx convex env set …` or dashboard):
   - `STRIPE_SECRET_KEY` = `sk_test_…`
   - `STRIPE_WEBHOOK_SECRET` = from step 4
3. **Stripe webhook** — Developers → Webhooks → Add endpoint:
   - URL: `https://YOUR_DEPLOYMENT.convex.site/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`
   - Copy the signing secret to `STRIPE_WEBHOOK_SECRET` in Convex
4. **Admin → Settings** → enable **Stripe checkout** → Save
5. Test with card `4242 4242 4242 4242`, any future expiry, any CVC

## License

Private — All rights reserved.
