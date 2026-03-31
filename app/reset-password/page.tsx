'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Home, ArrowRight, Shield, AlertCircle, CheckCircle2 } from 'lucide-react'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!token) {
            setError('Lien de réinitialisation invalide ou expiré.')
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            return setError('Les mots de passe ne correspondent pas.')
        }

        if (password.length < 8) {
            return setError('Le mot de passe doit contenir au moins 8 caractères.')
        }

        setLoading(true)

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Une erreur est survenue.')
            }

            setSuccess(true)
            setTimeout(() => {
                router.push('/agence/connexion')
            }, 3000)
        } catch (err: any) {
            setError(err.message || 'Le lien a expiré ou une erreur est survenue.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-slate-600 via-amber-500 to-slate-600" />

            <div className="p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto h-14 w-14 rounded-full bg-slate-900 flex items-center justify-center mb-4 shadow-lg">
                        <Shield className="h-7 w-7 text-amber-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Nouveau mot de passe
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        Entrez votre nouveau mot de passe sécurisé.
                    </p>
                </div>

                {success ? (
                    <div className="text-center space-y-6 animate-in fade-in duration-500">
                        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-inner">
                            <CheckCircle2 className="h-7 w-7" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg text-slate-900">Mot de passe modifié !</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
                            </p>
                        </div>
                        <Button
                            className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                            onClick={() => router.push('/agence/connexion')}
                        >
                            Retour à la connexion
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Nouveau mot de passe</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={!token || loading}
                                className="h-12 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-slate-50 focus:bg-white transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirmer le mot de passe</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={!token || loading}
                                className="h-12 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-slate-50 focus:bg-white transition-colors"
                            />
                        </div>
                        
                        <Button
                            type="submit"
                            disabled={!token || loading}
                            className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300 group disabled:opacity-50"
                            size="lg"
                        >
                            {loading ? 'Enregistrement...' : 'Valider'}
                            {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                        </Button>
                    </form>
                )}
                
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Shield className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Connexion sécurisée SSL</span>
                </div>
            </div>
        </div>
    )
}

export default function ResetPassword() {
    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
            {/* Background image - Neutral but elegant */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80')" }}
            >
                <div className="absolute inset-0 bg-slate-900/80" />
            </div>

            {/* Decorative lines */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
                <div className="absolute top-0 left-1/4 w-px h-full bg-white" />
                <div className="absolute top-0 right-1/4 w-px h-full bg-white" />
                <div className="absolute top-2/3 left-0 w-full h-px bg-white" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4 py-12">
                {/* Logo */}
                <div className="flex justify-center mb-10">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl group-hover:bg-white/20 transition-all duration-300">
                            <Home className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-3xl font-bold tracking-wide text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            IMMOCIBLE
                        </span>
                    </Link>
                </div>

                <Suspense fallback={<div className="text-white text-center font-medium">Chargement...</div>}>
                   <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}
