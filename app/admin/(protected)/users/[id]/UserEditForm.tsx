
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

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

            toast({
                title: "Succès",
                description: "Utilisateur mis à jour",
            })
            router.refresh()
        } catch (error) {
            console.error(error)
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour l'utilisateur",
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Personal Details */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Informations Personnelles</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Prénom</Label>
                        <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Nom</Label>
                        <Input value={nom} onChange={(e) => setNom(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    {user.role === 'agence' && (
                        <div className="space-y-2">
                            <Label>Nom Agence</Label>
                            <Input value={nomAgence} onChange={(e) => setNomAgence(e.target.value)} />
                        </div>
                    )}
                </div>
            </div>

            {/* Subscription Details (Agency Only) */}
            {user.role === 'agence' && (
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">Abonnement</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Plan</Label>
                            <Select value={plan} onValueChange={setPlan}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mensuel">Mensuel</SelectItem>
                                    <SelectItem value="myearly">Annuel</SelectItem>
                                    <SelectItem value="freemium">Gratuit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Statut</Label>
                            <Select value={subStatus} onValueChange={setSubStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Actif</SelectItem>
                                    <SelectItem value="PENDING">En attente</SelectItem>
                                    <SelectItem value="CANCELED">Annulé</SelectItem>
                                    <SelectItem value="EXPIRED">Expiré</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Date de fin</Label>
                            <Input
                                type="date"
                                value={subEndDate}
                                onChange={(e) => setSubEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
            </div>
        </div>
    )
}
