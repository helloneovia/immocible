'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ArrowLeft, Save, Loader2, User, Key, Mail, Phone, Building, Crown, CreditCard, Check, Ticket } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Navbar } from '@/components/layout/Navbar'
import { SecurePaymentOverlay } from '@/components/shared/SecurePaymentOverlay'
import { MobileAppPaymentNotice } from '@/components/shared/MobileAppPaymentNotice'
import { DEFAULT_SETTINGS, localizeSettings, type AppSettings } from '@/lib/settings'
import { formatPlanPrice } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/client'
import { intlLocale } from '@/lib/i18n/core'

function SettingsContent() {
    const router = useRouter()
    const { signOut } = useAuth()
    const { t, locale } = useI18n()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [role, setRole] = useState('')
    const [couponCode, setCouponCode] = useState('')
    const [applyingCoupon, setApplyingCoupon] = useState(false)
    const [isCheckingOut, setIsCheckingOut] = useState(false)
    const [settings, setSettings] = useState<AppSettings>(() => localizeSettings(DEFAULT_SETTINGS, locale))
    // Paiement Stripe désactivé par l'admin : l'abonnement se souscrit dans l'application mobile.
    const stripeWebEnabled = settings.payment_stripe_web_enabled !== false

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        nomAgence: '',
        password: '',
        confirmPassword: '',
        currentPassword: ''
    })
    // E-mail enregistré : le changer exige le mot de passe actuel.
    const [savedEmail, setSavedEmail] = useState('')
    const [plan, setPlan] = useState('')
    const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null)
    const [subscriptionStartDate, setSubscriptionStartDate] = useState<string | null>(null)

    const handleUpgrade = async () => {
        if (!stripeWebEnabled) return
        setIsCheckingOut(true)
        try {
            const response = await fetch('/api/payment/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    plan: 'yearly',
                    nomAgence: formData.nomAgence || 'Agence',
                    returnUrl: window.location.origin + '/settings'
                })
            })

            const data = await response.json()

            if (response.ok && data.clientSecret) {
                window.location.href = '/agence/paiement?client_secret=' + data.clientSecret
            } else {
                alert(t('settings.subscription.paymentInitError'))
                setIsCheckingOut(false)
            }
        } catch (error) {
            console.error("Payment init error", error)
            alert(t('settings.subscription.connectionError'))
            setIsCheckingOut(false)
        }
    }

    const handleApplyCoupon = async () => {
        if (!couponCode || !stripeWebEnabled) return
        setApplyingCoupon(true)
        try {
            const response = await fetch('/api/payment/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    plan: 'yearly', // Coupon applies to yearly upgrade by default in this context
                    nomAgence: formData.nomAgence || 'Agence',
                    couponCode,
                    returnUrl: window.location.origin + '/settings'
                })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                alert(data.message || t('settings.subscription.couponApplied'))
                window.location.reload()
            } else if (response.ok && data.clientSecret) {
                setIsCheckingOut(true)
                window.location.href = '/agence/paiement?client_secret=' + data.clientSecret
            } else {
                alert(data.error || t('settings.subscription.invalidPromo'))
            }
        } catch (error) {
            console.error("Coupon error", error)
            alert(t('settings.subscription.couponError'))
        } finally {
            setApplyingCoupon(false)
        }
    }

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/user/profile')
                if (response.ok) {
                    const data = await response.json()
                    setFormData(prev => ({
                        ...prev,
                        nom: data.nom || '',
                        prenom: data.prenom || '',
                        email: data.email || '',
                        telephone: data.telephone || '',
                        nomAgence: data.nomAgence || ''
                    }))
                    setSavedEmail(data.email || '')
                    setRole(data.role)
                    setPlan(data.plan)
                    setSubscriptionEndDate(data.subscriptionEndDate)
                    setSubscriptionStartDate(data.subscriptionStartDate)
                }
            } catch (error) {
                console.error('Error fetching profile:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()

        fetch('/api/public/settings')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setSettings(data)
            })
            .catch(console.error)
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        if (formData.password && formData.password !== formData.confirmPassword) {
            alert(t('settings.passwordsMismatch'))
            setSaving(false)
            return
        }

        if (formData.password && formData.password.length < 8) {
            alert(t('settings.passwordTooShort'))
            setSaving(false)
            return
        }

        const emailChanged = formData.email.trim().toLowerCase() !== savedEmail.trim().toLowerCase()
        if ((formData.password || emailChanged) && !formData.currentPassword) {
            alert(t('settings.currentPasswordRequired'))
            setSaving(false)
            return
        }

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                alert(t('settings.profileUpdated'))
                setSavedEmail(formData.email.trim().toLowerCase())
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '', currentPassword: '' }))
            } else {
                const errorData = await response.json()
                alert(t('settings.updateError', { error: errorData.error || t('settings.updateFailed') }))
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            alert(t('settings.genericError'))
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>
    }

    const backLink = role === 'agence' ? '/agence/dashboard' : (role === 'admin' ? '/admin/dashboard' : '/acquereur/dashboard')

    return (
        <div className="min-h-screen bg-gray-50">
            <SecurePaymentOverlay isVisible={isCheckingOut} />
            {/* Navigation */}
            <Navbar role={role as any} />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('settings.personalInfo')}</CardTitle>
                            <CardDescription>
                                {t('settings.personalInfoDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="prenom" className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        {t('settings.firstName')}
                                    </Label>
                                    <Input
                                        id="prenom"
                                        name="prenom"
                                        value={formData.prenom}
                                        onChange={handleChange}
                                        placeholder={t('settings.firstNamePlaceholder')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nom">{t('settings.lastName')}</Label>
                                    <Input
                                        id="nom"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        placeholder={t('settings.lastNamePlaceholder')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    {t('settings.email')}
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={t('settings.emailPlaceholder')}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telephone" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    {t('settings.phone')}
                                </Label>
                                <Input
                                    id="telephone"
                                    name="telephone"
                                    type="tel"
                                    value={formData.telephone}
                                    onChange={handleChange}
                                    placeholder={t('settings.phonePlaceholder')}
                                />
                            </div>

                            {role === 'agence' && (
                                <div className="space-y-2">
                                    <Label htmlFor="nomAgence" className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-gray-400" />
                                        {t('settings.agencyName')}
                                    </Label>
                                    <Input
                                        id="nomAgence"
                                        name="nomAgence"
                                        value={formData.nomAgence}
                                        onChange={handleChange}
                                        placeholder={t('settings.agencyNamePlaceholder')}
                                    />
                                </div>
                            )}

                            {role === 'agence' && (
                                <div className="pt-6 border-t">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-gray-500" />
                                        {t('settings.subscription.title')}
                                    </h3>
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-indigo-900">
                                                {t('settings.subscription.currentPlan', { plan: plan === 'yearly' ? t('settings.subscription.yearlyPremium') : t('settings.subscription.monthly') })}
                                            </p>
                                            {(subscriptionEndDate) && (
                                                <div className="text-sm font-medium text-indigo-800 mt-1">
                                                    <p>{t('settings.subscription.period', { start: (() => {
                                                        if (subscriptionStartDate) return new Date(subscriptionStartDate).toLocaleDateString(intlLocale(locale));

                                                        const end = new Date(subscriptionEndDate);
                                                        const start = new Date(end);
                                                        if (plan === 'yearly') start.setFullYear(start.getFullYear() - 1);
                                                        else start.setMonth(start.getMonth() - 1);
                                                        return start.toLocaleDateString(intlLocale(locale));
                                                    })(), end: new Date(subscriptionEndDate).toLocaleDateString(intlLocale(locale)) })}</p>
                                                </div>
                                            )}
                                            <p className="text-sm text-indigo-700 mt-1">
                                                {plan === 'yearly'
                                                    ? t('settings.subscription.premiumBenefits')
                                                    : t('settings.subscription.upgradeHint')}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-3 items-end w-full sm:w-auto">
                                            {plan !== 'yearly' && !stripeWebEnabled && (
                                                <MobileAppPaymentNotice className="sm:max-w-xs bg-white" message={t('common.payment.appOnlySubscription')} />
                                            )}
                                            {plan !== 'yearly' && stripeWebEnabled && (
                                                <Button
                                                    type="button"
                                                    onClick={handleUpgrade}
                                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg whitespace-nowrap w-full"
                                                >
                                                    <Crown className="mr-2 h-4 w-4" />
                                                    {t('settings.subscription.upgrade', { price: formatPlanPrice(settings.price_yearly, locale) })}
                                                </Button>
                                            )}
                                            {plan !== 'yearly' && stripeWebEnabled && (
                                                <div className="relative group w-full pt-2">
                                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-xl opacity-30 group-hover:opacity-60 transition duration-500 blur-[2px]"></div>
                                                    <div className="relative flex bg-white rounded-lg p-1.5 w-full items-center">
                                                        <div className="relative flex-1">
                                                            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500/70" />
                                                            <input
                                                                type="text"
                                                                placeholder={t('settings.subscription.promoPlaceholder')}
                                                                value={couponCode}
                                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                                className="w-full pl-10 pr-3 py-2 bg-transparent text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none uppercase tracking-widest font-mono"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            onClick={handleApplyCoupon}
                                                            disabled={!couponCode || applyingCoupon}
                                                            size="sm"
                                                            className={`
                                                                h-9 px-5 rounded-md transition-all duration-300 font-semibold text-xs shadow-sm
                                                                ${couponCode
                                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-200 hover:shadow-indigo-300 hover:scale-105'
                                                                    : 'bg-gray-100 text-gray-400'}
                                                            `}
                                                        >
                                                            {applyingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : t('settings.subscription.apply')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <Key className="h-5 w-5 text-gray-500" />
                                    {t('settings.security.title')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">{t('settings.security.newPassword')}</Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder={t('settings.security.newPasswordPlaceholder')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">{t('settings.security.confirmPassword')}</Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder={t('settings.security.confirmPasswordPlaceholder')}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="currentPassword">{t('settings.security.currentPassword')}</Label>
                                        <Input
                                            id="currentPassword"
                                            name="currentPassword"
                                            type="password"
                                            autoComplete="current-password"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            placeholder={t('settings.security.currentPasswordPlaceholder')}
                                        />
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-end bg-gray-50/50 p-6">
                            <Button type="submit" disabled={saving} className="bg-slate-900 hover:bg-blue-700 w-full sm:w-auto">
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('settings.save')}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </div >
    )
}

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <SettingsContent />
        </ProtectedRoute>
    )
}
