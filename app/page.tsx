export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">
          IMMOCIBLE
        </h1>
        <p className="text-xl text-gray-600">
          Le moteur de recherche inverse de l&apos;immobilier
        </p>
        <p className="text-lg">
          Plateforme de matching acquéreurs ↔ opportunités immobilières qualifiées
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <a
            href="/acquereur/inscription"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Acquéreur
          </a>
          <a
            href="/agence/inscription"
            className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Agence
          </a>
        </div>
      </div>
    </main>
  )
}
