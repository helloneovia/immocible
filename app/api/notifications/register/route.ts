import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, platform, userId } = body;

    if (!token || !userId) {
      return NextResponse.json({ error: 'Missing token or userId' }, { status: 400 });
    }

    // Upsert the token so we don't have duplicates
    const deviceToken = await prisma.deviceToken.upsert({
      where: {
        token: token,
      },
      update: {
        userId: userId,
        platform: platform || 'unknown',
        updatedAt: new Date()
      },
      create: {
        userId: userId,
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
