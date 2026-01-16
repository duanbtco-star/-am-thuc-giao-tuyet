'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePermission, UserRole } from '@/hooks/usePermission'

interface UserProfile {
    id: string
    full_name: string | null
    role: UserRole
    department: string | null
    is_active: boolean
    last_login_at: string | null
    created_at: string
}

const roleLabels: Record<UserRole, string> = {
    admin: 'Quản trị viên',
    manager: 'Quản lý',
    staff: 'Nhân viên',
    viewer: 'Người xem',
}

const roleColors: Record<UserRole, string> = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-purple-100 text-purple-800',
    staff: 'bg-blue-100 text-blue-800',
    viewer: 'bg-gray-100 text-gray-800',
}

export default function SettingsPage() {
    const { isAdmin, loading: permLoading } = usePermission()
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingUser, setEditingUser] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!permLoading && isAdmin) {
            fetchUsers()
        } else if (!permLoading && !isAdmin) {
            setLoading(false)
        }
    }, [permLoading, isAdmin])

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/settings/users')
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to fetch users')
            }
            const data = await res.json()
            setUsers(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách')
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        setSaving(true)
        try {
            const res = await fetch(`/api/settings/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to update role')
            }

            // Refresh list
            await fetchUsers()
            setEditingUser(null)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Lỗi khi cập nhật')
        } finally {
            setSaving(false)
        }
    }

    if (permLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
                <div className="animate-pulse text-center py-20">
                    <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4"></div>
                    <div className="h-4 w-32 bg-gray-100 rounded mx-auto"></div>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg mx-auto text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h1>
                    <p className="text-gray-500">Chỉ admin mới có thể xem trang cài đặt này.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Cài đặt</h1>
                    <p className="text-gray-500">Quản lý người dùng và phân quyền</p>
                </div>

                {/* User Management Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">👥 Quản lý người dùng</h2>
                        <span className="text-sm text-gray-500">{users.length} người dùng</span>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {/* Users Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tên</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Quyền</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Trạng thái</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Ngày tạo</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-4 px-4">
                                            <div className="font-medium text-gray-800">
                                                {user.full_name || 'Chưa đặt tên'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {editingUser === user.id ? (
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                                    disabled={saving}
                                                    className="border rounded-lg px-3 py-1.5 text-sm"
                                                >
                                                    <option value="admin">Quản trị viên</option>
                                                    <option value="manager">Quản lý</option>
                                                    <option value="staff">Nhân viên</option>
                                                    <option value="viewer">Người xem</option>
                                                </select>
                                            ) : (
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                                                    {roleLabels[user.role]}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {user.is_active ? 'Hoạt động' : 'Vô hiệu'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            {editingUser === user.id ? (
                                                <button
                                                    onClick={() => setEditingUser(null)}
                                                    className="text-gray-500 hover:text-gray-700 text-sm"
                                                >
                                                    Hủy
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setEditingUser(user.id)}
                                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                >
                                                    Đổi quyền
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.length === 0 && !error && (
                        <div className="text-center py-12 text-gray-500">
                            Chưa có người dùng nào
                        </div>
                    )}
                </motion.div>

                {/* Role Legend */}
                <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">📋 Mô tả quyền</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-red-50 rounded-xl">
                            <div className="font-medium text-red-800">🛡️ Quản trị viên (Admin)</div>
                            <p className="text-sm text-red-600 mt-1">Toàn quyền: CRUD + Settings + Phân quyền</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl">
                            <div className="font-medium text-purple-800">👔 Quản lý (Manager)</div>
                            <p className="text-sm text-purple-600 mt-1">Tạo, xem, sửa + Duyệt + Xem báo cáo</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl">
                            <div className="font-medium text-blue-800">👷 Nhân viên (Staff)</div>
                            <p className="text-sm text-blue-600 mt-1">Tạo, xem, sửa - Không xóa/duyệt</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="font-medium text-gray-800">👁️ Người xem (Viewer)</div>
                            <p className="text-sm text-gray-600 mt-1">Chỉ xem - Không chỉnh sửa</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
