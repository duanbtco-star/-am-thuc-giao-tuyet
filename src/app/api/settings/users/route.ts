import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/settings/users - List all users with profiles
export async function GET() {
    try {
        const supabase = createClient()

        // Get current user to check admin permission
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
        }

        // Check if current user is admin
        const { data: currentProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single()

        if (!currentProfile || currentProfile.role !== 'admin') {
            return NextResponse.json(
                { error: 'Chỉ admin mới có quyền xem danh sách người dùng' },
                { status: 403 }
            )
        }

        // Get all user profiles
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching users:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Lỗi khi tải danh sách người dùng' },
            { status: 500 }
        )
    }
}
