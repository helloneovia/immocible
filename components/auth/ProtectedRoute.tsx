'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/lib/i18n/client'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'acquereur' | 'agence'
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo || '/')
    } else if (!loading && user && requiredRole) {
      // Check user role
      if (user.role !== requiredRole) {
        router.push(redirectTo || '/')
      }
    }
  }, [user, loading, requiredRole, router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requiredRole && user.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
