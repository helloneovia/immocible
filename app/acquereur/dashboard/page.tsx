'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { NotificationBell } from '@/components/ui/NotificationBell'
import {
  Home,
  Settings,
  LogOut,
  Search,
  Heart,
  TrendingUp,
  FileText,
  ArrowRight,
  MapPin,
  Euro,
  Star,
  Filter,
  MessageSquare
} from 'lucide-react'

function DashboardContent() {
  const { signOut } = useAuth()
  const [profileCompleted, setProfileCompleted] = useState(false)

  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const response = await fetch('/api/acquereur/questionnaire')
        if (response.ok) {
          const { data } = await response.json()
          // If data is returned (not null), the profile is completed
          if (data) {
            setProfileCompleted(true)
          }
        }
      } catch (error) {
        console.error('Error checking profile status:', error)
      }
    }

    checkProfileStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="border-b border-white/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                IMMOCIBLE
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <NotificationBell role="acquereur" />
              <Link href="/settings">
                <Button variant="ghost" className="font-medium">
                  <Settings className="h-5 w-5 mr-2" />
                  Paramètres
                </Button>
              </Link>
              <Link href="/acquereur/messages">
                <Button variant="ghost" className="font-medium relative">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Messagerie
                  {/* Optional: Add badge here if unread count > 0 */}
                </Button>
              </Link>
              <Button variant="outline" className="font-medium" onClick={signOut}>
                <LogOut className="h-5 w-5 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Mes matches
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Opportunités immobilières correspondant à votre profil
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-indigo-100 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Profil complété
              </CardDescription>
              <CardTitle className="text-4xl font-extrabold text-white">{profileCompleted ? '100%' : '0%'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={profileCompleted ? 100 : 0} className="h-3 bg-white/20" />
            </CardContent>
          </Card>


          <Link href="/acquereur/messages" className="block">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white hover:scale-105 transition-transform cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardDescription className="text-teal-100 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Communications
                </CardDescription>
                <CardTitle className="text-2xl font-extrabold text-white">Messagerie</CardTitle>
                <p className="text-sm text-teal-100 mt-2">Discutez avec les agences</p>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Actions */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <Link href="/acquereur/questionnaire">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
            >
              <FileText className="mr-2 h-5 w-5" />
              {profileCompleted ? 'Modifier mes critères' : 'Compléter mon profil'}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

        </div>

        {/* Matches List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* No matches yet */}
          <div className="md:col-span-2 lg:col-span-3 text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
            <div className="mx-auto h-24 w-24 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Search className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {profileCompleted ? 'Recherche en cours' : 'Bienvenue'}
            </h3>
            <p className="text-gray-500 max-w-lg mx-auto text-lg leading-relaxed">
              {profileCompleted
                ? 'Votre demande est en cours de traitement, nous vous recommanderons les meilleurs biens selon vos critères.'
                : 'Veuillez compléter le questionnaire pour nous permettre de vous recommander les meilleurs biens selon vos besoins.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardAcquereur() {
  return (
    <ProtectedRoute requiredRole="acquereur" redirectTo="/acquereur/connexion">
      <DashboardContent />
    </ProtectedRoute>
  )
}
