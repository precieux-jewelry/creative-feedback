import { createClient } from '@/lib/supabase/server'
import { User } from 'lucide-react'

export default async function Header({ title }: { title: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Creator'

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
      <h1 className="text-white font-semibold text-lg">{title}</h1>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
          <User className="w-4 h-4 text-violet-400" />
        </div>
        <span className="text-zinc-400 text-sm hidden sm:block">{name}</span>
      </div>
    </header>
  )
}
