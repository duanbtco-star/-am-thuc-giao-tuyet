import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const PayrollUpdateSchema = z.object({
    allowances: z.number().min(0).optional(),
    bonus: z.number().min(0).optional(),
    deductions: z.number().min(0).optional(),
    payment_status: z.enum(['pending', 'paid', 'cancelled']).optional(),
    payment_date: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
})

// GET /api/hr/payroll/[id] - Get single payroll record
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createClient()
        const { id } = await params

        const { data, error } = await supabase
            .from('payroll')
            .select('*, employees(full_name, employee_code, department, position)')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Không tìm thấy bản ghi lương' },
                    { status: 404 }
                )
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json(
            { error: 'Lỗi khi tải thông tin lương' },
            { status: 500 }
        )
    }
}

// PUT /api/hr/payroll/[id] - Update payroll (adjust bonus/deductions)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createClient()
        const { id } = await params
        const body = await request.json()

        const result = PayrollUpdateSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dữ liệu không hợp lệ', details: result.error.flatten() },
                { status: 400 }
            )
        }

        // Note: total_salary will be auto-updated by database trigger
        const { data, error } = await supabase
            .from('payroll')
            .update(result.data)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json(
            { error: 'Lỗi khi cập nhật bản ghi lương' },
            { status: 500 }
        )
    }
}
