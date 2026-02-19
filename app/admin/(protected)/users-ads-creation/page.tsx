import { prisma } from '@/lib/prisma'
import BotDashboard from '@/components/admin/BotDashboard'

export const dynamic = 'force-dynamic'

export default async function UsersAdsCreationPage() {
    const accounts = await prisma.botAccount.findMany({
        orderBy: { createdAt: 'desc' },
        include: { ads: true }
    })

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Users & Ads Automation</h1>
            </div>
            <BotDashboard initialAccounts={accounts} />
        </div>
    )
}
