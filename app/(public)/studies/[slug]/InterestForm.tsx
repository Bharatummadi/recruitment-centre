'use client'

import { submitInterest } from '@/actions/submissions'
import { useState } from 'react'

type Question = { id: string; label: string; type: string }

export default function InterestForm({
  studyId,
  questions,
  isLoggedIn,
}: {
  studyId: string
  questions: Question[]
  isLoggedIn: boolean
}) {
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const answers: Record<string, string> = {}
    questions.forEach((q) => {
      answers[q.id] = fd.get(q.id) as string
    })
    const guest = isLoggedIn
      ? undefined
      : { name: fd.get('_guestName') as string, email: fd.get('_guestEmail') as string }
    await submitInterest(studyId, answers, guest)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ padding: 24, background: 'var(--accent-soft)', borderRadius: 12 }}>
        <p style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>
          Thank you! Your interest has been submitted. Our team will be in touch.
        </p>
      </div>
    )
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {!isLoggedIn && (
        <>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Your Name</label>
            <input name="_guestName" type="text" required style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Your Email</label>
            <input name="_guestEmail" type="email" required style={inputStyle} />
          </div>
        </>
      )}
      {questions.map((q) => (
        <div key={q.id}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>{q.label}</label>
          {q.type === 'textarea' ? (
            <textarea name={q.id} required rows={4} style={inputStyle} />
          ) : (
            <input name={q.id} type={q.type} required style={inputStyle} />
          )}
        </div>
      ))}
      <button type="submit"
        style={{ alignSelf: 'flex-start', padding: '12px 32px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15 }}>
        Submit Interest
      </button>
    </form>
  )
}
