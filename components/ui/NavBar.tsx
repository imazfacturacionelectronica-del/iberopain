'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function NavBar({ role }: { role: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/protocolos', label: 'Protocolos' },
    ...(role === 'admin' ? [{ href: '/admin/actualizaciones', label: 'Actualizaciones' }] : []),
  ]

  return (
    <nav className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg">IberoPain</span>
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm hover:text-blue-200 ${pathname.startsWith(link.href) ? 'text-white font-semibold' : 'text-blue-300'}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <button onClick={handleLogout} className="text-sm text-blue-300 hover:text-white">
        Salir
      </button>
    </nav>
  )
}
