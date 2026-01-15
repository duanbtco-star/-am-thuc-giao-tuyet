'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ChevronLeft,
    TrendingUp,
    TrendingDown,
    Calendar,
    DollarSign,
    Users,
    Package,
    PieChart,
    BarChart3,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Heart,
    Star,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ExcelExportButton } from '@/components/ExcelExport';

// Mock data for analytics
const monthlyData = [
    { month: 'T8/2025', revenue: 85000000, cost: 52000000, orders: 12, customers: 10 },
    { month: 'T9/2025', revenue: 92000000, cost: 58000000, orders: 14, customers: 12 },
    { month: 'T10/2025', revenue: 78000000, cost: 48000000, orders: 11, customers: 9 },
    { month: 'T11/2025', revenue: 105000000, cost: 65000000, orders: 16, customers: 14 },
    { month: 'T12/2025', revenue: 120000000, cost: 75000000, orders: 18, customers: 16 },
    { month: 'T1/2026', revenue: 95000000, cost: 60000000, orders: 15, customers: 13 },
];

const eventTypeData = [
    { type: 'Đám cưới', count: 35, revenue: 280000000, percentage: 45 },
    { type: 'Đám hỏi', count: 20, revenue: 120000000, percentage: 25 },
    { type: 'Thôi nôi', count: 18, revenue: 72000000, percentage: 15 },
    { type: 'Sinh nhật', count: 10, revenue: 35000000, percentage: 10 },
    { type: 'Khác', count: 5, revenue: 18000000, percentage: 5 },
];

const topDishes = [
    { name: 'Gà lên mâm', orders: 85, revenue: 21250000 },
    { name: 'Súp cua', orders: 72, revenue: 14400000 },
    { name: 'Cá hấp Hồng Kông', orders: 68, revenue: 27200000 },
    { name: 'Xôi gấc', orders: 65, revenue: 9750000 },
    { name: 'Chả giò', orders: 60, revenue: 9000000 },
];

