'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Home,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Euro,
  Users,
  Building2,
  CheckCircle2,
  X,
  Search,
  Check
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete'
import { Navbar } from '@/components/layout/Navbar'

interface QuestionnaireData {
  // Informations personnelles
  situationFamiliale: string
  nombreEnfants: string
  situationProfessionnelle: string

  // Critères de recherche
  typeBien: string[]
  budgetMin: string
  budgetMax: string
  surfaceMin: string
  surfaceMax: string
  nombrePieces: string[]
  localisation: string[]


  // Critères supplémentaires
  balcon: boolean
  terrasse: boolean
  jardin: boolean
  parking: boolean
  cave: boolean
  ascenseur: boolean

  // Financement
  apport: string
  financement: string
  dureePret: string

  // Urgence
  delaiRecherche: string
  flexibilite: string
  salaire: string
  patrimoine: string
}

const STEPS = [
  { id: 1, title: 'Situation personnelle', icon: Users },
  { id: 2, title: 'Type de bien recherché', icon: Building2 },
  { id: 3, title: 'Budget et financement', icon: Euro },
  { id: 4, title: 'Localisation', icon: MapPin },
  { id: 5, title: 'Critères supplémentaires', icon: CheckCircle2 },
  { id: 6, title: 'Urgence et flexibilité', icon: Home },
]

