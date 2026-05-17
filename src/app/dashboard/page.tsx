import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { Upload, Video, Sparkles, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'

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

  const allVideos = videos ?? []
  const totalVideos = allVideos.length
  const completedReviews = allVideos.filter((v) => v.status === 'complete').length

  const name = (user.user_metadata?.full_name as string)?.split(' ')[0] || 'Creator'

  return (
    <div className="flex flex-col flex-1">
      <Header title="Dashboard" />

      <main className="flex-1 p-5 space-y-5 max-w-2xl w-full mx-auto">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-bold text-white">Hey, {name} 👋</h2>
          <p className="text-zinc-400 text-sm mt-0.5">
            Upload a video and get AI-powered feedback to grow faster.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-500 text-xs">Videos</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalVideos}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-zinc-500 text-xs">Reviews</span>
            </div>
            <p className="text-2xl font-bold text-white">{completedReviews}</p>
          </div>
        </div>

        {/* Upload CTA */}
        <Link
          href="/upload"
          className="flex items-center justify-between bg-violet-500 hover:bg-violet-600 transition rounded-xl px-5 py-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Upload a new video</p>
              <p className="text-violet-200 text-xs">Get AI feedback in minutes</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Recent videos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Recent Videos</h3>
            {totalVideos > 0 && (
              <Link href="/history" className="text-violet-400 text-xs hover:text-violet-300 transition">
                View all →
              </Link>
            )}
          </div>

          {totalVideos === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-10 text-center">
              <Video className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">No videos yet</p>
              <p className="text-zinc-600 text-xs mt-0.5">Upload your first to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allVideos.map((video) => (
                <Link
                  key={video.id}
                  href={`/review/${video.id}`}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-4 py-3 flex items-center gap-3 transition group"
                >
                  <StatusIcon status={video.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{video.video_name}</p>
                    <p className="text-zinc-500 text-xs">
                      {formatDate(video.upload_date)}
                      {video.file_size ? ` · ${formatFileSize(video.file_size)}` : ''}
                    </p>
                  </div>
                  <StatusBadge status={video.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatusIcon({ status }: { status: string }) {
  const map: Record<string, React.ReactNode> = {
    complete: <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />,
    processing: <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 animate-pulse" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />,
    uploading: <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 animate-pulse" />,
  }
  return <>{map[status] ?? <Video className="w-5 h-5 text-zinc-500 flex-shrink-0" />}</>
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    uploading: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    complete: 'bg-green-500/10 text-green-400 border-green-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  const labels: Record<string, string> = {
    uploading: 'Uploading', processing: 'Processing', complete: 'Complete', error: 'Error',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${map[status] ?? map.error}`}>
      {labels[status] ?? status}
    </span>
  )
}
