'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Menu, X } from 'lucide-react'

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="absolute top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20 pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30 transition-all duration-300 group-hover:bg-white/30">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-semibold tracking-wide text-white">
              IMMOCIBLE
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-4">
            <Link href="/acquereur/connexion">
              <Button variant="ghost" className="font-medium text-white hover:bg-white/20 hover:text-white">Connexion</Button>
            </Link>
            <Link href="/acquereur/inscription">
              <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all duration-300 border border-slate-700">
                Commencer
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="sm:hidden flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-white hover:bg-white/20 hover:text-white">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isOpen && (
        <div className="sm:hidden absolute w-full left-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-xl animate-in slide-in-from-top-2">
          <div className="px-4 pt-4 pb-6 flex flex-col space-y-3">
            <Link href="/acquereur/connexion" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 text-lg">
                Connexion
              </Button>
            </Link>
            <Link href="/acquereur/inscription" onClick={() => setIsOpen(false)}>
              <Button className="w-full justify-start bg-white text-slate-900 hover:bg-slate-200 text-lg">
                Commencer
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