function QuestionnaireContent() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<QuestionnaireData>({
    situationFamiliale: '',
    nombreEnfants: '',
    situationProfessionnelle: '',
    typeBien: [],
    budgetMin: '',
    budgetMax: '',
    surfaceMin: '',
    surfaceMax: '',
    nombrePieces: [],

    localisation: [],
    balcon: false,
    terrasse: false,
    jardin: false,
    parking: false,
    cave: false,
    ascenseur: false,
    apport: '',
    financement: '',
    dureePret: '',
    delaiRecherche: '',
    flexibilite: '',
    salaire: '',
    patrimoine: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/acquereur/questionnaire')
      if (response.ok) {
        const { data } = await response.json()
        console.log('%c[LOAD] Data retrieved from DB:', 'color: green; font-weight: bold;', data);
        console.log('%c[LOAD] Specific fields - nombrePieces:', 'color: blue;', data?.nombrePieces, 'financement:', data?.financement);

        if (data) {
          // Ensure arrays are initialized
          setFormData({
            ...data,
            typeBien: data.typeBien || [],
            localisation: data.localisation || [],
            nombrePieces: Array.isArray(data.nombrePieces) ? data.nombrePieces : (data.nombrePieces ? [data.nombrePieces] : [])
          })
          // If data exists, we can assume profile is somewhat active/previously filled
        }
      }
    } catch (error) {
      console.error('Error fetching questionnaire data:', error)
    } finally {
      setLoading(false)
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  const updateFormData = (field: keyof QuestionnaireData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleTypeBien = (type: string) => {
    setFormData(prev => ({
      ...prev,
      typeBien: prev.typeBien.includes(type)
        ? prev.typeBien.filter(t => t !== type)
        : [...prev.typeBien, type]
    }))
  }

  const toggleNombrePieces = (pieces: string) => {
    setFormData((prev) => {
      const current = prev.nombrePieces || []
      const updated = current.includes(pieces)
        ? current.filter((p) => p !== pieces)
        : [...current, pieces]
      return { ...prev, nombrePieces: updated }
    })
  }

  // Validation logic - Now all optional
  const validateStep = (step: number) => {
    return true
  }

  const handleNext = () => {
    // No validation check needed
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinalize = async () => {
    // No validation check needed
    try {
      const response = await fetch('/api/acquereur/questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save questionnaire')
      }

      // Update local storage for client-side immediate feedback
      localStorage.setItem('profileCompleted', 'true')

      // Redirect
      router.push('/acquereur/dashboard?profile=completed')
    } catch (error) {
      console.error('Error saving questionnaire:', error)
      alert('Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Chargement...</div>
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="situationFamiliale" className="text-base font-semibold">
                Situation familiale
              </Label>
              <Select
                key={`situation-${formData.situationFamiliale}`}
                value={formData.situationFamiliale?.toString() || ''}
                onValueChange={(value) => updateFormData('situationFamiliale', value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionnez votre situation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celibataire">Célibataire</SelectItem>
                  <SelectItem value="marie">Marié(e)</SelectItem>
                  <SelectItem value="pacs">Pacsé(e)</SelectItem>
                  <SelectItem value="concubinage">En concubinage</SelectItem>
                  <SelectItem value="divorce">Divorcé(e)</SelectItem>
                  <SelectItem value="veuf">Veuf(ve)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombreEnfants" className="text-base font-semibold">
                Nombre d&apos;enfants
              </Label>
              <Select
                key={`enfants-${formData.nombreEnfants}`}
                value={formData.nombreEnfants?.toString() || ''}
                onValueChange={(value) => updateFormData('nombreEnfants', value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Nombre d'enfants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Aucun</SelectItem>
                  <SelectItem value="1">1 enfant</SelectItem>
                  <SelectItem value="2">2 enfants</SelectItem>
                  <SelectItem value="3">3 enfants</SelectItem>
                  <SelectItem value="4+">4 enfants ou plus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="situationProfessionnelle" className="text-base font-semibold">
                Situation professionnelle
              </Label>
              <Select
                key={`pro-${formData.situationProfessionnelle}`}
                value={formData.situationProfessionnelle?.toString() || ''}
                onValueChange={(value) => updateFormData('situationProfessionnelle', value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionnez votre situation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cdi">CDI</SelectItem>
                  <SelectItem value="cdd">CDD</SelectItem>
                  <SelectItem value="freelance">Freelance / Indépendant</SelectItem>
                  <SelectItem value="retraite">Retraité(e)</SelectItem>
                  <SelectItem value="chomage">En recherche d&apos;emploi</SelectItem>
                  <SelectItem value="etudiant">Étudiant(e)</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaire" className="text-base font-semibold">
                  Revenus mensuels nets (€)
                </Label>
                <Input
                  id="salaire"
                  type="number"
                  placeholder="Ex: 4500"
                  value={formData.salaire}
                  onChange={(e) => updateFormData('salaire', e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patrimoine" className="text-base font-semibold">
                  Patrimoine total (€)
                </Label>
                <Input
                  id="patrimoine"
                  type="number"
                  placeholder="Ex: 150000"
                  value={formData.patrimoine}
                  onChange={(e) => updateFormData('patrimoine', e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Type de bien recherché (plusieurs choix possibles)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {['Appartement', 'Maison', 'Studio', 'Loft', 'Duplex', 'Penthouse'].map((type) => (
                  <div
                    key={type}
                    onClick={() => toggleTypeBien(type.toLowerCase())}
                    className={`flex items-center space-x-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.typeBien.includes(type.toLowerCase())
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Checkbox
                      checked={formData.typeBien.includes(type.toLowerCase())}
                      onChange={() => toggleTypeBien(type.toLowerCase())}
                    />
                    <Label className="cursor-pointer font-medium">{type}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="surfaceMin" className="text-base font-semibold">
                  Surface minimum (m²)
                </Label>
                <Input
                  id="surfaceMin"
                  type="number"
                  placeholder="Ex: 50"
                  value={formData.surfaceMin}
                  onChange={(e) => updateFormData('surfaceMin', e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surfaceMax" className="text-base font-semibold">
                  Surface maximum (m²)
                </Label>
                <Input
                  id="surfaceMax"
                  type="number"
                  placeholder="Ex: 120"
                  value={formData.surfaceMax}
                  onChange={(e) => updateFormData('surfaceMax', e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">
                Nombre de pièces (plusieurs choix possibles)
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {['1', '2', '3', '4', '5', '6+'].map((pieces) => (
                  <div
                    key={pieces}
                    onClick={() => toggleNombrePieces(pieces)}
                    className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.nombrePieces.includes(pieces)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Checkbox
                      checked={formData.nombrePieces.includes(pieces)}
                      onChange={() => toggleNombrePieces(pieces)}
                    />
                    <Label className="cursor-pointer font-medium whitespace-nowrap">
                      {pieces} {pieces === '1' ? 'pièce' : pieces === '6+' ? 'pièces' : 'pièces'}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetMin" className="text-base font-semibold">
                  Budget minimum (€)
                </Label>
                <Input
                  id="budgetMin"
                  type="number"
                  placeholder="Ex: 300000"
                  value={formData.budgetMin}
                  onChange={(e) => updateFormData('budgetMin', e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetMax" className="text-base font-semibold">
                  Budget maximum (€)
                </Label>
                <Input
                  id="budgetMax"
                  type="number"
                  placeholder="Ex: 600000"
                  value={formData.budgetMax}
                  onChange={(e) => updateFormData('budgetMax', e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apport" className="text-base font-semibold">
                Apport personnel (€)
              </Label>
              <Input
                id="apport"
                type="number"
                placeholder="Ex: 100000"
                value={formData.apport}
                onChange={(e) => updateFormData('apport', e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="financement" className="text-base font-semibold">
                Type de financement
              </Label>
              <Select
                key={`financement-${formData.financement}`}
                value={formData.financement?.toString() || ''}
                onValueChange={(value) => updateFormData('financement', value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Type de financement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pret-bancaire">Prêt bancaire</SelectItem>
                  <SelectItem value="pret-relais">Prêt relais</SelectItem>
                  <SelectItem value="cash">Achat au comptant</SelectItem>
                  <SelectItem value="mixte">Financement mixte</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dureePret" className="text-base font-semibold">
                Durée du prêt souhaitée (années)
              </Label>
              <Select
                key={`duree-${formData.dureePret}`}
                value={formData.dureePret?.toString() || ''}
                onValueChange={(value) => updateFormData('dureePret', value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Durée du prêt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 ans</SelectItem>
                  <SelectItem value="15">15 ans</SelectItem>
                  <SelectItem value="20">20 ans</SelectItem>
                  <SelectItem value="25">25 ans</SelectItem>
                  <SelectItem value="30">30 ans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="localisation" className="text-base font-semibold">
                Villes ou régions recherchées
              </Label>

              {/* Selected Locations */}
              <div className="flex flex-wrap gap-2 min-h-[30px]">
                {formData.localisation.map((loc) => (
                  <Badge
                    key={loc}
                    variant="secondary"
                    className="px-3 py-1 flex items-center gap-2 cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors border"
                    onClick={() => updateFormData('localisation', formData.localisation.filter(l => l !== loc))}
                  >
                    {loc} <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>

              <LocationAutocomplete
                key={formData.localisation.length} // Force reset on selection
                value=""
                onChange={(val: string) => {
                  if (val && !formData.localisation.includes(val)) {
                    updateFormData('localisation', [...formData.localisation, val])
                  }
                }}
                placeholder="Ajouter une ville..."
              />
              <p className="text-sm text-gray-500">
                {formData.localisation.length === 0 ? "Recherchez et sélectionnez une ville." : "Vous pouvez ajouter d'autres villes."}
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <Label className="text-base font-semibold">
              Critères supplémentaires (au moins un choix)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'balcon', label: 'Balcon' },
                { key: 'terrasse', label: 'Terrasse' },
                { key: 'jardin', label: 'Jardin' },
                { key: 'parking', label: 'Parking' },
                { key: 'cave', label: 'Cave' },
                { key: 'ascenseur', label: 'Ascenseur' },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  onClick={() => updateFormData(key as keyof QuestionnaireData, !formData[key as keyof QuestionnaireData])}
                  className={`flex items-center space-x-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData[key as keyof QuestionnaireData]
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <Checkbox
                    checked={formData[key as keyof QuestionnaireData] as boolean}
                    onChange={() => updateFormData(key as keyof QuestionnaireData, !formData[key as keyof QuestionnaireData])}
                  />
                  <Label className="cursor-pointer font-medium">{label}</Label>
                </div>
              ))}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="delaiRecherche" className="text-base font-semibold">
                Délai de recherche souhaité
              </Label>
              <Select
                key={`delai-${formData.delaiRecherche}`}
                value={formData.delaiRecherche?.toString() || ''}
                onValueChange={(value) => updateFormData('delaiRecherche', value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Délai de recherche" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent (moins de 1 mois)</SelectItem>
                  <SelectItem value="1-3">1 à 3 mois</SelectItem>
                  <SelectItem value="3-6">3 à 6 mois</SelectItem>
                  <SelectItem value="6-12">6 à 12 mois</SelectItem>
                  <SelectItem value="12+">Plus de 12 mois</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flexibilite" className="text-base font-semibold">
                Flexibilité sur les critères
              </Label>
              <Select
                key={`flex-${formData.flexibilite}`}
                value={formData.flexibilite?.toString() || ''}
                onValueChange={(value) => updateFormData('flexibilite', value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Niveau de flexibilité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">Strict (tous les critères doivent être respectés)</SelectItem>
                  <SelectItem value="modere">Modéré (quelques ajustements possibles)</SelectItem>
                  <SelectItem value="flexible">Flexible (ouvert aux opportunités)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>💡 Astuce :</strong> Plus vous êtes flexible, plus nous pourrons vous proposer de biens correspondant à votre profil.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <Navbar role="acquereur" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-2">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl mb-2">Questionnaire intelligent</CardTitle>
              <CardDescription className="text-base">
                Créez votre profil en quelques minutes pour recevoir des matches personnalisés
              </CardDescription>
              <div className="mt-6">
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  Étape {currentStep} sur {STEPS.length} - {Math.round(progress)}% complété
                </p>
              </div>
            </CardHeader>

            {/* Steps indicator */}
            <div className="px-6 pb-6 hidden md:block">
              <div className="flex justify-between items-center">
                {STEPS.map((step, index) => {
                  const Icon = step.icon
                  const isActive = currentStep === step.id
                  const isCompleted = currentStep > step.id

                  return (
                    <div key={step.id} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isActive
                            ? 'bg-blue-600 text-white scale-110'
                            : isCompleted
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                            }`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <p className={`text-xs mt-2 text-center font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                          {step.title}
                        </p>
                      </div>
                      {index < STEPS.length - 1 && (
                        <div className={`h-1 flex-1 mx-2 rounded ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              <CardContent className="space-y-8 py-8 min-h-[400px]">
                {renderStepContent()}
              </CardContent>

              <div className="flex justify-between items-center p-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Précédent
                </Button>

                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2"
                  >
                    Suivant
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleFinalize}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2"
                  >
                    Finaliser mon profil
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function QuestionnaireAcquereur() {
  return (
    <ProtectedRoute requiredRole="acquereur" redirectTo="/acquereur/connexion">
      <QuestionnaireContent />
    </ProtectedRoute>
  )
}
