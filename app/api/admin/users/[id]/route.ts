
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

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'admin') {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const { id } = params

        // Vérifier que l'utilisateur existe et n'est pas admin
        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) {
            return new NextResponse("Utilisateur introuvable", { status: 404 })
        }
        if (user.role === 'admin') {
            return new NextResponse("Impossible de supprimer un administrateur", { status: 403 })
        }

        // Suppression dans une transaction pour garantir l'intégrité
        await prisma.$transaction(async (tx) => {
            // 1. Supprimer les UnlockedProfile où l'utilisateur est agence ou acheteur
            //    (ces relations n'ont pas de onDelete: Cascade dans le schema)
            await tx.unlockedProfile.deleteMany({
                where: { OR: [{ agencyId: id }, { buyerId: id }] }
            })

            // 2. Supprimer les messages envoyés par cet utilisateur
            //    (Message.sender n'a pas de onDelete: Cascade)
            await tx.message.deleteMany({
                where: { senderId: id }
            })

            // 3. Supprimer l'utilisateur (les autres relations ont onDelete: Cascade)
            await tx.user.delete({ where: { id } })
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Admin Delete User]', error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

