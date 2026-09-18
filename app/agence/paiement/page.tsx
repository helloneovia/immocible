'use client'

import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/Navbar'
import { useI18n } from '@/lib/i18n/client'
import { MobileAppPaymentNotice } from '@/components/shared/MobileAppPaymentNotice'

// We will fetch settings in useEffect or just use NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
let stripePromise: Promise<any> | null = null;
const initStripe = (key: string) => {
    if (!stripePromise) {
        stripePromise = loadStripe(key)
    }
    return stripePromise
}

export default function PaiementPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { t } = useI18n()
    const clientSecret = searchParams.get('client_secret')
    const [stripeKey, setStripeKey] = useState('')
    const [loading, setLoading] = useState(true)
    // Paiement Stripe désactivé par l'admin : le paiement se fait dans l'application mobile.
    const [stripeWebEnabled, setStripeWebEnabled] = useState(true)

    useEffect(() => {
        fetch('/api/public/settings')
            .then(res => res.json())
            .then(data => {
                if (data && data.payment_stripe_web_enabled === false) {
                    setStripeWebEnabled(false)
                    setLoading(false)
                    return
                }
                const key = data?.stripe_public_key || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                if (key) {
                    setStripeKey(key)
                    initStripe(key)
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    if (!loading && !stripeWebEnabled) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar role="agence" />
                <div className="flex flex-col items-center justify-center p-20 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">{t('common.payment.appOnlyTitle')}</h1>
                    <MobileAppPaymentNotice className="max-w-md mb-8" message={t('common.payment.appOnlySubscription')} />
                    <Button onClick={() => router.push('/agence/dashboard')}>{t('agency.payment.back')}</Button>
                </div>
            </div>
        )
    }

    if (!clientSecret) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar role="agence" />
                <div className="flex flex-col items-center justify-center p-20 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">{t('agency.payment.errorTitle')}</h1>
                    <p className="text-slate-500 mb-8">{t('agency.payment.missingSession')}</p>
                    <Button onClick={() => router.back()}>{t('agency.payment.back')}</Button>
                </div>
            </div>
        )
    }

    if (loading || !stripeKey) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p>{t('agency.payment.initializing')}</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar role="agence" />
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                
                <div className="mb-8 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => router.back()} className="text-slate-500 hover:text-slate-900">
                        <ArrowLeft className="w-4 h-4 mr-2" /> {t('agency.payment.back')}
                    </Button>
                    <div className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        <ShieldCheck className="w-4 h-4 mr-1.5" /> {t('agency.payment.secure')}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transform transition-all duration-300">
                    <div className="h-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
                    <div className="p-4 sm:p-8">
                        <EmbeddedCheckoutProvider
                            stripe={stripePromise}
                            options={{ clientSecret }}
                        >
                            <EmbeddedCheckout />
                        </EmbeddedCheckoutProvider>
                    </div>
                </div>
            </div>
        </div>
    )
}
