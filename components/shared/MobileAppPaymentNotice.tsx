'use client'

import { Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Message affiché à la place des paiements Stripe lorsque l'admin les a désactivés sur le
 * site (réglage payment_stripe_web_enabled) : les achats se font dans les applications.
 */
export function MobileAppPaymentNotice({
    message,
    tone = 'light',
    className,
}: {
    message: string
    tone?: 'light' | 'dark'
    className?: string
}) {
    return (
        <div
            className={cn(
                'flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm',
                tone === 'dark' ? 'border-white/15 bg-white/5 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-600',
                className,
            )}
        >
            <Smartphone className={cn('mt-0.5 h-4 w-4 flex-shrink-0', tone === 'dark' ? 'text-amber-400' : 'text-amber-600')} />
            <span>{message}</span>
        </div>
    )
}
