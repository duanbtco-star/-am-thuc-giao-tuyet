import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
    params: { id: string }
}

// GET /api/orders/[id] - Get single order
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', params.id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Order not found' }, { status: 404 })
            }
            console.error('Error fetching order:', error)
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

// PUT /api/orders/[id] - Update order
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const supabase = createClient()
        const body = await request.json()

        const remaining = (body.total_amount || 0) - (body.deposit || 0)

        const { data, error } = await supabase
            .from('orders')
            .update({
                customer_name: body.customer_name,
                phone: body.phone,
                event_date: body.event_date,
                event_time: body.event_time,
                location: body.location,
                menu_items: body.menu_items,
                total_amount: body.total_amount,
                deposit: body.deposit,
                remaining: remaining,
                status: body.status,
                assigned_vendors: body.assigned_vendors,
                notes: body.notes,
            })
            .eq('id', params.id)
            .select()
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Order not found' }, { status: 404 })
            }
            console.error('Error updating order:', error)
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

// DELETE /api/orders/[id] - Delete order
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const supabase = createClient()

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', params.id)

        if (error) {
            console.error('Error deleting order:', error)
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
