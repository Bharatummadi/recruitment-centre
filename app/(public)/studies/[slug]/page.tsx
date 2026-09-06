import { db } from '@/lib/db'
import { studies } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import IntakeChat from './IntakeChat'

export default async function StudyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const study = await db.query.studies.findFirst({
    where: eq(studies.slug, slug),
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

      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, marginBottom: 8 }}>
        Submit Your Interest
      </h2>
      <p style={{ color: 'var(--ink2)', marginBottom: 32, lineHeight: 1.7 }}>
        Our assistant will guide you through a few quick questions about your eligibility and contact details.
      </p>

      <IntakeChat
        studyId={study.id}
        studyTitle={study.title}
        questions={criteria.questions ?? []}
        isLoggedIn={!!session}
        userName={session?.user?.name ?? undefined}
        userEmail={session?.user?.email ?? undefined}
      />
    </main>
  )
}
