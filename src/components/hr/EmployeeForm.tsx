'use client'

import { useState, useEffect } from 'react'
import { Employee } from '@/types/database.types'

interface EmployeeFormProps {
    employee?: Employee | null
    onSubmit: (data: Partial<Employee>) => void
    onCancel: () => void
}

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
    const [formData, setFormData] = useState<{
        full_name: string
        phone: string
        email: string
        position: string
        department: string
        date_of_birth: string
        start_date: string
        base_salary: number
        daily_rate: number
        status: 'active' | 'inactive' | 'terminated'
        notes: string
    }>({
        full_name: '',
        phone: '',
        email: '',
        position: '',
        department: '',
        date_of_birth: '',
        start_date: new Date().toISOString().split('T')[0],
        base_salary: 0,
        daily_rate: 0,
        status: 'active',
        notes: '',
    })

    useEffect(() => {
        if (employee) {
            setFormData({
                full_name: employee.full_name || '',
                phone: employee.phone || '',
                email: employee.email || '',
                position: employee.position || '',
                department: employee.department || '',
                date_of_birth: employee.date_of_birth || '',
                start_date: employee.start_date || '',
                base_salary: employee.base_salary || 0,
                daily_rate: employee.daily_rate || 0,
                status: employee.status || 'active',
                notes: employee.notes || '',
            })
        }
    }, [employee])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
                <div className="border-b px-6 py-4">
                    <h2 className="text-xl font-semibold">
                        {employee ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Row 1: Full name */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.full_name}
                            onChange={(e) => handleChange('full_name', e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>

                    {/* Row 2: Phone & Email */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                placeholder="0912 345 678"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                placeholder="email@example.com"
                            />
                        </div>
                    </div>

                    {/* Row 3: Position & Department */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Chức vụ</label>
                            <input
                                type="text"
                                value={formData.position}
                                onChange={(e) => handleChange('position', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                placeholder="Đầu bếp"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phòng ban</label>
                            <select
                                value={formData.department}
                                onChange={(e) => handleChange('department', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Chọn phòng ban</option>
                                <option value="Bếp">Bếp</option>
                                <option value="Phục vụ">Phục vụ</option>
                                <option value="Vận chuyển">Vận chuyển</option>
                                <option value="Quản lý">Quản lý</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 4: DOB & Start Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                            <input
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) => handleChange('date_of_birth', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Ngày vào làm</label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => handleChange('start_date', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Row 5: Salary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Lương cơ bản (VNĐ/tháng)</label>
                            <input
                                type="number"
                                value={formData.base_salary}
                                onChange={(e) => handleChange('base_salary', parseFloat(e.target.value) || 0)}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                placeholder="5000000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Đơn giá công (VNĐ/ngày)</label>
                            <input
                                type="number"
                                value={formData.daily_rate}
                                onChange={(e) => handleChange('daily_rate', parseFloat(e.target.value) || 0)}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                placeholder="200000"
                            />
                        </div>
                    </div>

                    {/* Row 6: Status */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Trạng thái</label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="active">Đang làm việc</option>
                            <option value="inactive">Tạm nghỉ</option>
                            <option value="terminated">Đã nghỉ</option>
                        </select>
                    </div>

                    {/* Row 7: Notes */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Ghi chú</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            rows={3}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            placeholder="Thông tin bổ sung..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {employee ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
