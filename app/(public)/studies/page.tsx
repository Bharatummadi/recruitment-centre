import { db } from '@/lib/db'
import { studies } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

export default async function StudiesPage() {
  const activeStudies = await db.query.studies.findMany({
    where: eq(studies.status, 'active'),
  })

  return (
    <main style={{ maxWidth: 1240, margin: '0 auto', padding: '64px 32px' }}>
      <p style={{ color: 'var(--accent-ink)', fontWeight: 600, marginBottom: 8, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Visakhapatnam · Hyderabad · Bangalore
      </p>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 40, fontWeight: 300, marginBottom: 12 }}>
        Open Product Trials
      </h1>
      <p style={{ color: 'var(--ink2)', marginBottom: 40, lineHeight: 1.7 }}>
        Consumer research trials for skincare, haircare, and grooming products. Apply to trials you qualify for and get compensated for your time.
      </p>
      {activeStudies.length === 0 && (
        <p style={{ color: 'var(--ink3)' }}>No open trials at this time. Check back soon.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {activeStudies.map((study) => (
          <Link key={study.id} href={`/studies/${study.slug}`}
            style={{ display: 'block', padding: '24px 28px', border: '1px solid var(--line)', borderRadius: 12, background: 'var(--surface)' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, marginBottom: 8 }}>{study.title}</h2>
            <p style={{ color: 'var(--ink2)', marginBottom: 0 }}>{study.summary}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
