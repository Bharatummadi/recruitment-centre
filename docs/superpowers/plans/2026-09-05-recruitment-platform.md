# Aurelis Recruitment Center — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clinical study recruitment platform with public study browsing, interest submission, AI screening, admin review, and a participant portal.

**Architecture:** Next.js 15 App Router with Server Actions for data mutations, Neon (serverless Postgres) via Drizzle ORM, NextAuth (Auth.js JWT) for three-role auth, and Claude API for async AI screening recommendations.

**Tech Stack:** Next.js 15, TypeScript, Neon, Drizzle ORM, drizzle-kit, NextAuth (Auth.js v5), `@anthropic-ai/sdk`, bcryptjs, Vitest

---

## File Structure

```
/
├── app/
│   ├── layout.tsx                         # Root layout
│   ├── (public)/
│   │   ├── page.tsx                       # Landing page
│   │   └── studies/
│   │       ├── page.tsx                   # Browse studies
│   │       └── [slug]/page.tsx            # Study detail + interest form
│   ├── (auth)/
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── portal/
│   │   ├── layout.tsx                     # Participant auth guard
│   │   ├── page.tsx                       # My studies + status
│   │   └── studies/[slug]/page.tsx        # Study detail
│   ├── admin/
│   │   ├── layout.tsx                     # Admin auth guard
│   │   ├── page.tsx                       # Metrics dashboard
│   │   ├── studies/
│   │   │   ├── page.tsx                   # Studies list
│   │   │   ├── new/page.tsx               # Create study
│   │   │   └── [id]/
│   │   │       ├── page.tsx               # Edit study
│   │   │       └── applicants/page.tsx    # Study applicants
│   │   └── submissions/
│   │       ├── page.tsx                   # All submissions
│   │       └── [id]/page.tsx              # Review + AI rec + approve/reject
│   └── api/
│       ├── auth/[...nextauth]/route.ts    # NextAuth handler
│       └── agent/screen/route.ts         # AI screening trigger
├── lib/
│   ├── db/
│   │   ├── index.ts                       # Neon + Drizzle client
│   │   └── schema.ts                      # All table definitions
│   ├── auth.ts                            # NextAuth config
│   └── agent.ts                           # Claude screening function
├── actions/
│   ├── submissions.ts                     # submitInterest, approve, reject
│   ├── studies.ts                         # createStudy, updateStudy
│   └── auth.ts                            # signUp server action
├── types/
│   └── next-auth.d.ts                     # Session type extensions
├── middleware.ts                           # Route protection
├── drizzle.config.ts
├── vitest.config.ts
└── __tests__/
    ├── lib/agent.test.ts
    ├── actions/submissions.test.ts
    └── actions/studies.test.ts
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`

- [ ] **Step 1: Scaffold Next.js app with TypeScript**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir no --import-alias "@/*"
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @neondatabase/serverless drizzle-orm next-auth@beta @anthropic-ai/sdk bcryptjs
npm install -D drizzle-kit @types/bcryptjs vitest @vitejs/plugin-react
```

- [ ] **Step 3: Create vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 4: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Commit**

```bash
git init
git add package.json tsconfig.json next.config.ts vitest.config.ts
git commit -m "feat: scaffold Next.js project with dependencies"
```

---

## Task 2: Environment Variables

**Files:**
- Create: `.env.local`, `.env.example`

- [ ] **Step 1: Create `.env.local`**

```bash
# .env.local (never commit this file)
DATABASE_URL=postgresql://...   # from Neon dashboard
AUTH_SECRET=...                 # run: openssl rand -base64 32
AUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-...    # from Anthropic console
```

- [ ] **Step 2: Create `.env.example` (safe to commit)**

```bash
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
AUTH_SECRET=changeme
AUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-...
```

- [ ] **Step 3: Ensure `.env.local` is in `.gitignore`**

Verify `.gitignore` contains `.env.local`. If not, add it.

- [ ] **Step 4: Commit**

```bash
git add .env.example .gitignore
git commit -m "feat: add environment variable template"
```

---

## Task 3: Drizzle Config + Neon Client

**Files:**
- Create: `drizzle.config.ts`
- Create: `lib/db/index.ts`

- [ ] **Step 1: Create `drizzle.config.ts`**

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

- [ ] **Step 2: Create `lib/db/index.ts`**

```typescript
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

- [ ] **Step 3: Commit**

```bash
git add drizzle.config.ts lib/db/index.ts
git commit -m "feat: configure Drizzle ORM with Neon client"
```

---

## Task 4: Database Schema

**Files:**
- Create: `lib/db/schema.ts`

- [ ] **Step 1: Write the schema**

Create `lib/db/schema.ts`:
```typescript
import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  jsonb,
  real,
} from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['participant', 'admin'])
export const studyStatusEnum = pgEnum('study_status', ['draft', 'active', 'closed'])
export const submissionStatusEnum = pgEnum('submission_status', [
  'pending',
  'screened',
  'approved',
  'rejected',
  'withdrawn',
])
export const recommendationEnum = pgEnum('recommendation', [
  'eligible',
  'ineligible',
  'needs_review',
])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull().default('participant'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const studies = pgTable('studies', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  summary: text('summary').notNull(),
  status: studyStatusEnum('status').notNull().default('draft'),
  // Shape: { questions: [{id, label, type}], criteria: {...} }
  eligibilityCriteria: jsonb('eligibility_criteria').notNull(),
  contactEmail: text('contact_email').notNull(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const interestSubmissions = pgTable('interest_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  studyId: uuid('study_id')
    .notNull()
    .references(() => studies.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  // Shape: { [questionId]: answer }
  answers: jsonb('answers').notNull(),
  status: submissionStatusEnum('status').notNull().default('pending'),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
})

export const screeningResults = pgTable('screening_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id')
    .notNull()
    .references(() => interestSubmissions.id),
  recommendation: recommendationEnum('recommendation').notNull(),
  confidence: real('confidence').notNull(),
  reasoning: text('reasoning').notNull(),
  screenedAt: timestamp('screened_at').notNull().defaultNow(),
})

export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  studyId: uuid('study_id')
    .notNull()
    .references(() => studies.id),
  submissionId: uuid('submission_id')
    .notNull()
    .references(() => interestSubmissions.id),
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
})
```

