'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Trash2, Plus, Tag } from 'lucide-react'
import { format } from 'date-fns'

interface Coupon {
    id: string
    code: string
    discountType: string // 'PERCENTAGE', 'FIXED', 'FREE_TRIAL'
    discountValue: number
    planType?: string
    maxUses?: number
    usedCount: number
    isActive: boolean
    createdAt: string // Serialized Date
    validUntil?: string
}

export default function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
    const router = useRouter()
    const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
    const [loading, setLoading] = useState(false)
    const [isCreating, setIsCreating] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '10',
        planType: 'monthly',
        maxUses: '',
        validUntil: ''
    })

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    discountValue: parseFloat(formData.discountValue),
                    maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
                    validUntil: formData.validUntil || null
                })
            })

            if (res.ok) {
                const newCoupon = await res.json()
                setCoupons([newCoupon, ...coupons])
                setIsCreating(false)
                setFormData({
                    code: '',
                    discountType: 'FREE_TRIAL',
                    discountValue: '30',
                    planType: 'monthly',
                    maxUses: '',
                    validUntil: ''
                })
                router.refresh()
            } else {
                alert('Erreur lors de la création du coupon')
            }
        } catch (error) {
            console.error(error)
            alert('Erreur système')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce coupon ?')) return

        try {
            const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setCoupons(coupons.filter(c => c.id !== id))
                router.refresh()
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Coupons</h1>
                <Button onClick={() => setIsCreating(!isCreating)} className={isCreating ? "bg-gray-500" : "bg-indigo-600"}>
                    {isCreating ? 'Annuler' : <><Plus className="mr-2 h-4 w-4" /> Nouveau Coupon</>}
                </Button>
            </div>

            {isCreating && (
                <Card className="border-indigo-100 shadow-lg">
                    <CardHeader>
                        <CardTitle>Créer un nouveau coupon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Code</Label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="ex: HIVER2024"
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className="pl-9 font-mono"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Type de réduction</Label>
                                    <Select
                                        value={formData.discountType}
                                        onValueChange={val => setFormData({ ...formData, discountType: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FREE_TRIAL">Essai Gratuit (Jours)</SelectItem>
                                            <SelectItem value="PERCENTAGE">Pourcentage (%)</SelectItem>
                                            <SelectItem value="FIXED">Montant Fixe (€)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Valeur</Label>
                                    <Input
                                        type="number"
                                        value={formData.discountValue}
                                        onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                                        required
                                    />
                                    <p className="text-xs text-gray-500">
                                        {formData.discountType === 'FREE_TRIAL' ? 'Nombre de jours offerts' :
                                            formData.discountType === 'PERCENTAGE' ? '% de réduction' : 'Montant en EUR'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Plan Cible</Label>
                                    <Select
                                        value={formData.planType}
                                        onValueChange={val => setFormData({ ...formData, planType: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">Mensuel</SelectItem>
                                            <SelectItem value="yearly">Annuel</SelectItem>
                                            <SelectItem value="all">Tous</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Limite d'utilisations (Optionnel)</Label>
                                    <Input
                                        type="number"
                                        value={formData.maxUses}
                                        onChange={e => setFormData({ ...formData, maxUses: e.target.value })}
                                        placeholder="Illimité"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Valide jusqu'au (Optionnel)</Label>
                                    <Input
                                        type="date"
                                        value={formData.validUntil}
                                        onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enregistrer le coupon'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Valeur</TableHead>
                            <TableHead>Utilisations</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coupons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                    Aucun coupon actif
                                </TableCell>
                            </TableRow>
                        ) : (
                            coupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell className="font-medium font-mono">
                                        {coupon.code}
                                    </TableCell>
                                    <TableCell>
                                        {coupon.discountType === 'FREE_TRIAL' && 'Essai Gratuit'}
                                        {coupon.discountType === 'PERCENTAGE' && 'Pourcentage'}
                                        {coupon.discountType === 'FIXED' && 'Fixe'}
                                    </TableCell>
                                    <TableCell>
                                        {coupon.discountType === 'FREE_TRIAL' && `${coupon.discountValue} jours`}
                                        {coupon.discountType === 'PERCENTAGE' && `${coupon.discountValue}%`}
                                        {coupon.discountType === 'FIXED' && `${coupon.discountValue}€`}
                                    </TableCell>
                                    <TableCell>
                                        {coupon.usedCount} / {coupon.maxUses || '∞'}
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {coupon.planType === 'all' || !coupon.planType ? 'Tous' : coupon.planType}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={coupon.isActive ? 'default' : 'secondary'} className={coupon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                                            {coupon.isActive ? 'Actif' : 'Inactif'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(coupon.id)}
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
