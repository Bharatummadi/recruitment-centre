import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { studies } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
  const { query, sessionId, isFirstMessage } = await req.json()
  if (!query?.trim()) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
  }

  // Fetch studies only on the first message — Lyzr session retains context for follow-ups
  const activeStudies = isFirstMessage
    ? await db.query.studies.findMany({
        where: eq(studies.status, 'active'),
        columns: { id: true, slug: true, title: true, summary: true, eligibilityCriteria: true },
      })
    : await db.query.studies.findMany({
        where: eq(studies.status, 'active'),
        columns: { id: true, slug: true, title: true, summary: true },
      })

  const studiesContext = activeStudies.map((s) => ({
    slug: s.slug,
    title: s.title,
    summary: s.summary,
    ...('eligibilityCriteria' in s ? { eligibilityCriteria: s.eligibilityCriteria } : {}),
  }))

  // ── Lyzr Agent Call ───────────────────────────────────────────────────────
  // Configure in .env.local:
  //   LYZR_API_KEY=...
  //   LYZR_AGENT_ID=...
  //   LYZR_USER_ID=...
  //
  // Recommended Lyzr agent system prompt:
  //   "You are a clinical study matching assistant for Aurelis Health.
  //    Users describe their profile (age, location, conditions, medications).
  //    Match them to the available studies provided in the message.
  //    Be conversational and explain why each study fits. Always refer to
  //    studies by their exact title."
  // ─────────────────────────────────────────────────────────────────────────
  const lyzrApiKey = process.env.LYZR_API_KEY
  const lyzrAgentId = process.env.LYZR_AGENT_ID
  const lyzrUserId = process.env.LYZR_USER_ID

  if (!lyzrApiKey || !lyzrAgentId || !lyzrUserId) {
    return NextResponse.json(
      { error: 'Lyzr agent is not configured. Set LYZR_API_KEY, LYZR_AGENT_ID, and LYZR_USER_ID in .env.local.' },
      { status: 503 }
    )
  }

  const message = isFirstMessage
    ? `User query: "${query}"

Available studies (use these to find matches):
${JSON.stringify(studiesContext, null, 2)}

Based on the user's profile, recommend which studies they may qualify for and explain why.

At the very end of your response, on its own line, output exactly this (no extra text):
RECOMMENDED_SLUGS:["slug1","slug2"]
Only include slugs of studies you are actively recommending. If none match, output RECOMMENDED_SLUGS:[].`
    : `${query}

If your answer involves recommending specific studies, end your response with:
RECOMMENDED_SLUGS:["slug1","slug2"]
Otherwise end with RECOMMENDED_SLUGS:[].`

  const lyzrRes = await fetch('https://agent-prod.studio.lyzr.ai/v3/inference/chat/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': lyzrApiKey,
    },
    body: JSON.stringify({
      user_id: lyzrUserId,
      agent_id: lyzrAgentId,
      session_id: sessionId,
      message,
    }),
  })

  if (!lyzrRes.ok) {
    const text = await lyzrRes.text()
    console.error('Lyzr error:', lyzrRes.status, text)
    return NextResponse.json({ error: 'Agent error. Please try again.' }, { status: 502 })
  }

  const lyzrData = await lyzrRes.json()
  const rawMessage: string = lyzrData.response ?? ''

  // Extract explicit RECOMMENDED_SLUGS:[...] list the agent appended
  const slugMatch = rawMessage.match(/RECOMMENDED_SLUGS:\[(.*?)\]/s)
  let matchedSlugs: string[] = []
  if (slugMatch) {
    try {
      matchedSlugs = JSON.parse(`[${slugMatch[1]}]`)
    } catch {
      matchedSlugs = []
    }
  }

  // Strip the RECOMMENDED_SLUGS line from the displayed message
  const agentMessage = rawMessage.replace(/\nRECOMMENDED_SLUGS:\[.*?\]/s, '').trim()

  return NextResponse.json({ message: agentMessage, matchedSlugs })
  } catch (err) {
    console.error('Agent match error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
