import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') redirect('/auth/signin')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: 220, background: 'var(--surface)', borderRight: '1px solid var(--line)', padding: '32px 20px', flexShrink: 0 }}>
        <p style={{ fontWeight: 700, marginBottom: 32, color: 'var(--accent-ink)' }}>Admin</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/admin" style={{ padding: '8px 12px', borderRadius: 6, color: 'var(--ink2)' }}>Dashboard</Link>
          <Link href="/admin/studies" style={{ padding: '8px 12px', borderRadius: 6, color: 'var(--ink2)' }}>Studies</Link>
          <Link href="/admin/submissions" style={{ padding: '8px 12px', borderRadius: 6, color: 'var(--ink2)' }}>Submissions</Link>
        </div>
      </nav>
      <main style={{ flex: 1, padding: '48px 40px', overflowY: 'auto' }}>{children}</main>
    </div>
  )
}
