import { db } from '@/lib/db'
import { enrollments, interestSubmissions, studies, users } from '@/lib/db/schema'
import { count, eq } from 'drizzle-orm'

export default async function AdminDashboardPage() {
  const [
    [{ totalStudies }],
    [{ activeStudies }],
    [{ totalSubmissions }],
    [{ pendingSubmissions }],
    [{ approvedSubmissions }],
    [{ rejectedSubmissions }],
    [{ totalEnrollments }],
    [{ totalParticipants }],
  ] = await Promise.all([
    db.select({ totalStudies: count() }).from(studies),
    db.select({ activeStudies: count() }).from(studies).where(eq(studies.status, 'active')),
    db.select({ totalSubmissions: count() }).from(interestSubmissions),
    db.select({ pendingSubmissions: count() }).from(interestSubmissions).where(eq(interestSubmissions.status, 'pending')),
    db.select({ approvedSubmissions: count() }).from(interestSubmissions).where(eq(interestSubmissions.status, 'approved')),
    db.select({ rejectedSubmissions: count() }).from(interestSubmissions).where(eq(interestSubmissions.status, 'rejected')),
    db.select({ totalEnrollments: count() }).from(enrollments),
    db.select({ totalParticipants: count() }).from(users).where(eq(users.role, 'participant')),
  ])

  const enrollmentRate = totalSubmissions > 0
    ? Math.round((approvedSubmissions / totalSubmissions) * 100)
    : 0

  const metrics = [
    { label: 'Active Studies', value: activeStudies, sub: `${totalStudies} total` },
    { label: 'Total Submissions', value: totalSubmissions, sub: `${pendingSubmissions} pending review` },
    { label: 'Enrollment Rate', value: `${enrollmentRate}%`, sub: `${totalEnrollments} enrolled` },
    { label: 'Eligible Participants', value: approvedSubmissions, sub: '' },
    { label: 'Ineligible / Rejected', value: rejectedSubmissions, sub: '' },
    { label: 'Active Participants', value: totalParticipants, sub: 'with portal access' },
  ]

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400, marginBottom: 40 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ padding: 24, border: '1px solid var(--line)', borderRadius: 12, background: 'var(--surface)' }}>
            <p style={{ color: 'var(--ink3)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{m.label}</p>
            <p style={{ fontSize: 36, fontWeight: 700, marginBottom: 4 }}>{m.value}</p>
            {m.sub && <p style={{ color: 'var(--ink3)', fontSize: 13 }}>{m.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
