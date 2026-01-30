'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Trash2, CheckCircle2, Save, Settings, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface SystemSetting {
    key: string
    value: string
    type: string
    label: string
    description: string
}

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Settings state
    const [settings, setSettings] = useState<SystemSetting[]>([])
    const [settingsLoading, setSettingsLoading] = useState(true)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        setSettingsLoading(true)
        try {
            const res = await fetch('/api/admin/settings')
            if (res.ok) {
                const data = await res.json()
                if (Array.isArray(data) && data.length > 0) {
                    setSettings(data)
                } else {
                    // Start initialization if empty
                    await initSettings()
                }
            }
        } catch (e) {
            console.error(e)
        } finally {
            setSettingsLoading(false)
        }
    }

    const initSettings = async () => {
        try {
            const res = await fetch('/api/admin/init-settings', { method: 'POST' })
            if (res.ok) {
                const res2 = await fetch('/api/admin/settings')
                if (res2.ok) setSettings(await res2.json())
            }
        } catch (e) {
            console.error("Init failed", e)
        }
    }

    const handleSettingChange = (key: string, newValue: string) => {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value: newValue } : s))
        setHasChanges(true)
    }

    const saveSettings = async () => {
        setLoading(true)
        setSuccess(false)
        setError(null)
        try {
            const updates = settings.map(s => ({ key: s.key, value: s.value }))
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates }) // Wrap in updates object based on API requirement
            })

            if (!res.ok) throw new Error('Erreur lors de la sauvegarde')

            setSuccess(true)
            setHasChanges(false)
            setTimeout(() => setSuccess(false), 3000)
        } catch (e) {
            setError("Impossible de sauvegarder les paramètres")
        } finally {
            setLoading(false)
        }
    }

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
        <div className="space-y-8 pb-10">
            <h1 className="text-3xl font-bold text-gray-900">Paramètres système</h1>

            {/* General Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Settings className="h-6 w-6 text-gray-600" />
                        <CardTitle>Configuration Générale</CardTitle>
                    </div>
                    <CardDescription>
                        Modifiez les textes, prix et configurations du site en temps réel.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {settingsLoading ? (
                        <div className="flex justify-center p-8">
                            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {settings.map((setting) => (
                                <div key={setting.key} className="space-y-2">
                                    <Label htmlFor={setting.key} className="flex flex-col gap-1">
                                        <span className="font-medium text-gray-900">{setting.label || setting.key}</span>
                                        <span className="text-xs text-gray-500 font-normal">{setting.description}</span>
                                    </Label>

                                    {setting.type === 'json' || setting.value.length > 100 ? (
                                        <Textarea
                                            id={setting.key}
                                            value={setting.value}
                                            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                                            className="font-mono text-sm"
                                            rows={5}
                                        />
                                    ) : (
                                        <Input
                                            id={setting.key}
                                            value={setting.value}
                                            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                                            className="max-w-md"
                                        />
                                    )}
                                </div>
                            ))}

                            <div className="pt-4 flex items-center gap-4">
                                <Button
                                    onClick={saveSettings}
                                    disabled={loading || !hasChanges}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {loading ? 'Sauvegarde...' : 'Sauvegarder les changements'}
                                    {!loading && <Save className="ml-2 h-4 w-4" />}
                                </Button>
                                {success && (
                                    <span className="text-green-600 flex items-center gap-1 text-sm">
                                        <CheckCircle2 className="h-4 w-4" /> Sauvegardé !
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

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

                        {error && !settingsLoading && (
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
