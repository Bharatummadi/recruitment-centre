import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { enrollments, studies } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

export default async function PortalStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()

  const study = await db.query.studies.findFirst({
    where: eq(studies.slug, slug),
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
