import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Sparkles, Clock } from 'lucide-react'

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

  return (
    <div className="flex flex-col flex-1">
      <Header title="Video Review" />
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {video.status === 'processing' ? (
              <Clock className="w-6 h-6 text-violet-400 animate-pulse" />
            ) : (
              <Sparkles className="w-6 h-6 text-violet-400" />
            )}
          </div>
          <h2 className="text-white font-semibold text-lg mb-1 truncate">{video.video_name}</h2>
          <p className="text-zinc-400 text-sm mb-1">
            {video.status === 'processing'
              ? 'Your video is queued for analysis. AI review coming in Phase 3.'
              : video.status === 'complete'
              ? 'Review complete — full results UI coming in Phase 4.'
              : 'Something went wrong with this video.'}
          </p>
          <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full border ${
            video.status === 'processing'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              : video.status === 'complete'
              ? 'bg-green-500/10 text-green-400 border-green-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {video.status}
          </span>
        </div>
      </main>
    </div>
  )
}
