import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/api-auth'

export async function GET() {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(coupons)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    try {
        const body = await req.json()
        const { code, discountType, discountValue, durationMonths, maxUses, planType, validUntil } = body

        if (!code || !discountType || !discountValue) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const coupon = await prisma.coupon.create({
            data: {
                code,
                discountType,
                discountValue: Number(discountValue),
                durationMonths: durationMonths ? Number(durationMonths) : null,
                maxUses: maxUses ? Number(maxUses) : null,
                planType: planType === 'all' ? null : planType,
                validUntil: validUntil ? new Date(validUntil) : null,
            }
        })
        return NextResponse.json(coupon)
    } catch (error) {
        console.error("Error creating coupon:", error)
        return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
    }
}
