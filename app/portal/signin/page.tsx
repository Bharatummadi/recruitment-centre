'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ParticipantSignInPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    })
    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      const session = await getSession()
      router.push(session?.user?.role === 'admin' ? '/admin' : '/portal')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Minimal header */}
      <header style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/aurelis-logo.png" alt="Aurelis Research Centre" style={{ height: 48, width: 'auto' }} />
          </Link>
        </div>
      </header>

      {/* Two-column layout matching design system */}
      <div style={{
        flex: 1, maxWidth: 1240, margin: '0 auto', padding: '64px 32px 110px',
        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
        gap: 64, alignItems: 'center', width: '100%',
      }}>
        {/* Left: info */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 14 }}>Participant portal</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 42, letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 16px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '15.5px', lineHeight: 1.7, color: 'var(--ink2)', margin: '0 0 26px', maxWidth: 420 }}>
            Sign in to check the status of your study applications, view your enrolled trials, and manage your participation.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
            <div style={{ display: 'flex', gap: 11, fontSize: '13.5px', color: 'var(--ink2)', lineHeight: 1.55 }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>·</span>
              No account required to browse or submit interest in a study.
            </div>
            <div style={{ display: 'flex', gap: 11, fontSize: '13.5px', color: 'var(--ink2)', lineHeight: 1.55 }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>·</span>
              Create an account to track your applications in one place.
            </div>
          </div>
          <div style={{ marginTop: 32 }}>
            <Link href="/studies" style={{ fontSize: '13.5px', color: 'var(--accent-ink)', fontWeight: 600 }}>
              Browse open trials without signing in →
            </Link>
          </div>
        </div>

        {/* Right: sign-in form */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 3, padding: 40, maxWidth: 420, width: '100%', justifySelf: 'end' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 24, marginBottom: 8 }}>Sign in</div>
          <p style={{ fontSize: 13, color: 'var(--ink2)', margin: '0 0 24px', lineHeight: 1.6 }}>
            Use the email and password from your Aurelis account.
          </p>

          {error && (
            <div style={{ background: 'var(--err-soft)', border: '1px solid var(--err)', borderRadius: 2, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--err)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 7 }}>Email address</label>
              <input name="email" type="email" placeholder="you@example.com" required
                style={{ width: '100%', padding: '12px 13px', border: '1px solid var(--line)', borderRadius: 2, background: 'var(--bg)', fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 7 }}>Password</label>
              <input name="password" type="password" placeholder="••••••••" required
                style={{ width: '100%', padding: '12px 13px', border: '1px solid var(--line)', borderRadius: 2, background: 'var(--bg)', fontSize: 14 }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', background: 'var(--ink)', color: '#fff', border: 0, padding: 15, borderRadius: 2, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{ fontSize: '11.5px', color: 'var(--ink3)', margin: '20px 0 0', lineHeight: 1.6 }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
