import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { LEGAL_LAST_UPDATED_KEY } from '@/lib/legal'

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
            console.error('Unauthorized settings update attempt')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        console.log('Settings update request body:', body)

        const { updates } = body // Expecting [{ key, value }, ...]

        if (!Array.isArray(updates)) {
            console.error('Invalid data format - updates is not an array:', updates)
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
        }

        // Valeurs légales modifiées : on date la mise à jour affichée sur les pages légales.
        const legalUpdates = updates.filter((u: any) => typeof u.key === 'string' && u.key.startsWith('legal_') && u.key !== LEGAL_LAST_UPDATED_KEY)
        let legalChanged = false
        if (legalUpdates.length > 0) {
            const current = await prisma.systemSetting.findMany({ where: { key: { in: legalUpdates.map((u: any) => u.key) } } })
            const currentValues = new Map(current.map(row => [row.key, row.value]))
            legalChanged = legalUpdates.some((u: any) => currentValues.get(u.key) !== String(u.value))
        }

        const results = await Promise.all(
            updates
                .filter(update => update.key)
                .map(async (update) => {
                    const { key, value } = update
                    console.log(`Updating setting: ${key} = ${value}`)
                    try {
                        return await prisma.systemSetting.update({
                            where: { key },
                            data: { value: String(value) }
                        })
                    } catch (updateError: any) {
                        console.error(`Error updating setting ${key}:`, updateError.message)
                        return null
                    }
                })
        )
        const successfulResults = results.filter(Boolean)

        if (legalChanged) {
            const now = new Date().toISOString()
            await prisma.systemSetting.upsert({
                where: { key: LEGAL_LAST_UPDATED_KEY },
                update: { value: now },
                create: { key: LEGAL_LAST_UPDATED_KEY, value: now, type: 'string', label: 'Date de mise à jour des pages légales' },
            })
        }

        console.log(`Successfully updated ${successfulResults.length} settings`)

        // Invalidate cache
        revalidateTag('settings')

        return NextResponse.json({ success: true, settings: successfulResults })
    } catch (error: any) {
        console.error('Error updating settings:', error)
        console.error('Error stack:', error.stack)
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 })
    }
}
