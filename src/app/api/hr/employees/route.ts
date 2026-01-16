import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for employee
const EmployeeSchema = z.object({
    full_name: z.string().min(1, 'Tên nhân viên là bắt buộc'),
    phone: z.string().optional().nullable().transform(v => v === '' ? null : v),
    email: z.string().optional().nullable().transform(v => {
        if (!v || v === '') return null
        return v
    }),
    position: z.string().optional().nullable().transform(v => v === '' ? null : v),
    department: z.string().optional().nullable().transform(v => v === '' ? null : v),
    date_of_birth: z.string().optional().nullable().transform(v => v === '' ? null : v),
    start_date: z.string().optional().transform(v => v === '' ? undefined : v),
    base_salary: z.number().min(0).optional(),
    daily_rate: z.number().min(0).optional(),
    status: z.enum(['active', 'inactive', 'terminated']).optional(),
    avatar_url: z.string().optional().nullable(),
    notes: z.string().optional().nullable().transform(v => v === '' ? null : v),
})

// GET /api/hr/employees - List all employees
export async function GET() {
    try {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching employees:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Lỗi khi tải danh sách nhân viên' },
            { status: 500 }
        )
    }
}

// POST /api/hr/employees - Create new employee
export async function POST(request: Request) {
    try {
        const supabase = createClient()
        const body = await request.json()

        // Validate input
        const result = EmployeeSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                {
                    error: 'Dữ liệu không hợp lệ',
                    details: result.error.flatten()
                },
                { status: 400 }
            )
        }

        // Generate employee_code if not provided
        const employee_code = `NV-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.random().toString(36).slice(2, 4).toUpperCase()}`

        const { data, error } = await supabase
            .from('employees')
            .insert({
                ...result.data,
                employee_code
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating employee:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Lỗi khi tạo nhân viên mới' },
            { status: 500 }
        )
    }
}
