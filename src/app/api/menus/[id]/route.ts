import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

interface RouteParams {
    params: { id: string }
}

// GET /api/menus/[id] - Get single menu
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('menus')
            .select('*')
            .eq('id', params.id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Menu not found' }, { status: 404 })
            }
            console.error('Error fetching menu:', error)
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

// PUT /api/menus/[id] - Update menu
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const supabase = createClient()
        const body = await request.json()

        const updateData: Database['public']['Tables']['menus']['Update'] = {}
        if (body.name !== undefined) updateData.name = body.name
        if (body.category !== undefined) updateData.category = body.category
        if (body.selling_price !== undefined) updateData.selling_price = body.selling_price
        if (body.cost_price !== undefined) updateData.cost_price = body.cost_price
        if (body.unit !== undefined) updateData.unit = body.unit
        if (body.description !== undefined) updateData.description = body.description
        if (body.active !== undefined) updateData.active = body.active

        const { data, error } = await supabase
            .from('menus')
            .update(updateData)
            .eq('id', params.id)
            .select()
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Menu not found' }, { status: 404 })
            }
            console.error('Error updating menu:', error)
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

// DELETE /api/menus/[id] - Delete menu (soft delete)
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const supabase = createClient()

        // Soft delete by setting active = false
        const { error } = await supabase
            .from('menus')
            .update({ active: false })
            .eq('id', params.id)

        if (error) {
            console.error('Error deleting menu:', error)
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
