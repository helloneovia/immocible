'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Home, ArrowRight, Sparkles, CheckCircle2, Shield, AlertCircle } from 'lucide-react'
import { DEFAULT_SETTINGS, type AppSettings } from '@/lib/settings'
import { useAuth } from '@/contexts/AuthContext'

export default function InscriptionAcquereur() {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [telephone, setTelephone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    fetch('/api/public/settings')
      .then(res => res.json())
      .then(data => { if (data && !data.error) setSettings(data) })
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
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères'); return }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, role: 'acquereur', firstName, lastName, telephone }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Une erreur est survenue lors de l\'inscription')
      await refreshUser()
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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">
      {/* Background architecture image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-f2c9d6543a32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2053&q=80')" }}
      >
        <div className="absolute inset-0 bg-slate-900/75" />
      </div>

      {/* Decorative lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-0 left-1/4 w-px h-full bg-white" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-white" />
        <div className="absolute top-1/3 left-0 w-full h-px bg-white" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
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

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= s ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/40' : 'bg-white/20 text-white/50'}`}>
                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={`h-px w-8 transition-all duration-300 ${step > s ? 'bg-amber-500' : 'bg-white/20'}`} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="mx-auto h-14 w-14 rounded-full bg-slate-900 flex items-center justify-center mb-4 shadow-lg">
                <Sparkles className="h-7 w-7 text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                {settings.text_signup_buyer_title || 'Créer mon compte acquéreur'}
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                {settings.text_signup_buyer_subtitle || 'Commencez votre recherche en quelques minutes'}
              </p>
            </div>

            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
                  <Input
                    id="email" type="email" placeholder="votre@email.com" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
                <Button type="submit" disabled={loading || !email}
                  className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                  {loading ? 'Envoi...' : 'Continuer'}
                  {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                <div className="text-center mb-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-sm text-slate-600">Code envoyé à <strong className="text-slate-900">{email}</strong></p>
                  <button type="button" onClick={() => setStep(1)} className="text-xs text-amber-600 hover:underline mt-1 font-medium">Modifier l&apos;email</button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-semibold text-slate-700">Code de vérification</Label>
                  <Input
                    id="otp" type="text" placeholder="123456" required value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-12 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-slate-50 focus:bg-white text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                  />
                </div>
                <Button type="submit" disabled={loading || otp.length < 6}
                  className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  {loading ? 'Vérification...' : 'Vérifier le code'}
                </Button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleRegister} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700">Prénom</Label>
                    <Input id="firstName" type="text" placeholder="Jean" required value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-12 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-slate-50 focus:bg-white" autoComplete="given-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700">Nom</Label>
                    <Input id="lastName" type="text" placeholder="Dupont" required value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-slate-50 focus:bg-white" autoComplete="family-name" />
                  </div>
                </div>
                <div className="space-y-2 opacity-60 pointer-events-none">
                  <Label className="text-sm font-semibold text-slate-700">Email vérifié</Label>
                  <div className="flex items-center gap-2 h-12 px-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm">{email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone" className="text-sm font-semibold text-slate-700">Téléphone mobile</Label>
                  <Input id="telephone" type="tel" placeholder="06 12 34 56 78" required value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="h-12 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-slate-50 focus:bg-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Mot de passe</Label>
                  <Input id="password" type="password" placeholder="••••••••" required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-slate-50 focus:bg-white" />
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Minimum 8 caractères
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirmer le mot de passe</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" required value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-slate-50 focus:bg-white" />
                </div>
                <Button type="submit" disabled={loading}
                  className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                  {loading ? 'Création en cours...' : 'Créer mon compte'}
                  {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </form>
            )}

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-medium">Ou</span>
              </div>
            </div>

            <div className="text-center text-sm text-slate-500">
              Déjà un compte ?{' '}
              <Link href="/acquereur/connexion" className="text-slate-900 hover:text-amber-600 underline font-semibold transition-colors">
                Se connecter
              </Link>
            </div>
            <div className="text-center text-sm pt-2">
              <Link href="/agence/inscription" className="text-slate-400 hover:text-slate-700 transition-colors font-medium">
                Vous êtes une agence ? Inscrivez-vous ici →
              </Link>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                <span>{settings.text_trust_secure || 'Sécurisé'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                <span>{settings.text_trust_free || '100% Gratuit'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
