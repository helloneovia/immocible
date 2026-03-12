'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Home, ArrowRight, LogIn, Shield, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function ConnexionAcquereur() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [globalError, setGlobalError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setGlobalError(null)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password, role: 'acquereur' }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Identifiants incorrects')
      if (result.user.role !== 'acquereur') throw new Error('Ce compte n\'est pas un compte acquéreur')
      await refreshUser()
      router.push('/acquereur/dashboard')
      router.refresh()
    } catch (err: any) {
      setGlobalError(err.message || 'Une erreur est survenue lors de la connexion')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background architecture image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-f2c9d6543a32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2053&q=80')" }}
      >
        <div className="absolute inset-0 bg-slate-900/75" />
      </div>

      {/* Decorative architectural lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-0 left-1/4 w-px h-full bg-white" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-white" />
        <div className="absolute top-1/3 left-0 w-full h-px bg-white" />
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

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
          {/* Card header accent */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="mx-auto h-14 w-14 rounded-full bg-slate-900 flex items-center justify-center mb-4 shadow-lg">
                <LogIn className="h-7 w-7 text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Connexion acquéreur
              </h1>
              <p className="text-slate-500 text-sm font-medium">Accédez à votre espace personnel</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {globalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{globalError}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  className={`h-12 border-2 rounded-xl transition-colors bg-slate-50 focus:bg-white ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-slate-900'}`}
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Mot de passe</Label>
                  <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-slate-900 font-medium hover:underline transition-colors">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`h-12 border-2 rounded-xl transition-colors bg-slate-50 focus:bg-white ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-slate-900'}`}
                  {...register('password')}
                />
                {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group disabled:opacity-50"
                size="lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connexion...
                  </div>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-400 font-medium">Ou</span>
                </div>
              </div>

              <div className="text-center text-sm text-slate-500">
                Pas encore de compte ?{' '}
                <Link href="/acquereur/inscription" className="text-slate-900 hover:text-amber-600 underline font-semibold transition-colors">
                  Créer un compte
                </Link>
              </div>

              <div className="text-center text-sm">
                <Link href="/agence/connexion" className="text-slate-400 hover:text-slate-700 transition-colors font-medium">
                  Vous êtes une agence ? Connectez-vous ici →
                </Link>
              </div>
            </form>

            {/* Trust indicators */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              <span>Connexion sécurisée SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
