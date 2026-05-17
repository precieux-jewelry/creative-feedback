export type VideoStatus = 'uploading' | 'processing' | 'complete' | 'error'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Video {
  id: string
  user_id: string
  video_url: string
  video_name: string
  file_size: number | null
  duration: number | null
  upload_date: string
  status: VideoStatus
  thumbnail_url: string | null
}

export interface VideoReview {
  id: string
  video_id: string
  user_id: string
  created_at: string
  // Overview
  overall_score: number | null
  summary: string | null
  // Creative
  hook_analysis: string | null
  storytelling: string | null
  emotional_pull: string | null
  shareability: string | null
  viral_potential: string | null
  // Analytics
  thumb_stop_score: number | null
  watch_through_score: number | null
  pacing_analysis: string | null
  drop_off_risks: string | null
  retention_curve: string | null
  // Recommendations
  what_works: string | null
  what_to_cut: string | null
  what_to_improve: string | null
  suggested_hook: string | null
  suggested_caption: string | null
  suggested_title: string | null
  // Raw Gemini output
  raw_analysis: Record<string, unknown> | null
}

export interface PersonaMessage {
  id: string
  video_id: string
  user_id: string
  role: 'user' | 'persona'
  content: string
  created_at: string
}

export interface AdvisorMessage {
  id: string
  video_id: string
  user_id: string
  advisor_type: 'creative' | 'performance' | 'general'
  role: 'user' | 'advisor'
  content: string
  created_at: string
}
