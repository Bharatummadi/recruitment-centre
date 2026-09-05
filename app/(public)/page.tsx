import { db } from '@/lib/db'
import { studies } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const activeStudies = await db.query.studies.findMany({
    where: eq(studies.status, 'active'),
    columns: { id: true, title: true, slug: true, summary: true },
    limit: 3,
  })

  return (
    <main>
      {/* Hero */}
      <section style={{ padding: '96px 32px', textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
        <p style={{ color: 'var(--accent-ink)', fontWeight: 600, marginBottom: 16, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 13 }}>
          Visakhapatnam · Hyderabad · Bangalore
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 300, marginBottom: 24, lineHeight: 1.2 }}>
          Shape the future of beauty.<br />Get paid to test products.
        </h1>
        <p style={{ fontSize: 18, color: 'var(--ink2)', marginBottom: 40, lineHeight: 1.7 }}>
          Join consumer research trials for skincare, haircare, and grooming products — for men and women across India.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/find"
            style={{ padding: '14px 32px', background: 'var(--accent)', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 16 }}>
            Find My Trial
          </Link>
          <Link href="/studies"
            style={{ padding: '14px 32px', background: 'transparent', color: 'var(--accent-ink)', border: '1.5px solid var(--accent)', borderRadius: 8, fontWeight: 600, fontSize: 16 }}>
            Browse All Trials
          </Link>
        </div>
      </section>

      {/* Featured studies */}
      {activeStudies.length > 0 && (
        <section style={{ maxWidth: 1240, margin: '0 auto', padding: '0 32px 96px' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400, marginBottom: 32 }}>
            Open Trials
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
