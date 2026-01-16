import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/settings - Get all settings
// GET /api/settings?key=xxx - Get specific setting
export async function GET(request: Request) {
    try {
        const supabase = createClient()
        const { searchParams } = new URL(request.url)
        const key = searchParams.get('key')

        if (key) {
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .eq('key', key)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
                }
                console.error('Error fetching setting:', error)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }

            return NextResponse.json(data)
        }

        // Get all settings as key-value object
        const { data, error } = await supabase.from('settings').select('*')

        if (error) {
            console.error('Error fetching settings:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const settings: Record<string, string | null> = {}
        data.forEach((s) => {
            settings[s.key] = s.value
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST /api/settings - Create or update setting
export async function POST(request: Request) {
    try {
        const supabase = createClient()
        const body = await request.json()

        if (!body.key) {
            return NextResponse.json(
                { error: 'key is required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('settings')
            .upsert({
                key: body.key,
                value: body.value || null,
                description: body.description || null,
            })
            .select()
            .single()

        if (error) {
            console.error('Error saving setting:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
