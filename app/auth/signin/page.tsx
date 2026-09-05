'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    })
    if (result?.error) {
      setError('Invalid email or password')
    } else {
      const session = await getSession()
      router.push(session?.user?.role === 'admin' ? '/admin' : '/')
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, marginBottom: 24 }}>Sign in</h1>
      {error && <p style={{ color: 'var(--err)', marginBottom: 16 }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input name="email" type="email" placeholder="Email" required
          style={{ padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        <input name="password" type="password" placeholder="Password" required
          style={{ padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        <button type="submit"
          style={{ padding: '10px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
          Sign in
        </button>
      </form>
      <p style={{ marginTop: 16, color: 'var(--ink2)' }}>
        No account? <a href="/auth/signup">Create one</a>
      </p>
    </main>
  )
}
