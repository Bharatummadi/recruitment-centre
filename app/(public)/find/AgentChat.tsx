'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type Study = { id: string; slug: string; title: string; summary: string }
type Message = { role: 'user' | 'agent'; content: string; matchedSlugs?: string[] }

const EXAMPLES = [
  'I am a 27-year-old woman in Hyderabad with oily, acne-prone skin',
  'Male, 34, based in Bangalore, experiencing hair fall for the past year',
  'I am 45, based in Vizag, with dry and damaged hair from colouring',
]

export default function AgentChat({ studies }: { studies: Study[] }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(query: string) {
    if (!query.trim() || loading) return
    const isFirstMessage = messages.length === 0

    setMessages((prev) => [...prev, { role: 'user', content: query }])
    setInput('')
    setLoading(true)

    const res = await fetch('/api/agent/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, sessionId, isFirstMessage }),
    })

    let data: { message?: string; matchedSlugs?: string[]; error?: string } = {}
    try {
      data = await res.json()
    } catch {
      data = { error: 'Unexpected response from server.' }
    }

    setMessages((prev) => [
      ...prev,
      res.ok
        ? { role: 'agent', content: data.message ?? '', matchedSlugs: data.matchedSlugs ?? [] }
        : { role: 'agent', content: data.error ?? 'Something went wrong. Please try again.' },
    ])
    setLoading(false)
    inputRef.current?.focus()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    send(input)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  function resetConversation() {
    setMessages([])
    setInput('')
    inputRef.current?.focus()
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--line)',
    borderRadius: 8,
    fontSize: 15,
    lineHeight: 1.6,
    resize: 'none' as const,
    fontFamily: 'inherit',
    outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Empty state */}
      {messages.length === 0 && (
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: 'var(--ink2)', marginBottom: 16, fontSize: 15 }}>
            Try one of these examples or describe yourself below:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => send(ex)}
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 20,
                  cursor: 'pointer',
                  color: 'var(--ink2)',
                  textAlign: 'left',
                }}
              >
                {ex.length > 55 ? ex.slice(0, 55) + '…' : ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat history */}
      {messages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === 'user' ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '12px 18px',
                      background: 'var(--accent)',
                      color: '#fff',
                      borderRadius: '16px 16px 4px 16px',
                      lineHeight: 1.6,
                      fontSize: 15,
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      padding: '16px 20px',
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      borderRadius: '4px 16px 16px 16px',
                      lineHeight: 1.8,
                      fontSize: 15,
                      whiteSpace: 'pre-wrap',
                      color: 'var(--ink)',
                    }}
                  >
                    {msg.content}
                  </div>

                  {/* Matched study cards */}
                  {msg.matchedSlugs && msg.matchedSlugs.length > 0 && (
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {studies
                        .filter((s) => msg.matchedSlugs!.includes(s.slug))
                        .map((study) => (
                          <div
                            key={study.id}
                            style={{
                              padding: '16px 20px',
                              border: '1px solid var(--accent)',
                              borderRadius: 10,
                              background: 'var(--accent-soft)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: 16,
                            }}
                          >
                            <div>
                              <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>{study.title}</p>
                              <p style={{ color: 'var(--ink2)', fontSize: 13, lineHeight: 1.5 }}>{study.summary}</p>
                            </div>
                            <Link
                              href={`/studies/${study.slug}`}
                              style={{
                                flexShrink: 0,
                                padding: '8px 20px',
                                background: 'var(--accent)',
                                color: '#fff',
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: 13,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Apply
                            </Link>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '12px 18px',
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px 16px 16px 16px',
                  color: 'var(--ink3)',
                  fontSize: 14,
                }}
              >
                Agent is thinking…
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          position: 'sticky',
          bottom: 0,
          background: 'var(--bg)',
          paddingTop: 16,
          paddingBottom: 8,
          borderTop: messages.length > 0 ? '1px solid var(--line)' : 'none',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              messages.length === 0
                ? 'E.g. I am a 30-year-old woman in Hyderabad with dry, frizzy hair…'
                : 'Ask a follow-up question…'
            }
            rows={2}
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              flexShrink: 0,
              padding: '12px 24px',
              background: loading || !input.trim() ? 'var(--ink3)' : 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              height: 48,
            }}
          >
            Send
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--ink3)' }}>Press Enter to send · Shift+Enter for new line</p>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={resetConversation}
              style={{
                fontSize: 12,
                color: 'var(--ink3)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              New conversation
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
