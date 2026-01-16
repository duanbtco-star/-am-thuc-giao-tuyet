import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const AttendanceUpdateSchema = z.object({
    status: z.enum(['present', 'absent', 'leave', 'sick', 'holiday']).optional(),
    check_in_time: z.string().optional().nullable(),
    check_out_time: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
})

// PUT /api/hr/attendance/[id] - Update attendance record
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createClient()
        const { id } = await params
        const body = await request.json()

        const result = AttendanceUpdateSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dữ liệu không hợp lệ', details: result.error.flatten() },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('attendance')
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
            { error: 'Lỗi khi cập nhật bản ghi chấm công' },
            { status: 500 }
        )
    }
}

// DELETE /api/hr/attendance/[id] - Delete attendance record (admin only)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createClient()
        const { id } = await params

        // TODO: Add role check

        const { error } = await supabase
            .from('attendance')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json(
            { error: 'Lỗi khi xóa bản ghi chấm công' },
            { status: 500 }
        )
    }
}
