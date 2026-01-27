'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Building2,
    Euro,
    CheckCircle2,
    ArrowRight,
    MessageSquare,
    Loader2
} from 'lucide-react'

interface MatchCardProps {
    match: {
        id: string;
        score: number;
        user: {
            id: string;
            email: string;
            profile?: {
                nom?: string;
                prenom?: string;
            }
        };
        budgetMin?: number;
        budgetMax?: number;
    }
}

export function MatchCard({ match }: MatchCardProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleStartChat = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/chat/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ buyerId: match.user.id })
            })

            const data = await res.json()

            if (res.ok) {
                // Redirect to messages page
                router.push('/agence/messages')
            } else {
                if (data.code === 'LIMIT_REACHED') {
                    alert("Limite atteinte : " + data.error)
                } else {
                    console.error(data.error)
                    alert("Erreur lors de l'initialisation du chat")
                }
            }
        } catch (error) {
            console.error(error)
            alert("Erreur de connexion")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="group border-2 hover:border-purple-300 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
            <CardHeader>
                <div className="flex items-center justify-between mb-3">
                    <CardTitle className="text-xl font-bold">
                        {match.user.profile?.prenom || 'Acquéreur'} {match.user.profile?.nom?.charAt(0) || ''}.
                    </CardTitle>
                    <span className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-full font-bold flex items-center gap-1 shadow-lg">
                        {match.score}%
                    </span>
                </div>
                <CardDescription className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4" />
                    Recherche active
                </CardDescription>
                <CardDescription className="flex items-center gap-1 mt-1">
                    <Euro className="h-3 w-3" />
                    Budget: {match.budgetMin?.toLocaleString()} - {match.budgetMax?.toLocaleString()}€
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="font-medium">Acquéreur vérifié</span>
                    </div>
                </div>
                <Button
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 group-hover:shadow-lg transition-all duration-300"
                    variant="default"
                    onClick={handleStartChat}
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <MessageSquare className="mr-2 h-4 w-4" />
                    )}
                    Démarrer une discussion
                </Button>
            </CardContent>
        </Card>
    )
}
