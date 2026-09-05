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
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 40, fontWeight: 300, marginBottom: 40 }}>
        Active Studies
      </h1>
      {activeStudies.length === 0 && (
        <p style={{ color: 'var(--ink3)' }}>No active studies at this time. Check back soon.</p>
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
