'use client'

import { Loader2, Lock } from 'lucide-react'
import { useI18n } from '@/lib/i18n/client'

interface SecurePaymentOverlayProps {
  isVisible: boolean
  text?: string
}

export function SecurePaymentOverlay({ isVisible, text }: SecurePaymentOverlayProps) {
  const { t } = useI18n()
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full mx-4 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-emerald-500 text-white p-4 rounded-full shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white text-emerald-500 rounded-full p-1 shadow">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{t('common.payment.title')}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{text || t('common.payment.preparing')}</p>
        <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-slate-400">
          <Lock className="w-3 h-3" />
          <span>{t('common.payment.stripe')}</span>
        </div>
      </div>
    </div>
  )
}
