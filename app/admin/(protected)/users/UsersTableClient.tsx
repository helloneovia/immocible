'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Trash2, Loader2 } from 'lucide-react'

type UserWithProfile = {
    id: string
    email: string
    role: string
    createdAt: Date
    profile: {
        nom?: string | null
        prenom?: string | null
        nomAgence?: string | null
        plan?: string | null
        subscriptionStatus?: string | null
    } | null
}

interface UsersTableClientProps {
    users: UserWithProfile[]
}

export function UsersTableClient({ users }: UsersTableClientProps) {
    const router = useRouter()
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [isPending, startTransition] = useTransition()
    const [isLoading, setIsLoading] = useState(false)

    const allSelected = users.length > 0 && selected.size === users.length
    const someSelected = selected.size > 0 && !allSelected

    const toggleAll = () => {
        if (allSelected) {
            setSelected(new Set())
        } else {
            setSelected(new Set(users.map(u => u.id)))
        }
    }

    const toggleOne = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handleBulkDelete = async () => {
        if (selected.size === 0) return
        const count = selected.size
        if (!confirm(`Supprimer ${count} utilisateur(s) sélectionné(s) ? Cette action est irréversible.`)) return

        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/users/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', userIds: Array.from(selected) })
            })
            if (!res.ok) throw new Error('Bulk delete failed')

            setSelected(new Set())
            startTransition(() => { router.refresh() })
        } catch (e) {
            console.error(e)
            alert('Une erreur est survenue lors de la suppression.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            {/* Bulk Action Toolbar */}
            <div
                className={`flex items-center justify-between px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg mb-3 transition-all duration-200 ${selected.size > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}`}
            >
                <span className="text-sm font-medium text-amber-800">
                    {selected.size} utilisateur{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-1.5"
                        onClick={handleBulkDelete}
                        disabled={isLoading || isPending}
                    >
                        {(isLoading || isPending) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        Supprimer
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setSelected(new Set())}
                    >
                        Désélectionner
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[48px]">
                                <Checkbox
                                    checked={allSelected}
                                    onChange={toggleAll}
                                    aria-label="Tout sélectionner"
                                />
                            </TableHead>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Statut Abonn.</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Date d&apos;inscription</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow
                                key={user.id}
                                className={selected.has(user.id) ? 'bg-amber-50/50' : ''}
                                onClick={(e) => {
                                    // Don't toggle if clicking on the link
                                    if ((e.target as HTMLElement).closest('a')) return
                                    toggleOne(user.id)
                                }}
                            >
                                <TableCell onClick={e => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selected.has(user.id)}
                                        onChange={() => toggleOne(user.id)}
                                        aria-label={`Sélectionner ${user.email}`}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">
                                            {user.role === 'agence'
                                                ? user.profile?.nomAgence
                                                : `${user.profile?.prenom || ''} ${user.profile?.nom || ''}`}
                                        </span>
                                        <span className="text-sm text-gray-500">{user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={user.role === 'agence' ? 'default' : 'secondary'}
                                        className={user.role === 'agence'
                                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-100'
                                            : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}
                                    >
                                        {user.role === 'agence' ? 'Agence' : 'Acquéreur'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.role === 'agence' ? (
                                        <Badge
                                            className={
                                                user.profile?.subscriptionStatus === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                    : user.profile?.subscriptionStatus === 'PENDING'
                                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                                            }
                                        >
                                            {user.profile?.subscriptionStatus || 'N/A'}
                                        </Badge>
                                    ) : (
                                        <span className="text-gray-400 text-sm">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {user.profile?.plan ? (
                                        <span className="capitalize text-sm font-medium text-gray-700">{user.profile.plan}</span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-gray-500 text-sm">
                                    {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: fr })}
                                </TableCell>
                                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                                    <Link
                                        href={`/admin/users/${user.id}`}
                                        className="text-amber-500 hover:underline text-sm font-medium"
                                    >
                                        Gérer
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
