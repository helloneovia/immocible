'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    AlertCircle, CheckCircle2, Save,
    RefreshCw, DollarSign, List, Key, Sparkles, AlertTriangle,
    AlignLeft, CreditCard, LayoutTemplate, Settings2, FileText,
    ChevronRight, Layers
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface SystemSetting {
    key: string
    value: string
    type: string
    label: string
    description: string
}

type TabType = 'content' | 'pricing' | 'features' | 'config'

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>('content')

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

    // Group settings
    const priceSettings = settings.filter(s => s.key.startsWith('price_')).sort((a, b) => {
        const order = ['price_monthly', 'price_yearly', 'price_unlock_profile_percentage']
        return order.indexOf(a.key) - order.indexOf(b.key)
    })
    const featureSettings = settings.filter(s => s.key.startsWith('feature_'))
    const textSettings = settings.filter(s => s.key.startsWith('text_'))
    const otherSettings = settings.filter(s =>
        !s.key.startsWith('price_') &&
        !s.key.startsWith('feature_') &&
        !s.key.startsWith('text_')
    )

    const menuItems = [
        { id: 'content', label: 'Contenu & Textes', icon: FileText, desc: 'Textes de la page d\'accueil et pages légales', count: textSettings.length },
        { id: 'pricing', label: 'Tarification', icon: CreditCard, desc: 'Prix des abonnements et déblocages', count: priceSettings.length },
        { id: 'features', label: 'Fonctionnalités', icon: Layers, desc: 'Listes des avantages par plan', count: featureSettings.length },
        { id: 'config', label: 'Configuration API', icon: Settings2, desc: 'Clés API Stripe et config système', count: otherSettings.length },
    ]

    const renderField = (setting: SystemSetting) => (
        <div key={setting.key} className="group p-5 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all duration-200">
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start gap-4">
                    <Label htmlFor={setting.key} className="flex-1 cursor-pointer">
                        <div className="font-semibold text-gray-900 text-base mb-1 group-hover:text-indigo-700 transition-colors">
                            {setting.label || setting.key}
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                            {setting.description}
                        </p>
                    </Label>
                    <div className="px-2 py-1 bg-gray-50 rounded text-xs font-mono text-gray-400 select-all">
                        {setting.key}
                    </div>
                </div>

                <div className="mt-1">
                    {setting.type === 'json' || setting.value.length > 80 ? (
                        <Textarea
                            id={setting.key}
                            value={setting.value}
                            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                            className="font-mono text-sm min-h-[120px] bg-slate-50/50 border-gray-200 focus:bg-white focus:border-indigo-500 transition-all resize-y"
                        />
                    ) : (
                        <div className="relative">
                            <Input
                                id={setting.key}
                                value={setting.value}
                                onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                                className="h-11 bg-slate-50/50 border-gray-200 focus:bg-white focus:border-indigo-500 transition-all pl-4"
                            />
                            {setting.key.includes('price') && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                                    {setting.key.includes('percentage') ? '%' : '€'}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50/50 -m-8">
            <div className="flex flex-col lg:flex-row min-h-screen">

                {/* Refined Layout: 2 Columns */}
                <div className="max-w-7xl mx-auto w-full p-6 lg:p-10">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Paramètres</h1>
                            <p className="text-gray-500 mt-1">Configurez les aspects globaux de votre application Immocible.</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={initSettings}
                            disabled={settingsLoading}
                            className="gap-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm"
                        >
                            <RefreshCw className={`h-4 w-4 ${settingsLoading ? 'animate-spin' : ''}`} />
                            Sync. Définitions
                        </Button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">

                        {/* Navigation Menu (Left) */}
                        <nav className="w-full lg:w-64 flex-shrink-0 space-y-2 sticky top-6">
                            {menuItems.map((item) => {
                                const Icon = item.icon
                                const isActive = activeTab === item.id
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id as TabType)}
                                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 group flex items-start gap-4 ${isActive
                                            ? 'bg-indigo-600 shadow-md shadow-indigo-200'
                                            : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-indigo-600'}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className={`font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                                {item.label}
                                            </div>
                                            <div className={`text-xs mt-0.5 ${isActive ? 'text-indigo-100' : 'text-gray-500'}`}>
                                                {item.desc}
                                            </div>
                                        </div>
                                        {isActive && <ChevronRight className="h-4 w-4 text-white/50 ml-auto self-center" />}
                                    </button>
                                )
                            })}
                        </nav>

                        {/* Content Area (Right) */}
                        <div className="flex-1 min-w-0 space-y-6">

                            {/* Feedback Alerts */}
                            {success && (
                                <Alert className="bg-emerald-50 border-emerald-100 text-emerald-800 animate-in fade-in slide-in-from-top-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    <AlertTitle>Succès</AlertTitle>
                                    <AlertDescription>Modifications enregistrées avec succès.</AlertDescription>
                                </Alert>
                            )}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-5 w-5" />
                                    <AlertTitle>Erreur</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {settingsLoading ? (
                                <div className="h-96 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <RefreshCw className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
                                    <p className="text-gray-400 font-medium">Chargement...</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">
                                                {menuItems.find(i => i.id === activeTab)?.label}
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Gérez les paramètres de cette section
                                            </p>
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                                            {(() => {
                                                const Icon = menuItems.find(i => i.id === activeTab)?.icon || Settings2
                                                return <Icon className="h-5 w-5 text-indigo-600" />
                                            })()}
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {activeTab === 'content' && textSettings.map(renderField)}
                                        {activeTab === 'pricing' && priceSettings.map(renderField)}
                                        {activeTab === 'features' && featureSettings.map(renderField)}
                                        {activeTab === 'config' && otherSettings.map(renderField)}

                                        {[textSettings, priceSettings, featureSettings, otherSettings][['content', 'pricing', 'features', 'config'].indexOf(activeTab)].length === 0 && (
                                            <div className="py-12 text-center">
                                                <p className="text-gray-400">Aucun paramètre dans cette section.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Sticky Save Bar */}
                <div className={`fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 z-50 transition-transform duration-300 ${hasChanges ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3 text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-100 text-sm font-medium">
                            <AlertTriangle className="h-4 w-4" />
                            Modifications en attente
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setHasChanges(false)
                                    fetchSettings() // Reset
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={saveSettings}
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px] shadow-lg shadow-indigo-200"
                            >
                                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Sauvegarder
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
