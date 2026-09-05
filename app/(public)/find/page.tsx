import { db } from '@/lib/db'
import { studies } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import AgentChat from './AgentChat'

export default async function FindStudyPage() {
  const activeStudies = await db.query.studies.findMany({
    where: eq(studies.status, 'active'),
    columns: { id: true, slug: true, title: true, summary: true },
  })

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '64px 32px' }}>
      <p style={{ color: 'var(--accent-ink)', fontWeight: 600, marginBottom: 8, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Trial Matcher</p>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 40, fontWeight: 300, marginBottom: 16 }}>
        Find the right trial for you
      </h1>
      <p style={{ color: 'var(--ink2)', lineHeight: 1.8, marginBottom: 48 }}>
        Tell us your city, skin type, hair concerns, and what products you currently use.
        Our AI agent will match you to open trials you qualify for — across skincare, haircare, and grooming.
      </p>

      <AgentChat studies={activeStudies} />
    </main>
  )
}
