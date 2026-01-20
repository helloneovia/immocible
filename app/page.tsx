'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-20">
          <div className="inline-block mb-6 p-4 bg-blue-100 rounded-full">
            <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            IMMOCIBLE
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 mb-4 font-medium">
            Le moteur de recherche inversÃ© de l'immobilier
          </p>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Plateforme de matching acquÃ©reurs â†” opportunitÃ©s immobiliÃ¨res qualifiÃ©es
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-blue-600">
                Je suis acquÃ©reur
              </h2>
            </div>
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              CrÃ©ez votre profil en quelques minutes et accÃ©dez Ã  des opportunitÃ©s immobiliÃ¨res 
              qualifiÃ©es, y compris l'off-market.
            </p>
            <ul className="space-y-3 mb-8 text-base text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-500 text-xl font-bold">âœ“</span>
                <span>Questionnaire intelligent</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 text-xl font-bold">âœ“</span>
                <span>Matching personnalisÃ©</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 text-xl font-bold">âœ“</span>
                <span>AccÃ¨s off-market</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 text-xl font-bold">âœ“</span>
                <span>Alertes prioritaires</span>
              </li>
            </ul>
            <Link href="/acquereur/inscription">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold rounded-lg">
                Commencer gratuitement
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-indigo-600">
                Je suis une agence
              </h2>
            </div>
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              AccÃ©dez Ã  des acquÃ©reurs vÃ©rifiÃ©s et sÃ©rieux. Augmentez votre taux de transformation.
            </p>
            <ul className="space-y-3 mb-8 text-base text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-500 text-xl font-bold">âœ“</span>
                <span>AcquÃ©reurs vÃ©rifiÃ©s</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 text-xl font-bold">âœ“</span>
                <span>Score de compatibilitÃ©</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 text-xl font-bold">âœ“</span>
                <span>Off-market structurÃ©</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 text-xl font-bold">âœ“</span>
                <span>Suivi et historique</span>
              </li>
            </ul>
            <Link href="/agence/inscription">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg font-semibold rounded-lg">
                CrÃ©er mon compte agence
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 p-4 bg-orange-100 rounded-full">
              <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Notre diffÃ©renciation
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ce qui nous distingue des autres plateformes immobiliÃ¨res
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="inline-block p-4 bg-blue-200 rounded-full mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">AcquÃ©reurs vÃ©rifiÃ©s</h3>
              <p className="text-gray-700 leading-relaxed">
                Budget rÃ©el, projet concret, timing clair
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors">
              <div className="inline-block p-4 bg-indigo-200 rounded-full mb-4">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Off-market structurÃ©</h3>
              <p className="text-gray-700 leading-relaxed">
                Biens avant diffusion, tests de marchÃ©
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
              <div className="inline-block p-4 bg-purple-200 rounded-full mb-4">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Matching intelligent</h3>
              <p className="text-gray-700 leading-relaxed">
                Score clair, raisons du match, suggestions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}