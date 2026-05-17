import { createClient } from '@/lib/supabase/server'
import { getGeminiClient, ANALYSIS_PROMPT } from '@/lib/gemini'
import { sendReviewReadyEmail } from '@/lib/resend'
import { FileState } from '@google/genai'
import { NextResponse } from 'next/server'

// Allow up to 5 minutes for video processing on Vercel Pro+
export const maxDuration = 300

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { videoId } = await request.json()
  if (!videoId) return NextResponse.json({ error: 'videoId is required' }, { status: 400 })

  // Fetch video record — enforce ownership
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
  await supabase.from('videos').update({ status: 'processing' }).eq('id', videoId)

  let geminiFileName: string | undefined

  try {
    const ai = getGeminiClient()

    // 1. Download video from Supabase Storage
    const videoResponse = await fetch(video.video_url)
    if (!videoResponse.ok) throw new Error(`Failed to fetch video: ${videoResponse.statusText}`)
    const videoBuffer = await videoResponse.arrayBuffer()

    // 2. Detect MIME type from filename
    const ext = video.video_name.split('.').pop()?.toLowerCase() ?? ''
    const mimeMap: Record<string, string> = {
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      webm: 'video/webm',
      mpeg: 'video/mpeg',
      mpg: 'video/mpeg',
      '3gp': 'video/3gpp',
    }
    const mimeType = mimeMap[ext] ?? 'video/mp4'

    // 3. Upload to Gemini File API
    const videoBlob = new Blob([videoBuffer], { type: mimeType })
    const uploadedFile = await ai.files.upload({
      file: videoBlob,
      config: { mimeType, displayName: video.video_name },
    })

    geminiFileName = uploadedFile.name

    // 4. Poll until file is ACTIVE (Gemini processes it server-side)
    let fileMetadata = await ai.files.get({ name: uploadedFile.name! })
    let attempts = 0
    const maxAttempts = 30 // 2.5 min max wait

    while (fileMetadata.state === FileState.PROCESSING && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 5000))
      fileMetadata = await ai.files.get({ name: uploadedFile.name! })
      attempts++
    }

    if (fileMetadata.state !== FileState.ACTIVE) {
      throw new Error(`File processing failed or timed out (state: ${fileMetadata.state})`)
    }

    // 5. Run Gemini analysis with fileData reference
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              fileData: {
                mimeType: fileMetadata.mimeType!,
                fileUri: fileMetadata.uri!,
              },
            },
            { text: ANALYSIS_PROMPT },
          ],
        },
      ],
    })

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const analysis = JSON.parse(jsonText)

    // 6. Save review to DB
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

    // 7. Mark video complete
    await supabase.from('videos').update({ status: 'complete' }).eq('id', videoId)

    // 8. Clean up file from Gemini (fire and forget)
    ai.files.delete({ name: uploadedFile.name! }).catch(() => {})

    // 9. Send email notification (fire and forget)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    sendReviewReadyEmail({
      to: user.email!,
      videoName: video.video_name,
      reviewUrl: `${appUrl}/review/${videoId}`,
    }).catch(() => {})

    return NextResponse.json({ success: true, reviewId: review.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    console.error('[analyze]', message)

    await supabase.from('videos').update({ status: 'error' }).eq('id', videoId)

    // Clean up Gemini file on error too
    if (geminiFileName) {
      const ai = getGeminiClient()
      ai.files.delete({ name: geminiFileName }).catch(() => {})
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
