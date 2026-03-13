'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Send, Calendar, Users, Mail, Loader2, CheckCircle2, AlertTriangle, Clock, BarChart2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { fr } from 'date-fns/locale'

registerLocale('fr', fr)

export default function NewsletterPage() {
    const [newsletters, setNewsletters] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [statsData, setStatsData] = useState<Record<string, any>>({})
    const [loadingStats, setLoadingStats] = useState<Record<string, boolean>>({})
    const [currentEmail, setCurrentEmail] = useState('')

    // Form state
    const [formData, setFormData] = useState({
        subject: '',
        content: '',
        targetRole: 'ALL',
        scheduledAt: '',
        additionalEmails: ''
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
                setFormData({ subject: '', content: '', targetRole: 'ALL', scheduledAt: '', additionalEmails: '' })
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

    const fetchStats = async (id: string) => {
        if (statsData[id]) {
            // Toggle off
            setStatsData((prev) => { const next = {...prev}; delete next[id]; return next; })
            return;
        }

        setLoadingStats((prev) => ({ ...prev, [id]: true }))
        try {
            const res = await fetch(`/api/admin/newsletter/${id}/stats`)
            if (res.ok) {
                const data = await res.json()
                setStatsData((prev) => ({ ...prev, [id]: data.stats || { empty: true } }))
            } else {
                alert("Erreur lors de la récupération des stats")
            }
        } catch (e) {
            console.error(e)
            alert("Erreur système")
        } finally {
            setLoadingStats((prev) => ({ ...prev, [id]: false }))
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
                    <Button onClick={() => setShowModal(true)} className="bg-slate-900 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
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
                                                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {
                                                    news.targetRole === 'ALL' ? 'Tous' : 
                                                    news.targetRole === 'ADDITIONAL_ONLY' ? 'Emails supp.' : 
                                                    news.targetRole === 'ACQUEREUR' ? 'Acquéreurs' :
                                                    news.targetRole === 'AGENCE' ? 'Agences' :
                                                    news.targetRole
                                                }</span>
                                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(news.createdAt).toLocaleDateString()}</span>
                                                {news.scheduledAt && (
                                                    <span className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-medium">
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
                                        <div className="flex flex-col gap-2 items-end">
                                            <div className="flex items-center gap-2">
                                                {news.status === 'SENT' && (
                                                    <Button size="sm" variant="outline" onClick={() => fetchStats(news.id)} className="border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                                                        {loadingStats[news.id] ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <BarChart2 className="h-3 w-3 mr-1" />}
                                                        Stats Mailjet
                                                    </Button>
                                                )}
                                                {news.status === 'DRAFT' && (
                                                    <Button size="sm" onClick={() => handleSendNow(news.id)} className="bg-slate-900 hover:bg-indigo-700 text-white">
                                                        <Send className="h-3 w-3 mr-1" /> Envoyer maintenant
                                                    </Button>
                                                )}
                                                {news.status === 'SCHEDULED' && (
                                                    <Button size="sm" variant="outline" disabled className="text-amber-500 border-blue-200 bg-amber-50">
                                                        En attente
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                    
                                    {/* Stats Display Panel */}
                                    {statsData[news.id] && (
                                        <div className="bg-slate-50 border-t border-gray-100 p-4 px-6 animate-in slide-in-from-top-2 duration-200">
                                            {statsData[news.id].empty ? (
                                                <p className="text-sm text-gray-500">Aucune statistique disponible ou en cours de traitement par Mailjet.</p>
                                            ) : (
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                        <div className="text-xs text-gray-500 mb-1">Délivrés</div>
                                                        <div className="text-lg font-semibold text-gray-900">{statsData[news.id].deliveredCount || 0} / {statsData[news.id].totalSent || 0}</div>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                        <div className="text-xs text-gray-500 mb-1">Ouvertures</div>
                                                        <div className="text-lg font-semibold text-blue-600">{statsData[news.id].openedCount || 0}</div>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                        <div className="text-xs text-gray-500 mb-1">Clics</div>
                                                        <div className="text-lg font-semibold text-indigo-600">{statsData[news.id].clickedCount || 0}</div>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                        <div className="text-xs text-gray-500 mb-1">Rebonds</div>
                                                        <div className="text-lg font-semibold text-red-500">{statsData[news.id].bouncedCount || 0}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                                            <SelectItem value="ADDITIONAL_ONLY">Emails supplémentaires seulement</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Emails supplémentaires (Facultatif)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={currentEmail}
                                            onChange={(e) => setCurrentEmail(e.target.value)}
                                            placeholder="prospect@exemple.com"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    if (currentEmail.trim() && currentEmail.includes('@')) {
                                                        const newEmails = formData.additionalEmails ? `${formData.additionalEmails},${currentEmail.trim()}` : currentEmail.trim()
                                                        setFormData({ ...formData, additionalEmails: newEmails })
                                                        setCurrentEmail('')
                                                    }
                                                }
                                            }}
                                        />
                                        <Button 
                                            type="button" 
                                            variant="secondary"
                                            onClick={() => {
                                                if (currentEmail.trim() && currentEmail.includes('@')) {
                                                    const newEmails = formData.additionalEmails ? `${formData.additionalEmails},${currentEmail.trim()}` : currentEmail.trim()
                                                    setFormData({ ...formData, additionalEmails: newEmails })
                                                    setCurrentEmail('')
                                                }
                                            }}
                                        >
                                            Ajouter
                                        </Button>
                                    </div>
                                    {formData.additionalEmails && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.additionalEmails.split(',').map((email, idx) => {
                                                const trimmed = email.trim()
                                                if (!trimmed) return null
                                                return (
                                                    <Badge key={idx} variant="secondary" className="flex items-center gap-1.5 py-1 px-2 border border-gray-200">
                                                        {trimmed}
                                                        <button 
                                                            type="button" 
                                                            className="text-gray-400 hover:text-red-500 rounded-full bg-white p-0.5"
                                                            onClick={() => {
                                                                const emailsArray = formData.additionalEmails.split(',').map(e => e.trim()).filter(e => e !== '')
                                                                emailsArray.splice(idx, 1)
                                                                setFormData({ ...formData, additionalEmails: emailsArray.join(',') })
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Contenu</Label>
                                    <RichTextEditor
                                        value={formData.content}
                                        onChange={(val) => setFormData({ ...formData, content: val })}
                                        placeholder="Rédigez votre newsletter ici..."
                                    />
                                </div>

                                <div className="space-y-2 flex flex-col">
                                    <Label htmlFor="schedule">Planifier (Optionnel)</Label>
                                    <DatePicker
                                        id="schedule"
                                        selected={formData.scheduledAt ? new Date(formData.scheduledAt) : null}
                                        onChange={(date: Date | null) => setFormData({ ...formData, scheduledAt: date ? date.toISOString() : '' })}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        timeCaption="Heure"
                                        dateFormat="dd/MM/yyyy HH:mm"
                                        locale="fr"
                                        placeholderText="JJ/MM/AAAA HH:mm"
                                        isClearable
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Laissez vide pour enregistrer en brouillon.</p>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
                                    <Button type="submit" disabled={submitting} className="bg-slate-900 hover:bg-indigo-700 text-white">
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
