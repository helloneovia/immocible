'use client'

import { LogOut } from 'lucide-react'

export function AdminLogoutButton() {
    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })

            // Clear any local storage/session storage
            if (typeof window !== 'undefined') {
                localStorage.clear()
                sessionStorage.clear()
            }

            // Force hard redirect to login page
            window.location.href = '/admin/login'
        } catch (error) {
            console.error('Logout failed', error)
            // Still redirect even if API fails
            window.location.href = '/admin/login'
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
