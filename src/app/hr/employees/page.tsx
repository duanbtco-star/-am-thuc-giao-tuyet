'use client'

import { useState, useEffect, useCallback } from 'react'
import { Employee } from '@/types/database.types'
import { EmployeeForm } from '@/components/hr/EmployeeForm'

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/hr/employees')
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Lỗi khi tải danh sách nhân viên')
            }

            setEmployees(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchEmployees()
    }, [fetchEmployees])

    const handleCreate = async (data: Partial<Employee>) => {
        try {
            const response = await fetch('/api/hr/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Lỗi khi tạo nhân viên')
            }

            setShowForm(false)
            fetchEmployees()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
        }
    }

    const handleUpdate = async (data: Partial<Employee>) => {
        if (!editingEmployee) return

        try {
            const response = await fetch(`/api/hr/employees/${editingEmployee.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Lỗi khi cập nhật')
            }

            setEditingEmployee(null)
            fetchEmployees()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa nhân viên này?')) return

        try {
            const response = await fetch(`/api/hr/employees/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Lỗi khi xóa')
            }

            fetchEmployees()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-yellow-100 text-yellow-800',
            terminated: 'bg-red-100 text-red-800',
        }
        const labels = {
            active: 'Đang làm',
            inactive: 'Tạm nghỉ',
            terminated: 'Đã nghỉ',
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100'}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Quản lý nhân viên</h1>
                            <p className="text-gray-500 mt-1">Danh sách và thông tin nhân viên</p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Thêm nhân viên
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 py-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                ) : employees.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có nhân viên</h3>
                        <p className="text-gray-500 mb-4">Bắt đầu bằng cách thêm nhân viên đầu tiên</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Thêm nhân viên
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Mã NV</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Họ tên</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Chức vụ</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Phòng ban</th>
                                        <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Đơn giá/ngày</th>
                                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Trạng thái</th>
                                        <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {employees.map((employee) => (
                                        <tr key={employee.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-mono text-sm">{employee.employee_code}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{employee.full_name}</div>
                                                {employee.phone && (
                                                    <div className="text-sm text-gray-500">{employee.phone}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm">{employee.position || '-'}</td>
                                            <td className="px-4 py-3 text-sm">{employee.department || '-'}</td>
                                            <td className="px-4 py-3 text-right text-sm font-medium">
                                                {formatCurrency(employee.daily_rate)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {getStatusBadge(employee.status)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingEmployee(employee)}
                                                        className="text-blue-600 hover:text-blue-800 p-1"
                                                        title="Sửa"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(employee.id)}
                                                        className="text-red-600 hover:text-red-800 p-1"
                                                        title="Xóa"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Add Form Modal */}
            {showForm && (
                <EmployeeForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {/* Edit Form Modal */}
            {editingEmployee && (
                <EmployeeForm
                    employee={editingEmployee}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingEmployee(null)}
                />
            )}
        </div>
    )
}
