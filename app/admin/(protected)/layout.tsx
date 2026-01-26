import Link from 'next/link'
import { LayoutDashboard, Users, CreditCard, LogOut, Home, Trash2 } from 'lucide-react'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'

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
                    <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-900/20 hover:text-red-200 rounded-lg transition-colors mt-8">
                        <Trash2 className="h-5 w-5" />
                        Reset Database
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors text-sm">
                        <Home className="h-4 w-4" />
                        Retour au site
                    </Link>
                    <form action="/api/auth/logout" method="POST">
                        {/* We can use a real logout route or client component. For now, we will just use a button that hrefs to logout or use client logic. 
                             But wait, this layout is server side. We can't use onClick. 
                             Simple solution: make the logout button a link to a logout API route that redirects.
                             Or use a Client Component wrapper for the sidebar. 
                             For simplicity in this layout file, I'll keep the button visually but note it needs client logic or an API route. 
                             Actually, I'll allow the existing button but since it doesn't do anything yet, I will leave it as is or change to Link.
                         */}
                        <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors text-sm w-full text-left">
                            <LogOut className="h-4 w-4" />
                            Déconnexion
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between md:hidden">
                    <div className="font-bold">ADMIN PANEL</div>
                    {/* Mobile menu trigger could go here */}
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
