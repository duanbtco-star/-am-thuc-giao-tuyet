import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/finance/summary - Get financial summary
// Query params: startDate, endDate
export async function GET(request: Request) {
    try {
        const supabase = createClient()
        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        let query = supabase.from('transactions').select('type, category, amount')

        if (startDate) {
            query = query.gte('date', startDate)
        }
        if (endDate) {
            query = query.lte('date', endDate)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching transactions:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Calculate summary
        const totalIncome = data
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0)

        const totalExpense = data
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0)

        const byCategory: Record<string, number> = {}
        data.forEach((t) => {
            const key = `${t.type}_${t.category || 'other'}`
            byCategory[key] = (byCategory[key] || 0) + Number(t.amount)
        })

        return NextResponse.json({
            totalIncome,
            totalExpense,
            profit: totalIncome - totalExpense,
            byCategory,
        })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
