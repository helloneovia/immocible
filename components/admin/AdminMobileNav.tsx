'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, CreditCard, Receipt, Trash2, Home, LogOut, Menu, X, Settings, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AdminMobileNav() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsOpen(true)}
            >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/80 transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Sidebar Drawer */}
                    <div className="relative flex w-64 max-w-xs flex-col bg-gray-900 text-white h-full p-6 shadow-xl transition-transform">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2 font-bold text-xl">
                                <span className="text-indigo-500">IMMOCIBLE</span> ADMIN
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-white"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <nav className="flex-1 space-y-2">
                            <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <LayoutDashboard className="h-5 w-5" />
                                Dashboard
                            </Link>
                            <Link
                                href="/admin/users"
                                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Users className="h-5 w-5" />
                                Utilisateurs
                            </Link>
                            <Link
                                href="/admin/subscriptions"
                                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <CreditCard className="h-5 w-5" />
                                Abonnements
                            </Link>
                            <Link
                                href="/admin/transactions"
                                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Receipt className="h-5 w-5" />
                                Transactions
                            </Link>
                            <Link
                                href="/admin/coupons"
                                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Ticket className="h-5 w-5" />
                                Coupons
                            </Link>
                            <Link
                                href="/admin/settings"
                                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Settings className="h-5 w-5" />
                                Paramètres
                            </Link>
                        </nav>

                        <div className="pt-4 mt-4 border-t border-gray-800 space-y-2">
                            <Link
                                href="/"
                                className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors text-sm"
                                onClick={() => setIsOpen(false)}
                            >
                                <Home className="h-4 w-4" />
                                Retour au site
                            </Link>

                            <form action="/api/auth/logout" method="POST">
                                <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors text-sm w-full text-left">
                                    <LogOut className="h-4 w-4" />
                                    Déconnexion
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
