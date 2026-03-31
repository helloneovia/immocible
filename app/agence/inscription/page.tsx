'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Home, ArrowRight, Building2, CheckCircle2, Shield, AlertCircle, Ticket } from 'lucide-react'
import { SecurePaymentOverlay } from '@/components/shared/SecurePaymentOverlay'
import { DEFAULT_SETTINGS, type AppSettings } from '@/lib/settings'

export default function InscriptionAgence() {
  const router = useRouter()
  const [couponCode, setCouponCode] = useState('')
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState('')
  const [nomAgence, setNomAgence] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [plan, setPlan] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
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
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/verify-email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
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
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/verify-email/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp })
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
    setError(null)
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères'); return }
    setLoading(true)
    try {
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'agence', nomAgence, plan }),
      })
      const registerData = await registerResponse.json()
      if (!registerResponse.ok) throw new Error(registerData.error || 'Une erreur est survenue lors de l\'inscription')

      const checkoutResponse = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan, nomAgence, couponCode, returnUrl: window.location.origin + '/agence/inscription/success' })
      })
      const checkoutData = await checkoutResponse.json()
      if (!checkoutResponse.ok) throw new Error(checkoutData.error || 'Erreur lors de l\'initialisation du paiement')
      
      setIsCheckingOut(true) // Show the secure payment screen before redirecting
      
      if (checkoutData.clientSecret) { 
        window.location.href = '/agence/paiement?client_secret=' + checkoutData.clientSecret
      } else { 
        throw new Error('Url de paiement invalide') 
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription')
      setLoading(false)
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">
      <SecurePaymentOverlay isVisible={isCheckingOut} />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
      >
        <div className="absolute inset-0 bg-slate-900/78" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-0 left-1/4 w-px h-full bg-white" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-white" />
        <div className="absolute top-2/3 left-0 w-full h-px bg-white" />
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

        {/* Pro badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm">
            <Building2 className="h-3.5 w-3.5" />
            Espace Professionnel Agence
          </span>
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
          <div className="h-1 w-full bg-gradient-to-r from-slate-600 via-amber-500 to-slate-600" />

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="mx-auto h-14 w-14 rounded-full bg-slate-900 flex items-center justify-center mb-4 shadow-lg">
                <Building2 className="h-7 w-7 text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                {settings.text_signup_agency_title || 'Créer mon compte agence'}
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                {settings.text_signup_agency_subtitle || 'Accédez à des acquéreurs vérifiés. Choisissez votre plan.'}
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
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email professionnel</Label>
                  <Input id="email" type="email" placeholder="contact@agence.com" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-slate-50 focus:bg-white transition-colors" />
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
                  <Input id="otp" type="text" placeholder="123456" required value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-12 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-slate-50 focus:bg-white text-center text-2xl tracking-widest font-mono"
                    maxLength={6} />
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
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Nom de l&apos;agence</Label>
                  <Input id="name" type="text" placeholder="Mon Agence Immobilière" required value={nomAgence}
                    onChange={(e) => setNomAgence(e.target.value)}
                    className="h-12 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-slate-50 focus:bg-white" />
                </div>
                <div className="space-y-2 opacity-60 pointer-events-none">
                  <Label className="text-sm font-semibold text-slate-700">Email vérifié</Label>
                  <div className="flex items-center gap-2 h-12 px-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm">{email}</span>
                  </div>
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

                {/* Plan selector */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Choisir votre offre</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${plan === 'monthly' ? 'border-slate-900 bg-slate-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                      onClick={() => setPlan('monthly')}
                    >
                      {plan === 'monthly' && <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center"><CheckCircle2 className="h-3 w-3 text-white" /></div>}
                      <div className="font-bold text-slate-900">Mensuel</div>
                      <div className="text-sm text-slate-500 mt-1">{settings.price_monthly}€ / mois</div>
                      <ul className="mt-3 space-y-1.5 text-xs text-slate-500">
                        {settings.feature_list_monthly.map((feature, i) => (
                          <li key={i} className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" /> {feature}</li>
                        ))}
                      </ul>
                    </div>
                    <div
                      className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${plan === 'yearly' ? 'border-slate-900 bg-slate-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                      onClick={() => setPlan('yearly')}
                    >
                      {plan === 'yearly' && <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center"><CheckCircle2 className="h-3 w-3 text-white" /></div>}
                      <div className="font-bold text-slate-900">Annuel</div>
                      <div className="text-sm text-slate-500 mt-1">{settings.price_yearly}€ / an</div>
                      <div className="text-[10px] text-amber-600 font-semibold">2 mois offerts</div>
                      <ul className="mt-2 space-y-1.5 text-xs text-slate-500">
                        {settings.feature_list_yearly.map((feature, i) => (
                          <li key={i} className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" /> {feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Coupon */}
                <div className="space-y-2">
                  <Label htmlFor="coupon" className="text-sm font-semibold text-slate-700">Code Promo (Optionnel)</Label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="coupon" type="text" placeholder="CODE PROMO" value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="pl-10 h-10 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-slate-50 focus:bg-white uppercase font-mono tracking-wider text-sm" />
                  </div>
                </div>

                <Button type="submit" disabled={loading}
                  className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300 group disabled:opacity-50"
                  size="lg">
                  {loading ? 'Création en cours...' : settings.text_signup_agency_title || 'Créer mon compte agence'}
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
              <Link href="/agence/connexion" className="text-slate-900 hover:text-amber-600 underline font-semibold transition-colors">Se connecter</Link>
            </div>
            <div className="text-center text-sm pt-2">
              <Link href="/acquereur/inscription" className="text-slate-400 hover:text-slate-700 transition-colors font-medium">
                Vous êtes un acquéreur ? Inscrivez-vous ici →
              </Link>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                <span>{settings.text_trust_payment || 'Paiement sécurisé'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                <span>{settings.text_trust_trial || 'Essai gratuit 14 jours'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
