import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/menus - List all menus
// GET /api/menus?category=xxx - Filter by category
export async function GET(request: Request) {
    try {
        const supabase = createClient()
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')

        let query = supabase
            .from('menus')
            .select('*')
            .eq('active', true)
            .order('name')

        if (category) {
            query = query.eq('category', category)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching menus:', error)
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

// POST /api/menus - Create new menu item
export async function POST(request: Request) {
    try {
        const supabase = createClient()
        const body = await request.json()

        // Basic validation
        if (!body.name || body.selling_price === undefined) {
            return NextResponse.json(
                { error: 'Name and selling_price are required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('menus')
            .insert({
                name: body.name,
                category: body.category || null,
                selling_price: body.selling_price,
                cost_price: body.cost_price || null,
                unit: body.unit || 'phần',
                description: body.description || null,
                active: body.active ?? true,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating menu:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
