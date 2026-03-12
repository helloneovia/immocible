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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Home,
  Settings,
  LogOut,
  Search,
  FileText,
  ArrowRight,
  MessageSquare
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { AppSettings } from '@/lib/settings'

function DashboardContent() {
  const { signOut } = useAuth()
  const [profileCompleted, setProfileCompleted] = useState(false)
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [showSearchPopup, setShowSearchPopup] = useState(false)

  useEffect(() => {
    const fetchDashboardSettings = async () => {
      try {
        const response = await fetch('/api/public/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    fetchDashboardSettings()
  }, [])

  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const response = await fetch('/api/acquereur/questionnaire')
        if (response.ok) {
          const { data } = await response.json()
          if (data) {
            setProfileCompleted(true)

            // Check if user has already seen the popup in this session
            const hasSeenPopup = sessionStorage.getItem('hasSeenSearchPopup')
            if (!hasSeenPopup) {
              setShowSearchPopup(true)
              sessionStorage.setItem('hasSeenSearchPopup', 'true')
            }
          }
        }
      } catch (error) {
        console.error('Error checking profile status:', error)
      }
    }
    checkProfileStatus()
  }, [])

  const popupTitle = settings?.text_buyer_dashboard_popup_title || "Recherche de biens en cours 🔍"
  const popupDesc = settings?.text_buyer_dashboard_popup_description || "Votre profil a bien été enregistré. Nos agences partenaires analysent actuellement vos critères et nous vous contacterons dès qu'une opportunité off-market correspondante sera disponible."

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar role="acquereur" />

      {/* Modern Search Popup */}
      <Dialog open={showSearchPopup} onOpenChange={setShowSearchPopup}>
        <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mt-4 mb-2">
              <Search className="h-8 w-8 text-amber-500 animate-pulse" />
            </div>
            <DialogTitle className="text-2xl text-center font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {popupTitle}
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 text-base leading-relaxed">
              {popupDesc}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-6">
            <Button
              onClick={() => setShowSearchPopup(false)}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 px-8 shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              C'est compris, merci
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Mes matches
          </h1>
          <p className="text-lg text-slate-500 font-light">
            Opportunités immobilières correspondant à votre profil
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link href="/acquereur/questionnaire" className="block">
            <Card className="border-0 shadow-lg bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -translate-y-8 translate-x-8" />
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-400 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Profil complété
                </CardDescription>
                <CardTitle className="text-4xl font-bold text-white">{profileCompleted ? '100%' : '0%'}</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={profileCompleted ? 100 : 0} className="h-2 bg-white/10 [&>div]:bg-amber-400" />
                <p className="text-xs text-slate-400 mt-2">Cliquez pour {profileCompleted ? 'modifier' : 'compléter'} votre profil</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/acquereur/messages" className="block">
            <Card className="border border-slate-200 shadow-sm bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-500 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Communications
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-slate-900">Messagerie</CardTitle>
                <p className="text-sm text-slate-500 mt-1">Discutez avec les agences</p>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <Link href="/acquereur/questionnaire" className={!profileCompleted ? 'block sm:inline-block' : ''}>
            <Button
              size="lg"
              className={`
                ${!profileCompleted
                  ? 'bg-amber-500 hover:bg-amber-600 h-16 text-lg px-8 w-full sm:w-auto shadow-lg shadow-amber-500/25'
                  : 'bg-slate-900 hover:bg-slate-800'}
                text-white font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-300 group
              `}
            >
              <FileText className={`${!profileCompleted ? 'mr-3 h-6 w-6' : 'mr-2 h-5 w-5'}`} />
              {profileCompleted ? 'Modifier mes critères' : 'Compléter mon profil (Obligatoire)'}
              <ArrowRight className={`${!profileCompleted ? 'ml-3 h-6 w-6' : 'ml-2 h-5 w-5'} group-hover:translate-x-1 transition-transform`} />
            </Button>
          </Link>
        </div>

        {/* Matches List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2 lg:col-span-3 text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="mx-auto h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Search className="h-9 w-9 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {profileCompleted ? 'Recherche en cours' : 'Bienvenue sur IMMOCIBLE'}
            </h3>
            <p className="text-slate-400 max-w-lg mx-auto text-base leading-relaxed font-light">
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
