import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { getT } from '@/lib/i18n/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const t = getT()
  try {
    const user = await getCurrentUser()
    console.log('API /auth/me: Checking session', user ? `User found: ${user.id}` : 'No user found')

    if (!user) {
      return NextResponse.json(
        { error: t('api.common.notAuthenticated') },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { user },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { error: t('api.auth.getUserFailed') },
      { status: 500 }
    )
  }
}
