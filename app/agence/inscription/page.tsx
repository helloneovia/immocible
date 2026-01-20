'use client'

export default function InscriptionAgence() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-semibold mb-4">Creer mon compte agence</h1>
        <p className="text-gray-600 mb-6">Accedez a des acquireurs verifies et serieux</p>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input id="email" type="email" required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Mot de passe</label>
            <input id="password" type="password" required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
            Creer mon compte agence
          </button>
        </form>
      </div>
    </div>
  )
}
