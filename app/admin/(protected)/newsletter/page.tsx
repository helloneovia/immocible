'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Send, Calendar, Users, Mail, Loader2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function NewsletterPage() {
    const [newsletters, setNewsletters] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        subject: '',
        content: '',
        targetRole: 'ALL',
        scheduledAt: ''
    })

    useEffect(() => {
        fetchNewsletters()
    }, [])

    const fetchNewsletters = async () => {
        try {
            const res = await fetch('/api/admin/newsletter')
            if (res.ok) {
                const data = await res.json()
                setNewsletters(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await fetch('/api/admin/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setShowModal(false)
                setFormData({ subject: '', content: '', targetRole: 'ALL', scheduledAt: '' })
                fetchNewsletters()
                alert("Newsletter créée avec succès !")
            } else {
                alert("Erreur lors de la création")
            }
        } catch (e) {
            console.error(e)
            alert("Erreur système")
        } finally {
            setSubmitting(false)
        }
    }

    const handleSendNow = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir envoyer cette newsletter maintenant ?")) return;

        try {
            const res = await fetch(`/api/admin/newsletter/${id}/send`, { method: 'POST' })
            if (res.ok) {
                alert("Envoi lancé !")
                fetchNewsletters()
            } else {
                const err = await res.json()
                alert("Erreur: " + err.error)
            }
        } catch (e) {
            console.error(e)
            alert("Erreur de connexion")
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SENT': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Envoyé</Badge>
            case 'SCHEDULED': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Planifié</Badge>
            case 'DRAFT': return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">Brouillon</Badge>
            case 'FAILED': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Erreur</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-6">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Newsletter</h1>
                        <p className="text-gray-500 mt-1">Gérez vos campagnes d'emails et communications.</p>
                    </div>
                    <Button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvelle Campagne
                    </Button>
                </div>

                {loading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {newsletters.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                <Mail className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">Aucune newsletter</h3>
                                <p className="text-gray-500">Commencez par créer votre première campagne.</p>
                            </div>
                        ) : (
                            newsletters.map((news) => (
                                <Card key={news.id} className="border border-gray-100 hover:shadow-md transition-shadow">
                                    <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-gray-900 text-lg">{news.subject}</span>
                                                {getStatusBadge(news.status)}
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center gap-4">
                                                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {news.targetRole === 'ALL' ? 'Tous' : news.targetRole}</span>
                                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(news.createdAt).toLocaleDateString()}</span>
                                                {news.scheduledAt && (
                                                    <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium">
                                                        <Clock className="h-3 w-3" /> Prévu le {new Date(news.scheduledAt).toLocaleDateString()} à {new Date(news.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                            {news.sentAt && (
                                                <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Envoyé le {new Date(news.sentAt).toLocaleString()} ({news.sentCount} destinataires)
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {news.status === 'DRAFT' && (
                                                <Button size="sm" onClick={() => handleSendNow(news.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                                    <Send className="h-3 w-3 mr-1" /> Envoyer maintenant
                                                </Button>
                                            )}
                                            {news.status === 'SCHEDULED' && (
                                                <Button size="sm" variant="outline" disabled className="text-blue-600 border-blue-200 bg-blue-50">
                                                    En attente
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg shadow-2xl border-0 max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle>Nouvelle Newsletter</CardTitle>
                            <CardDescription>Configurez votre envoi d'email de masse.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Sujet de l'email</Label>
                                    <Input
                                        id="subject"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="Ex: Nouveautés sur Immocible"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="target">Destinataires</Label>
                                    <Select
                                        value={formData.targetRole}
                                        onValueChange={(val) => setFormData({ ...formData, targetRole: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choisir..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Tout le monde</SelectItem>
                                            <SelectItem value="AGENCE">Agences uniquement</SelectItem>
                                            <SelectItem value="ACQUEREUR">Acquéreurs uniquement</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Contenu</Label>
                                    <RichTextEditor
                                        value={formData.content}
                                        onChange={(val) => setFormData({ ...formData, content: val })}
                                        placeholder="Rédigez votre newsletter ici..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="schedule">Planifier (Optionnel)</Label>
                                    <Input
                                        id="schedule"
                                        type="datetime-local"
                                        value={formData.scheduledAt}
                                        onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500">Laissez vide pour enregistrer en brouillon.</p>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
                                    <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {formData.scheduledAt ? 'Planifier' : 'Enregistrer le brouillon'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
