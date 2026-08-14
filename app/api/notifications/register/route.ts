import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function POST(req: Request) {
  // Le token d'appareil est rattaché à l'utilisateur AUTHENTIFIÉ, jamais à un
  // userId fourni par le client (sinon on peut détourner les notifications d'autrui).
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const { token, platform } = body;

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    // Upsert the token so we don't have duplicates
    const deviceToken = await prisma.deviceToken.upsert({
      where: {
        token: token,
      },
      update: {
        userId: user.id,
        platform: platform || 'unknown',
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        token: token,
        platform: platform || 'unknown'
      }
    });

    return NextResponse.json({ success: true, deviceToken });
  } catch (error: any) {
    console.error('Error registering device token:', error);
    return NextResponse.json({ error: 'Failed to register token' }, { status: 500 });
  }
}
