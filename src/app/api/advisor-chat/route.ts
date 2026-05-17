import { createClient } from '@/lib/supabase/server'
import { getGeminiClient } from '@/lib/gemini'
import { NextResponse } from 'next/server'

const SYSTEM_PROMPTS = {
  creative: `You are a senior social media Creative Director with 10+ years experience making viral content for Instagram, TikTok, and YouTube Shorts. You think deeply about emotion, storytelling, relatability, personality, curiosity, and suspense. You give honest, direct, human-sounding feedback — not corporate fluff. You reference specific moments in the video. You care about whether the video feels worth watching, whether the idea feels fresh, and what would make people comment or share. Keep responses focused and under 150 words unless a detailed breakdown is needed.`,

  performance: `You are a social media performance analyst and retention expert. You think in data: hook strength, thumb-stop rate, watch-through rate, retention curves, drop-off moments, rewatch potential, CTA strength, and structure. You give second-by-second breakdowns when relevant. You're direct, specific, and analytical. Reference exact timing when possible. You optimize for Instagram Reels, TikTok, and YouTube Shorts. Keep responses under 150 words unless a detailed breakdown is requested.`,
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { videoId, advisorType, question, history = [] } = await request.json()

  if (!['creative', 'performance'].includes(advisorType)) {
    return NextResponse.json({ error: 'Invalid advisor type' }, { status: 400 })
  }

  // Load review for context
  const { data: review } = await supabase
    .from('video_reviews')
    .select('raw_analysis')
    .eq('video_id', videoId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const context = review?.raw_analysis
    ? `Video analysis data:\n${JSON.stringify(review.raw_analysis, null, 2)}`
    : ''

  const systemPrompt = SYSTEM_PROMPTS[advisorType as keyof typeof SYSTEM_PROMPTS]
  const ai = getGeminiClient()

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [{
          text: `${systemPrompt}\n\n${context}\n\nCreator's question: ${question}`,
        }],
      },
    ],
  })

  const reply = response.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Something went wrong.'

  // Save to DB
  await supabase.from('advisor_messages').insert([
    { video_id: videoId, user_id: user.id, advisor_type: advisorType, role: 'user', content: question },
    { video_id: videoId, user_id: user.id, advisor_type: advisorType, role: 'advisor', content: reply },
  ])

  return NextResponse.json({ reply })
}
