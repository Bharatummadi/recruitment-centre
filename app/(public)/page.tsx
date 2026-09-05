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
