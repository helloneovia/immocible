
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const settings = await prisma.systemSetting.findMany({
            orderBy: { key: 'asc' }
        })

        // Transform to object for easier consumption if needed, 
        // but array is good for admin table.
        // Let's return the array.
        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { updates } = body // Expecting [{ key, value }, ...]

        if (!Array.isArray(updates)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
        }

        const results = []
        for (const update of updates) {
            const { key, value } = update
            const setting = await prisma.systemSetting.update({
                where: { key },
                data: { value: String(value) }
            })
            results.push(setting)
        }

        return NextResponse.json({ success: true, settings: results })
    } catch (error) {
        console.error('Error updating settings:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
