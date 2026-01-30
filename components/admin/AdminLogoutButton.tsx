'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AdminLogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            // Force hard reload to login page
            window.location.href = '/admin/login'
        } catch (error) {
            console.error('Logout failed', error)
        }
    }

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors text-sm w-full text-left"
        >
            <LogOut className="h-4 w-4" />
            Déconnexion
        </button>
    )
}
