'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Trash2, CheckCircle2, Save, Settings, RefreshCw, DollarSign, List, Key, Sparkles, AlertTriangle, AlignLeft } from 'lucide-react'
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
                body: JSON.stringify({ updates })
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

    // Group settings by category
    const priceSettings = settings.filter(s => s.key.startsWith('price_'))
    const featureSettings = settings.filter(s => s.key.startsWith('feature_'))
    const textSettings = settings.filter(s => s.key.startsWith('text_'))
    const otherSettings = settings.filter(s =>
        !s.key.startsWith('price_') &&
        !s.key.startsWith('feature_') &&
        !s.key.startsWith('text_')
    )

    const getIcon = (key: string) => {
        if (key.startsWith('price_')) return <DollarSign className="h-5 w-5" />
        if (key.startsWith('feature_')) return <List className="h-5 w-5" />
        if (key.startsWith('text_')) return <AlignLeft className="h-5 w-5" />
        if (key.includes('stripe')) return <Key className="h-5 w-5" />
        return <Settings className="h-5 w-5" />
    }

    const renderSettingGroup = (title: string, icon: React.ReactNode, groupSettings: SystemSetting[], gradient: string) => {
        if (groupSettings.length === 0) return null

        return (
            <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className={`${gradient} text-white pb-6`}>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            {icon}
                        </div>
                        <div>
                            <CardTitle className="text-2xl">{title}</CardTitle>
                            <CardDescription className="text-white/80 mt-1">
                                {groupSettings.length} paramètre{groupSettings.length > 1 ? 's' : ''}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        {groupSettings.map((setting) => (
                            <div key={setting.key} className="space-y-3 p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:border-gray-200 transition-colors">
                                <Label htmlFor={setting.key} className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                                            {getIcon(setting.key)}
                                        </div>
                                        <span className="font-semibold text-gray-900 text-lg">{setting.label || setting.key}</span>
                                    </div>
                                    <span className="text-sm text-gray-600 ml-10">{setting.description}</span>
                                </Label>

                                {setting.type === 'json' || setting.value.length > 100 ? (
                                    <Textarea
                                        id={setting.key}
                                        value={setting.value}
                                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                                        className="font-mono text-sm bg-white border-gray-200 focus:border-indigo-500 ml-10"
                                        rows={4}
                                    />
                                ) : (
                                    <Input
                                        id={setting.key}
                                        value={setting.value}
                                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                                        className="max-w-md bg-white border-gray-200 focus:border-indigo-500 ml-10"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 -m-8 p-8">
            <div className="max-w-6xl mx-auto space-y-8 pb-10">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                            Paramètres Système
                        </h1>
                        <p className="text-gray-600 text-lg">Gérez la configuration globale de votre application</p>
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-xl">
                        <Settings className="h-8 w-8 text-white" />
                    </div>
                </div>

                {/* Success/Error Alerts */}
                {success && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <AlertTitle className="text-green-900">Succès !</AlertTitle>
                        <AlertDescription className="text-green-700">
                            Les paramètres ont été sauvegardés avec succès.
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

                {/* Loading State */}
                {settingsLoading ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="flex flex-col items-center justify-center p-16">
                            <RefreshCw className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                            <p className="text-gray-600 text-lg">Chargement des paramètres...</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Settings Groups */}
                        {renderSettingGroup(
                            "Contenu du Site",
                            <AlignLeft className="h-6 w-6" />,
                            textSettings,
                            "bg-gradient-to-r from-pink-500 to-rose-600"
                        )}

                        {renderSettingGroup(
                            "Tarification",
                            <DollarSign className="h-6 w-6" />,
                            priceSettings,
                            "bg-gradient-to-r from-emerald-500 to-teal-600"
                        )}

                        {renderSettingGroup(
                            "Fonctionnalités",
                            <Sparkles className="h-6 w-6" />,
                            featureSettings,
                            "bg-gradient-to-r from-indigo-600 to-purple-600"
                        )}

                        {renderSettingGroup(
                            "Configuration",
                            <Settings className="h-6 w-6" />,
                            otherSettings,
                            "bg-gradient-to-r from-blue-600 to-indigo-600"
                        )}

                        {/* Save Button - Sticky */}
                        {settings.length > 0 && (
                            <div className="sticky bottom-8 z-10">
                                <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {hasChanges && (
                                                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                                                        <AlertTriangle className="h-5 w-5" />
                                                        <span className="font-medium">Modifications non sauvegardées</span>
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                onClick={saveSettings}
                                                disabled={loading || !hasChanges}
                                                size="lg"
                                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                                            >
                                                {loading ? (
                                                    <>
                                                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                                        Sauvegarde en cours...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-5 w-5" />
                                                        Sauvegarder les modifications
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </>
                )}

                {/* Danger Zone */}
                <Card className="border-2 border-red-200 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white pb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Trash2 className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Zone de Danger</CardTitle>
                                <CardDescription className="text-white/90 mt-1">
                                    Actions destructrices et irréversibles
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 bg-red-50/30">
                        <div className="space-y-4">
                            <Alert className="border-red-200 bg-red-50">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <AlertTitle className="text-red-900">Attention !</AlertTitle>
                                <AlertDescription className="text-red-700">
                                    Cette action supprimera définitivement toutes les données de l'application (Utilisateurs, Biens, Recherches, Matchs).
                                    Seuls les comptes Administrateurs seront conservés. Cette action est <strong>irréversible</strong>.
                                </AlertDescription>
                            </Alert>

                            <Button
                                variant="destructive"
                                onClick={handleReset}
                                disabled={loading}
                                size="lg"
                                className="bg-red-600 hover:bg-red-700 shadow-lg"
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
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
