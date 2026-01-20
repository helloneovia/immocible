'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export default function QuestionnaireAcquereur() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                IMMOCIBLE
              </span>
            </Link>
            <Button variant="ghost" asChild>
              <Link href="/acquereur/dashboard">Retour au dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-xl border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-2">Questionnaire intelligent</CardTitle>
              <CardDescription className="text-base">
                Créez votre profil en quelques minutes pour recevoir des matches personnalisés
              </CardDescription>
              <div className="mt-6">
                <Progress value={0} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">0% complété</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 py-8">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-xl font-semibold mb-2">Questionnaire en cours de développement</h3>
                <p className="text-muted-foreground mb-6">
                  Cette fonctionnalité sera bientôt disponible. 
                  En attendant, vous pouvez explorer les autres fonctionnalités de la plateforme.
                </p>
                <Button asChild>
                  <Link href="/acquereur/dashboard">Retour au dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
