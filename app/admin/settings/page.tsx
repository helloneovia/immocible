
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Trash2, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleReset = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.')) {
            return
        }

        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const response = await fetch('/api/admin/reset-db', {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error('Erreur lors de la réinitialisation')
            }

            setSuccess(true)
        } catch (err) {
            setError('Impossible de réinitialiser la base de données')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Paramètres système</h1>

            <Card className="border-red-200">
                <CardHeader className="bg-red-50/50">
                    <div className="flex items-center gap-2 text-red-700">
                        <Trash2 className="h-6 w-6" />
                        <CardTitle>Zone de Danger</CardTitle>
                    </div>
                    <CardDescription className="text-red-600/80">
                        Actions destructrices irréversibles
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Utilisez ce bouton pour purger toutes les données de l'application (Utilisateurs, Biens, Recherches, Matchs).
                            Seuls les comptes Administrateurs seront conservés.
                        </p>

                        {success && (
                            <Alert className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertTitle>Succès</AlertTitle>
                                <AlertDescription>
                                    La base de données a été réinitialisée avec succès.
                                </AlertDescription>
                            </Alert>
                        )}

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Erreur</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            variant="destructive"
                            onClick={handleReset}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {loading ? 'Réinitialisation...' : 'Réinitialiser la base de données'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
