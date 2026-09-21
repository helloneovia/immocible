import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getT } from '@/lib/i18n/server'
import { parseNonNegativeNumber } from '@/lib/validation'

export async function GET(request: NextRequest) {
  const t = getT()
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: t('api.common.notAuthenticated') },
        { status: 401 }
      )
    }

    if (user.role !== 'agence') {
      return NextResponse.json(
        { error: t('api.common.forbidden') },
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
      { error: t('api.agency.biensFailed') },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const t = getT()
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: t('api.common.notAuthenticated') },
        { status: 401 }
      )
    }

    if (user.role !== 'agence') {
      return NextResponse.json(
        { error: t('api.common.forbidden') },
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
        { error: t('api.agency.missingFields') },
        { status: 400 }
      )
    }

    const prixValue = parseNonNegativeNumber(prix)
    const surfaceValue = parseNonNegativeNumber(surface)
    if (!prixValue || !surfaceValue) {
      return NextResponse.json({ error: t('api.validation.invalidNumber') }, { status: 400 })
    }
    if (!/^\d{5}$/.test(String(codePostal).trim())) {
      return NextResponse.json({ error: t('api.validation.postalCode') }, { status: 400 })
    }

    // Create bien
    const bien = await prisma.bien.create({
      data: {
        ownerId: user.id,
        titre,
        description,
        typeBien,
        prix: prixValue,
        surface: surfaceValue,
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
      { error: error.message || t('api.agency.createBienFailed') },
      { status: 500 }
    )
  }
}
