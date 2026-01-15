import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Apple-inspired palette
                primary: {
                    DEFAULT: '#1d1d1f',
                    light: '#f5f5f7',
                },
                accent: {
                    DEFAULT: '#ff4d4f',
                    gold: '#d4af37',
                    hover: '#ff7875',
                },
                background: {
                    DEFAULT: '#ffffff',
                    light: '#fbfbfd',
                    glass: 'rgba(255, 255, 255, 0.72)',
                },
                text: {
                    primary: '#1d1d1f',
                    secondary: '#86868b',
                    link: '#06c',
                },
            },
            fontFamily: {
                sans: [
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'SF Pro Display',
                    'SF Pro Text',
                    'Segoe UI',
                    'Roboto',
                    'sans-serif',
                ],
            },
            fontSize: {
                'hero': ['96px', { lineHeight: '1.05', letterSpacing: '-0.015em', fontWeight: '600' }],
                'headline': ['64px', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '600' }],
                'title': ['40px', { lineHeight: '1.2', letterSpacing: '-0.005em', fontWeight: '600' }],
                'subtitle': ['28px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }],
                'body-lg': ['21px', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '400' }],
                'body': ['17px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
                'caption': ['14px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '400' }],
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out',
                'fade-up': 'fadeUp 0.8s ease-out',
                'scale-in': 'scaleIn 0.4s ease-out',
                'slide-in-right': 'slideInRight 0.5s ease-out',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(30px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'apple': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'apple-lg': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                'apple-xl': '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
                'glow': '0 0 60px rgba(255, 77, 79, 0.3)',
            },
            transitionTimingFunction: {
                'apple': 'cubic-bezier(0.4, 0, 0.2, 1)',
                'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
        },
    },
    plugins: [],
}

export default config
