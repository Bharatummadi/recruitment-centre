'use client'

import { useEffect, useRef, useState } from 'react'
import { submitInterest } from '@/actions/submissions'

type Question = { id: string; label: string; type: string }
type Message = { role: 'agent' | 'user'; text: string }
type Criteria = { locations?: string[]; minAge?: number; maxAge?: number; gender?: string }

export default function IntakeChat({
  studyId,
  studyTitle,
  questions,
  criteria,
  isLoggedIn,
  userName,
  userEmail,
}: {
  studyId: string
  studyTitle: string
  questions: Question[]
  criteria: Criteria
  isLoggedIn: boolean
  userName?: string
  userEmail?: string
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [disqualified, setDisqualified] = useState(false)
  const [error, setError] = useState('')
  const sessionId = useRef(`intake-${studyId}-${Date.now()}`)
  // Guard against React Strict Mode double-invocation — set to false BEFORE async fetch
  const initiated = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // Kick off agent greeting exactly once
  useEffect(() => {
    if (initiated.current) return
    initiated.current = true
    sendMessage('', true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function sendMessage(userText: string, isFirst = false) {
    if (!isFirst && !userText.trim()) return

    if (!isFirst) {
      setMessages((m) => [...m, { role: 'user', text: userText }])
    }
    setInput('')
    setLoading(true)
    setError('')

    const res = await fetch('/api/agent/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        sessionId: sessionId.current,
        studyTitle,
        questions,
        criteria,
        isFirstMessage: isFirst,
        userName: isLoggedIn ? userName : undefined,
        userEmail: isLoggedIn ? userEmail : undefined,
      }),
    })

    if (!res.ok) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    const data = await res.json()

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    setMessages((m) => [...m, { role: 'agent', text: data.message }])
    setLoading(false)

    if (data.disqualified) {
      setDisqualified(true)
      return
    }

    if (data.collectedData) {
      const { name, email, ...answers } = data.collectedData as Record<string, string>
      const guest = isLoggedIn ? undefined : { name, email }
      try {
        await submitInterest(studyId, answers, guest)
        setSubmitted(true)
      } catch {
        setError('Failed to save your submission. Please try again.')
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  if (submitted) {
    return (
      <div style={{ padding: 32, background: 'var(--accent-soft)', border: '1px solid #D9E0D5', borderRadius: 3, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff', fontSize: 22 }}>✓</div>
        <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 26, marginBottom: 8 }}>Thank you for your interest</h3>
        <p style={{ color: 'var(--accent-ink)', lineHeight: 1.7, maxWidth: 420, margin: '0 auto' }}>
          Your information has been submitted. The research team will review your responses and be in touch within 3 working days.
        </p>
      </div>
    )
  }

  if (disqualified) {
    return (
      <div style={{ padding: 32, background: 'var(--warn-soft)', border: '1px solid var(--warn)', borderRadius: 3 }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 24, marginBottom: 8, color: 'var(--warn)' }}>Not eligible for this study</h3>
        <p style={{ color: 'var(--ink2)', lineHeight: 1.7, margin: '0 0 16px' }}>
          Based on your responses, you don&apos;t meet the criteria for this particular trial. There may be other studies that are a better fit.
        </p>
        <a href="/studies" style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-ink)' }}>Browse other open trials →</a>
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 3, background: 'var(--surface)', display: 'flex', flexDirection: 'column', height: 520, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
        <span style={{ fontSize: 14, fontWeight: 700 }}>Study Assistant</span>
        <span style={{ fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink3)', marginLeft: 4 }}>Collecting your information</span>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg)' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
            <div style={{
              padding: '12px 15px',
              background: m.role === 'user' ? 'var(--ink)' : 'var(--surface)',
              color: m.role === 'user' ? '#fff' : 'var(--ink)',
              border: m.role === 'user' ? 'none' : '1px solid var(--line)',
              borderRadius: 3, fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap',
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div style={{ padding: '12px 15px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 3, fontSize: 13, color: 'var(--ink3)' }}>
              Typing…
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: '8px 20px', background: 'var(--err-soft)', color: 'var(--err)', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disqualified || submitted ? '' : 'Type your answer…'}
          disabled={loading || disqualified || submitted}
          style={{ flex: 1, padding: '11px 13px', border: '1px solid var(--line)', borderRadius: 2, background: 'var(--bg)', fontSize: 14 }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim() || disqualified || submitted}
          style={{
            background: 'var(--ink)', color: '#fff', border: 0,
            padding: '11px 20px', borderRadius: 2, fontSize: 13, fontWeight: 600,
            opacity: loading || !input.trim() ? 0.5 : 1,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
