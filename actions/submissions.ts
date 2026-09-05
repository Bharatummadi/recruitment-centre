'use server'

import { and, eq, ne } from 'drizzle-orm'
import { db } from '@/lib/db'
import { enrollments, interestSubmissions, users } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function submitInterest(studyId: string, answers: Record<string, unknown>) {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  // Prevent duplicate submissions
  const existing = await db.query.interestSubmissions.findFirst({
    where: and(
      eq(interestSubmissions.studyId, studyId),
      eq(interestSubmissions.userId, session.user.id)
    ),
  })
  if (existing) return existing

  const [submission] = await db
    .insert(interestSubmissions)
    .values({ studyId, userId: session.user.id, answers })
    .returning()

  return submission
}

export async function approveSubmission(submissionId: string) {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  const submission = await db.query.interestSubmissions.findFirst({
    where: eq(interestSubmissions.id, submissionId),
  })
  if (!submission) throw new Error('Submission not found')

  // Check for existing enrollment to prevent duplicates
  const existingEnrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, submission.userId),
      eq(enrollments.studyId, submission.studyId)
    ),
  })
  if (existingEnrollment) {
    // Already enrolled — just ensure submission status is correct
    await db
      .update(interestSubmissions)
      .set({ status: 'approved' })
      .where(eq(interestSubmissions.id, submissionId))
    return
  }

  await db.insert(enrollments).values({
    userId: submission.userId,
    studyId: submission.studyId,
    submissionId,
  })

  await db
    .update(interestSubmissions)
    .set({ status: 'approved' })
    .where(eq(interestSubmissions.id, submissionId))

  // Only upgrade to participant if not already admin
  await db
    .update(users)
    .set({ role: 'participant' })
    .where(and(eq(users.id, submission.userId), ne(users.role, 'admin')))
}

export async function rejectSubmission(submissionId: string) {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  await db
    .update(interestSubmissions)
    .set({ status: 'rejected' })
    .where(eq(interestSubmissions.id, submissionId))
}
