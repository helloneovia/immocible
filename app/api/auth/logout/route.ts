import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    await deleteSession()

    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
