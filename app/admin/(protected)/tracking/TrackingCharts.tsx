'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export function TrackingCharts({ 
    roleData, 
    deviceData, 
    browserData, 
    countryData 
}: { 
    roleData: any[], 
    deviceData: any[], 
    browserData: any[], 
    countryData: any[] 
}) {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            <Card className="shadow-sm border-slate-100">
                <CardHeader>
                    <CardTitle className="text-lg">Répartition par Rôle</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={roleData} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={100} label>
                                {roleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-100">
                <CardHeader>
                    <CardTitle className="text-lg">Navigateurs Utilisés</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={browserData} dataKey="count" nameKey="browser" cx="50%" cy="50%" outerRadius={100} label>
                                {browserData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-100">
                <CardHeader>
                    <CardTitle className="text-lg">Appareils</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deviceData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                            <XAxis type="number" />
                            <YAxis dataKey="device" type="category" width={80} tick={{fill: '#64748b'}} />
                            <Tooltip cursor={{fill: '#F1F5F9'}} />
                            <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-100">
                <CardHeader>
                    <CardTitle className="text-lg">Pays d'Origine</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={countryData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                            <XAxis type="number" />
                            <YAxis dataKey="country" type="category" width={80} tick={{fill: '#64748b'}} />
                            <Tooltip cursor={{fill: '#F1F5F9'}} />
                            <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
