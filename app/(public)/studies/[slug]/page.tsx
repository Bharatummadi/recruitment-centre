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
