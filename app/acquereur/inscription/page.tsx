'use client'

export default function InscriptionAcquereur() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-semibold mb-4">CrÃ©er mon compte acquÃ©reur</h1>
        <p className="text-gray-600 mb-6">Commencez votre recherche immobiliÃ¨re en quelques minutes</p>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input id="email" type="email" required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Mot de passe</label>
            <input id="password" type="password" required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            CrÃ©er mon compte
          </button>
        </form>
      </div>
    </div>
  )
}