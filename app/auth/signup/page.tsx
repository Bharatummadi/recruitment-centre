import { signUp } from '@/actions/auth'

export default function SignUpPage() {
  return (
    <main style={{ maxWidth: 400, margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, marginBottom: 24 }}>Create account</h1>
      <form action={signUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input name="name" type="text" placeholder="Full name" required
          style={{ padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        <input name="email" type="email" placeholder="Email" required
          style={{ padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        <input name="password" type="password" placeholder="Password" required
          style={{ padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        <button type="submit"
          style={{ padding: '10px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
          Create account
        </button>
      </form>
      <p style={{ marginTop: 16, color: 'var(--ink2)' }}>
        Already have an account? <a href="/auth/signin">Sign in</a>
      </p>
    </main>
  )
}
