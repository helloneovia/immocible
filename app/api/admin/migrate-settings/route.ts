import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        // Delete old price_unlock_profile setting
        await prisma.systemSetting.deleteMany({
            where: {
                key: 'price_unlock_profile'
            }
        })

        return Response.json({ success: true, message: 'Old settings removed' })
    } catch (e: any) {
        return Response.json({ error: e.message }, { status: 500 })
    }
}
