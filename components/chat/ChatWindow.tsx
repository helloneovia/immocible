'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, User as UserIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Message {
    id: string
    content: string
    senderId: string
    createdAt: string
    isRead: boolean
}

interface ChatWindowProps {
    conversationId: string
    currentUserId: string
    recipientName: string
    recipientRole?: string
}

export function ChatWindow({ conversationId, currentUserId, recipientName, recipientRole }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`)
            if (res.ok) {
                const data = await res.json()
                setMessages(data.messages)
            }
        } catch (error) {
            console.error('Failed to fetch messages', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMessages()
        const interval = setInterval(fetchMessages, 3000) // Poll every 3 seconds
        return () => clearInterval(interval)
    }, [conversationId])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        setSending(true)
        try {
            const res = await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    content: newMessage,
                }),
            })

            if (res.ok) {
                setNewMessage('')
                fetchMessages()
            }
        } catch (error) {
            console.error('Failed to send message', error)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="flex flex-col h-[600px] border rounded-xl bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        {recipientName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold text-gray-900">{recipientName}</h3>
                    {recipientRole && <p className="text-xs text-muted-foreground capitalize">{recipientRole}</p>}
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-slate-50/50" ref={scrollRef}>
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2 opacity-70">
                        <div className="p-3 bg-gray-100 rounded-full">
                            <UserIcon className="h-6 w-6" />
                        </div>
                        <p className="text-sm">Démarrez la conversation avec {recipientName}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => {
                            const isMe = message.senderId === currentUserId
                            return (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "flex w-max max-w-[80%] flex-col gap-1 rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                        isMe
                                            ? "ml-auto bg-blue-600 text-white rounded-br-none"
                                            : "bg-white border text-gray-900 rounded-bl-none"
                                    )}
                                >
                                    <p>{message.content}</p>
                                    <span className={cn("text-[10px] opacity-70 block text-right", isMe ? "text-blue-100" : "text-gray-400")}>
                                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )
                        })}
                        <div ref={scrollRef} />
                    </div>
                )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-white">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className="flex-1"
                        disabled={sending}
                    />
                    <Button type="submit" disabled={sending || !newMessage.trim()} size="icon" className="bg-blue-600 hover:bg-blue-700">
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">Envoyer</span>
                    </Button>
                </form>
            </div>
        </div>
    )
}
