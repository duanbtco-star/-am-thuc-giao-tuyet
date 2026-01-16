import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
    params: { id: string }
}

// GET /api/quotes/[id] - Get single quote
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('quotes')
            .select('*')
            .eq('id', params.id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
            }
            console.error('Error fetching quote:', error)
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

// PUT /api/quotes/[id] - Update quote
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const supabase = createClient()
        const body = await request.json()

        const { data, error } = await supabase
            .from('quotes')
            .update({
                customer_name: body.customer_name,
                phone: body.phone,
                address: body.address,
                event_type: body.event_type,
                event_date: body.event_date,
                num_tables: body.num_tables,
                dishes: body.dishes,
                price_per_table: body.price_per_table,
                subtotal: body.subtotal,
                vat_percent: body.vat_percent,
                total: body.total,
                status: body.status,
                notes: body.notes,
            })
            .eq('id', params.id)
            .select()
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
            }
            console.error('Error updating quote:', error)
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

// DELETE /api/quotes/[id] - Delete quote
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const supabase = createClient()

        const { error } = await supabase
            .from('quotes')
            .delete()
            .eq('id', params.id)

        if (error) {
            console.error('Error deleting quote:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
