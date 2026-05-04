'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="border-b border-hw-border bg-hw-card/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-hw-red font-black text-2xl tracking-tight">HW</span>
            <span className="text-white font-bold text-xl tracking-tight">VAULT</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/catalog" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Catalog
            </Link>
            {session ? (
              <>
                <Link href="/portfolios" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                  My Portfolios
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-hw-red flex items-center justify-center text-white font-bold text-xs">
                      {session.user.username?.[0]?.toUpperCase()}
                    </div>
                    <span>{session.user.username}</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-hw-card border border-hw-border rounded-lg shadow-xl">
                      <Link
                        href="/portfolios"
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-hw-border/50 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        My Portfolios
                      </Link>
                      <Link
                        href="/cars/add"
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-hw-border/50 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        Add Custom Car
                      </Link>
                      <hr className="border-hw-border my-1" />
                      <button
                        onClick={() => { signOut({ callbackUrl: '/' }); setMenuOpen(false) }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-hw-border/50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                  Log In
                </Link>
                <Link href="/signup" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-hw-border py-4 flex flex-col gap-3">
            <Link href="/catalog" className="text-gray-300 hover:text-white text-sm font-medium" onClick={() => setMenuOpen(false)}>
              Catalog
            </Link>
            {session ? (
              <>
                <Link href="/portfolios" className="text-gray-300 hover:text-white text-sm font-medium" onClick={() => setMenuOpen(false)}>
                  My Portfolios
                </Link>
                <Link href="/cars/add" className="text-gray-300 hover:text-white text-sm font-medium" onClick={() => setMenuOpen(false)}>
                  Add Custom Car
                </Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-red-400 text-sm font-medium text-left">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white text-sm font-medium" onClick={() => setMenuOpen(false)}>
                  Log In
                </Link>
                <Link href="/signup" className="btn-primary text-sm inline-block w-fit" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
