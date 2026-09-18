'use client'

// Marqueur envoyé par l'API à la place d'un secret configuré (voir lib/settings.ts).
const SECRET_PLACEHOLDER = '__secret_configured__'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    AlertCircle, CheckCircle2, Save,
    RefreshCw, DollarSign, List, Key, Sparkles, AlertTriangle,
    AlignLeft, CreditCard, LayoutTemplate, Settings2, FileText,
    ChevronRight, Layers, Scale, Smartphone, Plus, Trash2, Pencil, EyeOff
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface SystemSetting {
    key: string
    value: string
    type: string
    label: string
    description: string
}

type TabType = 'content' | 'legal' | 'pricing' | 'features' | 'config' | 'stores'

/** Réglages de l'onglet « App Store / Google Play » (paiements et achats intégrés). */
const isStoreSettingKey = (key: string) => key.startsWith('iap_') || key.startsWith('payment_')

const STORE_GROUPS: { title: string; desc: string; keys: string[] }[] = [
    {
        title: 'Interrupteurs',
        desc: 'Moyens de paiement proposés sur le site et dans les applications.',
        keys: ['payment_stripe_web_enabled', 'iap_enabled'],
    },
    {
        title: 'Produits des abonnements',
        desc: 'Identifiants des abonnements créés dans App Store Connect et la Play Console.',
        keys: [
            'iap_apple_product_monthly', 'iap_apple_product_yearly',
            'iap_google_product_monthly', 'iap_google_base_plan_monthly',
            'iap_google_product_yearly', 'iap_google_base_plan_yearly',
        ],
    },
    {
        title: 'Déblocages',
        desc: 'Produits consommables vendus pour débloquer un contact, par palier de budget.',
        keys: ['iap_unlock_tiers'],
    },
    {
        title: 'Vérification des achats',
        desc: 'Identifiants utilisés par le serveur pour vérifier les achats auprès des stores.',
        keys: [
            'iap_apple_bundle_id', 'iap_apple_issuer_id', 'iap_apple_key_id', 'iap_apple_private_key',
            'iap_google_package_name', 'iap_google_service_account',
        ],
    },
]

interface UnlockTierRow {
    maxBudget: string
    apple: string
    google: string
}

/** Budget saisi : vide = sans limite (null) ; une saisie non numérique est conservée telle quelle pour être signalée. */
function parseTierBudget(text: string): number | string | null {
    const trimmed = text.trim()
    if (!trimmed) return null
    const n = Number(trimmed.replace(/\s/g, '').replace(',', '.'))
    return Number.isFinite(n) ? n : trimmed
}

function tiersFromValue(value: string): UnlockTierRow[] {
    try {
        const parsed = JSON.parse(value || '[]')
        if (!Array.isArray(parsed)) return []
        return parsed.map((tier: any) => ({
            maxBudget: tier?.maxBudget === null || tier?.maxBudget === undefined ? '' : String(tier.maxBudget),
            apple: typeof tier?.apple === 'string' ? tier.apple : '',
            google: typeof tier?.google === 'string' ? tier.google : '',
        }))
    } catch {
        return []
    }
}

function tiersToValue(rows: UnlockTierRow[]) {
    return JSON.stringify(rows.map((row) => ({
        maxBudget: parseTierBudget(row.maxBudget),
        apple: row.apple.trim(),
        google: row.google.trim(),
    })))
}

/** Erreurs de saisie des paliers de déblocage (liste vide = valide). */
function validateUnlockTiers(value: string): string[] {
    let parsed: any
    try {
        parsed = JSON.parse(value || '[]')
    } catch {
        return ['JSON invalide.']
    }
    if (!Array.isArray(parsed)) return ['La valeur doit être une liste de paliers.']
    const errors: string[] = []
    let unlimited = 0
    let previous = -Infinity
    parsed.forEach((tier: any, index: number) => {
        const line = `Ligne ${index + 1}`
        const budget = tier?.maxBudget
        if (budget === null || budget === undefined) {
            unlimited += 1
            if (index !== parsed.length - 1) errors.push(`${line} : le palier sans limite doit être le dernier.`)
            previous = Infinity
        } else if (typeof budget !== 'number' || !Number.isFinite(budget) || budget <= 0) {
            errors.push(`${line} : budget max invalide.`)
        } else {
            if (budget <= previous) errors.push(`${line} : les budgets doivent être classés par ordre croissant.`)
            previous = budget
        }
        if (!tier?.apple || !String(tier.apple).trim()) errors.push(`${line} : produit Apple requis.`)
        if (!tier?.google || !String(tier.google).trim()) errors.push(`${line} : produit Google requis.`)
    })
    if (unlimited > 1) errors.push('Un seul palier peut être sans limite de budget.')
    return errors
}

