import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const UpdateRoleSchema = z.object({
    role: z.enum(['admin', 'manager', 'staff', 'viewer']),
})

// GET /api/settings/users/[id] - Get single user profile
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createClient()
        const { id } = await params

        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json(
            { error: 'Lỗi khi tải thông tin người dùng' },
            { status: 500 }
        )
    }
}

// PUT /api/settings/users/[id] - Update user role (admin only)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createClient()
        const { id } = await params
        const body = await request.json()

        // Check if current user is admin
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
        }

        const { data: currentProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single()

        if (!currentProfile || currentProfile.role !== 'admin') {
            return NextResponse.json(
                { error: 'Chỉ admin mới có quyền thay đổi role' },
                { status: 403 }
            )
        }

        // Prevent admin from demoting themselves
        if (id === currentUser.id && body.role !== 'admin') {
            return NextResponse.json(
                { error: 'Không thể tự hạ quyền admin của mình' },
                { status: 400 }
            )
        }

        // Validate input
        const result = UpdateRoleSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: 'Dữ liệu không hợp lệ', details: result.error.flatten() },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .update({ role: result.data.role, updated_at: new Date().toISOString() })
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
            { error: 'Lỗi khi cập nhật người dùng' },
            { status: 500 }
        )
    }
}

// DELETE /api/settings/users/[id] - Deactivate user (admin only)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createClient()
        const { id } = await params

        // Check if current user is admin
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
        }

        const { data: currentProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single()

        if (!currentProfile || currentProfile.role !== 'admin') {
            return NextResponse.json(
                { error: 'Chỉ admin mới có quyền xóa người dùng' },
                { status: 403 }
            )
        }

        // Prevent self-deletion
        if (id === currentUser.id) {
            return NextResponse.json(
                { error: 'Không thể xóa chính mình' },
                { status: 400 }
            )
        }

        // Soft delete - set is_active to false
        const { error } = await supabase
            .from('user_profiles')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json(
            { error: 'Lỗi khi xóa người dùng' },
            { status: 500 }
        )
    }
}
