
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function RefundButton({ paymentId }: { paymentId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleRefund = async () => {
        if (!confirm('Voulez-vous vraiment rembourser ce paiement ? L\'abonnement de l\'agence sera annulé.')) {
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/payment/refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId })
            })

            if (!res.ok) throw new Error('Echec du remboursement')

            alert('Remboursement effectué avec succès')
            router.refresh()
        } catch (e) {
            alert('Erreur lors du remboursement')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleRefund}
            disabled={loading}
        >
            {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : 'Rembourser'}
        </Button>
    )
}
