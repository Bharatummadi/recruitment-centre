import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Sticky header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(250,248,245,0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{
          maxWidth: 1240, margin: '0 auto', padding: '0 32px',
          height: 74, display: 'flex', alignItems: 'center', gap: 40,
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/aurelis-logo.png" alt="Aurelis Research Centre" style={{ height: 70, width: 'auto' }} />
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 28, marginLeft: 'auto' }}>
           {/* <Link className="nav-link" href="/studies" style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--ink2)' }}>Studies</Link>
            <Link className="nav-link" href="/#how-it-works" style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--ink2)' }}>How It Works</Link>
             <Link className="nav-link" href="/find" style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--ink2)' }}>AI Matcher</Link> */}
            <div style={{ width: 1, height: 22, background: 'var(--line)' }} />
            <Link className="nav-link" href="/portal/signin" style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--ink2)' }}>Participant Login</Link>
            <Link className="btn-dark" href="/find" style={{
              background: 'var(--ink)', color: '#fff',
              padding: '11px 20px', borderRadius: 2,
              fontSize: 13, fontWeight: 600, letterSpacing: '0.01em',
            }}>Find a Study</Link>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <div style={{ flex: 1 }}>{children}</div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
        <div style={{
          maxWidth: 1240, margin: '0 auto', padding: '52px 32px 36px',
          display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) repeat(3,minmax(0,1fr))', gap: 40,
        }}>
          <div>
            <div style={{ marginBottom: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/aurelis-logo.png" alt="Aurelis Research Centre" style={{ height: 70, width: 'auto' }} />
            </div>
            <p style={{ fontSize: '12.5px', lineHeight: 1.7, color: 'var(--ink2)', margin: 0, maxWidth: 280 }}>
              Consumer product evaluation research for skincare, haircare, and grooming. Visakhapatnam · Hyderabad · Bangalore.
            </p>
          </div>

          <div>
            <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 14 }}>Participants</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <Link className="nav-link" href="/find" style={{ fontSize: 13, color: 'var(--ink2)' }}>Find a study</Link>
              <Link className="nav-link" href="/studies" style={{ fontSize: 13, color: 'var(--ink2)' }}>Browse all trials</Link>
              <Link className="nav-link" href="/#how-it-works" style={{ fontSize: 13, color: 'var(--ink2)' }}>How it works</Link>
              <Link className="nav-link" href="/portal/signin" style={{ fontSize: 13, color: 'var(--ink2)' }}>Participant login</Link>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 14 }}>Research</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <span style={{ fontSize: 13, color: 'var(--ink2)' }}>Skincare trials</span>
              <span style={{ fontSize: 13, color: 'var(--ink2)' }}>Haircare trials</span>
              <span style={{ fontSize: 13, color: 'var(--ink2)' }}>Grooming trials</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 14 }}>Legal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <span style={{ fontSize: 13, color: 'var(--ink2)' }}>Privacy notice</span>
              <span style={{ fontSize: 13, color: 'var(--ink2)' }}>Participant information</span>
              <span style={{ fontSize: 13, color: 'var(--ink2)' }}>Consent information</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 32px 40px' }}>
          <p style={{ fontSize: '11.5px', lineHeight: 1.7, color: 'var(--ink3)', margin: 0, borderTop: '1px solid var(--line)', paddingTop: 20 }}>
            Aurelis Research Centre — consumer product evaluation studies for skincare, haircare, and grooming. Based in Visakhapatnam, Hyderabad, and Bangalore. Participation is voluntary. Submitting interest does not guarantee enrolment.
          </p>
        </div>
      </footer>

    </div>
  )
}
