import Link from 'next/link'
import { LayoutDashboard, Users, CreditCard, LogOut, Home, Trash2, Receipt, Ticket, Settings, Mail, MessageSquare } from 'lucide-react'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import { AdminMobileNav } from '@/components/admin/AdminMobileNav'
import { AdminLogoutButton } from '@/components/admin/AdminLogoutButton'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
        redirect('/admin/login')
    }

    return (
        <div className="min-h-screen bg-slate-50/50 flex text-slate-900 font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900 text-white hidden md:flex flex-col border-r border-slate-800 shadow-2xl">
                <div className="p-8">
                    <div className="flex items-center gap-2 font-bold text-2xl tracking-wide">
                        <span className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                            <Home className="h-4 w-4 text-white" />
                        </span>
                        <span>IMMOCIBLE</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-4">
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300 font-medium group">
                        <LayoutDashboard className="h-5 w-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                        Dashboard
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300 font-medium group">
                        <Users className="h-5 w-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                        Utilisateurs
                    </Link>
                    <Link href="/admin/subscriptions" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300 font-medium group">
                        <CreditCard className="h-5 w-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                        Abonnements
                    </Link>
                    <Link href="/admin/transactions" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300 font-medium group">
                        <Receipt className="h-5 w-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                        Transactions
                    </Link>
                    <Link href="/admin/coupons" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300 font-medium group">
                        <Ticket className="h-5 w-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                        Coupons
                    </Link>
                    <Link href="/admin/newsletter" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300 font-medium group">
                        <Mail className="h-5 w-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                        Newsletter
                    </Link>
                    <Link href="/admin/chats" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300 font-medium group">
                        <MessageSquare className="h-5 w-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                        Messagerie
                    </Link>
                    <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300 font-medium group">
                        <Settings className="h-5 w-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                        Paramètres
                    </Link>
                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <Link href="/admin/system" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-300 font-medium group">
                            <Trash2 className="h-5 w-5 group-hover:text-red-400 transition-colors" />
                            Système
                        </Link>
                    </div>
                </nav>

                <div className="p-6 border-t border-slate-800 space-y-3">
                    <Link href="/" className="flex items-center gap-3 justify-center w-full px-4 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm font-medium">
                        <Home className="h-4 w-4" />
                        Retour au site
                    </Link>
                    <AdminLogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative">
                <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between md:hidden sticky top-0 z-50">
                    <div className="font-bold flex items-center gap-2">
                        <span className="h-6 w-6 bg-slate-900 rounded-md flex items-center justify-center">
                            <Home className="h-3 w-3 text-white" />
                        </span>
                        IMMOCIBLE
                    </div>
                    <AdminMobileNav />
                </header>
                <div className="p-6 md:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
