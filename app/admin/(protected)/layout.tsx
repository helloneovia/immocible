import Link from 'next/link'
import { LayoutDashboard, Users, CreditCard, LogOut, Home, Trash2, Receipt, Ticket, Settings } from 'lucide-react'
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
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white hidden md:flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <span className="text-indigo-500">IMMOCIBLE</span> ADMIN
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-4">
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                        <Users className="h-5 w-5" />
                        Utilisateurs
                    </Link>
                    <Link href="/admin/subscriptions" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                        <CreditCard className="h-5 w-5" />
                        Abonnements
                    </Link>
                    <Link href="/admin/transactions" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                        <Receipt className="h-5 w-5" />
                        Transactions
                    </Link>
                    <Link href="/admin/coupons" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                        <Ticket className="h-5 w-5" />
                        Coupons
                    </Link>
                    <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                        <Settings className="h-5 w-5" />
                        Paramètres
                    </Link>
                    <Link href="/admin/system" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                        <Trash2 className="h-5 w-5 text-red-400" />
                        Système
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors text-sm">
                        <Home className="h-4 w-4" />
                        Retour au site
                    </Link>
                    <AdminLogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between md:hidden">
                    <div className="font-bold">ADMIN PANEL</div>
                    <AdminMobileNav />
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
