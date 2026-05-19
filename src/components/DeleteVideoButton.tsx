'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteVideoButton({ videoId }: { videoId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }

    setLoading(true)
    await fetch(`/api/videos/${videoId}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition flex-shrink-0 ${
        confirming
          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
          : 'text-zinc-600 hover:text-red-400 hover:bg-red-500/10'
      }`}
    >
      <Trash2 className="w-3.5 h-3.5" />
      {confirming && !loading ? 'Confirm?' : loading ? '…' : ''}
    </button>
  )
}
