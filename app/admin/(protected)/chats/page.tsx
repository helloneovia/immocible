'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Settings, X, Search, User, Building, Trash2, Pencil, Check, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Message {
    id: string
    content: string
    createdAt: string
    sender: {
        id: string
        role: string
        profile: {
            prenom?: string
            nom?: string
            nomAgence?: string
        }
    }
}

interface Conversation {
    id: string
    updatedAt: string
    agency: {
        id: string
        email: string
        profile: {
            nomAgence?: string
        }
    }
    buyer: {
        id: string
        email: string
        profile: {
            prenom?: string
            nom?: string
        }
    }
    messages: Message[]
}

export default function AdminChatsPage() {
    const [activeTab, setActiveTab] = useState<'chats' | 'words'>('chats')
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loadingChats, setLoadingChats] = useState(true)
    const [loadingMessages, setLoadingMessages] = useState(false)

    // Message Editing State
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState('')
    const [updatingMessage, setUpdatingMessage] = useState(false)

    // Settings
    const [sensitiveWords, setSensitiveWords] = useState<string[]>([])
    const [newWord, setNewWord] = useState('')
    const [loadingWords, setLoadingWords] = useState(false)
    const [savingWords, setSavingWords] = useState(false)

    useEffect(() => {
        fetchConversations()
        fetchSensitiveWords()
    }, [])

    useEffect(() => {
        if (selectedConversationId) {
            fetchMessages(selectedConversationId)
            setEditingMessageId(null) // Reset edit mode on chat switch
        }
    }, [selectedConversationId])

    const fetchConversations = async () => {
        try {
            setLoadingChats(true)
            const res = await fetch('/api/admin/chats')
            if (res.ok) {
                const data = await res.json()
                setConversations(data)
            }
        } catch (error) {
            console.error('Failed to fetch chats', error)
        } finally {
            setLoadingChats(false)
        }
    }

    const fetchMessages = async (id: string) => {
        try {
            setLoadingMessages(true)
            const res = await fetch(`/api/admin/chats/${id}`)
            if (res.ok) {
                const data = await res.json()
                setMessages(data)
            }
        } catch (error) {
            console.error('Failed to fetch messages', error)
        } finally {
            setLoadingMessages(false)
        }
    }

    const fetchSensitiveWords = async () => {
        try {
            setLoadingWords(true)
            const res = await fetch('/api/admin/chats/settings')
            if (res.ok) {
                const data = await res.json()
                setSensitiveWords(data.words || [])
            }
        } catch (error) {
            console.error('Failed to fetch words', error)
        } finally {
            setLoadingWords(false)
        }
    }

    // --- Message Actions ---

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce message définitivement ?")) return

        try {
            const res = await fetch(`/api/admin/chats/message/${messageId}`, { method: 'DELETE' })
            if (res.ok) {
                setMessages(messages.filter(m => m.id !== messageId))
            } else {
                alert("Erreur lors de la suppression")
            }
        } catch (e) {
            console.error('Delete failed', e)
        }
    }

    const handleStartEdit = (msg: Message) => {
        setEditingMessageId(msg.id)
        setEditContent(msg.content)
    }

    const handleCancelEdit = () => {
        setEditingMessageId(null)
        setEditContent('')
    }

    const handleSaveEdit = async () => {
        if (!editingMessageId || !editContent.trim()) return

        try {
            setUpdatingMessage(true)
            const res = await fetch(`/api/admin/chats/message/${editingMessageId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editContent })
            })

            if (res.ok) {
                setMessages(messages.map(m => m.id === editingMessageId ? { ...m, content: editContent } : m))
                setEditingMessageId(null)
                setEditContent('')
            } else {
                alert("Erreur lors de la modification")
            }
        } catch (e) {
            console.error('Update failed', e)
        } finally {
            setUpdatingMessage(false)
        }
    }

    // --- Settings Actions ---

    const handleAddWord = async () => {
        if (!newWord.trim()) return
        const updated = [...sensitiveWords, newWord.trim()]
        setSensitiveWords(updated)
        setNewWord('')
        await saveWords(updated)
    }

    const handleRemoveWord = async (word: string) => {
        const updated = sensitiveWords.filter(w => w !== word)
        setSensitiveWords(updated)
        await saveWords(updated)
    }

    const saveWords = async (words: string[]) => {
        try {
            setSavingWords(true)
            await fetch('/api/admin/chats/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ words })
            })
        } catch (error) {
            console.error('Failed to save words', error)
        } finally {
            setSavingWords(false)
        }
    }

    const selectedConversation = conversations.find(c => c.id === selectedConversationId)

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">Messagerie & Modération</h1>
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <Button
                        variant={activeTab === 'chats' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('chats')}
                        className="gap-2"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Discussions
                    </Button>
                    <Button
                        variant={activeTab === 'words' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('words')}
                        className="gap-2"
                    >
                        <Settings className="h-4 w-4" />
                        Mots Interdits
                    </Button>
                </div>
            </div>

            {activeTab === 'chats' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0">
                    {/* List */}
                    <Card className="h-full flex flex-col min-h-0 border-r-0 md:border-r">
                        <CardHeader className="p-4 border-b shrink-0">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input placeholder="Rechercher..." className="pl-9" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 min-h-0 overflow-y-auto">
                            <div className="flex flex-col">
                                {loadingChats ? (
                                    <div className="p-8 text-center text-sm text-gray-500">Chargement...</div>
                                ) : conversations.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-gray-500">Aucune conversation</div>
                                ) : (
                                    conversations.map(conv => {
                                        const agencyName = conv.agency.profile.nomAgence || conv.agency.email
                                        const buyerName = conv.buyer.profile.prenom ? `${conv.buyer.profile.prenom} ${conv.buyer.profile.nom}` : conv.buyer.email

                                        return (
                                            <button
                                                key={conv.id}
                                                onClick={() => setSelectedConversationId(conv.id)}
                                                className={`flex flex-col gap-1 p-4 text-left hover:bg-gray-50 transition-colors border-b ${selectedConversationId === conv.id ? 'bg-indigo-50 hover:bg-indigo-50' : ''}`}
                                            >
                                                <div className="flex justify-between items-start w-full">
                                                    <div className="font-semibold text-sm truncate flex items-center gap-2">
                                                        <Building className="h-3 w-3 text-indigo-500" /> {agencyName}
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                        {conv.updatedAt && format(new Date(conv.updatedAt), 'dd/MM HH:mm', { locale: fr })}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-medium text-gray-700 mt-1 flex items-center gap-2">
                                                    <User className="h-3 w-3 text-green-600" /> {buyerName}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate mt-1">
                                                    {conv.messages[0]?.content || 'Nouvelle conversation'}
                                                </div>
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chat View */}
                    <Card className="col-span-1 md:col-span-2 h-full flex flex-col min-h-0">
                        {selectedConversation ? (
                            <>
                                <CardHeader className="p-4 border-b shrink-0 bg-gray-50/50 flex flex-row justify-between items-center">
                                    <div>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            Discussion
                                        </CardTitle>
                                        <CardDescription className="text-xs mt-1">
                                            Entre <span className="font-semibold text-indigo-600">{selectedConversation.agency.profile.nomAgence || 'Agence'}</span> et <span className="font-semibold text-green-600">{selectedConversation.buyer.profile.prenom || 'Acquéreur'}</span>
                                        </CardDescription>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        ID: {selectedConversation.id.substring(0, 8)}...
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 min-h-0 overflow-hidden relative">
                                    <ScrollArea className="h-full p-4">
                                        <div className="space-y-4">
                                            {loadingMessages ? (
                                                <div className="text-center py-10 text-gray-500 text-sm">Chargement des messages...</div>
                                            ) : messages.length === 0 ? (
                                                <div className="text-center py-10 text-gray-500 text-sm">Aucun message</div>
                                            ) : (
                                                messages.map(msg => {
                                                    const isAgency = msg.sender.role === 'agence'
                                                    const isEditing = editingMessageId === msg.id

                                                    return (
                                                        <div key={msg.id} className={`flex ${isAgency ? 'justify-start' : 'justify-end'} group`}>
                                                            <div className={`max-w-[80%] rounded-2xl p-0 shadow-sm text-sm relative transition-all ${isAgency
                                                                    ? 'bg-white border border-indigo-100 text-gray-800 rounded-tl-none'
                                                                    : 'bg-indigo-600 text-white rounded-tr-none'
                                                                } ${isEditing ? 'w-full max-w-[90%] border-orange-300 ring-2 ring-orange-100 bg-white' : ''}`}>

                                                                {/* Header in Bubble */}
                                                                {!isEditing && (
                                                                    <div className={`text-[10px] px-4 pt-2 mb-1 flex justify-between gap-4 ${isAgency ? 'opacity-70' : 'text-indigo-100'}`}>
                                                                        <span>{isAgency ? 'Agence' : 'Acquéreur'}</span>
                                                                        <span>{format(new Date(msg.createdAt), 'dd MMM HH:mm', { locale: fr })}</span>
                                                                    </div>
                                                                )}

                                                                {/* Content */}
                                                                <div className="px-4 pb-2">
                                                                    {isEditing ? (
                                                                        <div className="p-2 space-y-2">
                                                                            <Textarea
                                                                                value={editContent}
                                                                                onChange={(e) => setEditContent(e.target.value)}
                                                                                className="min-h-[80px] text-gray-900 bg-gray-50"
                                                                            />
                                                                            <div className="flex justify-end gap-2">
                                                                                <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={updatingMessage}>
                                                                                    <X className="h-3 w-3 mr-1" /> Annuler
                                                                                </Button>
                                                                                <Button size="sm" onClick={handleSaveEdit} disabled={updatingMessage}>
                                                                                    {updatingMessage ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                                                                                    Sauvegarder
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                                    )}
                                                                </div>

                                                                {/* Hover Actions */}
                                                                {!isEditing && (
                                                                    <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 -top-3 ${isAgency ? '-right-2' : '-left-2'} bg-white shadow-md rounded-md p-0.5 border`}>
                                                                        <button
                                                                            onClick={() => handleStartEdit(msg)}
                                                                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600"
                                                                            title="Modifier"
                                                                        >
                                                                            <Pencil className="h-3 w-3" />
                                                                        </button>
                                                                        <div className="w-[1px] bg-gray-200" />
                                                                        <button
                                                                            onClick={() => handleDeleteMessage(msg.id)}
                                                                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"
                                                                            title="Supprimer"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm flex-col gap-2">
                                <MessageSquare className="h-8 w-8 opacity-20" />
                                <p>Sélectionnez une conversation pour voir les échanges</p>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {activeTab === 'words' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Mots et Caractères Interdits</CardTitle>
                        <CardDescription>
                            Ces mots seront surveillés ou bloqués dans les conversations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4 max-w-md">
                            <Input
                                placeholder="Nouveau mot ou expression..."
                                value={newWord}
                                onChange={(e) => setNewWord(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
                            />
                            <Button onClick={handleAddWord} disabled={savingWords || !newWord.trim()}>
                                Ajouter
                            </Button>
                        </div>

                        {loadingWords ? (
                            <div className="text-sm text-gray-500">Chargement...</div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {sensitiveWords.length === 0 && (
                                    <p className="text-sm text-gray-500 italic">Aucun mot interdit configuré.</p>
                                )}
                                {sensitiveWords.map(word => (
                                    <Badge key={word} variant="secondary" className="px-3 py-1 flex items-center gap-2 text-sm bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
                                        {word}
                                        <button onClick={() => handleRemoveWord(word)} className="hover:bg-red-200 rounded-full p-0.5">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
