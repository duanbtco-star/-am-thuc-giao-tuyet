import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const AttendanceSchema = z.object({
    employee_id: z.string().uuid('ID nhân viên không hợp lệ'),
    date: z.string(),
    status: z.enum(['present', 'absent', 'leave', 'sick', 'holiday']).optional(),
    check_in_time: z.string().optional().nullable(),
    check_out_time: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
})

// GET /api/hr/attendance - Get attendance records with filters
export async function GET(request: Request) {
    try {
        const supabase = createClient()
        const { searchParams } = new URL(request.url)

        const employeeId = searchParams.get('employee_id')
        const month = searchParams.get('month')
        const year = searchParams.get('year')

        let query = supabase
            .from('attendance')
            .select('*, employees(full_name, employee_code)')
            .order('date', { ascending: false })

        // Filter by employee if provided
        if (employeeId) {
            query = query.eq('employee_id', employeeId)
        }

        // Filter by month and year if provided
        if (month && year) {
            const startDate = `${year}-${month.padStart(2, '0')}-01`
            const endDate = new Date(parseInt(year), parseInt(month), 0)
                .toISOString()
                .split('T')[0]
            query = query.gte('date', startDate).lte('date', endDate)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching attendance:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Lỗi khi tải dữ liệu chấm công' },
            { status: 500 }
        )
    }
}

// POST /api/hr/attendance - Log attendance (can be bulk or single)
export async function POST(request: Request) {
    try {
        const supabase = createClient()
        const body = await request.json()

        // Support both single object and array
        const records = Array.isArray(body) ? body : [body]

        // Validate all records
        const validationResults = records.map(record =>
            AttendanceSchema.safeParse(record)
        )

        const hasErrors = validationResults.some(result => !result.success)
        if (hasErrors) {
            const errors = validationResults
                .filter(result => !result.success)
                .map(result => result.error?.flatten())

            return NextResponse.json(
                { error: 'Dữ liệu không hợp lệ', details: errors },
                { status: 400 }
            )
        }

        // Extract valid data (filter out undefined)
        const validRecords = validationResults
            .filter((result): result is { success: true; data: z.infer<typeof AttendanceSchema> } => result.success)
            .map(result => result.data)

        // Check for duplicates
        for (const record of validRecords) {
            const { data: existing } = await supabase
                .from('attendance')
                .select('id')
                .eq('employee_id', record.employee_id)
                .eq('date', record.date)
                .single()

            if (existing) {
                return NextResponse.json(
                    {
                        error: `Đã có dữ liệu chấm công cho nhân viên này vào ngày ${record.date}`
                    },
                    { status: 400 }
                )
            }
        }

        const { data, error } = await supabase
            .from('attendance')
            .insert(validRecords)
            .select()

        if (error) {
            console.error('Error creating attendance:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Lỗi khi tạo bản ghi chấm công' },
            { status: 500 }
        )
    }
}
