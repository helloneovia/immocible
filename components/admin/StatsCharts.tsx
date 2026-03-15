'use client'

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'

const COLORS = ['#f59e0b', '#1e293b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899']
const PASTEL_COLORS = ['#fbbf24', '#334155', '#60a5fa', '#34d399', '#a78bfa', '#f87171', '#22d3ee', '#f472b6']

interface StatItem {
    name: string
    value: number
    percentage: number
}

interface StatsChartsProps {
    typesBien: StatItem[]
    financements: StatItem[]
    situationsFam: StatItem[]
    situationsPro: StatItem[]
    salaires: StatItem[]
    patrimoines: StatItem[]
    apports: StatItem[]
    features: StatItem[]
    delais: StatItem[]
    localisations: StatItem[]
    totalRecherches: number
    avgBudget: number
    budgetDistribution: StatItem[]
    surfaceStats: { min: number; max: number; avg: number }
    piecesDistribution: StatItem[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-xl">
                <p className="font-bold text-slate-900 text-sm">{payload[0].name || label}</p>
                <p className="text-amber-600 font-semibold text-sm">{payload[0].value} recherches</p>
                {payload[0].payload?.percentage !== undefined && (
                    <p className="text-slate-500 text-xs">{payload[0].payload.percentage}%</p>
                )}
            </div>
        )
    }
    return null
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold" style={{ fontSize: '11px', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    )
}

