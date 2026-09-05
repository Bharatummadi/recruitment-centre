import { db } from '@/lib/db'
import Link from 'next/link'

export default async function AdminStudiesPage() {
  const allStudies = await db.query.studies.findMany({
    orderBy: (studies, { desc }) => [desc(studies.createdAt)],
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400 }}>Studies</h1>
        <Link href="/admin/studies/new"
          style={{ padding: '10px 24px', background: 'var(--accent)', color: '#fff', borderRadius: 8, fontWeight: 600 }}>
          + New Study
        </Link>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)' }}>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ink3)', fontWeight: 600 }}>Title</th>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ink3)', fontWeight: 600 }}>Status</th>
            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ink3)', fontWeight: 600 }}>Created</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {allStudies.map((study) => (
            <tr key={study.id} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={{ padding: '14px 16px' }}>{study.title}</td>
              <td style={{ padding: '14px 16px', textTransform: 'capitalize' }}>{study.status}</td>
              <td style={{ padding: '14px 16px', color: 'var(--ink3)' }}>
                {new Date(study.createdAt).toLocaleDateString()}
              </td>
              <td style={{ padding: '14px 16px' }}>
                <Link href={`/admin/studies/${study.id}`} style={{ color: 'var(--accent-ink)' }}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
