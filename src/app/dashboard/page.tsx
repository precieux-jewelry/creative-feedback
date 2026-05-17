import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { Upload, Video, Sparkles, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('user_id', user.id)
    .order('upload_date', { ascending: false })
    .limit(5)

  const totalVideos = videos?.length ?? 0
  const completedReviews = videos?.filter((v) => v.status === 'complete').length ?? 0

  const name = user.user_metadata?.full_name?.split(' ')[0] || 'Creator'

  return (
    <div className="flex flex-col flex-1">
      <Header title="Dashboard" />

      <main className="flex-1 p-6 space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-semibold text-white">
            Hey, {name} 👋
          </h2>
          <p className="text-zinc-400 text-sm mt-0.5">
            Upload a video and get AI-powered feedback to grow your content.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Video className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-400 text-xs">Total Videos</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalVideos}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-zinc-400 text-xs">Reviews Done</span>
            </div>
            <p className="text-2xl font-bold text-white">{completedReviews}</p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/upload"
          className="flex items-center justify-between bg-violet-500 hover:bg-violet-600 transition rounded-xl px-5 py-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Upload a new video</p>
              <p className="text-violet-200 text-xs">Get AI feedback in minutes</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Recent videos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium text-sm">Recent Videos</h3>
            {totalVideos > 0 && (
              <Link href="/history" className="text-violet-400 text-xs hover:text-violet-300 transition">
                View all
              </Link>
            )}
          </div>

          {totalVideos === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-8 text-center">
              <Video className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">No videos yet</p>
              <p className="text-zinc-600 text-xs mt-0.5">Upload your first video to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {videos?.map((video) => (
                <div
                  key={video.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{video.video_name}</p>
                      <p className="text-zinc-500 text-xs">{formatDate(video.upload_date)}</p>
                    </div>
                  </div>
                  <StatusBadge status={video.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    uploading: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    complete: 'bg-green-500/10 text-green-400 border-green-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  const labels: Record<string, string> = {
    uploading: 'Uploading',
    processing: 'Processing',
    complete: 'Complete',
    error: 'Error',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${styles[status] ?? styles.error}`}>
      {labels[status] ?? status}
    </span>
  )
}
