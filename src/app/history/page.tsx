import { createAdminClient } from '@/lib/supabase/admin'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { Video, History, ArrowRight } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'
import DeleteVideoButton from '@/components/DeleteVideoButton'

export default async function HistoryPage() {
  const supabase = createAdminClient()

  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('upload_date', { ascending: false })

  return (
    <div className="flex flex-col flex-1">
      <Header title="Past Reviews" />

      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Your Videos</h2>
          <Link
            href="/upload"
            className="bg-violet-500 hover:bg-violet-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
          >
            + Upload
          </Link>
        </div>

        {!videos?.length ? (
          <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-12 text-center">
            <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <History className="w-6 h-6 text-zinc-600" />
            </div>
            <p className="text-zinc-400 font-medium text-sm">No videos yet</p>
            <p className="text-zinc-600 text-xs mt-1">Upload your first video to get started</p>
            <Link
              href="/upload"
              className="inline-block mt-4 text-violet-400 hover:text-violet-300 text-sm transition"
            >
              Upload a video →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`/review/${video.id}`}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-4 py-3.5 flex items-center gap-3 transition group"
              >
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Video className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{video.video_name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {formatDate(video.upload_date)}
                    {video.file_size ? ` · ${formatFileSize(video.file_size)}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={video.status} />
                  <DeleteVideoButton videoId={video.id} />
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
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
    <span className={`text-xs px-2 py-0.5 rounded-full border ${map[status] ?? map.error}`}>
      {labels[status] ?? status}
    </span>
  )
}
