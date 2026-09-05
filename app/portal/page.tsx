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
