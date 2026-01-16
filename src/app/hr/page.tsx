'use client'

import Link from 'next/link'

export default function HRPage() {
    const hrModules = [
        {
            title: 'Quản lý nhân viên',
            description: 'Danh sách, thêm/sửa/xóa nhân viên',
            href: '/hr/employees',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            color: 'blue'
        },
        {
            title: 'Chấm công',
            description: 'Theo dõi ngày công, điểm danh',
            href: '/hr/attendance',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            color: 'green'
        },
        {
            title: 'Bảng lương',
            description: 'Tính lương, phụ cấp, thưởng',
            href: '/hr/payroll',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'orange'
        }
    ]

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; icon: string; hover: string }> = {
            blue: { bg: 'bg-blue-50', icon: 'text-blue-600', hover: 'hover:border-blue-300 hover:shadow-blue-100' },
            green: { bg: 'bg-green-50', icon: 'text-green-600', hover: 'hover:border-green-300 hover:shadow-green-100' },
            orange: { bg: 'bg-orange-50', icon: 'text-orange-600', hover: 'hover:border-orange-300 hover:shadow-orange-100' },
        }
        return colors[color] || colors.blue
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <Link href="/" className="text-gray-500 hover:text-gray-700">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </Link>
                                <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhân sự</h1>
                            </div>
                            <p className="text-gray-500 mt-1 ml-8">Quản lý nhân viên, chấm công và tính lương</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Module Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {hrModules.map((module) => {
                        const colors = getColorClasses(module.color)
                        return (
                            <Link
                                key={module.href}
                                href={module.href}
                                className={`bg-white rounded-xl border p-6 transition-all duration-200 hover:shadow-lg ${colors.hover}`}
                            >
                                <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                                    <span className={colors.icon}>{module.icon}</span>
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                    {module.title}
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    {module.description}
                                </p>
                            </Link>
                        )
                    })}
                </div>

                {/* Quick Stats Placeholder */}
                <div className="mt-8 bg-white rounded-xl border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Thống kê nhanh</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">-</div>
                            <div className="text-sm text-gray-500 mt-1">Tổng nhân viên</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">-</div>
                            <div className="text-sm text-gray-500 mt-1">Đang làm việc</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">-</div>
                            <div className="text-sm text-gray-500 mt-1">Tạm nghỉ</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">-</div>
                            <div className="text-sm text-gray-500 mt-1">Tổng lương tháng</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
