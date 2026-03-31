'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function TrackingProvider() {
    const pathname = usePathname()
    const { user, loading } = useAuth()
    const [sessionId, setSessionId] = useState<string | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            let sid = sessionStorage.getItem('immocible_session_id')
            if (!sid) {
                sid = Math.random().toString(36).substring(2, 15)
                sessionStorage.setItem('immocible_session_id', sid)
            }
            setSessionId(sid)
        }
    }, [])

    useEffect(() => {
        if (loading) return;
        if (!sessionId) return; // Wait for session id to be assigned
        if (pathname?.startsWith('/admin')) return; // Don't track admin pages

        const trackPageview = async () => {
            try {
                await fetch('/api/tracking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        path: window.location.pathname + window.location.search,
                        referrer: document.referrer || null,
                        sessionId,
                        userId: user?.id || null,
                        role: user?.role || 'visitor',
                    })
                    // Removed keepalive to avoid CORS preflight blocking in Chromium
                })
            } catch (e) {
                // Silently ignore tracking errors
            }
        }

        // Delay slightly to prioritize critical page rendering requests
        const timeoutId = setTimeout(trackPageview, 1000)

        return () => clearTimeout(timeoutId)
    }, [pathname, user, loading, sessionId])

    return null
}
