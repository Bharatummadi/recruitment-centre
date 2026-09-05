import { db } from '@/lib/db'
import Link from 'next/link'

export default async function AdminSubmissionsPage() {
  const submissions = await db.query.interestSubmissions.findMany({
    with: { study: { columns: { title: true } }, user: { columns: { name: true, email: true } } },
    orderBy: (t, { desc }) => [desc(t.submittedAt)],
  })

  const statusColor: Record<string, string> = {
    pending: 'var(--warn)',
    screened: 'var(--accent)',
    approved: 'var(--accent-ink)',
    rejected: 'var(--err)',
    withdrawn: 'var(--ink3)',
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400, marginBottom: 32 }}>Submissions</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)' }}>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ink3)', fontWeight: 600 }}>Participant</th>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ink3)', fontWeight: 600 }}>Study</th>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ink3)', fontWeight: 600 }}>Status</th>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ink3)', fontWeight: 600 }}>Submitted</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={{ padding: '14px 16px' }}>
                <div>{s.user.name}</div>
                <div style={{ color: 'var(--ink3)', fontSize: 13 }}>{s.user.email}</div>
              </td>
              <td style={{ padding: '14px 16px' }}>{s.study.title}</td>
              <td style={{ padding: '14px 16px' }}>
                <span style={{ color: statusColor[s.status], fontWeight: 600, textTransform: 'capitalize' }}>
                  {s.status}
                </span>
              </td>
              <td style={{ padding: '14px 16px', color: 'var(--ink3)' }}>
                {new Date(s.submittedAt).toLocaleDateString()}
              </td>
              <td style={{ padding: '14px 16px' }}>
                <Link href={`/admin/submissions/${s.id}`} style={{ color: 'var(--accent-ink)' }}>Review</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
