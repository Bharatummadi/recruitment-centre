import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  jsonb,
  real,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

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
  // Null for guest (unauthenticated) submissions
  userId: uuid('user_id').references(() => users.id),
  guestName: text('guest_name'),
  guestEmail: text('guest_email'),
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