/** Éditeur des paliers de déblocage (iap_unlock_tiers), enregistrés en JSON. */
function UnlockTiersEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    const [rows, setRows] = useState<UnlockTierRow[]>(() => tiersFromValue(value))
    const lastEmitted = useRef(value)

    // Valeur remplacée de l'extérieur (rechargement, annulation) : on relit les lignes.
    useEffect(() => {
        if (value !== lastEmitted.current) {
            lastEmitted.current = value
            setRows(tiersFromValue(value))
        }
    }, [value])

    const update = (next: UnlockTierRow[]) => {
        setRows(next)
        const json = tiersToValue(next)
        lastEmitted.current = json
        onChange(json)
    }
    const setCell = (index: number, field: keyof UnlockTierRow, text: string) =>
        update(rows.map((row, i) => (i === index ? { ...row, [field]: text } : row)))

    const errors = validateUnlockTiers(value)

    return (
        <div className="space-y-3">
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-44">Budget max (€)</TableHead>
                            <TableHead>Produit Apple</TableHead>
                            <TableHead>Produit Google</TableHead>
                            <TableHead className="w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-sm text-gray-400 py-6">
                                    Aucun palier : les déblocages payants ne sont pas proposés dans les applications.
                                </TableCell>
                            </TableRow>
                        )}
                        {rows.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Input
                                        value={row.maxBudget}
                                        inputMode="numeric"
                                        placeholder="Sans limite"
                                        onChange={(e) => setCell(index, 'maxBudget', e.target.value)}
                                        className="h-9"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        value={row.apple}
                                        placeholder="com.immocible.deblocage.1"
                                        onChange={(e) => setCell(index, 'apple', e.target.value)}
                                        className="h-9 font-mono text-sm"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        value={row.google}
                                        placeholder="deblocage_1"
                                        onChange={(e) => setCell(index, 'google', e.target.value)}
                                        className="h-9 font-mono text-sm"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Supprimer le palier"
                                        onClick={() => update(rows.filter((_, i) => i !== index))}
                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => update([...rows, { maxBudget: '', apple: '', google: '' }])}>
                    <Plus className="h-4 w-4" /> Ajouter un palier
                </Button>
                <p className="text-xs text-gray-400">Budget vide = sans limite (dernier palier). Budgets classés par ordre croissant.</p>
            </div>
            {errors.length > 0 && (
                <ul className="text-sm text-red-600 space-y-1 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                    {errors.map((message, i) => <li key={i}>{message}</li>)}
                </ul>
            )}
        </div>
    )
}

