'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { hasAnalyticsConsent, CONSENT_EVENT } from '@/components/CookieConsent'

export function TrackingProvider() {
    const pathname = usePathname()
    const { user, loading } = useAuth()
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [consented, setConsented] = useState(false)

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

    // Suit le consentement à la mesure d'audience (bandeau cookies).
    useEffect(() => {
        const sync = () => setConsented(hasAnalyticsConsent())
        sync()
        window.addEventListener(CONSENT_EVENT, sync)
        window.addEventListener('storage', sync)
        return () => {
            window.removeEventListener(CONSENT_EVENT, sync)
            window.removeEventListener('storage', sync)
        }
    }, [])

    useEffect(() => {
        if (loading) return;
        if (!consented) return; // N'assure aucun suivi sans consentement explicite
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
    }, [pathname, user, loading, sessionId, consented])

    return null
}
