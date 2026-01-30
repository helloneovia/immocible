
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { DEFAULT_SETTINGS, type AppSettings } from '@/lib/settings'

interface UserEditFormProps {
    user: any
}

export function UserEditForm({ user }: UserEditFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // User Details State
    const [nom, setNom] = useState(user.profile?.nom || '')
    const [prenom, setPrenom] = useState(user.profile?.prenom || '')
    const [email, setEmail] = useState(user.email || '')
    const [nomAgence, setNomAgence] = useState(user.profile?.nomAgence || '')

    // Subscription State
    const [plan, setPlan] = useState(user.profile?.plan || '')
    const [subStatus, setSubStatus] = useState(user.profile?.subscriptionStatus || '')
    const [subEndDate, setSubEndDate] = useState(
        user.profile?.subscriptionEndDate
            ? format(new Date(user.profile.subscriptionEndDate), 'yyyy-MM-dd')
            : ''
    )
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

    useEffect(() => {
        fetch('/api/public/settings').then(r => r.json()).then(d => { if (d && !d.error) setSettings(d) }).catch(console.error)
    }, [])

    const handleSave = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom,
                    prenom,
                    email,
                    nomAgence,
                    plan,
                    subscriptionStatus: subStatus,
                    subscriptionEndDate: subEndDate ? new Date(subEndDate).toISOString() : null
                })
            })

            if (!res.ok) throw new Error('Failed to update')

            alert("Succès: Utilisateur mis à jour")
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Erreur: Impossible de mettre à jour l'utilisateur")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Personal Details */}
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Informations Personnelles</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-gray-600">Prénom</Label>
                        <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} className="bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-600">Nom</Label>
                        <Input value={nom} onChange={(e) => setNom(e.target.value)} className="bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-600">Email</Label>
                        <div className="relative">
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-50 focus:bg-white transition-colors pl-9" />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                    </div>
                    {user.role === 'agence' && (
                        <div className="space-y-2">
                            <Label className="text-gray-600">Nom Agence</Label>
                            <div className="relative">
                                <Input value={nomAgence} onChange={(e) => setNomAgence(e.target.value)} className="bg-gray-50 focus:bg-white transition-colors pl-9" />
                                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Subscription Details (Agency Only) */}
            {user.role === 'agence' && (
                <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
                    <div className="flex items-center gap-2 border-b pb-4">
                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Abonnement</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-gray-600">Plan</Label>
                            <Select value={plan} onValueChange={setPlan}>
                                <SelectTrigger className="bg-gray-50 focus:bg-white">
                                    <SelectValue placeholder="Sélectionner un plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Mensuel ({settings.price_monthly}€/mois)</SelectItem>
                                    <SelectItem value="yearly">Annuel ({settings.price_yearly}€/an)</SelectItem>
                                    <SelectItem value="freemium">Gratuit / Inactif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-600">Statut</Label>
                            <Select value={subStatus} onValueChange={setSubStatus}>
                                <SelectTrigger className="bg-gray-50 focus:bg-white">
                                    <SelectValue placeholder="Sélectionner un statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                            Actif
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="PENDING">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                                            En attente
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="CANCELED">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                                            Annulé
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="EXPIRED">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                            Expiré
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-600">Date de fin</Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={subEndDate}
                                    onChange={(e) => setSubEndDate(e.target.value)}
                                    className="bg-gray-50 focus:bg-white transition-colors pl-9"
                                />
                                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-4 sticky bottom-4 z-10">
                <Button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg px-8">
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enregistrement...
                        </>
                    ) : 'Enregistrer les modifications'}
                </Button>
            </div>
        </div>
    )
}
