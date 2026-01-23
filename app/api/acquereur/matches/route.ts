import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { calculateMatchScore } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (user.role !== 'acquereur') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get user's active recherches
    const recherches = await prisma.recherche.findMany({
      where: {
        ownerId: user.id,
        isActive: true,
      },
    })

    // Get all available biens
    const biens = await prisma.bien.findMany({
      where: {
        status: 'disponible',
      },
      include: {
        owner: {
          include: {
            profile: true,
          },
        },
      },
    })

    // Calculate matches
    const matches = []
    for (const recherche of recherches) {
      for (const bien of biens) {
        const matchResult = calculateMatchScore(recherche, bien)
        
        if (matchResult.score > 0) {
          // Check if match already exists
          const existingMatch = await prisma.match.findUnique({
            where: {
              userId_bienId: {
                userId: user.id,
                bienId: bien.id,
              },
            },
          })

          if (!existingMatch) {
            // Create match
            await prisma.match.create({
              data: {
                userId: user.id,
                bienId: bien.id,
                rechercheId: recherche.id,
                score: matchResult.score,
                raisons: matchResult.raisons,
                suggestions: matchResult.suggestions,
              },
            })
          }

          matches.push({
            bien: {
              ...bien,
              owner: undefined, // Remove owner details for security
            },
            score: matchResult.score,
            raisons: matchResult.raisons,
            suggestions: matchResult.suggestions,
          })
        }
      }
    }

    // Get existing matches from database
    const existingMatches = await prisma.match.findMany({
      where: {
        userId: user.id,
      },
      include: {
        bien: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        score: 'desc',
      },
    })

    return NextResponse.json({ matches: existingMatches }, { status: 200 })
  } catch (error: any) {
    console.error('Get matches error:', error)
    return NextResponse.json(
      { error: 'Failed to get matches' },
      { status: 500 }
    )
  }
}
