'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ArrowLeft, Save, Loader2, User, Key, Mail, Phone, Building, Crown, CreditCard, Check } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Navbar } from '@/components/layout/Navbar'

function SettingsContent() {
    const router = useRouter()
    const { signOut } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [role, setRole] = useState('')

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        nomAgence: '',
        password: '',
        confirmPassword: ''
    })
    const [plan, setPlan] = useState('')
    const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null)
    const [subscriptionStartDate, setSubscriptionStartDate] = useState<string | null>(null)

    const handleUpgrade = async () => {
        try {
            const response = await fetch('/api/payment/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    plan: 'yearly',
                    nomAgence: formData.nomAgence || 'Agence'
                })
            })

            const data = await response.json()

            if (response.ok && data.url) {
                window.location.href = data.url
            } else {
                alert("Erreur lors de l'initialisation du paiement.")
            }
        } catch (error) {
            console.error("Payment init error", error)
            alert("Erreur de connexion.")
        }
    }

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/user/profile')
                if (response.ok) {
                    const data = await response.json()
                    setFormData(prev => ({
                        ...prev,
                        nom: data.nom || '',
                        prenom: data.prenom || '',
                        email: data.email || '',
                        telephone: data.telephone || '',
                        nomAgence: data.nomAgence || ''
                    }))
                    setRole(data.role)
                    setPlan(data.plan)
                    setSubscriptionEndDate(data.subscriptionEndDate)
                    setSubscriptionStartDate(data.subscriptionStartDate)
                }
            } catch (error) {
                console.error('Error fetching profile:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        if (formData.password && formData.password !== formData.confirmPassword) {
            alert("Les mots de passe ne correspondent pas.")
            setSaving(false)
            return
        }

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                alert('Profil mis à jour avec succès !')
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
            } else {
                const errorData = await response.json()
                alert(`Erreur: ${errorData.error || 'Impossible de mettre à jour le profil'}`)
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            alert('Une erreur est survenue.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
    }

    const backLink = role === 'agence' ? '/agence/dashboard' : (role === 'admin' ? '/admin/dashboard' : '/acquereur/dashboard')

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <Navbar role={role as any} />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Paramètres du compte</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations personnelles</CardTitle>
                            <CardDescription>
                                Mettez à jour vos coordonnées et vos informations de connexion.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="prenom" className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        Prénom
                                    </Label>
                                    <Input
                                        id="prenom"
                                        name="prenom"
                                        value={formData.prenom}
                                        onChange={handleChange}
                                        placeholder="Votre prénom"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nom">Nom</Label>
                                    <Input
                                        id="nom"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        placeholder="Votre nom"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="exemple@email.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telephone" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    Téléphone
                                </Label>
                                <Input
                                    id="telephone"
                                    name="telephone"
                                    type="tel"
                                    value={formData.telephone}
                                    onChange={handleChange}
                                    placeholder="06 12 34 56 78"
                                />
                            </div>

                            {role === 'agence' && (
                                <div className="space-y-2">
                                    <Label htmlFor="nomAgence" className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-gray-400" />
                                        Nom de l'agence
                                    </Label>
                                    <Input
                                        id="nomAgence"
                                        name="nomAgence"
                                        value={formData.nomAgence}
                                        onChange={handleChange}
                                        placeholder="Nom de votre agence"
                                    />
                                </div>
                            )}

                            {role === 'agence' && (
                                <div className="pt-6 border-t">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-gray-500" />
                                        Abonnement
                                    </h3>
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-indigo-900">
                                                Plan Actuel : {plan === 'yearly' ? 'Annuel (Premium)' : 'Mensuel'}
                                            </p>
                                            {(subscriptionEndDate) && (
                                                <div className="text-sm font-medium text-indigo-800 mt-1">
                                                    <p>Période : Du {subscriptionStartDate ? new Date(subscriptionStartDate).toLocaleDateString() : (() => {
                                                        const end = new Date(subscriptionEndDate);
                                                        const start = new Date(end);
                                                        if (plan === 'yearly') start.setFullYear(start.getFullYear() - 1);
                                                        else start.setMonth(start.getMonth() - 1);
                                                        return start.toLocaleDateString();
                                                    })()} au {new Date(subscriptionEndDate).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                            <p className="text-sm text-indigo-700 mt-1">
                                                {plan === 'yearly'
                                                    ? 'Vous bénéficiez de tous les avantages Premium.'
                                                    : 'Passez au plan annuel pour économiser 2 mois.'}
                                            </p>
                                        </div>
                                        {plan !== 'yearly' && (
                                            <Button
                                                type="button"
                                                onClick={handleUpgrade}
                                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg whitespace-nowrap"
                                            >
                                                <Crown className="mr-2 h-4 w-4" />
                                                Passer à l'annuel (290€/an)
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <Key className="h-5 w-5 text-gray-500" />
                                    Sécurité
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Nouveau mot de passe</Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Laisser vide pour ne pas changer"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirmer le nouveau mot de passe"
                                        />
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-end bg-gray-50/50 p-6">
                            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enregistrer les modifications
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </div >
    )
}

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <SettingsContent />
        </ProtectedRoute>
    )
}
