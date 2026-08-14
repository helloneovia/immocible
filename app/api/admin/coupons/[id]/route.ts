import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/api-auth'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        await prisma.coupon.delete({ where: { id: params.id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    try {
        const body = await req.json()
        const coupon = await prisma.coupon.update({
            where: { id: params.id },
            data: {
                isActive: body.isActive
            }
        })
        return NextResponse.json(coupon)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
    }
}