- [ ] **Step 2: Add all Drizzle relations at the bottom of `lib/db/schema.ts`**

```typescript
import { relations } from 'drizzle-orm'

export const interestSubmissionsRelations = relations(
  interestSubmissions,
  ({ one }) => ({
    study: one(studies, {
      fields: [interestSubmissions.studyId],
      references: [studies.id],
    }),
    user: one(users, {
      fields: [interestSubmissions.userId],
      references: [users.id],
    }),
    screeningResult: one(screeningResults, {
      fields: [interestSubmissions.id],
      references: [screeningResults.submissionId],
    }),
  })
)

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  study: one(studies, { fields: [enrollments.studyId], references: [studies.id] }),
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
}))
```

- [ ] **Step 3: Generate and run migration**

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

Expected: migration files created in `./drizzle/`, tables created in Neon.

- [ ] **Step 4: Commit**

```bash
git add lib/db/schema.ts drizzle/
git commit -m "feat: define database schema with Drizzle"
```

---

## Task 5: NextAuth Setup

**Files:**
- Create: `lib/auth.ts`
- Create: `types/next-auth.d.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `actions/auth.ts`

- [ ] **Step 1: Extend NextAuth session types**

Create `types/next-auth.d.ts`:
```typescript
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'participant' | 'admin'
    }
  }
}
```

- [ ] **Step 2: Create `lib/auth.ts`**

```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        })
        if (!user) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as 'participant' | 'admin'
      return session
    },
  },
})
```

- [ ] **Step 3: Create `app/api/auth/[...nextauth]/route.ts`**

```typescript
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

- [ ] **Step 4: Create sign-up Server Action `actions/auth.ts`**

```typescript
'use server'

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const password = formData.get('password') as string

  if (!email || !name || !password) {
    return { error: 'All fields are required' }
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  })
  if (existing) {
    return { error: 'An account with this email already exists' }
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await db.insert(users).values({ email, name, passwordHash })

  redirect('/auth/signin')
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/auth.ts types/next-auth.d.ts app/api/auth actions/auth.ts
git commit -m "feat: set up NextAuth with credentials and JWT strategy"
```

---

## Task 6: Route Protection Middleware

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Write middleware**

Create `middleware.ts`:
```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Admin routes: require admin role
  if (pathname.startsWith('/admin')) {
    if (!session || session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
  }

  // Portal routes: require participant or admin role
  if (pathname.startsWith('/portal')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*'],
}
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: protect /admin and /portal routes via middleware"
```

---

## Task 7: AI Screening Agent

**Files:**
- Create: `lib/agent.ts`
- Test: `__tests__/lib/agent.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/lib/agent.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screenSubmission } from '@/lib/agent'

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}))

import Anthropic from '@anthropic-ai/sdk'

describe('screenSubmission', () => {
  let mockCreate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    const instance = new (Anthropic as any)()
    mockCreate = instance.messages.create
    vi.mocked(Anthropic).mockImplementation(() => instance)
  })

  it('returns eligible result when Claude responds with eligible JSON', async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            recommendation: 'eligible',
            confidence: 0.92,
            reasoning: 'Participant meets all inclusion criteria.',
          }),
        },
      ],
    })

    const result = await screenSubmission(
      { criteria: { minAge: 18 }, questions: [] },
      { age: 25 }
    )

    expect(result.recommendation).toBe('eligible')
    expect(result.confidence).toBe(0.92)
    expect(result.reasoning).toBe('Participant meets all inclusion criteria.')
  })

  it('returns ineligible result when Claude responds with ineligible JSON', async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            recommendation: 'ineligible',
            confidence: 0.98,
            reasoning: 'Participant is under minimum age.',
          }),
        },
      ],
    })

    const result = await screenSubmission(
      { criteria: { minAge: 18 }, questions: [] },
      { age: 15 }
    )

    expect(result.recommendation).toBe('ineligible')
  })

  it('throws when Claude returns non-text content', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'image', source: {} }],
    })

    await expect(
      screenSubmission({ criteria: {} }, { age: 25 })
    ).rejects.toThrow('Unexpected response type from Claude')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- __tests__/lib/agent.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/agent'`

