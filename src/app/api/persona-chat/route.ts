import { createAdminClient } from '@/lib/supabase/admin'
import { getGeminiClient } from '@/lib/gemini'
import { NextResponse } from 'next/server'

const PERSONA_SYSTEM = `You are Mia, a 27-year-old woman living in New York City. You're a casual social media user — you scroll Instagram Reels and TikTok every day, mostly for entertainment, inspiration, and relatable content. You are NOT a marketer or strategist. You react like a real viewer, not an expert.

You've just watched a short-form video. Answer questions about it honestly from your personal perspective as a viewer. Be natural, conversational, and specific. Use "I" statements. Keep answers to 2-4 sentences. Don't be overly positive — if something bored you, say so. If something caught your attention, explain exactly what it was.`

export async function POST(request: Request) {
  const supabase = createAdminClient()
  const { videoId, question, history = [] } = await request.json()

  const { data: review } = await supabase
    .from('video_reviews')
    .select('raw_analysis, summary, hook_analysis, storytelling, emotional_pull')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const context = review
    ? `Video analysis context: ${JSON.stringify(review.raw_analysis ?? { summary: review.summary })}`
    : ''

  const ai = getGeminiClient()

  // Build conversation history for Gemini
  const historyContents = history.flatMap((m: { role: string; content: string }) => [
    { role: 'user' as const, parts: [{ text: m.role === 'user' ? m.content : `[Mia]: ${m.content}` }] },
  ])

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [{ text: `${PERSONA_SYSTEM}\n\n${context}\n\nNow answer this question as Mia:\n${question}` }],
      },
    ],
  })

  const reply = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "I'm not sure how to answer that."

  // Save to DB
  await supabase.from('persona_messages').insert([
    { video_id: videoId, role: 'user', content: question },
    { video_id: videoId, role: 'persona', content: reply },
  ])

  return NextResponse.json({ reply })
}
