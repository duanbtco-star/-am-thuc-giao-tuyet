import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/finance - List all transactions
// Query params: type, startDate, endDate, orderId
export async function GET(request: Request) {
    try {
        const supabase = createClient()
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const orderId = searchParams.get('orderId')

        let query = supabase
            .from('transactions')
            .select('*, vendors(name)')
            .order('date', { ascending: false })

        if (type) {
            query = query.eq('type', type)
        }
        if (startDate) {
            query = query.gte('date', startDate)
        }
        if (endDate) {
            query = query.lte('date', endDate)
        }
        if (orderId) {
            query = query.eq('order_id', orderId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching transactions:', error)
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

// POST /api/finance - Create new transaction
export async function POST(request: Request) {
    try {
        const supabase = createClient()
        const body = await request.json()

        // Basic validation
        if (!body.type || !body.amount || !body.date) {
            return NextResponse.json(
                { error: 'type, amount and date are required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                order_id: body.order_id || null,
                date: body.date,
                type: body.type,
                category: body.category || null,
                amount: body.amount,
                payment_method: body.payment_method || null,
                vendor_id: body.vendor_id || null,
                description: body.description || null,
                receipt_url: body.receipt_url || null,
                created_by: body.created_by || null,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating transaction:', error)
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
