import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/quotes - List all quotes
// GET /api/quotes?status=xxx - Filter by status
export async function GET(request: Request) {
    try {
        const supabase = createClient()
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        let query = supabase
            .from('quotes')
            .select('*')
            .order('created_at', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching quotes:', error)
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

// POST /api/quotes - Create new quote
export async function POST(request: Request) {
    try {
        const supabase = createClient()
        const body = await request.json()

        // Basic validation
        if (!body.customer_name || !body.phone) {
            return NextResponse.json(
                { error: 'customer_name and phone are required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('quotes')
            .insert({
                customer_name: body.customer_name,
                phone: body.phone,
                address: body.address || null,
                event_type: body.event_type || null,
                event_date: body.event_date || null,
                num_tables: body.num_tables || 1,
                dishes: body.dishes || [],
                price_per_table: body.price_per_table || 0,
                subtotal: body.subtotal || 0,
                vat_percent: body.vat_percent || 0,
                total: body.total || 0,
                status: body.status || 'draft',
                notes: body.notes || null,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating quote:', error)
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
