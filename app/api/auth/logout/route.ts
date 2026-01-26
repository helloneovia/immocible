
import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  // Delete session
  await deleteSession()

  // Redirect to home/login
  const url = request.nextUrl.clone()
  url.pathname = '/admin/login' // Default redirect

  return NextResponse.redirect(url)
}

export async function GET(request: NextRequest) {
  await deleteSession()
  return NextResponse.redirect(new URL('/', request.url))
}
