'use client'

import { useState, useEffect, useCallback } from 'react'
import { Employee, Attendance } from '@/types/database.types'

export default function AttendancePage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [attendance, setAttendance] = useState<Attendance[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    })

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [year, month] = selectedMonth.split('-')

            // Fetch employees
            const empRes = await fetch('/api/hr/employees')
            const empData = await empRes.json()
            if (empRes.ok) setEmployees(empData.filter((e: Employee) => e.status === 'active'))

            // Fetch attendance
            const attRes = await fetch(`/api/hr/attendance?month=${month}&year=${year}`)
            const attData = await attRes.json()
            if (attRes.ok) setAttendance(attData)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }, [selectedMonth])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Get days in selected month
    const getDaysInMonth = () => {
        const [year, month] = selectedMonth.split('-').map(Number)
        const days = new Date(year, month, 0).getDate()
        return Array.from({ length: days }, (_, i) => i + 1)
    }

    // Get attendance for a specific employee and date
    const getAttendanceStatus = (employeeId: string, day: number) => {
        const [year, month] = selectedMonth.split('-')
        const dateStr = `${year}-${month.padStart(2, '0')}-${String(day).padStart(2, '0')}`

        const record = attendance.find(
            (a) => a.employee_id === employeeId && a.date === dateStr
        )
        return record?.status || null
    }

    // Toggle attendance
    const toggleAttendance = async (employeeId: string, day: number) => {
        const [year, month] = selectedMonth.split('-')
        const dateStr = `${year}-${month.padStart(2, '0')}-${String(day).padStart(2, '0')}`

        const currentStatus = getAttendanceStatus(employeeId, day)
        const statusCycle: Array<'present' | 'absent' | 'leave' | null> = [null, 'present', 'absent', 'leave']
        const currentIndex = statusCycle.indexOf(currentStatus as 'present' | 'absent' | 'leave' | null)
        const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length]

        try {
            if (nextStatus === null) {
                // Delete attendance record
                const record = attendance.find(
                    (a) => a.employee_id === employeeId && a.date === dateStr
                )
                if (record) {
                    await fetch(`/api/hr/attendance/${record.id}`, { method: 'DELETE' })
                }
            } else if (currentStatus === null) {
                // Create new attendance
                await fetch('/api/hr/attendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        employee_id: employeeId,
                        date: dateStr,
                        status: nextStatus,
                    }),
                })
            } else {
                // Update existing
                const record = attendance.find(
                    (a) => a.employee_id === employeeId && a.date === dateStr
                )
                if (record) {
                    await fetch(`/api/hr/attendance/${record.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: nextStatus }),
                    })
                }
            }

            fetchData()
        } catch (error) {
            console.error('Error toggling attendance:', error)
        }
    }

    // Bulk mark all present today
    const markAllPresentToday = async () => {
        const today = new Date().toISOString().split('T')[0]

        const records = employees
            .filter(emp => !attendance.find(a => a.employee_id === emp.id && a.date === today))
            .map(emp => ({
                employee_id: emp.id,
                date: today,
                status: 'present',
            }))

        if (records.length === 0) {
            alert('Tất cả nhân viên đã được chấm công hôm nay!')
            return
        }

        try {
            await fetch('/api/hr/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(records),
            })
            fetchData()
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const getStatusIcon = (status: string | null) => {
        switch (status) {
            case 'present': return '✅'
            case 'absent': return '❌'
            case 'leave': return '🏖️'
            case 'sick': return '🏥'
            case 'holiday': return '🎉'
            default: return '—'
        }
    }

    const countAttendance = (employeeId: string) => {
        return attendance.filter(
            (a) => a.employee_id === employeeId && a.status === 'present'
        ).length
    }

    const days = getDaysInMonth()
    const today = new Date().getDate()
    const [currentYear, currentMonth] = selectedMonth.split('-').map(Number)
    const isCurrentMonth =
        new Date().getFullYear() === currentYear &&
        new Date().getMonth() + 1 === currentMonth

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-full mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Chấm công</h1>
                            <p className="text-gray-500 mt-1">Theo dõi công làm việc hàng ngày</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            />
                            {isCurrentMonth && (
                                <button
                                    onClick={markAllPresentToday}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    ✅ Chấm công tất cả hôm nay
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="p-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : employees.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border">
                        <p className="text-gray-500">Chưa có nhân viên để chấm công.</p>
                        <a href="/hr/employees" className="text-blue-600 hover:underline">
                            Thêm nhân viên →
                        </a>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="sticky left-0 bg-gray-50 text-left px-4 py-3 font-medium text-gray-600 min-w-[180px]">
                                            Nhân viên
                                        </th>
                                        {days.map((day) => (
                                            <th
                                                key={day}
                                                className={`text-center px-2 py-3 font-medium min-w-[40px] ${isCurrentMonth && day === today
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'text-gray-600'
                                                    }`}
                                            >
                                                {day}
                                            </th>
                                        ))}
                                        <th className="sticky right-0 bg-gray-100 text-center px-4 py-3 font-medium text-gray-600">
                                            Tổng
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {employees.map((employee) => (
                                        <tr key={employee.id} className="hover:bg-gray-50">
                                            <td className="sticky left-0 bg-white px-4 py-2 font-medium border-r">
                                                <div>{employee.full_name}</div>
                                                <div className="text-xs text-gray-500">{employee.employee_code}</div>
                                            </td>
                                            {days.map((day) => {
                                                const status = getAttendanceStatus(employee.id, day)
                                                return (
                                                    <td
                                                        key={day}
                                                        className={`text-center px-1 py-2 cursor-pointer hover:bg-blue-50 ${isCurrentMonth && day === today ? 'bg-blue-50' : ''
                                                            }`}
                                                        onClick={() => toggleAttendance(employee.id, day)}
                                                        title={`Click để thay đổi. Hiện tại: ${status || 'Chưa chấm'}`}
                                                    >
                                                        {getStatusIcon(status)}
                                                    </td>
                                                )
                                            })}
                                            <td className="sticky right-0 bg-gray-50 text-center px-4 py-2 font-bold text-blue-600 border-l">
                                                {countAttendance(employee.id)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                    <span>✅ Có mặt</span>
                    <span>❌ Vắng</span>
                    <span>🏖️ Nghỉ phép</span>
                    <span>— Chưa chấm</span>
                    <span className="text-gray-400">(Click vào ô để thay đổi trạng thái)</span>
                </div>
            </main>
        </div>
    )
}
