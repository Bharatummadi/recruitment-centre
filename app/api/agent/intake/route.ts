import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const {
      message, sessionId, studyTitle, questions,
      criteria, isFirstMessage, userName, userEmail,
    } = await req.json()

    const lyzrApiKey = process.env.LYZR_API_KEY
    const lyzrAgentId = process.env.LYZR_INTAKE_AGENT_ID
    const lyzrUserId = process.env.LYZR_USER_ID

    if (!lyzrApiKey || !lyzrAgentId || !lyzrUserId) {
      return NextResponse.json(
        { error: 'Intake agent not configured. Set LYZR_INTAKE_AGENT_ID in environment variables.' },
        { status: 503 }
      )
    }

    type Criteria = { locations?: string[]; minAge?: number; maxAge?: number; gender?: string }
    const ec = (criteria ?? {}) as Criteria
    const locations: string[] = ec.locations ?? []
    const locationList = locations.length ? locations.join(', ') : 'not specified'

    const ageRule = ec.minAge && ec.maxAge
      ? `Participant must be between ${ec.minAge} and ${ec.maxAge} years old.`
      : ec.minAge ? `Participant must be at least ${ec.minAge} years old.`
      : ''
    const genderRule = ec.gender ? `Participant must identify as ${ec.gender}.` : ''

    const questionList = (questions as { id: string; label: string }[])
      .map((q, i) => `${i + 1}. [${q.id}] ${q.label}`)
      .join('\n')

    const knownInfo = userName
      ? `The participant is already signed in as ${userName} (${userEmail}). Do NOT ask for their name or email.`
      : `This participant is not signed in. You MUST collect their full name and email address first, before the study questions.`

    const fullMessage = isFirstMessage
      ? `Study: "${studyTitle}"

${knownInfo}

ELIGIBILITY RULES — check these as you collect answers:
- Accepted locations: ${locationList}. If the participant is NOT in one of these cities, immediately inform them they are not eligible and end with DISQUALIFIED on its own line. Do not ask further questions.
${ageRule ? `- ${ageRule} If not eligible, end with DISQUALIFIED.` : ''}
${genderRule ? `- ${genderRule} If not eligible, end with DISQUALIFIED.` : ''}

Once eligibility is confirmed, collect the following information one question at a time:
${questionList}

When you have collected ALL required information successfully, end your final response with:
COLLECTED_DATA:{"name":"...","email":"...","q_id":"answer",...}

Use the [id] values from above as JSON keys. For signed-in users, use "${userName ?? ''}" and "${userEmail ?? ''}" in the JSON.

Start by greeting the participant warmly and asking the first question.`
      : message

    const lyzrRes = await fetch('https://agent-prod.studio.lyzr.ai/v3/inference/chat/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': lyzrApiKey },
      body: JSON.stringify({
        user_id: lyzrUserId,
        agent_id: lyzrAgentId,
        session_id: sessionId,
        message: fullMessage,
      }),
    })

    if (!lyzrRes.ok) {
      const text = await lyzrRes.text()
      console.error('Lyzr intake error:', lyzrRes.status, text)
      return NextResponse.json({ error: 'Agent error. Please try again.' }, { status: 502 })
    }

    const lyzrData = await lyzrRes.json()
    const rawMessage: string = lyzrData.response ?? ''

    // Disqualified
    if (/DISQUALIFIED/i.test(rawMessage)) {
      const agentMessage = rawMessage.replace(/\n?DISQUALIFIED\s*$/i, '').trim()
      return NextResponse.json({ message: agentMessage, disqualified: true })
    }

    // Collected all data
    const dataMatch = rawMessage.match(/COLLECTED_DATA:(\{[\s\S]*?\})\s*$/)
    let collectedData: Record<string, string> | null = null
    if (dataMatch) {
      try { collectedData = JSON.parse(dataMatch[1]) } catch { collectedData = null }
    }

    const agentMessage = rawMessage.replace(/\nCOLLECTED_DATA:\{[\s\S]*?\}\s*$/, '').trim()
    return NextResponse.json({ message: agentMessage, collectedData })

  } catch (err) {
    console.error('Intake agent error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
