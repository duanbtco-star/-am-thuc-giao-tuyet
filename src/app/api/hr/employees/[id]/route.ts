import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const EmployeeUpdateSchema = z.object({
    full_name: z.string().min(1).optional(),
    phone: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    position: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    date_of_birth: z.string().optional().nullable(),
    start_date: z.string().optional(),
    base_salary: z.number().min(0).optional(),
    daily_rate: z.number().min(0).optional(),
    status: z.enum(['active', 'inactive', 'terminated']).optional(),
    avatar_url: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
})

// GET /api/hr/employees/[id] - Get single employee
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createClient()
        const { id } = await params

        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Không tìm thấy nhân viên' },
                    { status: 404 }
                )
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json(
            { error: 'Lỗi khi tải thông tin nhân viên' },
            { status: 500 }
        )
    }
}

// PUT /api/hr/employees/[id] - Update employee
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createClient()
        const { id } = await params
        const body = await request.json()

        // Validate input
        const result = EmployeeUpdateSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dữ liệu không hợp lệ', details: result.error.flatten() },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('employees')
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
            { error: 'Lỗi khi cập nhật nhân viên' },
            { status: 500 }
        )
    }
}

// DELETE /api/hr/employees/[id] - Delete employee (admin only)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createClient()
        const { id } = await params

        // TODO: Add role check - only admin can delete
        // const { data: { user } } = await supabase.auth.getUser()
        // if (user?.user_metadata?.role !== 'admin') {
        //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        // }

        const { error } = await supabase
            .from('employees')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json(
            { error: 'Lỗi khi xóa nhân viên' },
            { status: 500 }
        )
    }
}
