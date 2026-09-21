'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { LocationMapDraw, type DrawnAreaGeoJSON } from '@/components/ui/LocationMapDraw'
import { MapErrorBoundary } from '@/components/ui/MapErrorBoundary'
import { Navbar } from '@/components/layout/Navbar'
import { NativeLocationButton } from '@/components/ui/NativeLocationButton'
import { useI18n } from '@/lib/i18n/client'

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
  drawnArea: DrawnAreaGeoJSON | null


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
  commentaires: string
}

const STEPS = [
  { id: 1, titleKey: 'buyer.questionnaire.steps.personal', icon: Users },
  { id: 2, titleKey: 'buyer.questionnaire.steps.propertyType', icon: Building2 },
  { id: 3, titleKey: 'buyer.questionnaire.steps.budget', icon: Euro },
  { id: 4, titleKey: 'buyer.questionnaire.steps.location', icon: MapPin },
  { id: 5, titleKey: 'buyer.questionnaire.steps.extras', icon: CheckCircle2 },
  { id: 6, titleKey: 'buyer.questionnaire.steps.urgency', icon: Home },
] as const

// Types de biens : la valeur envoyée à l'API reste l'identifiant français, seul le libellé est traduit.
const PROPERTY_TYPES = ['appartement', 'maison', 'terrain', 'studio', 'loft', 'duplex', 'penthouse'] as const

// Critères supplémentaires : la clé est le champ enregistré, le libellé vient du dictionnaire.
const AMENITIES = ['balcon', 'terrasse', 'jardin', 'parking', 'cave', 'ascenseur'] as const