function ChartCard({ title, icon, children, className = '', span = '' }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string; span?: string }) {
    return (
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${span} ${className}`}>
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <h3 className="flex items-center gap-2.5 text-base font-bold text-slate-800 tracking-tight">
                    {icon}
                    {title}
                </h3>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    )
}

function StatLegend({ data, colors = COLORS }: { data: StatItem[]; colors?: string[] }) {
    return (
        <div className="space-y-2 mt-4">
            {data.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                        <span className="text-slate-700 font-medium truncate">{item.name}</span>
                    </div>
                    <span className="text-slate-500 font-mono text-xs shrink-0 ml-2">{item.value} ({item.percentage}%)</span>
                </div>
            ))}
        </div>
    )
}

function EnhancedBar({ data, color = '#f59e0b' }: { data: StatItem[]; color?: string }) {
    return (
        <div className="space-y-3">
            {data.map((item, i) => (
                <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                        <span className="font-semibold text-slate-700">{item.name}</span>
                        <span className="text-slate-500 font-mono text-xs">{item.percentage}% ({item.value})</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                                width: `${item.percentage}%`,
                                background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[i % COLORS.length]}cc)`
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function StatsCharts(props: StatsChartsProps) {
    const {
        typesBien, financements, situationsFam, situationsPro,
        salaires, patrimoines, apports, features, delais, localisations,
        totalRecherches, avgBudget, budgetDistribution, surfaceStats, piecesDistribution
    } = props

    return (
        <div className="space-y-8">

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/20">
                    <p className="text-amber-100 text-xs font-bold uppercase tracking-widest">Recherches Actives</p>
                    <p className="text-3xl font-bold mt-2 tracking-tight">{totalRecherches}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg shadow-slate-800/20">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Budget Moyen</p>
                    <p className="text-3xl font-bold mt-2 tracking-tight">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(avgBudget)}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Surface Moy.</p>
                    <p className="text-3xl font-bold mt-2 tracking-tight">{surfaceStats.avg > 0 ? `${surfaceStats.avg} m²` : 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Top Localisation</p>
                    <p className="text-xl font-bold mt-2 tracking-tight truncate">{localisations[0]?.name || 'N/A'}</p>
                </div>
            </div>

            {/* Row 1: Pie Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Types de Biens - Pie */}
                <ChartCard title="Types de Biens" icon={<span className="text-amber-500">🏠</span>}>
                    {typesBien.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={typesBien}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                    >
                                        {typesBien.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <StatLegend data={typesBien} />
                        </>
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-8">Aucune donnée</p>
                    )}
                </ChartCard>

                {/* Financement - Pie */}
                <ChartCard title="Sources de Financement" icon={<span className="text-emerald-500">💰</span>}>
                    {financements.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={financements}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                    >
                                        {financements.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <StatLegend data={financements} />
                        </>
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-8">Non renseigné</p>
                    )}
                </ChartCard>

                {/* Situation Familiale - Pie */}
                <ChartCard title="Situation Familiale" icon={<span className="text-pink-500">❤️</span>}>
                    {situationsFam.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={situationsFam}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                    >
                                        {situationsFam.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <StatLegend data={situationsFam} />
                        </>
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-8">Non renseigné</p>
                    )}
                </ChartCard>
            </div>

            {/* Row 2: Bar Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Localisations - Horizontal Bar */}
                <ChartCard title="Top Localisations" icon={<span className="text-blue-500">📍</span>}>
                    {localisations.length > 0 ? (
                        <ResponsiveContainer width="100%" height={Math.max(200, localisations.length * 45)}>
                            <BarChart data={localisations} layout="vertical" margin={{ left: 10, right: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fontWeight: 600, fill: '#475569' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                                    {localisations.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-8">Aucune donnée</p>
                    )}
                </ChartCard>

                {/* Budget Distribution - Bar */}
                <ChartCard title="Distribution des Budgets" icon={<span className="text-amber-500">€</span>}>
                    {budgetDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={budgetDistribution} margin={{ bottom: 20 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600, fill: '#475569' }} angle={-30} textAnchor="end" height={60} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={32}>
                                    {budgetDistribution.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-8">Non renseigné</p>
                    )}
                </ChartCard>
            </div>

            {/* Row 3: Finances Detaillées */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <ChartCard title="Salaires" icon={<span className="text-slate-500">💵</span>}>
                    {salaires.length > 0 ? (
                        <EnhancedBar data={salaires} />
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-8">Non renseigné</p>
                    )}
                </ChartCard>

                <ChartCard title="Apports Personnels" icon={<span className="text-blue-500">🏦</span>}>
                    {apports.length > 0 ? (
                        <EnhancedBar data={apports} />
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-8">Non renseigné</p>
                    )}
                </ChartCard>

                <ChartCard title="Patrimoine" icon={<span className="text-purple-500">🏛️</span>}>
                    {patrimoines.length > 0 ? (
                        <EnhancedBar data={patrimoines} />
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-8">Non renseigné</p>
                    )}
                </ChartCard>
            </div>

            {/* Row 4: Features Radar + Profession + Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Features - Radar Chart */}
                <ChartCard title="Prestations Recherchées" icon={<span className="text-cyan-500">✨</span>}>
                    {features.filter(f => f.value > 0).length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={260}>
                                <RadarChart data={features.filter(f => f.value > 0)} cx="50%" cy="50%" outerRadius="70%">
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} />
                                    <PolarRadiusAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <Radar name="Demandes" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} strokeWidth={2} />
                                    <Tooltip content={<CustomTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                            <StatLegend data={features.filter(f => f.value > 0)} />
                        </>
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-8">Aucune donnée</p>
                    )}
                </ChartCard>

                {/* Profession - Pie */}
                <ChartCard title="Situation Professionnelle" icon={<span className="text-indigo-500">💼</span>}>
                    {situationsPro.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={situationsPro}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                    >
                                        {situationsPro.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <StatLegend data={situationsPro} />
                        </>
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-8">Non renseigné</p>
                    )}
                </ChartCard>

                {/* Urgence */}
                <ChartCard title="Délai de Recherche" icon={<span className="text-red-500">⏰</span>}>
                    {delais.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={delais}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                    >
                                        {delais.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <StatLegend data={delais} />
                        </>
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-8">Non renseigné</p>
                    )}
                </ChartCard>
            </div>

            {/* Row 5: Number of rooms */}
            {piecesDistribution.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Nombre de Pièces Recherchées" icon={<span className="text-violet-500">🚪</span>}>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={piecesDistribution}>
                                <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600, fill: '#475569' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                                    {piecesDistribution.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            )}
        </div>
    )
}
