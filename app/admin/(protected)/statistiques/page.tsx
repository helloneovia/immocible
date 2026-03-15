import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, PieChart } from 'lucide-react'
import StatsCharts from '@/components/admin/StatsCharts'

// Helper to process JSON characteristics safely
const parseCaracteristiques = (data: any) => {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data)
        } catch {
            return {}
        }
    }
    return data || {}
}

async function getQuestionnaireStats() {
    const recherches = await prisma.recherche.findMany({
        where: { isActive: true },
        select: {
            typeBien: true,
            localisation: true,
            financement: true,
            prixMax: true,
            prixMin: true,
            surfaceMin: true,
            surfaceMax: true,
            nombrePieces: true,
            caracteristiques: true,
        }
    })

    const totalRecherches = recherches.length

    // Aggregators
    const typeBienCounts: Record<string, number> = {}
    const localisationCounts: Record<string, number> = {}
    const financementCounts: Record<string, number> = {}
    const situationFamilialeCounts: Record<string, number> = {}
    const situationProCounts: Record<string, number> = {}
    const salaireCounts: Record<string, number> = {}
    const patrimoineCounts: Record<string, number> = {}
    const apportCounts: Record<string, number> = {}
    const delaiCounts: Record<string, number> = {}
    const piecesCounts: Record<string, number> = {}

    const ammenities: Record<string, number> = {
        Balcon: 0,
        Terrasse: 0,
        Jardin: 0,
        Parking: 0,
        Cave: 0,
        Ascenseur: 0,
    }

    let totalPrixMax = 0
    let prixMaxCount = 0
    const budgets: number[] = []

    let totalSurface = 0
    let surfaceCount = 0
    let minSurface = Infinity
    let maxSurface = 0

    recherches.forEach(r => {
        // Types de bien
        r.typeBien.forEach(type => {
            const label = type.charAt(0).toUpperCase() + type.slice(1)
            typeBienCounts[label] = (typeBienCounts[label] || 0) + 1
        })

        // Localisations
        r.localisation.forEach(loc => {
            localisationCounts[loc] = (localisationCounts[loc] || 0) + 1
        })

        // Financement
        if (r.financement) {
            const label = r.financement.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            financementCounts[label] = (financementCounts[label] || 0) + 1
        }

        // Budget
        if (r.prixMax && r.prixMax > 0) {
            totalPrixMax += r.prixMax
            prixMaxCount++
            budgets.push(r.prixMax)
        }

        // Surface
        if (r.surfaceMin && r.surfaceMin > 0) {
            totalSurface += r.surfaceMin
            surfaceCount++
            if (r.surfaceMin < minSurface) minSurface = r.surfaceMin
            if (r.surfaceMin > maxSurface) maxSurface = r.surfaceMin
        }
        if (r.surfaceMax && r.surfaceMax > 0) {
            totalSurface += r.surfaceMax
            surfaceCount++
            if (r.surfaceMax > maxSurface) maxSurface = r.surfaceMax
        }

        // Nombre de pièces
        if (r.nombrePieces && r.nombrePieces.length > 0) {
            r.nombrePieces.forEach(p => {
                const label = p.includes('+') ? p : `${p} pièces`
                piecesCounts[label] = (piecesCounts[label] || 0) + 1
            })
        }

        // Characteristics (JSON)
        const car = parseCaracteristiques(r.caracteristiques)

        if (car.situationFamiliale) {
            const label = car.situationFamiliale.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
            situationFamilialeCounts[label] = (situationFamilialeCounts[label] || 0) + 1
        }
        if (car.situationProfessionnelle) {
            const label = car.situationProfessionnelle.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
            situationProCounts[label] = (situationProCounts[label] || 0) + 1
        }

        if (car.salaire) salaireCounts[car.salaire] = (salaireCounts[car.salaire] || 0) + 1
        if (car.patrimoine) patrimoineCounts[car.patrimoine] = (patrimoineCounts[car.patrimoine] || 0) + 1
        if (car.apport) apportCounts[car.apport] = (apportCounts[car.apport] || 0) + 1

        if (car.balcon) ammenities.Balcon++
        if (car.terrasse) ammenities.Terrasse++
        if (car.jardin) ammenities.Jardin++
        if (car.parking) ammenities.Parking++
        if (car.cave) ammenities.Cave++
        if (car.ascenseur) ammenities.Ascenseur++

        if (car.delaiRecherche) {
            const label = car.delaiRecherche.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
            delaiCounts[label] = (delaiCounts[label] || 0) + 1
        }
    })

    // Convert to StatItem arrays
    const toStatItems = (obj: Record<string, number>, limit = 10) =>
        Object.entries(obj)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([name, value]) => ({
                name,
                value,
                percentage: totalRecherches > 0 ? Math.round((value / totalRecherches) * 100) : 0
            }))

    const avgBudget = prixMaxCount > 0 ? Math.round(totalPrixMax / prixMaxCount) : 0
    const avgSurface = surfaceCount > 0 ? Math.round(totalSurface / surfaceCount) : 0

    // Budget distribution by ranges
    const budgetRanges = [
        { label: '< 100k', min: 0, max: 100000 },
        { label: '100k-200k', min: 100000, max: 200000 },
        { label: '200k-350k', min: 200000, max: 350000 },
        { label: '350k-500k', min: 350000, max: 500000 },
        { label: '500k-750k', min: 500000, max: 750000 },
        { label: '750k-1M', min: 750000, max: 1000000 },
        { label: '1M-2M', min: 1000000, max: 2000000 },
        { label: '> 2M', min: 2000000, max: Infinity },
    ]

    const budgetDistribution = budgetRanges
        .map(range => {
            const count = budgets.filter(b => b >= range.min && b < range.max).length
            return {
                name: range.label,
                value: count,
                percentage: totalRecherches > 0 ? Math.round((count / totalRecherches) * 100) : 0
            }
        })
        .filter(d => d.value > 0)

    return {
        totalRecherches,
        avgBudget,
        surfaceStats: {
            min: minSurface === Infinity ? 0 : Math.round(minSurface),
            max: Math.round(maxSurface),
            avg: avgSurface
        },
        typesBien: toStatItems(typeBienCounts),
        localisations: toStatItems(localisationCounts),
        financements: toStatItems(financementCounts),
        situationsFam: toStatItems(situationFamilialeCounts),
        situationsPro: toStatItems(situationProCounts),
        salaires: toStatItems(salaireCounts),
        patrimoines: toStatItems(patrimoineCounts),
        apports: toStatItems(apportCounts),
        features: Object.entries(ammenities)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({
                name,
                value,
                percentage: totalRecherches > 0 ? Math.round((value / totalRecherches) * 100) : 0
            })),
        delais: toStatItems(delaiCounts),
        budgetDistribution,
        piecesDistribution: toStatItems(piecesCounts),
    }
}

export default async function StatistiquesPage() {
    const stats = await getQuestionnaireStats()

    return (
        <div className="space-y-8 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/dashboard"
                        className="h-10 w-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100/50 shadow-sm">
                            <PieChart className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Intelligence Acquéreurs</h1>
                            <p className="text-slate-500 font-medium text-sm mt-0.5">
                                Analyse 360° de {stats.totalRecherches} recherches actives
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* No data state */}
            {stats.totalRecherches === 0 ? (
                <div className="bg-white/50 backdrop-blur-sm border-dashed border-2 border-slate-300 rounded-2xl py-20 text-center">
                    <PieChart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium text-lg">Aucune donnée de recherche encore disponible.</p>
                    <p className="text-slate-400 text-sm mt-2">Les statistiques apparaîtront dès que des acquéreurs rempliront le questionnaire.</p>
                </div>
            ) : (
                <StatsCharts {...stats} />
            )}
        </div>
    )
}
