# SomEducation — Architecture & Deployment Guide

## Architecture overview

SomEducation is a production-oriented learning platform with:

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui-style components
- **Backend**: Convex (real-time database, server functions, file storage)
- **Auth**: [Convex Auth](https://labs.convex.dev/auth) — email/password, 3-hour sessions, staff MFA
- **Deployment**: Vercel (frontend) + Convex Cloud (backend)

```
┌─────────────┐   session    ┌─────────────┐
│  Next.js    │◀────────────▶│   Convex    │
│  (Vercel)   │   cookies    │  (Backend)  │
└─────────────┘              └──────┬──────┘
       │                            │
       │  Convex Auth HTTP routes   │ Real-time queries
       └────────────────────────────┘
```

## Architectural improvements

| Area | Improvement |
|------|-------------|
| **Authorization** | All RBAC enforced in Convex mutations/queries — frontend checks are UX only |
| **Admin bootstrap** | `OWNER_EMAILS` / `ADMIN_EMAILS` env vars promote users on sign-up |
| **Audit trail** | Every admin action logged to `auditLogs` table |
| **Rate limiting** | Per-user rate limits on payments, uploads, messages |
| **Soft delete** | Users marked `deleted` instead of hard delete |
| **Search indexes** | Convex search indexes on users and courses |
| **Payment state machine** | Strict status transitions with enrollment coupling on approval |
| **File validation** | MIME type + size validated server-side |
| **Input sanitization** | HTML stripped from text inputs before storage |
| **Staff MFA** | TOTP for teacher/admin/owner; verified per session |
| **Student sessions** | One device — new login revokes other student sessions |

## Folder structure

```
SomEducation/
├── convex/                 # Backend (Convex functions)
│   ├── auth.ts             # Convex Auth providers + callbacks
│   ├── auth.config.ts      # JWT issuer config
│   ├── schema.ts           # Database schema + indexes
│   ├── mfa.ts              # Staff TOTP MFA
│   ├── lib/                # Auth, audit, validation, files
│   ├── users.ts            # User management
│   ├── courses.ts          # Course CRUD + admin approval
│   ├── payments.ts         # Manual payment flow
│   └── …                   # modules, lessons, messages, etc.
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # UI + layout (incl. auth pages)
│   ├── features/           # admin, teacher, student
│   ├── schemas/            # Zod validation
│   └── lib/                # Utilities
└── docs/                   # Documentation
```

## Authentication flow

1. User signs up or signs in at `/sign-up` or `/sign-in` (password provider)
2. `convex/auth.ts` `createOrUpdateUser` links by email to legacy rows or creates a new user
3. `users.ensureProfile` promotes owner emails on first dashboard load
4. **Staff** with MFA enabled must complete `/mfa/setup` then `/mfa` per session
5. Session cookies managed by `@convex-dev/auth/nextjs` (3-hour lifetime)

## Authorization flow

Every protected Convex function calls:

```typescript
const user = await requireCurrentUser(ctx);  // Auth + MFA for staff
const admin = await requireAdmin(ctx);
const teacher = await requireTeacherOrAdmin(ctx);
```

Role checks happen **server-side only**. `src/proxy.ts` uses `convexAuthNextjsMiddleware` to protect dashboard routes.

## Admin setup

1. Set `OWNER_EMAILS` / `ADMIN_EMAILS` in Convex env
2. Sign up with that email at `/sign-up`
3. **Dashboard → Admin → Settings** — payment instructions, Stripe toggle
4. Seed categories via `bootstrap:setupPlatform` or admin UI
5. Approve teacher requests and course submissions

## Deployment guide

### 1. Convex (dev)

```bash
npx convex dev
npx @convex-dev/auth --web-server-url http://localhost:3000
```

### 2. Convex (production)

```bash
npx @convex-dev/auth --prod --web-server-url https://www.someducation.com
npx convex deploy
```

Convex env (prod): `SITE_URL`, `JWT_PRIVATE_KEY`, `JWKS`, `OWNER_EMAILS`, `ADMIN_EMAILS`, optional Stripe keys.

### 3. Vercel

Set `NEXT_PUBLIC_CONVEX_URL` (prod deployment URL) and `NEXT_PUBLIC_APP_URL` (live domain). Redeploy.

### 4. Post-deploy

- Test sign-up, sign-in, dashboard by role
- Test staff MFA flow
- Test payment flow end-to-end
- Remove obsolete third-party auth env vars if any remain

## Testing

```bash
npm test
npm run test:watch
```

## Security checklist

- [x] RBAC on all mutations/queries
- [x] Ownership verification for course/lesson edits
- [x] IDOR prevention (users access own payments/messages only)
- [x] Input sanitization (XSS prevention)
- [x] File type validation
- [x] Rate limiting on sensitive endpoints
- [x] Audit logging for admin actions
- [x] Soft delete for users
- [x] Suspended user blocking
- [x] Staff MFA (TOTP)
- [x] Student single-device sessions

## Performance

- Convex indexes on all query patterns
- Search indexes for courses/users
- Parallel `Promise.all` for related data
- Next.js code splitting via App Router
- TanStack Query defaults for client caching

## Schema note

`users.clerkId` remains optional for legacy data from the previous auth provider. New users do not receive a `clerkId`.
