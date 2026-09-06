import { db } from '@/lib/db'
import { studies } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type EligibilityCriteria = {
  criteria?: {
    locations?: string[]
    minAge?: number
    maxAge?: number
    gender?: string
  }
}

function getCategory(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('hair') || t.includes('shampoo') || t.includes('scalp') || t.includes('beard') || t.includes('dandruff')) return 'Haircare'
  if (t.includes('body')) return 'Body Care'
  return 'Skincare'
}

function getAges(ec: EligibilityCriteria): string {
  const min = ec?.criteria?.minAge
  const max = ec?.criteria?.maxAge
  if (min && max) return `${min}–${max} years`
  if (min) return `${min}+ years`
  return 'All ages'
}

function getLocations(ec: EligibilityCriteria): string {
  const locs = ec?.criteria?.locations ?? []
  if (locs.length === 0) return 'India'
  // Shorten for display
  return locs.map(l => l.replace(' (Vizag)', '')).join(' · ')
}

export default async function LandingPage() {
  const [activeStudies, allActive] = await Promise.all([
    db.query.studies.findMany({
      where: eq(studies.status, 'active'),
      columns: { id: true, title: true, slug: true, summary: true, eligibilityCriteria: true },
      limit: 3,
    }),
    db.query.studies.findMany({
      where: eq(studies.status, 'active'),
      columns: { id: true },
    }),
  ])

  const totalCount = allActive.length

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 1240, margin: '0 auto', padding: '52px 32px 64px',
        display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,0.95fr)',
        gap: 64, alignItems: 'center',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            padding: '6px 12px', border: '1px solid var(--line)',
            borderRadius: 100, background: 'var(--surface)', marginBottom: 26,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink2)' }}>
              {totalCount} {totalCount === 1 ? 'study' : 'studies'} currently recruiting
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 60,
            lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 22px',
          }}>
            Help shape the future of beauty &amp; skincare
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--ink2)', maxWidth: 520, margin: '0 0 34px' }}>
            Get paid to test skincare, haircare, and grooming products across Visakhapatnam, Hyderabad, and Bangalore. No experience needed.
          </p>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link className="btn-dark" href="/find" style={{
              background: 'var(--ink)', color: '#fff',
              padding: '15px 28px', borderRadius: 2, fontSize: 14, fontWeight: 600,
            }}>Find a Study</Link>
            <Link className="btn-outline" href="/studies" style={{
              background: 'var(--surface)', color: 'var(--ink)',
              border: '1px solid var(--line)', padding: '15px 28px',
              borderRadius: 2, fontSize: 14, fontWeight: 600,
            }}>Browse All Trials</Link>
          </div>

          <p style={{ fontSize: '12.5px', color: 'var(--ink3)', margin: '26px 0 0', lineHeight: 1.6 }}>
            No account required to check whether a study may suit you.<br />
            Participation is entirely voluntary.
          </p>
        </div>

        {/* Hero image + floating stat card */}
        <div style={{ position: 'relative', paddingBottom: 26, maxWidth: 460, justifySelf: 'end', width: '100%' }}>
          <div style={{ aspectRatio: '4/5', borderRadius: 24, overflow: 'hidden', position: 'relative', boxShadow: '0 24px 64px rgba(31,29,27,0.10)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-participant.png"
              alt="Aurelis research participant"
              style={{
                width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top',
                filter: 'grayscale(18%) sepia(14%) contrast(0.96) brightness(1.02)',
              }}
            />
            {/* Gradient fade to background at bottom */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 55%, rgba(250,248,245,0.55) 100%)',
              pointerEvents: 'none',
            }} />
            {/* Subtle warm overlay tint */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(242,238,232,0.08)',
              pointerEvents: 'none',
            }} />
          </div>
          {/* Floating stats card */}
          <div style={{
            position: 'absolute', bottom: -26, left: -26,
            background: 'var(--surface)', border: '1px solid var(--line)',
            padding: '20px 24px', borderRadius: 2, maxWidth: 250,
          }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 300, lineHeight: 1, marginBottom: 6 }}>1,200+</div>
            <div style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.5 }}>
              participants have taken part in Aurelis product evaluation studies
            </div>
          </div>
        </div>
      </section>

      {/* ── "Research designed around people" ────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
        <div style={{
          maxWidth: 1240, margin: '0 auto', padding: '56px 32px',
          display: 'grid', gridTemplateColumns: 'minmax(0,0.8fr) minmax(0,2fr)', gap: 56,
        }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 30, lineHeight: 1.2, letterSpacing: '-0.01em', margin: 0 }}>
            Research designed around people
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '34px 44px' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 8 }}>Participant-focused research</div>
              <p style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--ink2)', margin: 0 }}>Product routines, schedules, and assessments are explained in full before you decide to take part.</p>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 8 }}>Experienced research teams</div>
              <p style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--ink2)', margin: 0 }}>Studies are run by trained investigators and coordinators at dedicated evaluation sites across India.</p>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 8 }}>Clearly explained participation</div>
              <p style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--ink2)', margin: 0 }}>You receive full information covering procedures, duration, compensation, and your right to withdraw.</p>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 8 }}>Privacy-conscious handling</div>
              <p style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--ink2)', margin: 0 }}>Information you submit is used only to assess study suitability and is accessible only to the research team.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured studies ──────────────────────────────────────────────── */}
      {activeStudies.length > 0 && (
        <section style={{ maxWidth: 1240, margin: '0 auto', padding: '76px 32px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32, marginBottom: 34 }}>
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 12 }}>Open enrolment</div>
              <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 38, lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                Studies currently recruiting
              </h2>
              <p style={{ fontSize: 15, color: 'var(--ink2)', margin: 0 }}>Explore research opportunities that may be a match for you.</p>
            </div>
            <Link className="link-underline" href="/studies" style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)', borderBottom: '1px solid var(--ink)', paddingBottom: 3, whiteSpace: 'nowrap' }}>
              View all studies
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 20 }}>
            {activeStudies.map((study) => {
              const ec = study.eligibilityCriteria as EligibilityCriteria
              const category = getCategory(study.title)
              const ages = getAges(ec)
              const location = getLocations(ec)
              return (
                <div key={study.id} className="study-card" style={{
                  background: 'var(--surface)', border: '1px solid var(--line)',
                  borderRadius: 3, padding: 24, display: 'flex', flexDirection: 'column', gap: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--ink3)' }}>{category}</span>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', background: 'var(--accent-soft)', color: 'var(--accent-ink)', padding: '5px 9px', borderRadius: 2 }}>Recruiting</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 23, lineHeight: 1.22, letterSpacing: '-0.01em', margin: 0 }}>{study.title}</h3>
                  <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--ink2)', margin: 0, flex: 1 }}>{study.summary}</p>
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                      <span style={{ color: 'var(--ink3)' }}>Ages</span>
                      <span style={{ fontWeight: 600 }}>{ages}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                      <span style={{ color: 'var(--ink3)' }}>Location</span>
                      <span style={{ fontWeight: 600 }}>{location}</span>
                    </div>
                  </div>
                  <Link className="btn-ink-outline" href={`/studies/${study.slug}`} style={{
                    display: 'block', textAlign: 'center',
                    background: 'var(--surface)', border: '1px solid var(--ink)',
                    color: 'var(--ink)', padding: 12, borderRadius: 2,
                    fontSize: 13, fontWeight: 600,
                  }}>View Study</Link>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ maxWidth: 1240, margin: '0 auto', padding: '56px 32px 84px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 3, padding: 48 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 38 }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 32, letterSpacing: '-0.01em', margin: 0 }}>How participation works</h2>
            <span style={{ fontSize: '12.5px', color: 'var(--ink3)' }}>Typical sequence · varies by study</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 28 }}>
            <div style={{ borderTop: '2px solid var(--accent)', paddingTop: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent-ink)', marginBottom: 10 }}>STEP 01</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, marginBottom: 8 }}>Find a study</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink2)', margin: 0 }}>Browse recruiting studies by product category, location, or use our AI matcher to find your best fit.</p>
            </div>
            <div style={{ borderTop: '2px solid var(--line)', paddingTop: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink3)', marginBottom: 10 }}>STEP 02</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, marginBottom: 8 }}>Pre-screening</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink2)', margin: 0 }}>Answer a short questionnaire drawn from the study's eligibility criteria to check your initial fit.</p>
            </div>
            <div style={{ borderTop: '2px solid var(--line)', paddingTop: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink3)', marginBottom: 10 }}>STEP 03</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, marginBottom: 8 }}>Register interest</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink2)', margin: 0 }}>Share your contact details so the research coordinator can reach you about next steps.</p>
            </div>
            <div style={{ borderTop: '2px solid var(--line)', paddingTop: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink3)', marginBottom: 10 }}>STEP 04</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, marginBottom: 8 }}>Get compensated</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink2)', margin: 0 }}>Eligible participants receive product kits and compensation upon completing the study protocol.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
