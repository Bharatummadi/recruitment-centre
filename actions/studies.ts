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

  // Parse eligibilityCriteria if it's a JSON string (from form submission)
  const parsedCriteria =
    typeof input.eligibilityCriteria === 'string'
      ? JSON.parse(input.eligibilityCriteria)
      : input.eligibilityCriteria

  await db.insert(studies).values({
    title: input.title,
    slug: input.slug,
    description: input.description,
    summary: input.summary,
    contactEmail: input.contactEmail,
    eligibilityCriteria: parsedCriteria,
    createdBy: session.user.id,
  })

  redirect('/admin/studies')
}

export async function updateStudy(
  id: string,
  input: Partial<StudyInput> & { status?: 'draft' | 'active' | 'closed' }
) {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  const parsedCriteria =
    input.eligibilityCriteria !== undefined && typeof input.eligibilityCriteria === 'string'
      ? JSON.parse(input.eligibilityCriteria)
      : input.eligibilityCriteria

  await db
    .update(studies)
    .set({ ...input, eligibilityCriteria: parsedCriteria, updatedAt: new Date() })
    .where(eq(studies.id, id))
}
