import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

const SETTING_KEY = 'chat_sensitive_words'

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const setting = await prisma.systemSetting.findUnique({
            where: { key: SETTING_KEY }
        })

        let words: string[] = []
        if (setting && setting.value) {
            try {
                words = JSON.parse(setting.value)
            } catch (e) {
                // If parsing fails (maybe stored as simple string previously?), return empty or split by comma if appropriate
                // For now safely return empty array
                words = []
            }
        }

        return NextResponse.json({ words })
    } catch (e) {
        console.error("Error fetching chat settings:", e)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { words } = body

        if (!Array.isArray(words)) {
            return NextResponse.json({ error: 'Words must be an array' }, { status: 400 })
        }

        await prisma.systemSetting.upsert({
            where: { key: SETTING_KEY },
            update: {
                value: JSON.stringify(words),
                type: 'json'
            },
            create: {
                key: SETTING_KEY,
                value: JSON.stringify(words),
                type: 'json',
                label: 'Mots Interdits',
                description: 'Liste des mots sensibles surveillés dans le chat'
            }
        })

        return NextResponse.json({ success: true })
    } catch (e) {
        console.error("Error saving chat settings:", e)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
