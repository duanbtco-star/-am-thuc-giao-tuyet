'use client'

import { useState, useEffect, useCallback } from 'react'
import { Payroll } from '@/types/database.types'

interface PayrollWithEmployee extends Payroll {
    employees: {
        full_name: string
        employee_code: string
        department: string | null
    }
}

export default function PayrollPage() {
    const [payrolls, setPayrolls] = useState<PayrollWithEmployee[]>([])
    const [loading, setLoading] = useState(true)
    const [calculating, setCalculating] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    })

    const fetchPayroll = useCallback(async () => {
        setLoading(true)
        try {
            const [year, month] = selectedMonth.split('-')
            const res = await fetch(`/api/hr/payroll?month=${month}&year=${year}`)
            const data = await res.json()
            if (res.ok) setPayrolls(data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }, [selectedMonth])

    useEffect(() => {
        fetchPayroll()
    }, [fetchPayroll])

    const calculatePayroll = async () => {
        const [year, month] = selectedMonth.split('-').map(Number)

        setCalculating(true)
        try {
            const res = await fetch('/api/hr/payroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month, year }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Lỗi khi tính lương')
            }

            alert(`Đã tính lương cho ${data.count || 0} nhân viên!`)
            fetchPayroll()
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Đã xảy ra lỗi')
        } finally {
            setCalculating(false)
        }
    }

    const updatePayroll = async (id: string, field: string, value: number) => {
        try {
            await fetch(`/api/hr/payroll/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value }),
            })
            fetchPayroll()
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const markAsPaid = async (id: string) => {
        try {
            await fetch(`/api/hr/payroll/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_status: 'paid',
                    payment_date: new Date().toISOString().split('T')[0]
                }),
            })
            fetchPayroll()
        } catch (error) {
            console.error('Error:', error)
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
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        }
        const labels = {
            pending: 'Chờ thanh toán',
            paid: 'Đã thanh toán',
            cancelled: 'Đã hủy',
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        )
    }

    const totalSalary = payrolls.reduce((sum, p) => sum + (p.total_salary || 0), 0)
    const totalPaid = payrolls
        .filter(p => p.payment_status === 'paid')
        .reduce((sum, p) => sum + (p.total_salary || 0), 0)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Bảng lương</h1>
                            <p className="text-gray-500 mt-1">Tính toán và quản lý lương nhân viên</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={calculatePayroll}
                                disabled={calculating}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {calculating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Đang tính...
                                    </>
                                ) : (
                                    <>
                                        📊 Tính lương tháng này
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats */}
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border p-4">
                        <p className="text-sm text-gray-500">Tổng lương tháng</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSalary)}</p>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <p className="text-sm text-gray-500">Đã thanh toán</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <p className="text-sm text-gray-500">Còn lại</p>
                        <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalSalary - totalPaid)}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 pb-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : payrolls.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border">
                        <p className="text-gray-500 mb-4">Chưa có dữ liệu lương cho tháng này.</p>
                        <button
                            onClick={calculatePayroll}
                            disabled={calculating}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Tính lương ngay
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Nhân viên</th>
                                        <th className="text-center px-4 py-3 font-medium text-gray-600">Ngày công</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600">Lương cơ bản</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600">Phụ cấp</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600">Thưởng</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600">Trừ</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600 bg-blue-50">Tổng lương</th>
                                        <th className="text-center px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {payrolls.map((payroll) => (
                                        <tr key={payroll.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{payroll.employees?.full_name}</div>
                                                <div className="text-xs text-gray-500">{payroll.employees?.employee_code}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center font-medium">
                                                {payroll.total_days_worked}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {formatCurrency(payroll.base_salary)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <input
                                                    type="number"
                                                    value={payroll.allowances}
                                                    onChange={(e) => updatePayroll(payroll.id, 'allowances', parseFloat(e.target.value) || 0)}
                                                    className="w-24 text-right border rounded px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <input
                                                    type="number"
                                                    value={payroll.bonus}
                                                    onChange={(e) => updatePayroll(payroll.id, 'bonus', parseFloat(e.target.value) || 0)}
                                                    className="w-24 text-right border rounded px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <input
                                                    type="number"
                                                    value={payroll.deductions}
                                                    onChange={(e) => updatePayroll(payroll.id, 'deductions', parseFloat(e.target.value) || 0)}
                                                    className="w-24 text-right border rounded px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-blue-600 bg-blue-50">
                                                {formatCurrency(payroll.total_salary)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {getStatusBadge(payroll.payment_status)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {payroll.payment_status === 'pending' && (
                                                    <button
                                                        onClick={() => markAsPaid(payroll.id)}
                                                        className="text-green-600 hover:text-green-800 text-xs font-medium"
                                                    >
                                                        ✓ Đánh dấu đã trả
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
