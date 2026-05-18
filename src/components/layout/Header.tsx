import { Clapperboard } from 'lucide-react'

export default function Header({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
      <h1 className="text-white font-semibold text-lg">{title}</h1>
      <div className="w-7 h-7 bg-violet-500 rounded-lg flex items-center justify-center">
        <Clapperboard className="w-3.5 h-3.5 text-white" />
      </div>
    </header>
  )
}
