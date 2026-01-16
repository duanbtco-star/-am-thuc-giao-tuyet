import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/orders - List all orders
// GET /api/orders?status=xxx - Filter by status
export async function GET(request: Request) {
    try {
        const supabase = createClient()
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        let query = supabase
            .from('orders')
            .select('*')
            .order('event_date', { ascending: true })

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching orders:', error)
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

// POST /api/orders - Create new order
export async function POST(request: Request) {
    try {
        const supabase = createClient()
        const body = await request.json()

        // Basic validation
        if (!body.customer_name || !body.phone || !body.event_date) {
            return NextResponse.json(
                { error: 'customer_name, phone and event_date are required' },
                { status: 400 }
            )
        }

        const remaining = (body.total_amount || 0) - (body.deposit || 0)

        const { data, error } = await supabase
            .from('orders')
            .insert({
                quote_id: body.quote_id || null,
                customer_name: body.customer_name,
                phone: body.phone,
                event_date: body.event_date,
                event_time: body.event_time || null,
                location: body.location || null,
                menu_items: body.menu_items || [],
                total_amount: body.total_amount || 0,
                deposit: body.deposit || 0,
                remaining: remaining,
                status: body.status || 'confirmed',
                assigned_vendors: body.assigned_vendors || [],
                notes: body.notes || null,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating order:', error)
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
