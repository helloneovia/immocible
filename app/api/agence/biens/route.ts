import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (user.role !== 'agence') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get all biens for this agence
    const biens = await prisma.bien.findMany({
      where: {
        ownerId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ biens }, { status: 200 })
  } catch (error: any) {
    console.error('Get biens error:', error)
    return NextResponse.json(
      { error: 'Failed to get biens' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (user.role !== 'agence') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      titre,
      description,
      typeBien,
      prix,
      surface,
      nombrePieces,
      nombreChambres,
      adresse,
      ville,
      codePostal,
      quartier,
      images,
      caracteristiques,
    } = body

    // Validation
    if (!titre || !typeBien || !prix || !surface || !adresse || !ville || !codePostal) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create bien
    const bien = await prisma.bien.create({
      data: {
        ownerId: user.id,
        titre,
        description,
        typeBien,
        prix: parseFloat(prix),
        surface: parseFloat(surface),
        nombrePieces: nombrePieces ? parseInt(nombrePieces) : null,
        nombreChambres: nombreChambres ? parseInt(nombreChambres) : null,
        adresse,
        ville,
        codePostal,
        quartier: quartier || null,
        images: images || [],
        caracteristiques: caracteristiques || null,
      },
    })

    return NextResponse.json({ bien }, { status: 201 })
  } catch (error: any) {
    console.error('Create bien error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create bien' },
      { status: 500 }
    )
  }
}
