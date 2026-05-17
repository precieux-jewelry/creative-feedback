'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Upload,
  History,
  LogOut,
  Clapperboard,
} from 'lucide-react'
import { signOut } from '@/app/auth/actions'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload Video', icon: Upload },
  { href: '/history', label: 'Past Reviews', icon: History },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-56 bg-zinc-900 border-r border-zinc-800 min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-800">
        <div className="w-7 h-7 bg-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Clapperboard className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-semibold text-sm leading-tight">
          Creative<br />Feedback
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition',
              pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                ? 'bg-violet-500/10 text-violet-400 font-medium'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-zinc-800">
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition w-full"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
