import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/quotes/[id]/convert - Convert quote to order with auto calendar
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient()
        const quoteId = params.id
        const body = await request.json()

        // 1. Get the quote
        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .select('*')
            .eq('id', quoteId)
            .single()

        if (quoteError || !quote) {
            return NextResponse.json(
                { error: 'Quote not found' },
                { status: 404 }
            )
        }

        // 2. Calculate remaining amount
        const deposit = body.deposit || 0
        const totalAmount = quote.total || quote.subtotal || 0
        const remaining = totalAmount - deposit

        // 3. Create the order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                quote_id: quoteId,
                customer_name: quote.customer_name,
                phone: quote.phone,
                event_date: quote.event_date,
                event_time: body.event_time || '11:00',
                location: quote.address || body.location || '',
                menu_items: quote.dishes || [],
                total_amount: totalAmount,
                deposit: deposit,
                remaining: remaining,
                status: 'confirmed',
                assigned_vendors: [],
                notes: quote.notes || '',
            })
            .select()
            .single()

        if (orderError) {
            console.error('Error creating order:', orderError)
            return NextResponse.json(
                { error: orderError.message },
                { status: 500 }
            )
        }

        // 4. Auto-create calendar event
        const { error: calendarError } = await supabase
            .from('calendar_events')
            .insert({
                order_id: order.id,
                title: `${quote.event_type || 'Tiệc'} - ${quote.customer_name}`,
                event_date: quote.event_date,
                start_time: body.event_time || '11:00',
                end_time: body.end_time || '15:00',
                event_type: quote.event_type || 'other',
                location: quote.address || body.location || '',
                status: 'scheduled',
                color: getEventColor(quote.event_type),
            })

        if (calendarError) {
            console.warn('Warning: Failed to create calendar event:', calendarError)
            // Don't fail the whole operation, just log warning
        }

        // 5. Update quote status to 'accepted'
        await supabase
            .from('quotes')
            .update({ status: 'accepted' })
            .eq('id', quoteId)

        // 6. Auto-create deposit transaction if deposit > 0
        if (deposit > 0) {
            await supabase
                .from('transactions')
                .insert({
                    order_id: order.id,
                    date: new Date().toISOString().split('T')[0],
                    type: 'income',
                    category: 'deposit',
                    amount: deposit,
                    payment_method: body.payment_method || 'cash',
                    description: `Tiền cọc đơn hàng ${order.order_number} - ${quote.customer_name}`,
                })
        }

        return NextResponse.json({
            success: true,
            order: order,
            message: 'Quote converted to order successfully',
        }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Helper function to get color based on event type
function getEventColor(eventType: string | null): string {
    const colors: Record<string, string> = {
        'dam_cuoi': '#FF6B6B',
        'dam_hoi': '#4ECDC4',
        'thoi_noi': '#FFE66D',
        'sinh_nhat': '#95E1D3',
        'gio_to': '#A8D8EA',
        'other': '#DDA0DD',
    }
    return colors[eventType || 'other'] || '#DDA0DD'
}
