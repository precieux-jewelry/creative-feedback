'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle } from 'lucide-react'

export default function ReviewPoller({ videoId, videoName }: { videoId: string; videoName: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<'triggering' | 'analyzing' | 'error'>('triggering')
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval>

    async function triggerAnalysis() {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId }),
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? 'Analysis failed. Please try again.')
          setStatus('error')
          return
        }

        // Analysis complete — reload to show results
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error')
        setStatus('error')
      }
    }

    // Start analysis immediately
    setStatus('analyzing')
    triggerAnalysis()

    // Poll DB status every 3s as a safety net
    pollInterval = setInterval(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('videos')
        .select('status')
        .eq('id', videoId)
        .single()

      if (data?.status === 'complete' || data?.status === 'error') {
        clearInterval(pollInterval)
        router.refresh()
      }
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [videoId, router, retryKey])

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <h2 className="text-white font-semibold text-lg mb-2">Analysis failed</h2>
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <button
          onClick={() => { setError(null); setStatus('triggering'); setRetryKey(k => k + 1) }}
          className="mt-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition"
        >
          Retry Analysis
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-center max-w-sm">
      <div className="w-14 h-14 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-4">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
      <h2 className="text-white font-semibold text-lg mb-1 truncate max-w-xs">{videoName}</h2>
      <p className="text-zinc-400 text-sm mb-1">
        {status === 'triggering' ? 'Starting analysis…' : 'Gemini is analyzing your video…'}
      </p>
      <p className="text-zinc-600 text-xs">This takes 30–90 seconds depending on video length</p>

      {/* Animated dots */}
      <div className="flex gap-1.5 mt-5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
