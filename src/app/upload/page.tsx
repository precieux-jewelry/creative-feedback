import Header from '@/components/layout/Header'
import { Upload } from 'lucide-react'

export default function UploadPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Upload Video" />
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6 text-violet-400" />
          </div>
          <p className="text-white font-medium">Upload coming in Phase 2</p>
          <p className="text-zinc-500 text-sm mt-1">Video upload + Supabase Storage</p>
        </div>
      </main>
    </div>
  )
}