// Customer Lifetime Value data
const topCustomers = [
    { name: 'Nguyễn Văn An', orders: 5, totalSpent: 185000000, avgOrder: 37000000, firstOrder: '2024-06', lastOrder: '2026-01', loyaltyScore: 95 },
    { name: 'Trần Thị Bích', orders: 4, totalSpent: 142000000, avgOrder: 35500000, firstOrder: '2024-09', lastOrder: '2025-12', loyaltyScore: 88 },
    { name: 'Lê Văn Cường', orders: 3, totalSpent: 98000000, avgOrder: 32700000, firstOrder: '2025-02', lastOrder: '2025-11', loyaltyScore: 75 },
    { name: 'Phạm Thị Dữ', orders: 3, totalSpent: 87000000, avgOrder: 29000000, firstOrder: '2025-05', lastOrder: '2026-01', loyaltyScore: 82 },
    { name: 'Hoàng Văn Em', orders: 2, totalSpent: 65000000, avgOrder: 32500000, firstOrder: '2025-08', lastOrder: '2025-12', loyaltyScore: 70 },
];

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState({
        start: '2025-08-01',
        end: '2026-01-31'
    });

    // Calculate summary from filtered data
    const summary = useMemo(() => {
        const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
        const totalCost = monthlyData.reduce((sum, m) => sum + m.cost, 0);
        const totalOrders = monthlyData.reduce((sum, m) => sum + m.orders, 0);
        const totalCustomers = monthlyData.reduce((sum, m) => sum + m.customers, 0);
        const profitMargin = ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1);
        const avgOrderValue = totalRevenue / totalOrders;

        // Compare with previous period
        const currentRevenue = monthlyData[monthlyData.length - 1].revenue;
        const previousRevenue = monthlyData[monthlyData.length - 2].revenue;
        const revenueGrowth = ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);

        return {
            totalRevenue,
            totalCost,
            totalProfit: totalRevenue - totalCost,
            totalOrders,
            totalCustomers,
            profitMargin,
            avgOrderValue,
            revenueGrowth: parseFloat(revenueGrowth),
        };
    }, []);

    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

    return (
        <main className="min-h-screen bg-background-light">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="section-container">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <ChevronLeft className="w-5 h-5 text-text-secondary" />
                            <span className="text-text-secondary hidden sm:inline">Quay lại</span>
                        </Link>

                        <h1 className="text-lg font-semibold text-primary">Báo cáo & Phân tích</h1>

                        <ExcelExportButton
                            data={monthlyData}
                            filename="BaoCao_ThongKe"
                            sheetName="Thống kê"
                            headers={{
                                month: 'Tháng',
                                revenue: 'Doanh thu',
                                cost: 'Chi phí',
                                orders: 'Số đơn',
                                customers: 'Khách hàng',
                            }}
                        />
                    </div>
                </div>
            </header>

            <div className="section-container py-8">
                {/* Date Range Filter */}
                <div className="bg-white rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-4">
                    <Filter className="w-5 h-5 text-text-secondary" />
                    <span className="text-sm text-text-secondary">Khoảng thời gian:</span>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="px-3 py-2 bg-gray-50 rounded-xl border-0 text-sm"
                    />
                    <span className="text-text-secondary">đến</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="px-3 py-2 bg-gray-50 rounded-xl border-0 text-sm"
                    />
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <span className={`flex items-center text-sm ${summary.revenueGrowth >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                                {summary.revenueGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {Math.abs(summary.revenueGrowth)}%
                            </span>
                        </div>
                        <p className="text-2xl font-bold mb-1">{formatCurrency(summary.totalRevenue)}</p>
                        <p className="text-sm text-white/70">Tổng doanh thu</p>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-sm text-green-200">{summary.profitMargin}%</span>
                        </div>
                        <p className="text-2xl font-bold mb-1">{formatCurrency(summary.totalProfit)}</p>
                        <p className="text-sm text-white/70">Lợi nhuận</p>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-5 text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Package className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold mb-1">{summary.totalOrders}</p>
                        <p className="text-sm text-white/70">Tổng đơn hàng</p>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-5 text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold mb-1">{formatCurrency(summary.avgOrderValue)}</p>
                        <p className="text-sm text-white/70">Giá trị TB/đơn</p>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    <motion.div
                        className="bg-white rounded-2xl p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-semibold text-primary">Doanh thu & Chi phí</h3>
                                <p className="text-sm text-text-secondary">6 tháng gần nhất</p>
                            </div>
                            <BarChart3 className="w-5 h-5 text-text-secondary" />
                        </div>

                        <div className="space-y-4">
                            {monthlyData.map((data, index) => (
                                <div key={data.month} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">{data.month}</span>
                                        <span className="font-medium text-primary">{formatCurrency(data.revenue)}</span>
                                    </div>
                                    <div className="h-6 bg-gray-100 rounded-full overflow-hidden flex">
                                        <motion.div
                                            className="h-full bg-blue-500 rounded-l-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                        />
                                        <motion.div
                                            className="h-full bg-red-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(data.cost / maxRevenue) * 100}%` }}
                                            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-text-secondary">
                                        <span>Chi phí: {formatCurrency(data.cost)}</span>
                                        <span className="text-green-600">Lãi: {formatCurrency(data.revenue - data.cost)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm text-text-secondary">Doanh thu</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <span className="text-sm text-text-secondary">Chi phí</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Event Type Distribution */}
                    <motion.div
                        className="bg-white rounded-2xl p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-semibold text-primary">Phân bố loại tiệc</h3>
                                <p className="text-sm text-text-secondary">Theo doanh thu</p>
                            </div>
                            <PieChart className="w-5 h-5 text-text-secondary" />
                        </div>

                        <div className="space-y-4">
                            {eventTypeData.map((event, index) => {
                                const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-gray-400'];
                                return (
                                    <div key={event.type} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                                                <span className="text-sm font-medium">{event.type}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-semibold text-primary">{formatCurrency(event.revenue)}</span>
                                                <span className="text-xs text-text-secondary ml-2">({event.count} đơn)</span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${colors[index]} rounded-full`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${event.percentage}%` }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Top Dishes */}
                    <motion.div
                        className="bg-white rounded-2xl p-6 lg:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-semibold text-primary">Top 5 món ăn bán chạy</h3>
                                <p className="text-sm text-text-secondary">Theo số lượng đơn</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-sm text-text-secondary border-b border-gray-100">
                                        <th className="pb-3 font-medium">#</th>
                                        <th className="pb-3 font-medium">Tên món</th>
                                        <th className="pb-3 font-medium text-center">Số lần đặt</th>
                                        <th className="pb-3 font-medium text-right">Doanh thu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topDishes.map((dish, index) => (
                                        <motion.tr
                                            key={dish.name}
                                            className="border-b border-gray-50 last:border-0"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.7 + index * 0.1 }}
                                        >
                                            <td className="py-4">
                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    index === 1 ? 'bg-gray-100 text-gray-600' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                                            'bg-gray-50 text-gray-500'
                                                    }`}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="py-4 font-medium text-primary">{dish.name}</td>
                                            <td className="py-4 text-center text-text-secondary">{dish.orders} lần</td>
                                            <td className="py-4 text-right font-semibold text-green-600">{formatCurrency(dish.revenue)}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Profit Margin Analysis */}
                    <motion.div
                        className="bg-white rounded-2xl p-6 lg:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-semibold text-primary">Phân tích biên lợi nhuận</h3>
                                <p className="text-sm text-text-secondary">So sánh theo tháng</p>
                            </div>
                            <TrendingUp className="w-5 h-5 text-text-secondary" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {monthlyData.map((data, index) => {
                                const margin = ((data.revenue - data.cost) / data.revenue * 100).toFixed(1);
                                const isGood = parseFloat(margin) >= 35;
                                return (
                                    <motion.div
                                        key={data.month}
                                        className={`p-4 rounded-xl text-center ${isGood ? 'bg-green-50' : 'bg-orange-50'}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.9 + index * 0.1 }}
                                    >
                                        <p className="text-sm text-text-secondary mb-2">{data.month}</p>
                                        <p className={`text-2xl font-bold ${isGood ? 'text-green-600' : 'text-orange-600'}`}>
                                            {margin}%
                                        </p>
                                        <p className="text-xs text-text-secondary mt-1">
                                            {isGood ? '✓ Tốt' : '⚠ Cần cải thiện'}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                            <p className="text-sm text-blue-800">
                                <strong>Gợi ý:</strong> Biên lợi nhuận lý tưởng nên từ 35% trở lên.
                                Các tháng có biên thấp hơn cần xem xét lại chi phí nguyên liệu và nhân công.
                            </p>
                        </div>
                    </motion.div>

                    {/* Customer Lifetime Value */}
                    <motion.div
                        className="bg-white rounded-2xl p-6 lg:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-semibold text-primary">Giá trị trọn đời khách hàng (CLV)</h3>
                                <p className="text-sm text-text-secondary">Top 5 khách hàng theo tổng chi tiêu</p>
                            </div>
                            <Heart className="w-5 h-5 text-red-500" />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-sm text-text-secondary border-b border-gray-100">
                                        <th className="pb-3 font-medium">Khách hàng</th>
                                        <th className="pb-3 font-medium text-center">Số đơn</th>
                                        <th className="pb-3 font-medium text-right">Tổng chi tiêu</th>
                                        <th className="pb-3 font-medium text-right">TB/đơn</th>
                                        <th className="pb-3 font-medium text-center">Độ trung thành</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topCustomers.map((customer, index) => (
                                        <motion.tr
                                            key={customer.name}
                                            className="border-b border-gray-50 last:border-0"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 1.1 + index * 0.1 }}
                                        >
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                                                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                                                                index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                                                                    'bg-gray-200 text-gray-600'
                                                        }`}>
                                                        {customer.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-primary">{customer.name}</p>
                                                        <p className="text-xs text-text-secondary">
                                                            Từ {customer.firstOrder} - {customer.lastOrder}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-center">
                                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                                    {customer.orders} đơn
                                                </span>
                                            </td>
                                            <td className="py-4 text-right font-semibold text-green-600">
                                                {formatCurrency(customer.totalSpent)}
                                            </td>
                                            <td className="py-4 text-right text-text-secondary">
                                                {formatCurrency(customer.avgOrder)}
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className={`h-full rounded-full ${customer.loyaltyScore >= 90 ? 'bg-green-500' :
                                                                    customer.loyaltyScore >= 75 ? 'bg-blue-500' :
                                                                        'bg-orange-500'
                                                                }`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${customer.loyaltyScore}%` }}
                                                            transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium">{customer.loyaltyScore}%</span>
                                                    {customer.loyaltyScore >= 90 && <Star className="w-4 h-4 text-yellow-500" />}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <div className="p-4 bg-purple-50 rounded-xl text-center">
                                <p className="text-2xl font-bold text-purple-600">
                                    {formatCurrency(topCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / topCustomers.length)}
                                </p>
                                <p className="text-sm text-text-secondary">CLV trung bình</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-xl text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    {(topCustomers.reduce((sum, c) => sum + c.orders, 0) / topCustomers.length).toFixed(1)}
                                </p>
                                <p className="text-sm text-text-secondary">Đơn TB/khách</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl text-center">
                                <p className="text-2xl font-bold text-blue-600">
                                    {Math.round(topCustomers.reduce((sum, c) => sum + c.loyaltyScore, 0) / topCustomers.length)}%
                                </p>
                                <p className="text-sm text-text-secondary">Độ trung thành TB</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
