import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    // Check if Supabase credentials are configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If credentials are not configured, skip authentication (development mode)
    if (!supabaseUrl || !supabaseAnonKey ||
        supabaseUrl === 'https://xxxxxxxxx.supabase.co' ||
        supabaseAnonKey.includes('xxxxx')) {
        // No auth configured - allow all routes
        return NextResponse.next()
    }

    let response = NextResponse.next({
        request: {
            headers: req.headers,
        },
    })

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    get(name: string) {
                        return req.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        req.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                        response = NextResponse.next({
                            request: {
                                headers: req.headers,
                            },
                        })
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                    },
                    remove(name: string, options: CookieOptions) {
                        req.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                        response = NextResponse.next({
                            request: {
                                headers: req.headers,
                            },
                        })
                        response.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                    },
                },
            }
        )

        const { data: { session } } = await supabase.auth.getSession()

        // Protected routes - redirect to login if not authenticated
        const protectedPaths = [
            '/',
            '/bao-gia',
            '/don-hang',
            '/lich',
            '/tai-chinh',
            '/vendor',
            '/bao-cao',
        ]

        const isProtectedPath = protectedPaths.some(path =>
            req.nextUrl.pathname === path ||
            req.nextUrl.pathname.startsWith(path + '/')
        )

        // If accessing protected route without session, redirect to login
        if (isProtectedPath && !session) {
            const redirectUrl = new URL('/login', req.url)
            redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
            return NextResponse.redirect(redirectUrl)
        }

        // If accessing login with session, redirect to home
        if (req.nextUrl.pathname === '/login' && session) {
            return NextResponse.redirect(new URL('/', req.url))
        }
    } catch (error) {
        // If Supabase fails, allow the request to continue (graceful degradation)
        console.error('Middleware auth error:', error)
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
    ],
}
