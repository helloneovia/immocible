import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            ðŸ—ï¸ IMMOCIBLE
          </h1>
          <p className="text-2xl text-gray-700 mb-2">
            Le moteur de recherche inversÃ© de l'immobilier
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Plateforme de matching acquÃ©reurs â†” opportunitÃ©s immobiliÃ¨res qualifiÃ©es
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">
              ðŸ‘¤ Je suis acquÃ©reur
            </h2>
            <p className="text-gray-600 mb-6">
              CrÃ©ez votre profil en quelques minutes et accÃ©dez Ã  des opportunitÃ©s immobiliÃ¨res 
              qualifiÃ©es, y compris l'off-market.
            </p>
            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              <li>âœ“ Questionnaire intelligent</li>
              <li>âœ“ Matching personnalisÃ©</li>
              <li>âœ“ AccÃ¨s off-market</li>
              <li>âœ“ Alertes prioritaires</li>
            </ul>
            <Link href="/acquereur/inscription">
              <Button className="w-full" size="lg">
                Commencer gratuitement
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
              ðŸ¢ Je suis une agence
            </h2>
            <p className="text-gray-600 mb-6">
              AccÃ©dez Ã  des acquÃ©reurs vÃ©rifiÃ©s et sÃ©rieux. Augmentez votre taux de transformation.
            </p>
            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              <li>âœ“ AcquÃ©reurs vÃ©rifiÃ©s</li>
              <li>âœ“ Score de compatibilitÃ©</li>
              <li>âœ“ Off-market structurÃ©</li>
              <li>âœ“ Suivi et historique</li>
            </ul>
            <Link href="/agence/inscription">
              <Button className="w-full" size="lg" variant="outline">
                CrÃ©er mon compte agence
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            ðŸ”¥ Notre diffÃ©renciation
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">âœ…</div>
              <h3 className="font-semibold mb-2">AcquÃ©reurs vÃ©rifiÃ©s</h3>
              <p className="text-sm text-gray-600">
                Budget rÃ©el, projet concret, timing clair
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">ðŸ”’</div>
              <h3 className="font-semibold mb-2">Off-market structurÃ©</h3>
              <p className="text-sm text-gray-600">
                Biens avant diffusion, tests de marchÃ©
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">ðŸŽ¯</div>
              <h3 className="font-semibold mb-2">Matching intelligent</h3>
              <p className="text-sm text-gray-600">
                Score clair, raisons du match, suggestions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}