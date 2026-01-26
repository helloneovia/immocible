
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react'

export default function AdminLogin() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    role: 'admin', // Enforce admin role
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Connexion échouée')
            }

            // Check if user is admin
            if (data.user.role !== 'admin') {
                setError('Accès non autorisé')
                return
            }

            router.push('/admin/dashboard')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-2xl border-gray-800 bg-gray-800/50 backdrop-blur-xl text-white">
                    <CardHeader className="space-y-1 text-center pb-6">
                        <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg ring-4 ring-indigo-500/20">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">
                            Administration
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            Accès réservé au personnel
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-300">Email</Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@immocible.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500 pl-10 h-11"
                                    />
                                    <ShieldCheck className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-300">Mot de passe</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500 pl-10 h-11"
                                    />
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white transition-all font-medium"
                            >
                                {loading ? 'Connexion...' : 'Accéder au panel'}
                                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