- [ ] **Step 3: Implement `lib/agent.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk'

export type ScreeningResult = {
  recommendation: 'eligible' | 'ineligible' | 'needs_review'
  confidence: number
  reasoning: string
}

const anthropic = new Anthropic()

export async function screenSubmission(
  eligibilityCriteria: unknown,
  answers: unknown
): Promise<ScreeningResult> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are a clinical study screening assistant. Given study eligibility criteria and participant answers, evaluate whether the participant qualifies.

Return ONLY valid JSON matching this exact schema — no prose, no markdown:
{
  "recommendation": "eligible" | "ineligible" | "needs_review",
  "confidence": <number 0.0–1.0>,
  "reasoning": "<brief explanation for the admin reviewer>"
}`,
    messages: [
      {
        role: 'user',
        content: `Eligibility Criteria:\n${JSON.stringify(eligibilityCriteria, null, 2)}\n\nParticipant Answers:\n${JSON.stringify(answers, null, 2)}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

  return JSON.parse(content.text) as ScreeningResult
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test -- __tests__/lib/agent.test.ts
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add lib/agent.ts __tests__/lib/agent.test.ts
git commit -m "feat: add Claude AI screening agent with tests"
```

---

## Task 8: Screening API Route

**Files:**
- Create: `app/api/agent/screen/route.ts`

- [ ] **Step 1: Create the route**

Create `app/api/agent/screen/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { interestSubmissions, screeningResults, studies } from '@/lib/db/schema'
import { screenSubmission } from '@/lib/agent'

export async function POST(req: NextRequest) {
  const { submissionId } = await req.json()

  // Fetch submission + study
  const submission = await db.query.interestSubmissions.findFirst({
    where: eq(interestSubmissions.id, submissionId),
    with: { study: true },
  })

  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  try {
    const result = await screenSubmission(
      submission.study.eligibilityCriteria,
      submission.answers
    )

    await db.insert(screeningResults).values({
      submissionId,
      recommendation: result.recommendation,
      confidence: result.confidence,
      reasoning: result.reasoning,
    })

    await db
      .update(interestSubmissions)
      .set({ status: 'screened' })
      .where(eq(interestSubmissions.id, submissionId))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[agent/screen] error:', err)
    // Submission stays 'pending' — admin reviews manually
    return NextResponse.json({ error: 'Screening failed' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/agent/screen/route.ts lib/db/schema.ts
git commit -m "feat: add AI screening API route and schema relations"
```

---

## Task 9: Submit Interest Server Action

**Files:**
- Create: `actions/submissions.ts`
- Test: `__tests__/actions/submissions.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/actions/submissions.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'sub-123', studyId: 'study-1', userId: 'user-1' }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
    query: {
      interestSubmissions: {
        findFirst: vi.fn(),
      },
      enrollments: {
        findFirst: vi.fn(),
      },
    },
  },
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

// Mock fetch (for screening trigger)
global.fetch = vi.fn().mockResolvedValue({ ok: true })

import { approveSubmission, rejectSubmission } from '@/actions/submissions'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

describe('approveSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws Unauthorized if caller is not admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'participant', id: 'u1' } } as any)

    await expect(approveSubmission('sub-123')).rejects.toThrow('Unauthorized')
  })

  it('creates enrollment and updates submission status when admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin', id: 'admin-1' } } as any)
    vi.mocked(db.query.interestSubmissions.findFirst).mockResolvedValue({
      id: 'sub-123',
      studyId: 'study-1',
      userId: 'user-1',
      status: 'screened',
    } as any)

    await approveSubmission('sub-123')

    expect(db.insert).toHaveBeenCalled()
    expect(db.update).toHaveBeenCalled()
  })
})

describe('rejectSubmission', () => {
  it('throws Unauthorized if caller is not admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'participant', id: 'u1' } } as any)

    await expect(rejectSubmission('sub-123')).rejects.toThrow('Unauthorized')
  })

  it('updates submission status to rejected when admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin', id: 'admin-1' } } as any)

    await rejectSubmission('sub-123')

    expect(db.update).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- __tests__/actions/submissions.test.ts
```

Expected: FAIL — `Cannot find module '@/actions/submissions'`

- [ ] **Step 3: Implement `actions/submissions.ts`**

```typescript
'use server'

import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { enrollments, interestSubmissions, users } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function submitInterest(studyId: string, answers: Record<string, unknown>) {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const [submission] = await db
    .insert(interestSubmissions)
    .values({ studyId, userId: session.user.id, answers })
    .returning()

  // Trigger async screening — fire and forget
  fetch(`${process.env.AUTH_URL}/api/agent/screen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submissionId: submission.id }),
  }).catch(console.error)

  return submission
}

export async function approveSubmission(submissionId: string) {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  const submission = await db.query.interestSubmissions.findFirst({
    where: eq(interestSubmissions.id, submissionId),
  })
  if (!submission) throw new Error('Submission not found')

  await db.insert(enrollments).values({
    userId: submission.userId,
    studyId: submission.studyId,
    submissionId,
  })

  await db
    .update(interestSubmissions)
    .set({ status: 'approved' })
    .where(eq(interestSubmissions.id, submissionId))

  // Upgrade user role to participant if not already
  await db
    .update(users)
    .set({ role: 'participant' })
    .where(eq(users.id, submission.userId))
}

