import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/api-auth'

export async function POST(req: Request) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        // Delete old price_unlock_profile setting
        await prisma.systemSetting.deleteMany({
            where: {
                key: 'price_unlock_profile'
            }
        })

        return Response.json({ success: true, message: 'Old settings removed' })
    } catch (e: any) {
        console.error('migrate-settings error:', e)
        return Response.json({ error: 'Migration échouée' }, { status: 500 })
    }
}
