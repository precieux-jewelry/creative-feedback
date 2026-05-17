import { GoogleGenAI } from '@google/genai'

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')
  return new GoogleGenAI({ apiKey })
}

export const ANALYSIS_PROMPT = `You are an expert social media strategist and video performance analyst. Analyze this short-form video and return a detailed JSON review.

Evaluate the video across every dimension and return ONLY valid JSON matching this exact structure — no markdown, no explanation, just the JSON object:

{
  "overall_score": <number 1-100>,
  "summary": "<2-3 sentence overall verdict>",

  "hook_analysis": "<detailed analysis of the opening hook and first 3 seconds>",
  "storytelling": "<analysis of narrative structure, flow, and story arc>",
  "emotional_pull": "<how emotionally engaging is this content, what feelings does it evoke>",
  "shareability": "<analysis of share-worthiness, relatability, and comment potential>",
  "viral_potential": "<honest assessment of viral potential and why>",

  "thumb_stop_score": <number 1-100>,
  "watch_through_score": <number 1-100>,
  "pacing_analysis": "<detailed pacing breakdown — too fast, too slow, where attention drops>",
  "drop_off_risks": "<specific moments or sections where viewers are likely to scroll away>",
  "retention_curve": "<predicted retention arc — describe how viewer attention builds, peaks, and drops second by second>",

  "clarity_of_idea": "<is the core idea clear within the first 5 seconds>",
  "visual_interest": "<analysis of visual composition, movement, and on-screen interest>",
  "audio_narration": "<quality and effectiveness of audio, voiceover, or music>",
  "on_screen_text": "<assessment of any text overlays, captions, or supers>",
  "cta_strength": "<call to action strength — is there one, is it clear, does it land>",

  "what_works": "<bullet-style list of the strongest elements — what is genuinely good>",
  "what_to_cut": "<specific parts that should be removed or shortened>",
  "what_to_improve": "<specific actionable improvements with examples>",
  "suggested_hook": "<write a stronger opening hook or first line for this video>",
  "suggested_caption": "<write an optimized caption for Instagram/TikTok>",
  "suggested_title": "<write a stronger on-screen title or text overlay>",

  "forecast": {
    "instagram": {
      "views_low": <conservative view estimate as integer>,
      "views_high": <optimistic view estimate as integer>,
      "likes_low": <integer>,
      "likes_high": <integer>,
      "comments_low": <integer>,
      "comments_high": <integer>,
      "shares_low": <integer>,
      "shares_high": <integer>,
      "saves_low": <integer>,
      "saves_high": <integer>,
      "watch_through_pct": <predicted avg watch-through % as integer 0-100>,
      "virality": "<low | medium | high>",
      "confidence": "<low | medium | high>",
      "reasoning": "<2-3 sentences explaining the forecast based on the video's content, hook strength, and niche>"
    },
    "tiktok": {
      "views_low": <integer>,
      "views_high": <integer>,
      "likes_low": <integer>,
      "likes_high": <integer>,
      "comments_low": <integer>,
      "comments_high": <integer>,
      "shares_low": <integer>,
      "shares_high": <integer>,
      "saves_low": <integer>,
      "saves_high": <integer>,
      "watch_through_pct": <integer 0-100>,
      "virality": "<low | medium | high>",
      "confidence": "<low | medium | high>",
      "reasoning": "<2-3 sentences>"
    },
    "youtube_shorts": {
      "views_low": <integer>,
      "views_high": <integer>,
      "likes_low": <integer>,
      "likes_high": <integer>,
      "comments_low": <integer>,
      "comments_high": <integer>,
      "shares_low": <integer>,
      "shares_high": <integer>,
      "saves_low": <integer>,
      "saves_high": <integer>,
      "watch_through_pct": <integer 0-100>,
      "virality": "<low | medium | high>",
      "confidence": "<low | medium | high>",
      "reasoning": "<2-3 sentences>"
    }
  }
}`