/** Secret (clé privée, compte de service) : masqué par défaut, affiché seulement sur « Modifier ». */
function SecretField({ setting, onChange }: { setting: SystemSetting; onChange: (value: string) => void }) {
    const [editing, setEditing] = useState(false)
    const hasValue = setting.value.trim() !== ''
    // Le serveur ne renvoie qu'un marqueur pour un secret configuré : champ vide à la modification.
    const displayValue = setting.value === SECRET_PLACEHOLDER ? '' : setting.value

    if (hasValue && !editing) {
        return (
            <div className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-slate-50/50 px-4 py-3">
                <span className="font-mono text-sm text-gray-500">•••• (configurée)</span>
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setEditing(true)}>
                    <Pencil className="h-4 w-4" /> Modifier
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <Textarea
                id={setting.key}
                value={displayValue}
                spellCheck={false}
                autoComplete="off"
                onChange={(e) => onChange(e.target.value)}
                placeholder="Collez ici le contenu complet du fichier"
                className="font-mono text-sm min-h-[140px] bg-slate-50/50 border-gray-200 focus:bg-white focus:border-indigo-500 transition-all resize-y"
            />
            {hasValue && (
                <Button type="button" variant="ghost" size="sm" className="gap-2 text-gray-500" onClick={() => setEditing(false)}>
                    <EyeOff className="h-4 w-4" /> Masquer
                </Button>
            )}
        </div>
    )
}

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
                // Nouvelles définitions (ex. informations légales) : synchronisées automatiquement.
                if (Array.isArray(data) && ['legal_company_name', 'text_home_hero_title_1_en', 'iap_enabled'].every((key) => data.some((s: SystemSetting) => s.key === key))) {
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
        setSuccess(false)
        setError(null)
        const tiers = settings.find(s => s.key === 'iap_unlock_tiers')
        const tierErrors = tiers ? validateUnlockTiers(tiers.value) : []
        if (tierErrors.length > 0) {
            setActiveTab('stores')
            setError(`Paliers de déblocage invalides : ${tierErrors.join(' ')}`)
            return
        }
        setLoading(true)
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
        const order = ['price_monthly', 'price_yearly', 'price_unlock_profile_percentage', 'price_unlock_profile_min_budget']
        return order.indexOf(a.key) - order.indexOf(b.key)
    })
    const featureSettings = settings.filter(s => s.key.startsWith('feature_'))
    const textSettings = settings.filter(s => s.key.startsWith('text_'))
    // legal_last_updated est tenu à jour automatiquement à l'enregistrement.
    const legalSettings = settings.filter(s => s.key.startsWith('legal_') && s.key !== 'legal_last_updated')
    const storeSettings = settings.filter(s => isStoreSettingKey(s.key))
    const storeGroups = [
        ...STORE_GROUPS.map(group => ({
            ...group,
            settings: group.keys.map(key => storeSettings.find(s => s.key === key)).filter((s): s is SystemSetting => Boolean(s)),
        })),
        {
            title: 'Autres',
            desc: '',
            keys: [] as string[],
            settings: storeSettings.filter(s => !STORE_GROUPS.some(group => group.keys.includes(s.key))),
        },
    ].filter(group => group.settings.length > 0)
    const otherSettings = settings.filter(s =>
        !isStoreSettingKey(s.key) &&
        !s.key.startsWith('price_') &&
        !s.key.startsWith('feature_') &&
        !s.key.startsWith('text_') &&
        !s.key.startsWith('legal_')
    )

    const menuItems = [
        { id: 'content', label: 'Contenu & Textes', icon: FileText, desc: 'Textes de la page d\'accueil et messages', count: textSettings.length },
        { id: 'legal', label: 'Informations légales', icon: Scale, desc: 'Société, hébergeur, CGU et confidentialité (site et application)', count: legalSettings.length },
        { id: 'pricing', label: 'Tarification', icon: CreditCard, desc: 'Prix des abonnements et déblocages', count: priceSettings.length },
        { id: 'features', label: 'Fonctionnalités', icon: Layers, desc: 'Listes des avantages par plan', count: featureSettings.length },
        { id: 'stores', label: 'App Store / Google Play', icon: Smartphone, desc: 'Achats intégrés des applications et paiement Stripe du site', count: storeSettings.length },
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
                    {setting.type === 'boolean' ? (
                        <Select value={setting.value.trim() === 'true' ? 'true' : 'false'} onValueChange={(v) => handleSettingChange(setting.key, v)}>
                            <SelectTrigger id={setting.key} className="h-11 w-full sm:w-60 bg-slate-50/50 border-gray-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Activé</SelectItem>
                                <SelectItem value="false">Désactivé</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : setting.type === 'secret' ? (
                        <SecretField setting={setting} onChange={(v) => handleSettingChange(setting.key, v)} />
                    ) : setting.key === 'iap_unlock_tiers' ? (
                        <UnlockTiersEditor value={setting.value} onChange={(v) => handleSettingChange(setting.key, v)} />
                    ) : setting.type === 'json' || setting.value.length > 80 ? (
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
                                            ? 'bg-slate-900 shadow-md shadow-indigo-200'
                                            : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-amber-500'}`}>
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
                                                return <Icon className="h-5 w-5 text-amber-500" />
                                            })()}
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {activeTab === 'content' && textSettings.map(renderField)}
                                        {activeTab === 'legal' && legalSettings.map(renderField)}
                                        {activeTab === 'pricing' && priceSettings.map(renderField)}
                                        {activeTab === 'features' && featureSettings.map(renderField)}
                                        {activeTab === 'config' && otherSettings.map(renderField)}
                                        {activeTab === 'stores' && storeSettings.length > 0 && (
                                            <>
                                                <Alert className="bg-indigo-50/60 border-indigo-100 text-slate-800">
                                                    <Smartphone className="h-5 w-5 text-indigo-600" />
                                                    <AlertTitle>Mise en place des achats intégrés</AlertTitle>
                                                    <AlertDescription>
                                                        <ol className="list-decimal pl-5 mt-2 space-y-1.5 text-sm text-slate-600">
                                                            <li>Créez les abonnements mensuel et annuel (dans le même groupe d&apos;abonnements) et les produits consommables de déblocage dans App Store Connect et dans la Play Console.</li>
                                                            <li>Reportez ici les identifiants des produits (abonnements et paliers de déblocage).</li>
                                                            <li>Renseignez les clés API : Issuer ID, Key ID et clé privée .p8 d&apos;Apple, compte de service Google Play.</li>
                                                            <li>Configurez les notifications serveur Apple (App Store Server Notifications, version 2) vers <code className="font-mono text-xs bg-white px-1 py-0.5 rounded border">https://immocible.com/api/iap/apple/notifications</code>.</li>
                                                            <li>Configurez les notifications Google (Real-time developer notifications) : un sujet Pub/Sub avec un abonnement en push vers <code className="font-mono text-xs bg-white px-1 py-0.5 rounded border">https://immocible.com/api/iap/google/notifications</code>.</li>
                                                            <li>Activez enfin « Achats intégrés dans les applications ».</li>
                                                        </ol>
                                                    </AlertDescription>
                                                </Alert>
                                                {storeGroups.map(group => (
                                                    <section key={group.title} className="space-y-4">
                                                        <div className="pt-2">
                                                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">{group.title}</h3>
                                                            {group.desc && <p className="text-sm text-gray-500 mt-0.5">{group.desc}</p>}
                                                        </div>
                                                        {group.settings.map(renderField)}
                                                    </section>
                                                ))}
                                            </>
                                        )}

                                        {[textSettings, legalSettings, priceSettings, featureSettings, otherSettings, storeSettings][['content', 'legal', 'pricing', 'features', 'config', 'stores'].indexOf(activeTab)].length === 0 && (
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
                                className="bg-slate-900 hover:bg-indigo-700 text-white min-w-[150px] shadow-lg shadow-indigo-200"
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
