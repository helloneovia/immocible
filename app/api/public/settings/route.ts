import { NextResponse } from 'next/server'
import { getAppSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const settings = await getAppSettings()
        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error fetching public settings:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
