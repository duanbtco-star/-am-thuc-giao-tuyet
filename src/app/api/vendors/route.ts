import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/vendors - List all vendors
// Query params: category
export async function GET(request: Request) {
    try {
        const supabase = createClient()
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')

        let query = supabase
            .from('vendors')
            .select('*')
            .eq('active', true)
            .order('name')

        if (category) {
            query = query.eq('category', category)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching vendors:', error)
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

// POST /api/vendors - Create new vendor
export async function POST(request: Request) {
    try {
        const supabase = createClient()
        const body = await request.json()

        if (!body.name) {
            return NextResponse.json(
                { error: 'name is required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('vendors')
            .insert({
                name: body.name,
                category: body.category || null,
                phone: body.phone || null,
                address: body.address || null,
                specialties: body.specialties || null,
                rating: body.rating || null,
                price_range: body.price_range || null,
                active: body.active ?? true,
                notes: body.notes || null,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating vendor:', error)
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
