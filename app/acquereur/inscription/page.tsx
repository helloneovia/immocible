'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowRight, Sparkles, CheckCircle2, Shield, AlertCircle } from 'lucide-react'
import { DEFAULT_SETTINGS, type AppSettings } from '@/lib/settings'
import { useEffect } from 'react'

export default function InscriptionAcquereur() {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [telephone, setTelephone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    fetch('/api/public/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setSettings(data)
      })
      .catch(console.error)
  }, [])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/verify-email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStep(2)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/verify-email/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: otp })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStep(3)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setError(null)

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)

    try {
      // 1. Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          role: 'acquereur',
          firstName,
          telephone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue lors de l\'inscription')
      }

      // 2. Redirect to dashboard
      // Note: Registration route already sets the session cookie
      router.refresh()
      router.push('/acquereur/questionnaire')

    } catch (err: any) {
      if (err.message && (err.message.includes('existe déjà') || err.message.includes('already exists'))) {
        setError('Ce compte existe déjà. Redirection vers la connexion...')
        setTimeout(() => router.push('/acquereur/connexion'), 2000)
      } else {
        setError(err.message || 'Une erreur est survenue lors de l\'inscription')
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Home className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                IMMOCIBLE
              </span>
            </Link>
          </div>

          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader className="space-y-1 text-center pb-6">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {settings.text_signup_buyer_title || 'Créer mon compte acquéreur'}
              </CardTitle>
              <CardDescription className="text-base pt-2">
                {settings.text_signup_buyer_subtitle || 'Commencez votre recherche immobilière en quelques minutes'}
              </CardDescription>
            </CardHeader>
            <CardContent>

              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Envoi...' : 'Continuer'}
                    {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-500">Un code de vérification a été envoyé à <strong>{email}</strong></p>
                    <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline mt-1">Modifier l'email</button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-semibold">Code de vérification</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="h-12 border-2 focus:border-blue-500 transition-colors text-center text-xl tracking-widest font-mono"
                      maxLength={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Vérification...' : 'Vérifier'}
                  </Button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleRegister} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold">Prénom & Nom</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Jean Dupont"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-12 border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2 opacity-50 pointer-events-none">
                    <Label className="text-sm font-semibold">Email vérifié</Label>
                    <div className="flex items-center gap-2 h-12 px-3 border-2 rounded-md bg-gray-50 text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      {email}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone" className="text-sm font-semibold">Téléphone mobile</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      placeholder="06 12 34 56 78"
                      required
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className="h-12 border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 border-2 focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Minimum 8 caractères
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {loading ? 'Création en cours...' : 'Créer mon compte'}
                    {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </form>
              )}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Ou</span>
                </div>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Vous avez déjà un compte ?{' '}
                <Link href="/acquereur/connexion" className="text-blue-600 hover:text-blue-700 underline font-semibold">
                  Se connecter
                </Link>
              </div>
              <div className="text-center text-sm pt-2">
                <Link href="/agence/inscription" className="text-muted-foreground hover:text-blue-600 transition-colors font-medium">
                  Vous êtes une agence ? Inscrivez-vous ici →
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-6 pt-6 border-t flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>{settings.text_trust_secure || 'Sécurisé'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <span>{settings.text_trust_free || '100% Gratuit'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
