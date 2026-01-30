
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple middleware to check for admin session
// Note: In a real production app with NextAuth, you decode the token.
// Here we are using a custom cookie implementation.

export function middleware(request: NextRequest) {
    // Check if accessing admin routes (excluding login)
    if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {

        // Get the session cookie
        const sessionCookie = request.cookies.get('immocible_session_v3')

        // If no session, redirect to login
        if (!sessionCookie) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        // Note: We cannot verify the database session in Middleware (Edge Runtime).
        // So we rely on the checking of the cookie existence here, 
        // and let the Page/Layout handle the actual Role validation via DB calls.
        // However, since we want to prevent *visibility*, strictly speaking we usually
        // verify the token. 

        // For now, this prevents casual access. 
        // The Layout should double-check the user role.
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
