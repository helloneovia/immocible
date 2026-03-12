'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { Button } from '@/components/ui/button'
import { Home, MessageSquare, Settings, LogOut, Menu, X } from 'lucide-react'

interface NavbarProps {
    role: 'agence' | 'acquereur' | 'admin'
}

export function Navbar({ role }: NavbarProps) {
    const { signOut } = useAuth()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const homeLink = role === 'agence' ? '/agence/dashboard' : (role === 'admin' ? '/admin/dashboard' : '/acquereur/dashboard')
    const messagesLink = role === 'agence' ? '/agence/messages' : '/acquereur/messages'

    const isMessagesActive = pathname === messagesLink || pathname?.startsWith(messagesLink + '/')
    const isSettingsActive = pathname === '/settings'

    return (
        <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75 shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo */}
                    <Link href={homeLink} className="flex items-center space-x-3 group">
                        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md group-hover:bg-slate-800 transition-all duration-300">
                            <Home className="h-5 w-5 text-amber-400" />
                        </div>
                        <span className="text-xl sm:text-2xl font-bold tracking-wide text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                            IMMOCIBLE
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {role !== 'admin' && <NotificationBell role={role} />}

                        {role !== 'admin' && (
                            <Link href={messagesLink}>
                                <Button
                                    variant={isMessagesActive ? 'secondary' : 'ghost'}
                                    className={`font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 ${isMessagesActive ? 'bg-slate-100 text-slate-900' : ''}`}
                                >
                                    <MessageSquare className="h-5 w-5 mr-2" />
                                    Messagerie
                                </Button>
                            </Link>
                        )}

                        <Link href="/settings">
                            <Button
                                variant={isSettingsActive ? 'secondary' : 'ghost'}
                                className={`font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 ${isSettingsActive ? 'bg-slate-100 text-slate-900' : ''}`}
                            >
                                <Settings className="h-5 w-5 mr-2" />
                                Paramètres
                            </Button>
                        </Link>

                        <Button
                            variant="outline"
                            className="font-medium border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300"
                            onClick={signOut}
                        >
                            <LogOut className="h-5 w-5 mr-2" />
                            Déconnexion
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center space-x-3 md:hidden">
                        {role !== 'admin' && <NotificationBell role={role} />}
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-slate-700 hover:bg-slate-100">
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl absolute w-full left-0 shadow-xl animate-in slide-in-from-top-2">
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        {role !== 'admin' && (
                            <Link href={messagesLink} onClick={() => setIsOpen(false)}>
                                <Button
                                    variant={isMessagesActive ? 'secondary' : 'ghost'}
                                    className={`w-full justify-start font-medium text-slate-600 hover:text-slate-900 ${isMessagesActive ? 'bg-slate-100 text-slate-900' : ''}`}
                                >
                                    <MessageSquare className="h-5 w-5 mr-3" />
                                    Messagerie
                                </Button>
                            </Link>
                        )}

                        <Link href="/settings" onClick={() => setIsOpen(false)}>
                            <Button
                                variant={isSettingsActive ? 'secondary' : 'ghost'}
                                className={`w-full justify-start font-medium text-slate-600 hover:text-slate-900 ${isSettingsActive ? 'bg-slate-100 text-slate-900' : ''}`}
                            >
                                <Settings className="h-5 w-5 mr-3" />
                                Paramètres
                            </Button>
                        </Link>

                        <div className="pt-2 border-t border-slate-100 mt-2">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
                                onClick={() => { setIsOpen(false); signOut(); }}
                            >
                                <LogOut className="h-5 w-5 mr-3" />
                                Déconnexion
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
