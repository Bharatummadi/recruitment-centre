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
