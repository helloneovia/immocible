'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { Button } from '@/components/ui/button'
import { Home, MessageSquare, Settings, LogOut } from 'lucide-react'

interface NavbarProps {
    role: 'agence' | 'acquereur' | 'admin'
}

export function Navbar({ role }: NavbarProps) {
    const { signOut } = useAuth()
    const pathname = usePathname()

    const homeLink = role === 'agence' ? '/agence/dashboard' : (role === 'admin' ? '/admin/dashboard' : '/acquereur/dashboard')
    const messagesLink = role === 'agence' ? '/agence/messages' : '/acquereur/messages'

    // Helper to check active state
    // Exact match for dashboard, StartsWith for others to handle subpages
    const isMessagesActive = pathname === messagesLink || pathname?.startsWith(messagesLink + '/')
    const isSettingsActive = pathname === '/settings'

    return (
        <nav className="border-b border-white/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    <Link href={homeLink} className="flex items-center space-x-3 group">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Home className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            IMMOCIBLE
                        </span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        <NotificationBell role={role} />

                        {role !== 'admin' && (
                            <Link href={messagesLink}>
                                <Button
                                    variant={isMessagesActive ? "secondary" : "ghost"}
                                    className={`font-medium ${isMessagesActive ? 'bg-indigo-50 text-indigo-700' : ''}`}
                                >
                                    <MessageSquare className="h-5 w-5 mr-2" />
                                    Messagerie
                                </Button>
                            </Link>
                        )}

                        <Link href="/settings">
                            <Button
                                variant={isSettingsActive ? "secondary" : "ghost"}
                                className={`font-medium ${isSettingsActive ? 'bg-indigo-50 text-indigo-700' : ''}`}
                            >
                                <Settings className="h-5 w-5 mr-2" />
                                Paramètres
                            </Button>
                        </Link>

                        <Button variant="outline" className="font-medium" onClick={signOut}>
                            <LogOut className="h-5 w-5 mr-2" />
                            Déconnexion
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
