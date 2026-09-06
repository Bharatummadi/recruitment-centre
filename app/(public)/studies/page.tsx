import { db } from '@/lib/db'
import { studies } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type EligibilityCriteria = {
  criteria?: { locations?: string[]; minAge?: number; maxAge?: number; gender?: string }
}

function getCategory(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('hair') || t.includes('shampoo') || t.includes('scalp') || t.includes('beard') || t.includes('dandruff')) return 'Haircare'
  if (t.includes('body')) return 'Body Care'
  return 'Skincare'
}

export default async function StudiesPage() {
  const activeStudies = await db.query.studies.findMany({
    where: eq(studies.status, 'active'),
  })

  return (
    <main style={{ maxWidth: 1240, margin: '0 auto', padding: '44px 32px 84px' }}>
      <div style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 22 }}>
        <Link href="/" style={{ color: 'var(--ink3)' }}>Home</Link> / Studies
      </div>

      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 44, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
        Studies currently recruiting
      </h1>
      <p style={{ fontSize: 15, color: 'var(--ink2)', margin: '0 0 36px' }}>
        Explore research opportunities for skincare, haircare, and grooming products across Visakhapatnam, Hyderabad, and Bangalore.
      </p>

      {activeStudies.length === 0 ? (
        <p style={{ color: 'var(--ink3)' }}>No open trials at this time. Check back soon.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeStudies.map((study) => {
            const ec = study.eligibilityCriteria as EligibilityCriteria
            const category = getCategory(study.title)
            const min = ec?.criteria?.minAge
            const max = ec?.criteria?.maxAge
            const ages = min && max ? `${min}–${max} years` : min ? `${min}+ years` : null
            return (
              <Link key={study.id} className="study-card" href={`/studies/${study.slug}`} style={{
                display: 'block', padding: '24px 28px',
                border: '1px solid var(--line)', borderRadius: 3,
                background: 'var(--surface)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--ink3)' }}>{category}</span>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', background: 'var(--accent-soft)', color: 'var(--accent-ink)', padding: '4px 8px', borderRadius: 2 }}>Recruiting</span>
                  {ages && <span style={{ fontSize: '12px', color: 'var(--ink3)', marginLeft: 'auto' }}>{ages}</span>}
                </div>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, margin: '0 0 8px' }}>{study.title}</h2>
                <p style={{ color: 'var(--ink2)', margin: 0, lineHeight: 1.6 }}>{study.summary}</p>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
