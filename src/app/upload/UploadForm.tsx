'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, Video, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'

type UploadState = 'idle' | 'uploading' | 'saving' | 'done' | 'error'

const ACCEPTED = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mpeg', 'video/3gpp']
const MAX_SIZE = 500 * 1024 * 1024 // 500 MB

export default function UploadForm() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  function selectFile(f: File) {
    setError(null)
    if (!ACCEPTED.includes(f.type)) {
      setError('Please upload a video file (MP4, MOV, AVI, WebM).')
      return
    }
    if (f.size > MAX_SIZE) {
      setError('File is too large. Maximum size is 500 MB.')
      return
    }
    setFile(f)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) selectFile(f)
  }, [])

  async function handleUpload() {
    if (!file) return
    setError(null)
    setState('uploading')
    setProgress(0)

    const supabase = createClient()

    const storagePath = `uploads/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    // Animate progress to 90% while upload runs
    const progressInterval = setInterval(() => {
      setProgress((p) => (p < 88 ? p + Math.random() * 8 : p))
    }, 400)

    const { data: storageData, error: storageError } = await supabase.storage
      .from('videos')
      .upload(storagePath, file, { cacheControl: '3600', upsert: false })

    clearInterval(progressInterval)

    if (storageError) {
      setError(storageError.message)
      setState('error')
      return
    }

    setProgress(95)
    setState('saving')

    // Public URL (bucket is public)
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(storagePath)

    const videoUrl = urlData.publicUrl

    const { data: videoRecord, error: dbError } = await supabase
      .from('videos')
      .insert({
        video_url: videoUrl,
        video_name: file.name,
        file_size: file.size,
        status: 'processing',
      })
      .select()
      .single()

    if (dbError) {
      setError(dbError.message)
      setState('error')
      return
    }

    setProgress(100)
    setState('done')

    setTimeout(() => {
      router.push(`/review/${videoRecord.id}`)
    }, 1200)
  }

  return (
    <div className="p-6 max-w-xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-white font-semibold text-lg">Upload your video</h2>
        <p className="text-zinc-400 text-sm mt-0.5">MP4, MOV, AVI, or WebM · Max 500 MB</p>
      </div>

      {/* Drop zone */}
      {!file && state === 'idle' && (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          className={cn(
            'border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition',
            dragOver
              ? 'border-violet-500 bg-violet-500/5'
              : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50'
          )}
        >
          <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-white font-medium text-sm mb-1">Drop your video here</p>
          <p className="text-zinc-500 text-xs">or click to browse</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) selectFile(f) }}
          />
        </div>
      )}

      {/* File selected */}
      {file && state === 'idle' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Video className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{file.name}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{formatFileSize(file.size)}</p>
            </div>
            <button onClick={() => setFile(null)} className="text-zinc-500 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            className="mt-4 w-full bg-violet-500 hover:bg-violet-600 text-white font-medium py-2.5 rounded-lg transition text-sm"
          >
            Upload &amp; Analyze
          </button>
        </div>
      )}

      {/* Uploading / saving */}
      {(state === 'uploading' || state === 'saving') && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin flex-shrink-0" />
            <div>
              <p className="text-white font-medium text-sm">
                {state === 'uploading' ? 'Uploading video…' : 'Saving details…'}
              </p>
              <p className="text-zinc-500 text-xs mt-0.5 truncate">{file?.name}</p>
            </div>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5">
            <div
              className="bg-violet-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-zinc-500 text-xs mt-2 text-right">{Math.round(progress)}%</p>
        </div>
      )}

      {/* Done */}
      {state === 'done' && (
        <div className="bg-zinc-900 border border-green-500/20 rounded-2xl p-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-white font-medium text-sm">Upload complete</p>
            <p className="text-zinc-400 text-xs mt-0.5">Heading to your review…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="bg-zinc-900 border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-white font-medium text-sm">Upload failed</p>
          </div>
          <p className="text-red-400 text-xs mb-4">{error}</p>
          <button
            onClick={() => { setState('idle'); setProgress(0) }}
            className="text-sm text-violet-400 hover:text-violet-300 transition"
          >
            Try again
          </button>
        </div>
      )}

      {/* Tips */}
      {state === 'idle' && (
        <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-2">Tips for best results</p>
          {[
            'Upload the original, unedited export for the most accurate analysis',
            'Short-form videos (15–90s) get the most detailed feedback',
            'Make sure audio is clear — it helps the AI evaluate narration',
          ].map((tip) => (
            <p key={tip} className="text-zinc-500 text-xs flex items-start gap-2 mt-1.5">
              <span className="text-violet-500 mt-0.5">·</span>
              {tip}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
