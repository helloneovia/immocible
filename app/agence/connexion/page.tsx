'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, LogIn, Shield, AlertCircle, Building2 } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/lib/i18n/client'

export default function ConnexionAgence() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const { t } = useI18n()
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'agence' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t('auth.agencyLogin.invalidCredentials'))
      if (data.user.role !== 'agence') { setError(t('auth.agencyLogin.notAgencyAccount')); return }
      await refreshUser()
      router.push('/agence/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || t('auth.agencyLogin.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Different architecture image for agence — modern office building */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
      >
        <div className="absolute inset-0 bg-slate-900/78" />
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
            <Logo className="text-white" iconClassName="h-12 w-12" wordmarkClassName="text-3xl" />
          </Link>
        </div>

        {/* Pro badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm">
            <Building2 className="h-3.5 w-3.5" />
            {t('auth.common.agencyBadge')}
          </span>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-slate-600 via-amber-500 to-slate-600" />

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="mx-auto h-14 w-14 rounded-full bg-slate-900 flex items-center justify-center mb-4 shadow-lg">
                <LogIn className="h-7 w-7 text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t('auth.agencyLogin.title')}
              </h1>
              <p className="text-slate-500 text-sm font-medium">{t('auth.agencyLogin.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">{t('auth.common.proEmail')}</Label>
                <Input
                  id="email" type="email" placeholder={t('auth.common.agencyEmailPlaceholder')} required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-slate-50 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700">{t('auth.common.password')}</Label>
                  <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-slate-900 font-medium hover:underline transition-colors">
                    {t('auth.common.forgotPassword')}
                  </Link>
                </div>
                <Input
                  id="password" type="password" placeholder="••••••••" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-2 border-slate-200 focus:border-slate-900 rounded-xl bg-slate-50 focus:bg-white transition-colors"
                />
              </div>

              <Button type="submit" disabled={loading}
                className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300 group disabled:opacity-50"
                size="lg">
                {loading ? t('auth.common.signingIn') : t('auth.common.signIn')}
                {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-400 font-medium">{t('auth.common.or')}</span>
                </div>
              </div>

              <div className="text-center text-sm text-slate-500">
                {t('auth.agencyLogin.noAccount')}{' '}
                <Link href="/agence/inscription" className="text-slate-900 hover:text-amber-600 underline font-semibold transition-colors">
                  {t('auth.common.createAccount')}
                </Link>
              </div>
              <div className="text-center text-sm">
                <Link href="/acquereur/connexion" className="text-slate-400 hover:text-slate-700 transition-colors font-medium">
                  {t('auth.agencyLogin.buyerLink')}
                </Link>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              <span>{t('auth.common.sslSecure')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
