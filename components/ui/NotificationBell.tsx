'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface NotificationBellProps {
    role: 'acquereur' | 'agence'
}

export function NotificationBell({ role }: NotificationBellProps) {
    const [unreadCount, setUnreadCount] = useState(0)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const previousCountRef = useRef(0)

    useEffect(() => {
        // Initialize audio
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3') // Simple distinct notification sound
        audioRef.current.volume = 0.5

        const fetchUnread = async () => {
            try {
                const res = await fetch('/api/notifications/unread')
                if (res.ok) {
                    const data = await res.json()
                    const newCount = data.count

                    // Play sound if count increased
                    if (newCount > previousCountRef.current && newCount > 0) {
                        try {
                            // User interaction is usually required to play audio, 
                            // but inside an effect it might be blocked until user interacts with the page.
                            // We attempt it anyway.
                            audioRef.current?.play().catch(e => console.log('Audio play blocked:', e))
                        } catch (e) {
                            console.error('Audio error', e)
                        }
                    }

                    setUnreadCount(newCount)
                    previousCountRef.current = newCount
                }
            } catch (error) {
                console.error('Error fetching notifications:', error)
            }
        }

        // Initial fetch
        fetchUnread()

        // Poll every 15 seconds
        const interval = setInterval(fetchUnread, 15000)

        return () => clearInterval(interval)
    }, [])

    const href = role === 'agence' ? '/agence/messages' : '/acquereur/messages'

    return (
        <Link href={href}>
            <Button variant="ghost" className="relative p-2 h-10 w-10 rounded-full hover:bg-gray-100">
                <Bell className={`h-6 w-6 ${unreadCount > 0 ? 'text-blue-600 animate-pulse' : 'text-gray-500'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white transform translate-x-1 -translate-y-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>
        </Link>
    )
}
