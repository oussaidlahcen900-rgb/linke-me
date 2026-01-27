import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // 🛡️ Security Headers
    // Prevent clickjacking (site being embedded in iframe)
    response.headers.set('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Control information leakage in Referer header
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Enforce HTTPS HSTS (Optional for localhost, good for prod)
    // response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

    // Basic XSS Protection (Browsers handle this mostly now, but good practice)
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
