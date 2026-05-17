import Header from '@/components/layout/Header'
import { History } from 'lucide-react'

export default function HistoryPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Past Reviews" />
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-white font-medium">History coming in Phase 2+</p>
          <p className="text-zinc-500 text-sm mt-1">Your past reviews will appear here</p>
        </div>
      </main>
    </div>
  )
}
