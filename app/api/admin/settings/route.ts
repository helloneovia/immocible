
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

        const results = []
        for (const update of updates) {
            const { key, value } = update

            if (!key) {
                console.error('Missing key in update:', update)
                continue
            }

            console.log(`Updating setting: ${key} = ${value}`)

            try {
                const setting = await prisma.systemSetting.update({
                    where: { key },
                    data: { value: String(value) }
                })
                results.push(setting)
            } catch (updateError: any) {
                console.error(`Error updating setting ${key}:`, updateError.message)
                // Continue with other updates even if one fails
            }
        }

        console.log(`Successfully updated ${results.length} settings`)
        return NextResponse.json({ success: true, settings: results })
    } catch (error: any) {
        console.error('Error updating settings:', error)
        console.error('Error stack:', error.stack)
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 })
    }
}
