import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/portal/signin')

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ position: 'sticky', top: 0, background: 'rgba(250,248,245,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)', zIndex: 40 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/portal" style={{ fontWeight: 700, color: 'var(--accent-ink)' }}>My Portal</Link>
          <span style={{ color: 'var(--ink3)', fontSize: 14 }}>{session.user.name}</span>
        </div>
      </header>
      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '48px 32px' }}>{children}</main>
    </div>
  )
}
