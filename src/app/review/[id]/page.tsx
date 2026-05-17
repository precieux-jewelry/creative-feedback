import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import ReviewPoller from './ReviewPoller'
import ReviewTabs from './ReviewTabs'
import AdvisorChat from './AdvisorChat'
import type { VideoReview } from '@/types'

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
    .maybeSingle()

  const isProcessing = (video.status === 'processing' || video.status === 'uploading') && !review

  return (
    <div className="flex flex-col flex-1">
      <Header title={isProcessing ? 'Analyzing…' : 'Video Review'} />

      <main className="flex-1 p-4 md:p-6">
        {/* Processing — auto-triggers Gemini */}
        {isProcessing && (
          <div className="flex items-center justify-center min-h-[400px]">
            <ReviewPoller videoId={video.id} videoName={video.video_name} />
          </div>
        )}

        {/* Complete — full tabbed review */}
        {video.status === 'complete' && review && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Video name breadcrumb */}
            <div>
              <p className="text-zinc-500 text-xs mb-0.5">Review for</p>
              <h2 className="text-white font-semibold text-base truncate">{video.video_name}</h2>
            </div>

            <ReviewTabs
              review={review as VideoReview}
              videoId={video.id}
              videoName={video.video_name}
            />

            {/* Advisor section below tabs */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Advisor Chat</h3>
              <AdvisorChat videoId={video.id} />
            </div>
          </div>
        )}

        {/* Error */}
        {video.status === 'error' && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-400 font-medium mb-1">Analysis failed</p>
              <p className="text-zinc-500 text-sm">Try uploading the video again.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
