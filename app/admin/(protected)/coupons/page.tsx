import { prisma } from '@/lib/prisma'
import CouponsClient from './CouponsClient'

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'

export default async function CouponsPage() {
    // Check if user is admin (Assuming middleware handles protection, but extra safety check is good)
    // In a real app we'd check session here too, but let's rely on Layout/Middleware for now

    const coupons = await prisma.coupon.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    })

    // Serializing dates for Client Component
    const formattedCoupons = coupons.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        validUntil: c.validUntil ? c.validUntil.toISOString() : undefined,
        validFrom: c.validFrom ? c.validFrom.toISOString() : undefined
    }))

    return <CouponsClient initialCoupons={formattedCoupons as any} />
}
