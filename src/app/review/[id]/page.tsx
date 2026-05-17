import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import ReviewPoller from './ReviewPoller'
import { CheckCircle } from 'lucide-react'

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: video } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!video) notFound()

  const { data: review } = await supabase
    .from('video_reviews')
    .select('*')
    .eq('video_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="flex flex-col flex-1">
      <Header title="Video Review" />
      <main className="flex-1 p-6 flex items-center justify-center">

        {/* Still processing — show poller that auto-triggers Gemini */}
        {(video.status === 'processing' || video.status === 'uploading') && !review && (
          <ReviewPoller videoId={video.id} videoName={video.video_name} />
        )}

        {/* Review complete — show results (Phase 4 will replace this) */}
        {video.status === 'complete' && review && (
          <div className="w-full max-w-xl">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">{video.video_name}</p>
                <p className="text-zinc-500 text-xs mt-0.5">Review complete</p>
              </div>
            </div>

            {/* Score card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-400 text-sm font-medium">Overall Score</span>
                <span className="text-3xl font-bold text-white">{review.overall_score}<span className="text-zinc-500 text-base font-normal">/100</span></span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-violet-500 h-2 rounded-full transition-all"
                  style={{ width: `${review.overall_score}%` }}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-2">Summary</p>
              <p className="text-white text-sm leading-relaxed">{review.summary}</p>
            </div>

            {/* Quick scores */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <ScoreCard label="Thumb-Stop" score={review.thumb_stop_score} />
              <ScoreCard label="Watch-Through" score={review.watch_through_score} />
            </div>

            {/* What works */}
            {review.what_works && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-3">
                <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-2">What Works</p>
                <p className="text-white text-sm leading-relaxed">{review.what_works}</p>
              </div>
            )}

            {/* Suggested hook */}
            {review.suggested_hook && (
              <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-5 mb-3">
                <p className="text-violet-400 text-xs font-medium uppercase tracking-wide mb-2">Suggested Hook</p>
                <p className="text-white text-sm leading-relaxed italic">&ldquo;{review.suggested_hook}&rdquo;</p>
              </div>
            )}

            {/* Suggested caption */}
            {review.suggested_caption && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-2">Suggested Caption</p>
                <p className="text-zinc-300 text-sm leading-relaxed">{review.suggested_caption}</p>
              </div>
            )}

            <p className="text-zinc-600 text-xs text-center mt-5">
              Full tabbed review UI coming in Phase 4
            </p>
          </div>
        )}

        {/* Error */}
        {video.status === 'error' && (
          <div className="text-center">
            <p className="text-red-400 font-medium">Something went wrong with this video.</p>
            <p className="text-zinc-500 text-sm mt-1">Try uploading again.</p>
          </div>
        )}
      </main>
    </div>
  )
}

function ScoreCard({ label, score }: { label: string; score: number | null }) {
  const color = !score ? 'text-zinc-400'
    : score >= 70 ? 'text-green-400'
    : score >= 45 ? 'text-yellow-400'
    : 'text-red-400'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-zinc-500 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {score ?? '—'}<span className="text-zinc-600 text-sm font-normal">/100</span>
      </p>
    </div>
  )
}
