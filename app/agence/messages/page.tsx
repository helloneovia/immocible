'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { useAuth } from '@/contexts/AuthContext'
import { MessageSquare, Search, ArrowLeft, Home, Settings, LogOut } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { NotificationBell } from '@/components/ui/NotificationBell'

interface Conversation {
    id: string
    agencyId: string
    buyerId: string
    updatedAt: string
    agency?: { email: string, profile: any }
    buyer?: { email: string, profile: any }
    _count?: {
        messages: number
    }
}

function MessagesContent() {
    const { user, signOut } = useAuth()
    const router = useRouter()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await fetch('/api/chat/conversations')
                if (res.ok) {
                    const data = await res.json()
                    setConversations(data.conversations)
                }
            } catch (error) {
                console.error('Failed to fetch conversations', error)
            } finally {
                setLoading(false)
            }
        }
        fetchConversations()
    }, [])

    const getRecipient = (conv: Conversation) => {
        if (user?.role === 'agence') {
            return {
                name: (conv.buyer?.profile?.prenom ? `${conv.buyer.profile.prenom} ${conv.buyer.profile.nom || ''}`.trim() : conv.buyer?.profile?.nom) || conv.buyer?.email || 'Acquéreur',
                role: 'Acquéreur'
            }
        } else {
            return {
                name: conv.agency?.profile?.nomAgence || conv.agency?.email || 'Agence',
                role: 'Agence'
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="border-b border-white/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between">
                        <Link href="/agence/dashboard" className="flex items-center space-x-3 group">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Home className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                IMMOCIBLE
                            </span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <NotificationBell role="agence" />
                            <Button variant="ghost" className="font-medium bg-indigo-50 text-indigo-700">
                                <MessageSquare className="h-5 w-5 mr-2" />
                                Messagerie
                            </Button>
                            <Link href="/settings">
                                <Button variant="ghost" className="font-medium">
                                    <Settings className="h-5 w-5 mr-2" />
                                    Paramètres
                                </Button>
                            </Link>
                            <Button variant="outline" className="font-medium" onClick={signOut}>
                                <LogOut className="h-5 w-5 mr-2" />
                                Déconnexion
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Messagerie</h1>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[600px]">
                    {/* List */}
                    <div className={`md:col-span-4 lg:col-span-3 ${selectedConversation ? 'hidden md:block' : 'block'}`}>
                        <Card className="h-[600px] border-none shadow-lg overflow-hidden flex flex-col">
                            <div className="p-4 border-b bg-white">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        placeholder="Rechercher..."
                                        className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-white">
                                {loading ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">Chargement...</div>
                                ) : conversations.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                        <p>Aucune conversation</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {conversations.map((conv) => {
                                            const recipient = getRecipient(conv)
                                            return (
                                                <div
                                                    key={conv.id}
                                                    onClick={() => setSelectedConversation(conv)}
                                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                            {recipient.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-center">
                                                                <h4 className="text-sm font-semibold text-gray-900 truncate">{recipient.name}</h4>
                                                                {conv._count && conv._count.messages > 0 && (
                                                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shrink-0">
                                                                        {conv._count.messages}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                Cliquez pour voir les messages
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Chat Window */}
                    <div className={`md:col-span-8 lg:col-span-9 ${!selectedConversation ? 'hidden md:block' : 'block'}`}>
                        {selectedConversation ? (
                            <ChatWindow
                                conversationId={selectedConversation.id}
                                currentUserId={user?.id || ''}
                                recipientName={getRecipient(selectedConversation).name}
                                recipientRole={getRecipient(selectedConversation).role}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center bg-white rounded-xl border border-dashed text-center p-8 text-muted-foreground">
                                <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="h-8 w-8 text-blue-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Vos messages</h3>
                                <p>Sélectionnez une conversation pour commencer à discuter.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function MessagesPage() {
    return (
        <ProtectedRoute>
            <MessagesContent />
        </ProtectedRoute>
    )
}
