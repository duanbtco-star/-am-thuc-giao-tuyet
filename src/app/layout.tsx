import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { PWAInstallPrompt, OfflineIndicator } from '@/components/PWAPrompt'

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#3b82f6',
}

export const metadata: Metadata = {
    title: 'ẨM THỰC GIÁO TUYẾT | Dịch Vụ Nấu Ăn Tiệc Tại Nhà',
    description: 'Dịch vụ nấu ăn tiệc tại nhà chuyên nghiệp - Thôi nôi, Đám cưới, Đám hỏi, Đám dỗ. Thực đơn đa dạng, đội ngũ đầu bếp kinh nghiệm.',
    keywords: ['nấu ăn tiệc', 'tiệc tại nhà', 'thôi nôi', 'đám cưới', 'đám hỏi', 'dịch vụ nấu ăn'],
    authors: [{ name: 'ẨM THỰC GIÁO TUYẾT' }],
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Giáo Tuyết',
    },
    openGraph: {
        title: 'ẨM THỰC GIÁO TUYẾT | Dịch Vụ Nấu Ăn Tiệc Tại Nhà',
        description: 'Dịch vụ nấu ăn tiệc tại nhà chuyên nghiệp',
        type: 'website',
        locale: 'vi_VN',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="vi">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
            </head>
            <body className="antialiased">
                <OfflineIndicator />
                <Providers>
                    {children}
                </Providers>
                <PWAInstallPrompt />
            </body>
        </html>
    )
}
