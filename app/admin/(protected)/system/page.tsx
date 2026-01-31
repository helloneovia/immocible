'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Trash2, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function AdminSystemPage() {
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 -m-8 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                            Système & Maintenance
                        </h1>
                        <p className="text-gray-600 text-lg">Actions avancées et irréversibles</p>
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-xl">
                        <ShieldAlert className="h-8 w-8 text-white" />
                    </div>
                </div>

                {success && (
                    <Alert className="border-green-200 bg-green-50">
                        <AlertTitle className="text-green-900">Succès</AlertTitle>
                        <AlertDescription className="text-green-700">
                            La base de données a été réinitialisée avec succès.
                        </AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Danger Zone */}
                <Card className="border-2 border-red-200 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white pb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Trash2 className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Réinitialisation Complète</CardTitle>
                                <CardDescription className="text-white/90 mt-1">
                                    Suppression de toutes les données applicatives
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 bg-red-50/30">
                        <div className="space-y-6">
                            <Alert className="border-red-200 bg-red-50">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <AlertTitle className="text-red-900">Attention : Zone de Danger</AlertTitle>
                                <AlertDescription className="text-red-700 mt-2">
                                    Cette action supprimera définitivement :
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li>Tous les utilisateurs (sauf Admins)</li>
                                        <li>Toutes les annonces immobilières</li>
                                        <li>Toutes les recherches et favoris</li>
                                        <li>Tous les matchs et conversations</li>
                                        <li>L'historique des paiements</li>
                                    </ul>
                                    <p className="mt-2 font-bold">Cette action est irréversible.</p>
                                </AlertDescription>
                            </Alert>

                            <div className="flex justify-end">
                                <Button
                                    variant="destructive"
                                    onClick={handleReset}
                                    disabled={loading}
                                    size="lg"
                                    className="bg-red-600 hover:bg-red-700 shadow-lg w-full sm:w-auto"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                            Réinitialisation en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="mr-2 h-5 w-5" />
                                            Réinitialiser la base de données
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
