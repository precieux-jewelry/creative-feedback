import { createClient } from '@/lib/supabase/server'
import { getGeminiClient, ANALYSIS_PROMPT } from '@/lib/gemini'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { videoId } = await request.json()
  if (!videoId) {
    return NextResponse.json({ error: 'videoId is required' }, { status: 400 })
  }

  // Fetch the video record — enforce ownership
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('*')
    .eq('id', videoId)
    .eq('user_id', user.id)
    .single()

  if (videoError || !video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  // Mark as processing
  await supabase
    .from('videos')
    .update({ status: 'processing' })
    .eq('id', videoId)

  try {
    const ai = getGeminiClient()

    // Download the video bytes from the signed URL
    const videoResponse = await fetch(video.video_url)
    if (!videoResponse.ok) {
      throw new Error(`Failed to fetch video: ${videoResponse.statusText}`)
    }
    const videoBuffer = await videoResponse.arrayBuffer()
    const videoBytes = Buffer.from(videoBuffer).toString('base64')

    // Detect MIME type from video_name
    const ext = video.video_name.split('.').pop()?.toLowerCase()
    const mimeMap: Record<string, string> = {
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      webm: 'video/webm',
      mpeg: 'video/mpeg',
      mpg: 'video/mpeg',
      '3gp': 'video/3gpp',
    }
    const mimeType = mimeMap[ext ?? ''] ?? 'video/mp4'

    // Call Gemini with inline video data
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: videoBytes,
              },
            },
            { text: ANALYSIS_PROMPT },
          ],
        },
      ],
    })

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    // Strip markdown code fences if Gemini wraps the JSON
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const analysis = JSON.parse(jsonText)

    // Save review to DB
    const { data: review, error: reviewError } = await supabase
      .from('video_reviews')
      .insert({
        video_id: videoId,
        user_id: user.id,
        overall_score: analysis.overall_score,
        summary: analysis.summary,
        hook_analysis: analysis.hook_analysis,
        storytelling: analysis.storytelling,
        emotional_pull: analysis.emotional_pull,
        shareability: analysis.shareability,
        viral_potential: analysis.viral_potential,
        thumb_stop_score: analysis.thumb_stop_score,
        watch_through_score: analysis.watch_through_score,
        pacing_analysis: analysis.pacing_analysis,
        drop_off_risks: analysis.drop_off_risks,
        retention_curve: analysis.retention_curve,
        what_works: analysis.what_works,
        what_to_cut: analysis.what_to_cut,
        what_to_improve: analysis.what_to_improve,
        suggested_hook: analysis.suggested_hook,
        suggested_caption: analysis.suggested_caption,
        suggested_title: analysis.suggested_title,
        raw_analysis: analysis,
      })
      .select()
      .single()

    if (reviewError) throw reviewError

    // Update video status to complete
    await supabase
      .from('videos')
      .update({ status: 'complete' })
      .eq('id', videoId)

    return NextResponse.json({ success: true, reviewId: review.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    console.error('[analyze]', message)

    // Mark video as error
    await supabase
      .from('videos')
      .update({ status: 'error' })
      .eq('id', videoId)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
