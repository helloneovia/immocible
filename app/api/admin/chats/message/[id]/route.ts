import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.message.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true })
    } catch (e) {
        console.error("Error deleting message:", e)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { content } = body

        if (typeof content !== 'string') {
            return NextResponse.json({ error: 'Content must be a string' }, { status: 400 })
        }

        const updatedMessage = await prisma.message.update({
            where: { id: params.id },
            data: { content }
        })

        return NextResponse.json(updatedMessage)
    } catch (e) {
        console.error("Error updating message:", e)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
