import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/calendar - List calendar events
// Query params: year, month, date
export async function GET(request: Request) {
    try {
        const supabase = createClient()
        const { searchParams } = new URL(request.url)
        const year = searchParams.get('year')
        const month = searchParams.get('month')
        const date = searchParams.get('date')

        let query = supabase
            .from('calendar_events')
            .select('*, orders(customer_name, phone)')
            .order('event_date', { ascending: true })

        if (date) {
            query = query.eq('event_date', date)
        } else if (year && month) {
            // Filter by month (YYYY-MM format matching)
            const startOfMonth = `${year}-${month.padStart(2, '0')}-01`
            const endOfMonth = `${year}-${month.padStart(2, '0')}-31`
            query = query.gte('event_date', startOfMonth).lte('event_date', endOfMonth)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching calendar events:', error)
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

// POST /api/calendar - Create calendar event
export async function POST(request: Request) {
    try {
        const supabase = createClient()
        const body = await request.json()

        if (!body.title || !body.event_date) {
            return NextResponse.json(
                { error: 'title and event_date are required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('calendar_events')
            .insert({
                order_id: body.order_id || null,
                title: body.title,
                event_date: body.event_date,
                start_time: body.start_time || null,
                end_time: body.end_time || null,
                event_type: body.event_type || null,
                location: body.location || null,
                status: body.status || 'scheduled',
                color: body.color || null,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating calendar event:', error)
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
