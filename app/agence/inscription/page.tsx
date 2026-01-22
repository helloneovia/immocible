'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowRight, Building2, CheckCircle2, Shield, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

export default function InscriptionAgence() {
  const router = useRouter()
  const [nomAgence, setNomAgence] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      // Inscription avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'agence',
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Le profil est créé automatiquement par le trigger PostgreSQL
        // Attendre un peu pour que le trigger s'exécute (jusqu'à 2 secondes)
        let profileCreated = false
        for (let i = 0; i < 4; i++) {
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', authData.user.id)
            .single()
          
          if (profile) {
            profileCreated = true
            break
          }
        }

        // Si le profil n'existe toujours pas après 2 secondes, utiliser la fonction create_user_profile()
        if (!profileCreated) {
          const { data: result, error: createError } = await supabase
            .rpc('create_user_profile', {
              p_role: 'agence',
              p_nom_agence: nomAgence
            })

          if (createError || !result?.success) {
            console.error('Erreur lors de la création du profil:', createError || result)
            // Fallback : essayer l'insertion directe
            const { error: insertError } = await supabase
              .from('profiles')
              .upsert({
                id: authData.user.id,
                email: email,
                role: 'agence',
                nom_agence: nomAgence,
              }, {
                onConflict: 'id'
              })

            if (insertError) {
              console.error('Erreur détaillée:', insertError)
              if (insertError.code === '42P01') {
                setError('La table profiles n\'existe pas. Exécutez le script supabase-solution-simple.sql dans Supabase SQL Editor.')
              } else if (insertError.code === '42501') {
                setError('Erreur de permissions. Exécutez le script supabase-solution-simple.sql dans Supabase SQL Editor. Si le problème persiste, exécutez aussi supabase-diagnostic.sql pour diagnostiquer.')
              } else {
                setError(`Erreur: ${insertError.message}. Code: ${insertError.code}. Exécutez supabase-solution-simple.sql dans Supabase.`)
              }
              setLoading(false)
              return
            }
          }
        }

        // Rediriger vers le dashboard
        router.push('/agence/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      // Gestion spécifique de l'erreur de limite d'email
      if (err.message?.includes('rate limit') || err.message?.includes('email rate limit')) {
        setError('Limite d\'envoi d\'emails atteinte. Veuillez attendre quelques minutes avant de réessayer, ou désactivez la confirmation d\'email dans les paramètres Supabase (Authentication > Settings > Email Auth > Confirm email).')
      } else {
        setError(err.message || 'Une erreur est survenue lors de l\'inscription')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Home className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                IMMOCIBLE
              </span>
            </Link>
          </div>

          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader className="space-y-1 text-center pb-6">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Créer mon compte agence
              </CardTitle>
              <CardDescription className="text-base pt-2">
                Accédez à des acquéreurs vérifiés et sérieux
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Nom de l&apos;agence</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Mon Agence Immobilière"
                    required
                    value={nomAgence}
                    onChange={(e) => setNomAgence(e.target.value)}
                    className="h-12 border-2 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email professionnel</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@agence.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-2 focus:border-indigo-500 transition-colors"
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
                    className="h-12 border-2 focus:border-indigo-500 transition-colors"
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
                    className="h-12 border-2 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {loading ? 'Création en cours...' : 'Créer mon compte agence'}
                  {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </Button>
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
                  <Link href="/agence/connexion" className="text-indigo-600 hover:text-indigo-700 underline font-semibold">
                    Se connecter
                  </Link>
                </div>
                <div className="text-center text-sm pt-2">
                  <Link href="/acquereur/inscription" className="text-muted-foreground hover:text-indigo-600 transition-colors font-medium">
                    Vous êtes un acquéreur ? Inscrivez-vous ici →
                  </Link>
                </div>
              </form>
              
              {/* Trust indicators */}
              <div className="mt-6 pt-6 border-t flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Sécurisé</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                  <span>100% Gratuit</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
