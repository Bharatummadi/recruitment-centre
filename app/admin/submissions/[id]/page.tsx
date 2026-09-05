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

      {/* Screening Recommendation */}
      {rec ? (
        <section style={{ padding: 28, background: 'var(--accent-soft)', borderRadius: 12, marginBottom: 40 }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Screening Recommendation</p>
          <p style={{ color: recColor, fontWeight: 600, textTransform: 'capitalize', marginBottom: 12 }}>
            {rec.recommendation.replace('_', ' ')} ({Math.round(rec.confidence * 100)}% confidence)
          </p>
          <p style={{ color: 'var(--ink2)', lineHeight: 1.7 }}>{rec.reasoning}</p>
        </section>
      ) : (
        <section style={{ padding: 28, background: 'var(--warn-soft)', borderRadius: 12, marginBottom: 40 }}>
          <p style={{ color: 'var(--warn)' }}>Screening is in progress or unavailable. Review manually.</p>
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

      {/* Approve / Reject actions */}
      {(submission.status === 'screened' || submission.status === 'pending') ? (
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
