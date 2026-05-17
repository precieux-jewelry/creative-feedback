'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Upload, History } from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/history', label: 'History', icon: History },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 flex z-50">
      {nav.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex-1 flex flex-col items-center gap-1 py-3 text-xs transition',
            pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              ? 'text-violet-400'
              : 'text-zinc-500 hover:text-white'
          )}
        >
          <Icon className="w-5 h-5" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
