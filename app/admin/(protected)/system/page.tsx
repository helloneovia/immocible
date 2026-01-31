'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Trash2, RefreshCw, AlertTriangle, ShieldAlert, CheckSquare, Square } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const TABLES = [
    { id: 'user', label: 'Utilisateurs (sauf Admins)', desc: 'Supprime aussi les profils associés' },
    { id: 'conversation', label: 'Conversations & Messages', desc: 'Tout l\'historique de chat' },
    { id: 'unlockedProfile', label: 'Contacts Débloqués', desc: 'Les accès payés aux contacts' },
    { id: 'payment', label: 'Paiements', desc: 'Historique Stripe et facturation' },
    { id: 'bien', label: 'Annonces (Biens)', desc: 'Toutes les propriétés listées' },
    { id: 'recherche', label: 'Recherches', desc: 'Critères de recherche des acquéreurs' },
    { id: 'match', label: 'Matchs & Favoris', desc: 'Associations automatiques et likes' },
    { id: 'coupon', label: 'Coupons', desc: 'Codes promo' },
    { id: 'verificationToken', label: 'Tokens de Vérification', desc: 'Liens magiques et resets de mot de passe' },
]

export default function AdminSystemPage() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedTables, setSelectedTables] = useState<string[]>(TABLES.map(t => t.id))

    const handleSelectAll = () => {
        if (selectedTables.length === TABLES.length) {
            setSelectedTables([])
        } else {
            setSelectedTables(TABLES.map(t => t.id))
        }
    }

    const handleToggle = (id: string) => {
        if (selectedTables.includes(id)) {
            setSelectedTables(selectedTables.filter(t => t !== id))
        } else {
            setSelectedTables([...selectedTables, id])
        }
    }

    const handleReset = async () => {
        if (selectedTables.length === 0) {
            setError('Sélectionnez au moins une table')
            return
        }

        if (!confirm(`Êtes-vous sûr de vouloir supprimer les données des ${selectedTables.length} tables sélectionnées ? Cette action est irréversible.`)) {
            return
        }

        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const response = await fetch('/api/admin/reset-db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tables: selectedTables })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Erreur lors de la réinitialisation')
            }

            setSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Impossible de réinitialiser la base de données')
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
                        <p className="text-gray-600 text-lg">Actions avancées et nettoyage de données</p>
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-xl">
                        <ShieldAlert className="h-8 w-8 text-white" />
                    </div>
                </div>

                {success && (
                    <Alert className="border-green-200 bg-green-50">
                        <AlertTitle className="text-green-900">Succès</AlertTitle>
                        <AlertDescription className="text-green-700">
                            Les données sélectionnées ont été supprimées avec succès.
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

                {/* Selection Zone */}
                <Card className="border-2 border-red-200 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white pb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Trash2 className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Suppression Sélective</CardTitle>
                                <CardDescription className="text-white/90 mt-1">
                                    Cochez les éléments à supprimer définitivement
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 bg-red-50/30">
                        <div className="space-y-6">

                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-red-900">Tables de la base de données</h3>
                                <Button variant="outline" size="sm" onClick={handleSelectAll} className="text-red-600 border-red-200 hover:bg-red-50">
                                    {selectedTables.length === TABLES.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {TABLES.map((table) => (
                                    <div key={table.id} className="flex items-start space-x-3 p-3 rounded-lg border border-red-100 bg-white hover:shadow-md transition-shadow">
                                        <Checkbox
                                            id={table.id}
                                            checked={selectedTables.includes(table.id)}
                                            onCheckedChange={() => handleToggle(table.id)}
                                            className="mt-1"
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label
                                                htmlFor={table.id}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-900"
                                            >
                                                {table.label}
                                            </Label>
                                            <p className="text-xs text-gray-500">
                                                {table.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Alert className="border-red-200 bg-red-50 mt-6">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <AlertTitle className="text-red-900">Attention</AlertTitle>
                                <AlertDescription className="text-red-700 mt-2">
                                    Cette action est <strong>IRRÉVERSIBLE</strong>. Assurez-vous d'avoir une sauvegarde si nécessaire.
                                </AlertDescription>
                            </Alert>

                            <div className="flex justify-end pt-4 border-t border-red-200 mobile:flex-col gap-4">
                                <div className="text-sm text-red-600 self-center hidden md:block">
                                    {selectedTables.length} tables sélectionnées
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={handleReset}
                                    disabled={loading || selectedTables.length === 0}
                                    size="lg"
                                    className="bg-red-600 hover:bg-red-700 shadow-lg w-full md:w-auto"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                            Suppression en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="mr-2 h-5 w-5" />
                                            Supprimer la sélection
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
