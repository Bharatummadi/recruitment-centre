import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, studyTitle, questions, isFirstMessage, userName, userEmail } =
      await req.json()

    const lyzrApiKey = process.env.LYZR_API_KEY
    const lyzrAgentId = process.env.LYZR_INTAKE_AGENT_ID
    const lyzrUserId = process.env.LYZR_USER_ID

    if (!lyzrApiKey || !lyzrAgentId || !lyzrUserId) {
      return NextResponse.json(
        { error: 'Intake agent not configured. Set LYZR_INTAKE_AGENT_ID in environment variables.' },
        { status: 503 }
      )
    }

    const questionList = (questions as { id: string; label: string }[])
      .map((q, i) => `${i + 1}. [${q.id}] ${q.label}`)
      .join('\n')

    const knownInfo = userName
      ? `The participant is already signed in as ${userName} (${userEmail}). Do NOT ask for their name or email.`
      : `This participant is not signed in. You MUST collect their full name and email address before the study questions.`

    const fullMessage = isFirstMessage
      ? `Study: "${studyTitle}"

${knownInfo}

Collect the following information conversationally, one question at a time. Be warm and encouraging:
${questionList}

When you have collected ALL required information, end your response with exactly this on its own line:
COLLECTED_DATA:{"name":"...","email":"...","q_id":"answer",...}

Use the question IDs in brackets above as the JSON keys. For signed-in users, use "${userName ?? ''}" as name and "${userEmail ?? ''}" as email in the COLLECTED_DATA.

Start by greeting the participant and asking the first question.`
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

    // Parse COLLECTED_DATA:{...} marker from agent response
    const dataMatch = rawMessage.match(/COLLECTED_DATA:(\{[\s\S]*?\})\s*$/)
    let collectedData: Record<string, string> | null = null
    if (dataMatch) {
      try {
        collectedData = JSON.parse(dataMatch[1])
      } catch {
        collectedData = null
      }
    }

    const agentMessage = rawMessage.replace(/\nCOLLECTED_DATA:\{[\s\S]*?\}\s*$/, '').trim()

    return NextResponse.json({ message: agentMessage, collectedData })
  } catch (err) {
    console.error('Intake agent error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