export async function rejectSubmission(submissionId: string) {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  await db
    .update(interestSubmissions)
    .set({ status: 'rejected' })
    .where(eq(interestSubmissions.id, submissionId))
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test -- __tests__/actions/submissions.test.ts
```

Expected: PASS — 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add actions/submissions.ts __tests__/actions/submissions.test.ts
git commit -m "feat: add submit interest and approve/reject server actions with tests"
```

---

## Task 10: Studies Server Actions

**Files:**
- Create: `actions/studies.ts`
- Test: `__tests__/actions/studies.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/actions/studies.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'study-1', slug: 'test-study' }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

import { createStudy, updateStudy } from '@/actions/studies'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

describe('createStudy', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws Unauthorized if caller is not admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'participant', id: 'u1' } } as any)

    await expect(createStudy({
      title: 'Study A',
      slug: 'study-a',
      description: 'desc',
      summary: 'sum',
      contactEmail: 'pi@example.com',
      eligibilityCriteria: { questions: [], criteria: {} },
    })).rejects.toThrow('Unauthorized')
  })

  it('inserts study and redirects when admin', async () => {
    const { redirect } = await import('next/navigation')
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin', id: 'admin-1' } } as any)

    await createStudy({
      title: 'Study A',
      slug: 'study-a',
      description: 'desc',
      summary: 'sum',
      contactEmail: 'pi@example.com',
      eligibilityCriteria: { questions: [], criteria: {} },
    })

    expect(db.insert).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/admin/studies')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- __tests__/actions/studies.test.ts
```

Expected: FAIL — `Cannot find module '@/actions/studies'`

- [ ] **Step 3: Implement `actions/studies.ts`**

```typescript
'use server'

import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { studies } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

type StudyInput = {
  title: string
  slug: string
  description: string
  summary: string
  contactEmail: string
  eligibilityCriteria: unknown
}

export async function createStudy(input: StudyInput) {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  await db.insert(studies).values({
    ...input,
    createdBy: session.user.id,
  })

  redirect('/admin/studies')
}

export async function updateStudy(id: string, input: Partial<StudyInput> & { status?: 'draft' | 'active' | 'closed' }) {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  await db
    .update(studies)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(studies.id, id))
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test -- __tests__/actions/studies.test.ts
```

Expected: PASS — 2 tests passing

- [ ] **Step 5: Commit**

```bash
git add actions/studies.ts __tests__/actions/studies.test.ts
git commit -m "feat: add study CRUD server actions with tests"
```

---

## Task 11: Auth Pages (Sign In / Sign Up)

**Files:**
- Create: `app/(auth)/signin/page.tsx`
- Create: `app/(auth)/signup/page.tsx`

- [ ] **Step 1: Create sign-in page**

Create `app/(auth)/signin/page.tsx`:
```tsx
'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    })
    if (result?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/')
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, marginBottom: 24 }}>Sign in</h1>
      {error && <p style={{ color: 'var(--err)', marginBottom: 16 }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input name="email" type="email" placeholder="Email" required
          style={{ padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        <input name="password" type="password" placeholder="Password" required
          style={{ padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        <button type="submit"
          style={{ padding: '10px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
          Sign in
        </button>
      </form>
      <p style={{ marginTop: 16, color: 'var(--ink2)' }}>
        No account? <a href="/auth/signup">Create one</a>
      </p>
    </main>
  )
}
```

- [ ] **Step 2: Create sign-up page**

Create `app/(auth)/signup/page.tsx`:
```tsx
import { signUp } from '@/actions/auth'

export default function SignUpPage() {
  return (
    <main style={{ maxWidth: 400, margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, marginBottom: 24 }}>Create account</h1>
      <form action={signUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input name="name" type="text" placeholder="Full name" required
          style={{ padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        <input name="email" type="email" placeholder="Email" required
          style={{ padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        <input name="password" type="password" placeholder="Password" required
          style={{ padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        <button type="submit"
          style={{ padding: '10px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
          Create account
        </button>
      </form>
      <p style={{ marginTop: 16, color: 'var(--ink2)' }}>
        Already have an account? <a href="/auth/signin">Sign in</a>
      </p>
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/
git commit -m "feat: add sign in and sign up pages"
```

---

## Task 12: Public Pages (Landing + Studies)

**Files:**
- Create: `app/(public)/page.tsx`
- Create: `app/(public)/studies/page.tsx`
- Create: `app/(public)/studies/[slug]/page.tsx`

- [ ] **Step 1: Create landing page `app/(public)/page.tsx`**

```tsx
import { db } from '@/lib/db'
import { studies } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

export default async function LandingPage() {
  const activeStudies = await db.query.studies.findMany({
    where: eq(studies.status, 'active'),
    columns: { id: true, title: true, slug: true, summary: true },
    limit: 3,
  })

  return (
    <main>
      {/* Hero */}
      <section style={{ padding: '96px 32px', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 300, marginBottom: 24 }}>
          Advance medical research.<br />Find your study.
        </h1>
        <p style={{ fontSize: 18, color: 'var(--ink2)', marginBottom: 40 }}>
          Browse active clinical studies and submit your interest in minutes.
        </p>
        <Link href="/studies"
          style={{ padding: '14px 32px', background: 'var(--accent)', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 16 }}>
          Browse Studies
        </Link>
      </section>

      {/* Featured studies */}
      {activeStudies.length > 0 && (
        <section style={{ maxWidth: 1240, margin: '0 auto', padding: '0 32px 96px' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400, marginBottom: 32 }}>
            Featured Studies
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {activeStudies.map((study) => (
              <Link key={study.id} href={`/studies/${study.slug}`}
                style={{ display: 'block', padding: 28, border: '1px solid var(--line)', borderRadius: 12, background: 'var(--surface)' }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 400, marginBottom: 12 }}>{study.title}</h3>
                <p style={{ color: 'var(--ink2)', fontSize: 15, lineHeight: 1.6 }}>{study.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Create studies list page `app/(public)/studies/page.tsx`**

```tsx
import { db } from '@/lib/db'
import { studies } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

export default async function StudiesPage() {
  const activeStudies = await db.query.studies.findMany({
    where: eq(studies.status, 'active'),
  })

  return (
    <main style={{ maxWidth: 1240, margin: '0 auto', padding: '64px 32px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 40, fontWeight: 300, marginBottom: 40 }}>
        Active Studies
      </h1>
      {activeStudies.length === 0 && (
        <p style={{ color: 'var(--ink3)' }}>No active studies at this time. Check back soon.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {activeStudies.map((study) => (
          <Link key={study.id} href={`/studies/${study.slug}`}
            style={{ display: 'block', padding: '24px 28px', border: '1px solid var(--line)', borderRadius: 12, background: 'var(--surface)' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, marginBottom: 8 }}>{study.title}</h2>
            <p style={{ color: 'var(--ink2)', marginBottom: 0 }}>{study.summary}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Create study detail + interest form `app/(public)/studies/[slug]/page.tsx`**

```tsx
import { db } from '@/lib/db'
import { studies } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import InterestForm from './InterestForm'

export default async function StudyDetailPage({ params }: { params: { slug: string } }) {
  const study = await db.query.studies.findFirst({
    where: eq(studies.slug, params.slug),
  })

  if (!study || study.status !== 'active') notFound()

  const session = await auth()
  const criteria = study.eligibilityCriteria as {
    questions: { id: string; label: string; type: string }[]
    criteria: Record<string, unknown>
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '64px 32px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 40, fontWeight: 300, marginBottom: 16 }}>
        {study.title}
      </h1>
      <p style={{ color: 'var(--ink2)', marginBottom: 48, whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
        {study.description}
      </p>
      <p style={{ color: 'var(--ink2)' }}>
        Questions? Email <a href={`mailto:${study.contactEmail}`}>{study.contactEmail}</a>
      </p>

      <hr style={{ margin: '48px 0', borderColor: 'var(--line)' }} />

      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, marginBottom: 32 }}>
        Submit Your Interest
      </h2>

      {session ? (
        <InterestForm studyId={study.id} questions={criteria.questions ?? []} />
      ) : (
        <p style={{ color: 'var(--ink2)' }}>
          <a href="/auth/signin">Sign in</a> or <a href="/auth/signup">create an account</a> to submit your interest.
        </p>
      )}
    </main>
  )
}
```

- [ ] **Step 4: Create `app/(public)/studies/[slug]/InterestForm.tsx`**

```tsx
'use client'

import { submitInterest } from '@/actions/submissions'
import { useState } from 'react'

type Question = { id: string; label: string; type: string }

export default function InterestForm({
  studyId,
  questions,
}: {
  studyId: string
  questions: Question[]
}) {
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const answers: Record<string, string> = {}
    questions.forEach((q) => {
      answers[q.id] = fd.get(q.id) as string
    })
    await submitInterest(studyId, answers)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ padding: 24, background: 'var(--accent-soft)', borderRadius: 12 }}>
        <p style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>
          Thank you! Your interest has been submitted. Our team will be in touch.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {questions.map((q) => (
        <div key={q.id}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>{q.label}</label>
          {q.type === 'textarea' ? (
            <textarea name={q.id} required rows={4}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
          ) : (
            <input name={q.id} type={q.type} required
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
          )}
        </div>
      ))}
      <button type="submit"
        style={{ alignSelf: 'flex-start', padding: '12px 32px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15 }}>
        Submit Interest
      </button>
    </form>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/\(public\)/
git commit -m "feat: add public landing page, studies list, and study detail with interest form"
```

---

## Task 13: Admin — Studies CRUD

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/studies/page.tsx`
- Create: `app/admin/studies/new/page.tsx`
- Create: `app/admin/studies/[id]/page.tsx`

- [ ] **Step 1: Create admin layout**

Create `app/admin/layout.tsx`:
```tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') redirect('/auth/signin')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: 220, background: 'var(--surface)', borderRight: '1px solid var(--line)', padding: '32px 20px', flexShrink: 0 }}>
        <p style={{ fontWeight: 700, marginBottom: 32, color: 'var(--accent-ink)' }}>Admin</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/admin" style={{ padding: '8px 12px', borderRadius: 6, color: 'var(--ink2)' }}>Dashboard</Link>
          <Link href="/admin/studies" style={{ padding: '8px 12px', borderRadius: 6, color: 'var(--ink2)' }}>Studies</Link>
          <Link href="/admin/submissions" style={{ padding: '8px 12px', borderRadius: 6, color: 'var(--ink2)' }}>Submissions</Link>
        </div>
      </nav>
      <main style={{ flex: 1, padding: '48px 40px', overflowY: 'auto' }}>{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: Create studies list `app/admin/studies/page.tsx`**

```tsx
import { db } from '@/lib/db'
import Link from 'next/link'

export default async function AdminStudiesPage() {
  const allStudies = await db.query.studies.findMany({
    orderBy: (studies, { desc }) => [desc(studies.createdAt)],
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400 }}>Studies</h1>
        <Link href="/admin/studies/new"
          style={{ padding: '10px 24px', background: 'var(--accent)', color: '#fff', borderRadius: 8, fontWeight: 600 }}>
          + New Study
        </Link>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)' }}>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ink3)', fontWeight: 600 }}>Title</th>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ink3)', fontWeight: 600 }}>Status</th>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ink3)', fontWeight: 600 }}>Created</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {allStudies.map((study) => (
            <tr key={study.id} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={{ padding: '14px 16px' }}>{study.title}</td>
              <td style={{ padding: '14px 16px', textTransform: 'capitalize' }}>{study.status}</td>
              <td style={{ padding: '14px 16px', color: 'var(--ink3)' }}>
                {new Date(study.createdAt).toLocaleDateString()}
              </td>
              <td style={{ padding: '14px 16px' }}>
                <Link href={`/admin/studies/${study.id}`} style={{ color: 'var(--accent-ink)' }}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 3: Create new study form `app/admin/studies/new/page.tsx`**

```tsx
import { createStudy } from '@/actions/studies'

export default function NewStudyPage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400, marginBottom: 40 }}>New Study</h1>
      <form action={createStudy} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Field name="title" label="Title" />
        <Field name="slug" label="URL Slug (e.g. heart-health-2026)" />
        <Field name="summary" label="Summary (short, shown on cards)" />
        <Field name="contactEmail" label="Contact Email" type="email" />
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Description</label>
          <textarea name="description" required rows={8}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
            Eligibility Criteria (JSON)
          </label>
          <textarea name="eligibilityCriteria" required rows={12}
            defaultValue={JSON.stringify({
              questions: [
                { id: 'age', label: 'What is your age?', type: 'number' },
                { id: 'conditions', label: 'List any current medical conditions', type: 'textarea' },
                { id: 'medications', label: 'List any current medications', type: 'textarea' },
              ],
              criteria: {
                minAge: 18,
                maxAge: 75,
                note: 'Describe any exclusion criteria here for the AI agent',
              },
            }, null, 2)}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'monospace', fontSize: 13 }} />
        </div>
        <button type="submit"
          style={{ alignSelf: 'flex-start', padding: '12px 32px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
          Create Study
        </button>
      </form>
    </div>
  )
}

function Field({ name, label, type = 'text' }: { name: string; label: string; type?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>{label}</label>
      <input name={name} type={type} required
        style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
    </div>
  )
}
```

- [ ] **Step 4: Update `actions/studies.ts` to parse eligibilityCriteria from JSON string**

Add JSON parsing for when the form sends it as a string. Update the `createStudy` action:

```typescript
// At the top of createStudy, before db.insert:
const parsedCriteria = typeof input.eligibilityCriteria === 'string'
  ? JSON.parse(input.eligibilityCriteria)
  : input.eligibilityCriteria
```

And update the `values()` call to use `parsedCriteria` instead of `input.eligibilityCriteria`.

- [ ] **Step 5: Create edit study page `app/admin/studies/[id]/page.tsx`**

```tsx
import { db } from '@/lib/db'
import { studies } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { updateStudy } from '@/actions/studies'
import Link from 'next/link'

export default async function EditStudyPage({ params }: { params: { id: string } }) {
  const study = await db.query.studies.findFirst({
    where: eq(studies.id, params.id),
  })
  if (!study) notFound()

  async function handleUpdate(formData: FormData) {
    'use server'
    await updateStudy(params.id, {
      title: formData.get('title') as string,
      summary: formData.get('summary') as string,
      description: formData.get('description') as string,
      contactEmail: formData.get('contactEmail') as string,
      status: formData.get('status') as 'draft' | 'active' | 'closed',
      eligibilityCriteria: JSON.parse(formData.get('eligibilityCriteria') as string),
    })
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400 }}>Edit Study</h1>
        <Link href={`/admin/studies/${study.id}/applicants`} style={{ color: 'var(--accent-ink)' }}>
          View Applicants
        </Link>
      </div>
      <form action={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Title</label>
          <input name="title" defaultValue={study.title} required
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Status</label>
          <select name="status" defaultValue={study.status}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Summary</label>
          <input name="summary" defaultValue={study.summary} required
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Contact Email</label>
          <input name="contactEmail" type="email" defaultValue={study.contactEmail} required
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Description</label>
          <textarea name="description" defaultValue={study.description} required rows={8}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Eligibility Criteria (JSON)</label>
          <textarea name="eligibilityCriteria" defaultValue={JSON.stringify(study.eligibilityCriteria, null, 2)}
            required rows={12}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'monospace', fontSize: 13 }} />
        </div>
        <button type="submit"
          style={{ alignSelf: 'flex-start', padding: '12px 32px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
          Save Changes
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add app/admin/layout.tsx app/admin/studies/
git commit -m "feat: add admin studies CRUD pages"
```

---

## Task 14: Admin — Submissions Review

**Files:**
- Create: `app/admin/submissions/page.tsx`
- Create: `app/admin/submissions/[id]/page.tsx`

- [ ] **Step 1: Create submissions list `app/admin/submissions/page.tsx`**

```tsx
import { db } from '@/lib/db'
import Link from 'next/link'

export default async function AdminSubmissionsPage() {
  const submissions = await db.query.interestSubmissions.findMany({
    with: { study: { columns: { title: true } }, user: { columns: { name: true, email: true } } },
    orderBy: (t, { desc }) => [desc(t.submittedAt)],
  })

  const statusColor: Record<string, string> = {
    pending: 'var(--warn)',
    screened: 'var(--accent)',
    approved: 'var(--accent-ink)',
    rejected: 'var(--err)',
    withdrawn: 'var(--ink3)',
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400, marginBottom: 32 }}>Submissions</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)' }}>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ink3)', fontWeight: 600 }}>Participant</th>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ink3)', fontWeight: 600 }}>Study</th>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ink3)', fontWeight: 600 }}>Status</th>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ink3)', fontWeight: 600 }}>Submitted</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={{ padding: '14px 16px' }}>
                <div>{s.user.name}</div>
                <div style={{ color: 'var(--ink3)', fontSize: 13 }}>{s.user.email}</div>
              </td>
              <td style={{ padding: '14px 16px' }}>{s.study.title}</td>
              <td style={{ padding: '14px 16px' }}>
                <span style={{ color: statusColor[s.status], fontWeight: 600, textTransform: 'capitalize' }}>
                  {s.status}
                </span>
              </td>
              <td style={{ padding: '14px 16px', color: 'var(--ink3)' }}>
                {new Date(s.submittedAt).toLocaleDateString()}
              </td>
              <td style={{ padding: '14px 16px' }}>
                <Link href={`/admin/submissions/${s.id}`} style={{ color: 'var(--accent-ink)' }}>Review</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Create submission detail page `app/admin/submissions/[id]/page.tsx`**

```tsx
import { db } from '@/lib/db'
import { interestSubmissions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { approveSubmission, rejectSubmission } from '@/actions/submissions'

export default async function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const submission = await db.query.interestSubmissions.findFirst({
    where: eq(interestSubmissions.id, params.id),
    with: {
      study: { columns: { title: true, slug: true } },
      user: { columns: { name: true, email: true } },
      screeningResult: true,
    },
  })

  if (!submission) notFound()

  const answers = submission.answers as Record<string, string>
  const rec = submission.screeningResult

  const recColor = rec
    ? { eligible: 'var(--accent-ink)', ineligible: 'var(--err)', needs_review: 'var(--warn)' }[rec.recommendation]
    : 'var(--ink3)'

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400, marginBottom: 8 }}>
        {submission.user.name}
      </h1>
      <p style={{ color: 'var(--ink3)', marginBottom: 40 }}>
        {submission.user.email} · {submission.study.title}
      </p>

      {/* AI Recommendation */}
      {rec ? (
        <section style={{ padding: 28, background: 'var(--accent-soft)', borderRadius: 12, marginBottom: 40 }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>AI Screening Recommendation</p>
          <p style={{ color: recColor, fontWeight: 600, textTransform: 'capitalize', marginBottom: 12 }}>
            {rec.recommendation.replace('_', ' ')} ({Math.round(rec.confidence * 100)}% confidence)
          </p>
          <p style={{ color: 'var(--ink2)', lineHeight: 1.7 }}>{rec.reasoning}</p>
        </section>
      ) : (
        <section style={{ padding: 28, background: 'var(--warn-soft)', borderRadius: 12, marginBottom: 40 }}>
          <p style={{ color: 'var(--warn)' }}>AI screening is still in progress or failed. Review manually.</p>
        </section>
      )}

      {/* Answers */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, marginBottom: 20 }}>Answers</h2>
        {Object.entries(answers).map(([key, value]) => (
          <div key={key} style={{ marginBottom: 20 }}>
            <p style={{ fontWeight: 600, marginBottom: 4, textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</p>
            <p style={{ color: 'var(--ink2)', lineHeight: 1.7 }}>{value}</p>
          </div>
        ))}
      </section>

      {/* Actions */}
      {submission.status === 'screened' || submission.status === 'pending' ? (
        <div style={{ display: 'flex', gap: 16 }}>
          <form action={approveSubmission.bind(null, submission.id)}>
            <button type="submit"
              style={{ padding: '12px 32px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
              Approve
            </button>
          </form>
          <form action={rejectSubmission.bind(null, submission.id)}>
            <button type="submit"
              style={{ padding: '12px 32px', background: 'var(--err-soft)', color: 'var(--err)', border: '1px solid var(--err)', borderRadius: 8, fontWeight: 600 }}>
              Reject
            </button>
          </form>
        </div>
      ) : (
        <p style={{ color: 'var(--ink3)', fontWeight: 600, textTransform: 'capitalize' }}>
          Status: {submission.status}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/submissions/ lib/db/schema.ts
git commit -m "feat: add admin submissions list and review page with AI recommendation"
```

---

## Task 15: Admin — Metrics Dashboard

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Create dashboard with DB aggregates**

Create `app/admin/page.tsx`:
```tsx
import { db } from '@/lib/db'
import { enrollments, interestSubmissions, studies, users } from '@/lib/db/schema'
import { count, eq } from 'drizzle-orm'

export default async function AdminDashboardPage() {
  const [
    [{ totalStudies }],
    [{ activeStudies }],
    [{ totalSubmissions }],
    [{ pendingSubmissions }],
    [{ approvedSubmissions }],
    [{ rejectedSubmissions }],
    [{ totalEnrollments }],
    [{ totalParticipants }],
  ] = await Promise.all([
    db.select({ totalStudies: count() }).from(studies),
    db.select({ activeStudies: count() }).from(studies).where(eq(studies.status, 'active')),
    db.select({ totalSubmissions: count() }).from(interestSubmissions),
    db.select({ pendingSubmissions: count() }).from(interestSubmissions).where(eq(interestSubmissions.status, 'pending')),
    db.select({ approvedSubmissions: count() }).from(interestSubmissions).where(eq(interestSubmissions.status, 'approved')),
    db.select({ rejectedSubmissions: count() }).from(interestSubmissions).where(eq(interestSubmissions.status, 'rejected')),
    db.select({ totalEnrollments: count() }).from(enrollments),
    db.select({ totalParticipants: count() }).from(users).where(eq(users.role, 'participant')),
  ])

  const enrollmentRate = totalSubmissions > 0
    ? Math.round((approvedSubmissions / totalSubmissions) * 100)
    : 0

  const metrics = [
    { label: 'Active Studies', value: activeStudies, sub: `${totalStudies} total` },
    { label: 'Total Submissions', value: totalSubmissions, sub: `${pendingSubmissions} pending review` },
    { label: 'Enrollment Rate', value: `${enrollmentRate}%`, sub: `${totalEnrollments} enrolled` },
    { label: 'Eligible Participants', value: approvedSubmissions, sub: '' },
    { label: 'Ineligible / Rejected', value: rejectedSubmissions, sub: '' },
    { label: 'Active Participants', value: totalParticipants, sub: 'with portal access' },
  ]

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400, marginBottom: 40 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ padding: 24, border: '1px solid var(--line)', borderRadius: 12, background: 'var(--surface)' }}>
            <p style={{ color: 'var(--ink3)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{m.label}</p>
            <p style={{ fontSize: 36, fontWeight: 700, marginBottom: 4 }}>{m.value}</p>
            {m.sub && <p style={{ color: 'var(--ink3)', fontSize: 13 }}>{m.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: add admin metrics dashboard"
```

---

## Task 16: Participant Portal

**Files:**
- Create: `app/portal/layout.tsx`
- Create: `app/portal/page.tsx`
- Create: `app/portal/studies/[slug]/page.tsx`

- [ ] **Step 1: Create portal layout**

Create `app/portal/layout.tsx`:
```tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ position: 'sticky', top: 0, background: 'rgba(250,248,245,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)', zIndex: 40 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/portal" style={{ fontWeight: 700, color: 'var(--accent-ink)' }}>My Portal</Link>
          <span style={{ color: 'var(--ink3)', fontSize: 14 }}>{session.user.name}</span>
        </div>
      </header>
      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '48px 32px' }}>{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: Create portal home `app/portal/page.tsx`**

```tsx
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { enrollments, interestSubmissions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

export default async function PortalPage() {
  const session = await auth()

  const myEnrollments = await db.query.enrollments.findMany({
    where: eq(enrollments.userId, session!.user.id),
    with: { study: { columns: { id: true, title: true, slug: true, summary: true, contactEmail: true } } },
    orderBy: (t, { desc }) => [desc(t.enrolledAt)],
  })

  const pendingSubmissions = await db.query.interestSubmissions.findMany({
    where: eq(interestSubmissions.userId, session!.user.id),
    with: { study: { columns: { title: true } } },
  })
  const activeStatuses = ['pending', 'screened']
  const inReview = pendingSubmissions.filter((s) => activeStatuses.includes(s.status))

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 300, marginBottom: 8 }}>
        Welcome, {session!.user.name}
      </h1>
      <p style={{ color: 'var(--ink3)', marginBottom: 48 }}>Your study participation overview.</p>

      {inReview.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, marginBottom: 16 }}>Pending Review</h2>
          {inReview.map((s) => (
            <div key={s.id} style={{ padding: '16px 20px', background: 'var(--warn-soft)', borderRadius: 8, marginBottom: 8 }}>
              <p style={{ fontWeight: 600 }}>{s.study.title}</p>
              <p style={{ color: 'var(--warn)', fontSize: 14 }}>Under review — we'll be in touch soon.</p>
            </div>
          ))}
        </section>
      )}

      <section>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, marginBottom: 16 }}>
          Enrolled Studies ({myEnrollments.length})
        </h2>
        {myEnrollments.length === 0 ? (
          <p style={{ color: 'var(--ink3)' }}>
            No active enrollments yet. <Link href="/studies">Browse studies</Link> to get started.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {myEnrollments.map((e) => (
              <Link key={e.id} href={`/portal/studies/${e.study.slug}`}
                style={{ display: 'block', padding: 24, border: '1px solid var(--line)', borderRadius: 12, background: 'var(--surface)' }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 400, marginBottom: 8 }}>{e.study.title}</h3>
                <p style={{ color: 'var(--ink2)', marginBottom: 8 }}>{e.study.summary}</p>
                <p style={{ color: 'var(--accent-ink)', fontSize: 14, fontWeight: 600 }}>Enrolled</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Create study detail for portal `app/portal/studies/[slug]/page.tsx`**

```tsx
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { enrollments, studies } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

export default async function PortalStudyPage({ params }: { params: { slug: string } }) {
  const session = await auth()

  const study = await db.query.studies.findFirst({
    where: eq(studies.slug, params.slug),
  })
  if (!study) notFound()

  // Verify user is enrolled in this study
  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, session!.user.id),
      eq(enrollments.studyId, study.id)
    ),
  })
  if (!enrollment) notFound()

  return (
    <div style={{ maxWidth: 720 }}>
      <p style={{ color: 'var(--accent-ink)', fontWeight: 600, marginBottom: 8 }}>Enrolled</p>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 40, fontWeight: 300, marginBottom: 16 }}>
        {study.title}
      </h1>
      <p style={{ color: 'var(--ink2)', whiteSpace: 'pre-wrap', lineHeight: 1.8, marginBottom: 40 }}>
        {study.description}
      </p>
      <div style={{ padding: 24, background: 'var(--accent-soft)', borderRadius: 12 }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>Study Contact</p>
        <a href={`mailto:${study.contactEmail}`} style={{ color: 'var(--accent-ink)' }}>
          {study.contactEmail}
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/portal/ lib/db/schema.ts
git commit -m "feat: add participant portal with enrollment view and study detail"
```

---

## Task 17: Root Layout + Global Styles

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update root layout**

Replace `app/layout.tsx` with:
```tsx
import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'

export const metadata: Metadata = {
  title: 'Aurelis Participant Platform',
  description: 'Browse and enroll in clinical research studies.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          :root {
            --bg: #FAF8F5; --surface: #FFFFFF; --sand: #F2EEE8;
            --ink: #1F1D1B; --ink2: #57524C; --ink3: #8B857D;
            --line: #E4DED4; --accent: #5E7460; --accent-soft: #EAEEE7;
            --accent-ink: #3F5242; --warn: #8A6A3A; --warn-soft: #F5EDE0;
            --err: #8C4A42; --err-soft: #F6E9E7;
            --serif: "Newsreader", Georgia, serif;
            --sans: "Manrope", system-ui, sans-serif;
          }
          * { box-sizing: border-box; }
          html { scroll-behavior: smooth; }
          body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--sans); -webkit-font-smoothing: antialiased; }
          a { color: var(--accent-ink); text-decoration: none; }
          a:hover { color: var(--ink); }
          button { font-family: var(--sans); cursor: pointer; }
          input, select, textarea { font-family: var(--sans); font-size: 15px; color: var(--ink); }
          :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
          ::selection { background: var(--accent-soft); }
          p { margin: 0 0 8px; }
          h1, h2, h3 { margin: 0; }
        `}</style>
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Run the full test suite**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 3: Run dev server and verify**

```bash
npm run dev
```

Verify:
- `http://localhost:3000` — landing page loads
- `http://localhost:3000/studies` — study list loads (empty if no studies yet)
- `http://localhost:3000/auth/signup` — sign-up form works
- `http://localhost:3000/auth/signin` — sign-in form works
- `http://localhost:3000/admin` — redirects to signin if not admin

- [ ] **Step 4: Seed an admin user**

First generate a bcrypt hash for your chosen password:
```bash
node -e "const b = require('bcryptjs'); b.hash('yourpassword', 12).then(h => console.log(h))"
```

Then insert into Neon SQL editor (replace `<hash>` with the output above):
```sql
INSERT INTO users (id, email, name, password_hash, role)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  'Admin User',
  '<paste bcrypt hash here>',
  'admin'
);
```

- [ ] **Step 5: Final commit**

```bash
git add app/layout.tsx
git commit -m "feat: complete platform — root layout with design system tokens"
```

---

## All Tests

Run the full suite at any point:
```bash
npm test
```

Expected: 9 tests passing across 3 test files.