function QuestionnaireContent() {
  const router = useRouter()
  const { t } = useI18n()
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
    drawnArea: null,
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
    commentaires: '',
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
            drawnArea: data.drawnArea ?? null,
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

  // Champs facultatifs, mais une fourchette saisie doit être cohérente (minimum ≤ maximum).
  const inverted = (min: string, max: string) => !!min && !!max && Number(max) > 0 && Number(min) > Number(max)
  const stepError = (step: number): string | null => {
    if (step === 2 && inverted(formData.surfaceMin, formData.surfaceMax)) return t('buyer.questionnaire.errors.surfaceRange')
    if (step === 3 && inverted(formData.budgetMin, formData.budgetMax)) return t('buyer.questionnaire.errors.budgetRange')
    return null
  }

  const handleNext = () => {
    const error = stepError(currentStep)
    if (error) {
      alert(error)
      return
    }
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
    const invalidStep = [2, 3].find((step) => stepError(step))
    if (invalidStep) {
      alert(stepError(invalidStep))
      setCurrentStep(invalidStep)
      return
    }
    try {
      const response = await fetch('/api/acquereur/questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || t('buyer.questionnaire.saveError'))
      }

      // Update local storage for client-side immediate feedback
      localStorage.setItem('profileCompleted', 'true')

      // Redirect
      router.push('/acquereur/dashboard?profile=completed')
    } catch (error) {
      console.error('Error saving questionnaire:', error)
      alert(error instanceof Error && error.message ? error.message : t('buyer.questionnaire.saveError'))
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">{t('buyer.questionnaire.loading')}</div>
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="situationFamiliale" className="text-base font-semibold">
                {t('buyer.questionnaire.personal.familyStatus')}
              </Label>
              <Select
                key={`situation-${formData.situationFamiliale}`}
                value={formData.situationFamiliale?.toString() || ''}
                onValueChange={(value) => updateFormData('situationFamiliale', value)}
              >
                <SelectTrigger className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 transition-colors">
                  <SelectValue placeholder={t('buyer.questionnaire.personal.selectSituation')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celibataire">{t('buyer.questionnaire.personal.familyOptions.celibataire')}</SelectItem>
                  <SelectItem value="marie">{t('buyer.questionnaire.personal.familyOptions.marie')}</SelectItem>
                  <SelectItem value="pacs">{t('buyer.questionnaire.personal.familyOptions.pacs')}</SelectItem>
                  <SelectItem value="concubinage">{t('buyer.questionnaire.personal.familyOptions.concubinage')}</SelectItem>
                  <SelectItem value="divorce">{t('buyer.questionnaire.personal.familyOptions.divorce')}</SelectItem>
                  <SelectItem value="veuf">{t('buyer.questionnaire.personal.familyOptions.veuf')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombreEnfants" className="text-base font-semibold">
                {t('buyer.questionnaire.personal.children')}
              </Label>
              <Select
                key={`enfants-${formData.nombreEnfants}`}
                value={formData.nombreEnfants?.toString() || ''}
                onValueChange={(value) => updateFormData('nombreEnfants', value)}
              >
                <SelectTrigger className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 transition-colors">
                  <SelectValue placeholder={t('buyer.questionnaire.personal.children')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t('buyer.questionnaire.personal.childrenOptions.none')}</SelectItem>
                  <SelectItem value="1">{t('buyer.questionnaire.personal.childrenOptions.one')}</SelectItem>
                  <SelectItem value="2">{t('buyer.questionnaire.personal.childrenOptions.two')}</SelectItem>
                  <SelectItem value="3">{t('buyer.questionnaire.personal.childrenOptions.three')}</SelectItem>
                  <SelectItem value="4+">{t('buyer.questionnaire.personal.childrenOptions.fourPlus')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="situationProfessionnelle" className="text-base font-semibold">
                {t('buyer.questionnaire.personal.professional')}
              </Label>
              <Select
                key={`pro-${formData.situationProfessionnelle}`}
                value={formData.situationProfessionnelle?.toString() || ''}
                onValueChange={(value) => updateFormData('situationProfessionnelle', value)}
              >
                <SelectTrigger className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 transition-colors">
                  <SelectValue placeholder={t('buyer.questionnaire.personal.selectSituation')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cdi">{t('buyer.questionnaire.personal.professionalOptions.cdi')}</SelectItem>
                  <SelectItem value="cdd">{t('buyer.questionnaire.personal.professionalOptions.cdd')}</SelectItem>
                  <SelectItem value="freelance">{t('buyer.questionnaire.personal.professionalOptions.freelance')}</SelectItem>
                  <SelectItem value="retraite">{t('buyer.questionnaire.personal.professionalOptions.retraite')}</SelectItem>
                  <SelectItem value="chomage">{t('buyer.questionnaire.personal.professionalOptions.chomage')}</SelectItem>
                  <SelectItem value="etudiant">{t('buyer.questionnaire.personal.professionalOptions.etudiant')}</SelectItem>
                  <SelectItem value="autre">{t('buyer.questionnaire.personal.professionalOptions.autre')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaire" className="text-base font-semibold">
                  {t('buyer.questionnaire.personal.income')}
                </Label>
                <Input
                  id="salaire"
                  type="number"
                  min={0}
                  placeholder={t('buyer.questionnaire.personal.incomePlaceholder')}
                  value={formData.salaire}
                  onChange={(e) => updateFormData('salaire', e.target.value)}
                  className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patrimoine" className="text-base font-semibold">
                  {t('buyer.questionnaire.personal.assets')}
                </Label>
                <Input
                  id="patrimoine"
                  type="number"
                  min={0}
                  placeholder={t('buyer.questionnaire.personal.assetsPlaceholder')}
                  value={formData.patrimoine}
                  onChange={(e) => updateFormData('patrimoine', e.target.value)}
                  className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 transition-colors"
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
                {t('buyer.questionnaire.property.typeLabel')}
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {PROPERTY_TYPES.map((type) => (
                  <div
                    key={type}
                    onClick={() => toggleTypeBien(type)}
                    className={`flex items-center space-x-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.typeBien.includes(type)
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Checkbox
                      checked={formData.typeBien.includes(type)}
                      className="pointer-events-none"
                      readOnly
                    />
                    <Label className="cursor-pointer font-medium pointer-events-none">{t(`buyer.questionnaire.property.types.${type}`)}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="surfaceMin" className="text-base font-semibold">
                  {t('buyer.questionnaire.property.surfaceMin')}
                </Label>
                <Input
                  id="surfaceMin"
                  type="number"
                  min={0}
                  placeholder={t('buyer.questionnaire.property.surfaceMinPlaceholder')}
                  value={formData.surfaceMin}
                  onChange={(e) => updateFormData('surfaceMin', e.target.value)}
                  className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surfaceMax" className="text-base font-semibold">
                  {t('buyer.questionnaire.property.surfaceMax')}
                </Label>
                <Input
                  id="surfaceMax"
                  type="number"
                  min={0}
                  placeholder={t('buyer.questionnaire.property.surfaceMaxPlaceholder')}
                  value={formData.surfaceMax}
                  onChange={(e) => updateFormData('surfaceMax', e.target.value)}
                  className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {t('buyer.questionnaire.property.roomsLabel')}
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {['1', '2', '3', '4', '5', '6+'].map((pieces) => (
                  <div
                    key={pieces}
                    onClick={() => toggleNombrePieces(pieces)}
                    className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.nombrePieces.includes(pieces)
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Checkbox
                      checked={formData.nombrePieces.includes(pieces)}
                      className="pointer-events-none"
                      readOnly
                    />
                    <Label className="cursor-pointer font-medium whitespace-nowrap pointer-events-none">
                      {pieces} {pieces === '1' ? t('buyer.questionnaire.property.room') : t('buyer.questionnaire.property.rooms')}
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
                  {t('buyer.questionnaire.budget.budgetMin')}
                </Label>
                <Input
                  id="budgetMin"
                  type="number"
                  min={0}
                  placeholder={t('buyer.questionnaire.budget.budgetMinPlaceholder')}
                  value={formData.budgetMin}
                  onChange={(e) => updateFormData('budgetMin', e.target.value)}
                  className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetMax" className="text-base font-semibold">
                  {t('buyer.questionnaire.budget.budgetMax')}
                </Label>
                <Input
                  id="budgetMax"
                  type="number"
                  min={0}
                  placeholder={t('buyer.questionnaire.budget.budgetMaxPlaceholder')}
                  value={formData.budgetMax}
                  onChange={(e) => updateFormData('budgetMax', e.target.value)}
                  className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apport" className="text-base font-semibold">
                {t('buyer.questionnaire.budget.deposit')}
              </Label>
              <Input
                id="apport"
                type="number"
                  min={0}
                placeholder={t('buyer.questionnaire.budget.depositPlaceholder')}
                value={formData.apport}
                onChange={(e) => updateFormData('apport', e.target.value)}
                className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="financement" className="text-base font-semibold">
                {t('buyer.questionnaire.budget.financing')}
              </Label>
              <Select
                key={`financement-${formData.financement}`}
                value={formData.financement?.toString() || ''}
                onValueChange={(value) => updateFormData('financement', value)}
              >
                <SelectTrigger className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 transition-colors">
                  <SelectValue placeholder={t('buyer.questionnaire.budget.financing')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pret-bancaire">{t('buyer.questionnaire.budget.financingOptions.pretBancaire')}</SelectItem>
                  <SelectItem value="pret-relais">{t('buyer.questionnaire.budget.financingOptions.pretRelais')}</SelectItem>
                  <SelectItem value="cash">{t('buyer.questionnaire.budget.financingOptions.cash')}</SelectItem>
                  <SelectItem value="mixte">{t('buyer.questionnaire.budget.financingOptions.mixte')}</SelectItem>
                  <SelectItem value="autre">{t('buyer.questionnaire.budget.financingOptions.autre')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.financement !== 'cash' && (
              <div className="space-y-2">
                <Label htmlFor="dureePret" className="text-base font-semibold">
                  {t('buyer.questionnaire.budget.loanDuration')}
                </Label>
                <Select
                  key={`duree-${formData.dureePret}`}
                  value={formData.dureePret?.toString() || ''}
                  onValueChange={(value) => updateFormData('dureePret', value)}
                >
                  <SelectTrigger className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 transition-colors">
                    <SelectValue placeholder={t('buyer.questionnaire.budget.loanDurationPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">{t('buyer.questionnaire.budget.years', { count: 10 })}</SelectItem>
                    <SelectItem value="15">{t('buyer.questionnaire.budget.years', { count: 15 })}</SelectItem>
                    <SelectItem value="20">{t('buyer.questionnaire.budget.years', { count: 20 })}</SelectItem>
                    <SelectItem value="25">{t('buyer.questionnaire.budget.years', { count: 25 })}</SelectItem>
                    <SelectItem value="30">{t('buyer.questionnaire.budget.years', { count: 30 })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="localisation" className="text-base font-semibold">
                  {t('buyer.questionnaire.location.label')}
                </Label>
                <NativeLocationButton
                  variant="outline"
                  className="rounded-lg"
                  onLocationFound={(val) => {
                    if (val && !formData.localisation.includes(val)) {
                      updateFormData('localisation', [...formData.localisation, val])
                    }
                  }}
                />
              </div>

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
                placeholder={t('buyer.questionnaire.location.addCity')}
              />
              <p className="text-sm text-gray-500">
                {formData.localisation.length === 0 ? t('buyer.questionnaire.location.hintEmpty') : t('buyer.questionnaire.location.hintMore')}
              </p>

              <div className="pt-4 border-t">
                <Label className="text-base font-semibold block mb-2">
                  {t('buyer.questionnaire.location.drawLabel')}
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  {t('buyer.questionnaire.location.drawHint')}
                </p>
                <MapErrorBoundary
                  fallback={
                    <div className="rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center p-6 min-h-[280px]">
                      <p className="text-sm text-gray-500 text-center">
                        {t('buyer.questionnaire.location.mapUnavailable')}
                      </p>
                    </div>
                  }
                >
                  <LocationMapDraw
                    value={formData.drawnArea}
                    onChange={(v) => updateFormData('drawnArea', v)}
                    height="380px"
                  />
                </MapErrorBoundary>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <Label className="text-base font-semibold">
              {t('buyer.questionnaire.extras.label')}
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {AMENITIES.map((key) => ({ key, label: t(`buyer.amenities.${key}`) })).map(({ key, label }) => (
                <div
                  key={key}
                  onClick={() => updateFormData(key as keyof QuestionnaireData, !formData[key as keyof QuestionnaireData])}
                  className={`flex items-center space-x-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData[key as keyof QuestionnaireData]
                    ? 'border-amber-500 bg-amber-50'
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

            <div className="space-y-2">
              <Label htmlFor="commentaires" className="text-base font-semibold">
                {t('buyer.questionnaire.extras.comments')}
              </Label>
              <Textarea
                id="commentaires"
                placeholder={t('buyer.questionnaire.extras.commentsPlaceholder')}
                value={formData.commentaires}
                onChange={(e) => updateFormData('commentaires', e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-gray-500">{t('buyer.questionnaire.extras.commentsHint')}</p>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="delaiRecherche" className="text-base font-semibold">
                {t('buyer.questionnaire.urgency.delay')}
              </Label>
              <Select
                key={`delai-${formData.delaiRecherche}`}
                value={formData.delaiRecherche?.toString() || ''}
                onValueChange={(value) => updateFormData('delaiRecherche', value)}
              >
                <SelectTrigger className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 transition-colors">
                  <SelectValue placeholder={t('buyer.questionnaire.urgency.delayPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">{t('buyer.questionnaire.urgency.delayOptions.urgent')}</SelectItem>
                  <SelectItem value="1-3">{t('buyer.questionnaire.urgency.delayOptions.m1to3')}</SelectItem>
                  <SelectItem value="3-6">{t('buyer.questionnaire.urgency.delayOptions.m3to6')}</SelectItem>
                  <SelectItem value="6-12">{t('buyer.questionnaire.urgency.delayOptions.m6to12')}</SelectItem>
                  <SelectItem value="12+">{t('buyer.questionnaire.urgency.delayOptions.m12plus')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flexibilite" className="text-base font-semibold">
                {t('buyer.questionnaire.urgency.flexibility')}
              </Label>
              <Select
                key={`flex-${formData.flexibilite}`}
                value={formData.flexibilite?.toString() || ''}
                onValueChange={(value) => updateFormData('flexibilite', value)}
              >
                <SelectTrigger className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 transition-colors">
                  <SelectValue placeholder={t('buyer.questionnaire.urgency.flexibilityPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">{t('buyer.questionnaire.urgency.flexibilityOptions.strict')}</SelectItem>
                  <SelectItem value="modere">{t('buyer.questionnaire.urgency.flexibilityOptions.modere')}</SelectItem>
                  <SelectItem value="flexible">{t('buyer.questionnaire.urgency.flexibilityOptions.flexible')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl rounded-lg p-4">
              <p className="text-sm text-slate-800">
                <strong>{t('buyer.questionnaire.urgency.tipLabel')}</strong> {t('buyer.questionnaire.urgency.tip')}
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden flex flex-col items-center">
      {/* Navigation */}
      <Navbar role="acquereur" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border border-white/30 rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "\'Playfair Display\', serif" }}>{t('buyer.questionnaire.title')}</CardTitle>
              <CardDescription className="text-base">
                {t('buyer.questionnaire.subtitle')}
              </CardDescription>
              <div className="mt-6">
                <Progress value={progress} className="h-2 bg-slate-100 [&>div]:bg-amber-400" />
                <p className="text-sm text-muted-foreground mt-2">
                  {t('buyer.questionnaire.progress', { current: currentStep, total: STEPS.length, percent: Math.round(progress) })}
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
                            ? 'bg-slate-900 text-white scale-110'
                            : isCompleted
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                            }`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <p className={`text-xs mt-2 text-center font-medium ${isActive ? 'text-amber-500' : 'text-gray-500'
                          }`}>
                          {t(step.titleKey)}
                        </p>
                      </div>
                      {index < STEPS.length - 1 && (
                        <div className={`h-1 flex-1 mx-2 rounded ${isCompleted ? 'bg-amber-500' : 'bg-gray-200'
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
                  {t('buyer.questionnaire.previous')}
                </Button>

                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                  >
                    {t('buyer.questionnaire.next')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleFinalize}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                  >
                    {t('buyer.questionnaire.finalize')}
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
