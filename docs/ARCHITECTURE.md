# EduFlow — Architecture & Deployment Guide

## Architecture Overview

EduFlow is a production-oriented learning platform with:

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui-style components
- **Backend**: Convex (real-time database, server functions, file storage)
- **Auth**: Clerk (identity) + Convex JWT validation (authorization)
- **Deployment**: Vercel (frontend) + Convex Cloud (backend)

```
┌─────────────┐     JWT      ┌─────────────┐
│   Clerk     │─────────────▶│   Convex    │
│   (Auth)    │              │  (Backend)  │
└─────────────┘              └──────┬──────┘
       ▲                            │
       │                            │ Real-time queries
┌──────┴──────┐                     │
│  Next.js    │◀────────────────────┘
│  (Vercel)   │
└─────────────┘
```

## Architectural Improvements (vs. Raw Requirements)

| Area | Improvement |
|------|-------------|
| **Authorization** | All RBAC enforced in Convex mutations/queries — frontend checks are UX only |
| **Admin bootstrap** | `ADMIN_EMAILS` env var promotes first-login users — no manual DB seeding |
| **Audit trail** | Every admin action logged to `auditLogs` table |
| **Rate limiting** | Per-user rate limits on payments, uploads, messages |
| **Soft delete** | Users marked `deleted` instead of hard delete — preserves referential integrity |
| **Search indexes** | Convex search indexes on users and courses — avoids full table scans |
| **Payment state machine** | Strict status transitions with enrollment coupling on approval |
| **File validation** | MIME type + size validated server-side on every upload reference |
| **Input sanitization** | HTML stripped from all text inputs before storage |

## Folder Structure

```
achool/
├── convex/                 # Backend (Convex functions)
│   ├── schema.ts           # Database schema + indexes
│   ├── lib/                # Auth, audit, validation, files
│   ├── users.ts            # User management
│   ├── courses.ts          # Course CRUD + admin approval
│   ├── modules.ts          # Course modules
│   ├── lessons.ts          # Lessons + enrollment access
│   ├── payments.ts         # Manual payment flow
│   ├── enrollments.ts      # Access control
│   ├── messages.ts         # Messaging system
│   ├── notifications.ts    # In-app notifications
│   ├── teacherRequests.ts  # Teacher onboarding
│   ├── settings.ts         # Platform settings
│   └── seed.ts             # Category seeding
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # UI + layout components
│   ├── features/           # Feature modules (admin, teacher, student)
│   ├── schemas/            # Zod validation schemas
│   ├── lib/                # Utilities
│   └── __tests__/          # Vitest tests
└── .env.example            # Environment template
```

## Authentication Flow

1. User signs up/in via Clerk
2. `UserSync` component calls `users.syncUser` mutation
3. Convex creates user with role `student` (or `admin` if email in `ADMIN_EMAILS`)
4. Clerk JWT passed to Convex on every request via `ConvexProviderWithClerk`

## Authorization Flow

Every protected Convex function calls:

```typescript
const user = await requireCurrentUser(ctx);  // Must be authenticated + active
const admin = await requireAdmin(ctx);       // Must be admin
const teacher = await requireTeacherOrAdmin(ctx);
```

Role checks happen **server-side only**. Middleware protects dashboard routes via Clerk.

## Admin Setup Instructions

1. Sign up with an email listed in `ADMIN_EMAILS` Convex env var
2. First login auto-assigns `admin` role
3. Go to **Dashboard → Admin → Settings** to configure payment number/instructions
4. Run category seed: Convex dashboard → Functions → `seed:seedCategories`
5. Approve teacher requests and course submissions from admin dashboard

## Deployment Guide

### 1. Convex

```bash
npx convex dev          # Development
npx convex deploy       # Production
```

Set in Convex dashboard:
- `CLERK_JWT_ISSUER_DOMAIN`
- `ADMIN_EMAILS`

### 2. Clerk

- Create application
- Add JWT template named `convex` (use Convex docs template)
- Configure sign-in/sign-up URLs

### 3. Vercel

```bash
vercel --prod
```

Environment variables: see `.env.example`

### 4. Post-deploy

- Verify Clerk webhook (optional)
- Seed categories via admin
- Create first admin account
- Test payment flow end-to-end

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

Tests cover:
- Zod schema validation
- Authorization rule definitions
- File upload security rules

## Security Checklist

- [x] RBAC on all mutations/queries
- [x] Ownership verification for course/lesson edits
- [x] IDOR prevention (users can only access own payments/messages)
- [x] Input sanitization (XSS prevention)
- [x] File type validation (upload attacks)
- [x] Rate limiting on sensitive endpoints
- [x] Audit logging for admin actions
- [x] Soft delete for users
- [x] Suspended user blocking

## Performance

- Convex indexes on all query patterns
- Search indexes for courses/users
- Parallel `Promise.all` for related data fetching
- Next.js code splitting via App Router
- Stale-while-revalidate via TanStack Query defaults
