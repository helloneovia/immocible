import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrackingCharts } from './TrackingCharts'

export const dynamic = 'force-dynamic'

export default async function TrackingPage() {
    // Analytics gathering
    const totalVisitors = await prisma.visitorLog.count()
    const uniqueSessionsRaw = await prisma.visitorLog.groupBy({ by: ['sessionId'] })
    const uniqueSessions = uniqueSessionsRaw.length
    
    // Aggregations
    const roleStats = await prisma.visitorLog.groupBy({ by: ['role'], _count: { _all: true } })
    const deviceStats = await prisma.visitorLog.groupBy({ by: ['device'], _count: { _all: true } })
    const browserStats = await prisma.visitorLog.groupBy({ by: ['browser'], _count: { _all: true }, orderBy: { _count: { id: 'desc' } }, take: 10 })
    const countryStats = await prisma.visitorLog.groupBy({ by: ['country'], _count: { _all: true }, orderBy: { _count: { id: 'desc' } }, take: 10 })
    
    const referrers = await prisma.visitorLog.groupBy({ 
        by: ['referrer'], 
        _count: { _all: true }, 
        orderBy: { _count: { id: 'desc' } }, 
        take: 15 
    })

    const roleData = roleStats.map(r => ({ role: r.role || 'Inconnu', count: r._count._all }))
    const deviceData = deviceStats.map(r => ({ device: r.device || 'Inconnu', count: r._count._all }))
    const browserData = browserStats.map(r => ({ browser: r.browser || 'Inconnu', count: r._count._all }))
    const countryData = countryStats.map(r => ({ country: r.country || 'Inconnu', count: r._count._all }))

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tracking & Analytics</h1>
                <p className="text-slate-500 mt-2">Analysez l'origine de vos visiteurs et les statistiques de navigation en temps réel.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="shadow-sm border-slate-100 bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pages Vues (Total)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-extrabold text-slate-900">{totalVisitors}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100 bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sessions Uniques</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-extrabold text-slate-900">{uniqueSessions}</div>
                    </CardContent>
                </Card>
            </div>

            <TrackingCharts 
                roleData={roleData} 
                deviceData={deviceData} 
                browserData={browserData} 
                countryData={countryData} 
            />

            <Card className="shadow-sm border-slate-100">
                <CardHeader>
                    <CardTitle className="text-lg">Top Sites Référents (Provenance)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {referrers.filter(r => r.referrer && r.referrer.trim() !== "").map((r, i) => (
                            <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                <span className="text-sm font-medium text-slate-700 truncate max-w-xl" title={r.referrer || ''}>
                                    {r.referrer}
                                </span>
                                <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-semibold">
                                    {r._count._all} visites
                                </span>
                            </div>
                        ))}
                        {referrers.filter(r => r.referrer && r.referrer.trim() !== "").length === 0 && (
                            <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                                <p className="text-sm font-medium">Aucun référent détecté pour le moment.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
