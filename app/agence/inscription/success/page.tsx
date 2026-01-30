
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function PaymentSuccess() {
    const router = useRouter()
    const { refreshUser } = useAuth()
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

    useEffect(() => {
        if (!sessionId) {
            setStatus('error')
            return
        }

        const verifyPayment = async () => {
            try {
                const res = await fetch(`/api/payment/success?session_id=${sessionId}`)
                if (res.ok) {
                    setStatus('success')
                    await refreshUser()
                    // Optional: Auto redirect after few seconds
                    setTimeout(() => router.push('/agence/dashboard'), 3000)
                } else {
                    setStatus('error')
                }
            } catch (e) {
                setStatus('error')
            }
        }

        verifyPayment()
    }, [sessionId, router])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto mb-4">
                        {status === 'loading' && <Loader2 className="h-16 w-16 text-indigo-600 animate-spin" />}
                        {status === 'success' && <CheckCircle2 className="h-16 w-16 text-green-500" />}
                        {status === 'error' && <XCircle className="h-16 w-16 text-red-500" />}
                    </div>
                    <CardTitle>
                        {status === 'loading' && <span>Vérification du paiement...</span>}
                        {status === 'success' && <span>Paiement réussi !</span>}
                        {status === 'error' && <span>Erreur de paiement</span>}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            {status === 'success' && <span>Votre compte agence est maintenant actif. Vous allez être redirigé...</span>}
                            {status === 'error' && <span>Impossible de vérifier le paiement. Veuillez contacter le support.</span>}
                        </p>

                        {status !== 'loading' && (
                            <Button
                                className="w-full"
                                onClick={() => router.push(status === 'success' ? '/agence/dashboard' : '/agence/inscription')}
                            >
                                {status === 'success' ? 'Accéder au Dashboard' : 'Retour'}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
