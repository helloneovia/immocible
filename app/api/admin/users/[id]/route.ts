
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'admin') {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const body = await req.json()
        const { id } = params

        const {
            nom,
            prenom,
            email,
            nomAgence,
            plan,
            subscriptionStatus,
            subscriptionEndDate
        } = body

        // 1. Update User (Email)
        await prisma.user.update({
            where: { id },
            data: { email }
        })

        // 2. Update Profile
        await prisma.profile.update({
            where: { userId: id },
            data: {
                nom,
                prenom,
                nomAgence: nomAgence || undefined,
                plan: plan || undefined,
                subscriptionStatus: subscriptionStatus || undefined,
                subscriptionEndDate: subscriptionEndDate ? new Date(subscriptionEndDate) : undefined
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Admin Update User]', error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
