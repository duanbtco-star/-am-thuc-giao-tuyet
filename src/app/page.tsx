'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Users,
    Calendar,
    ChefHat,
    ClipboardList,
    Wallet,
    Store,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Bell,
    Search,
    ChevronRight,
    BarChart3,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Utensils,
    PieChart,
    Activity
} from 'lucide-react';

// Mock Data - Thay thế bằng API thực tế
const kpiData = {
    revenue: {
        current: 125500000,
        previous: 98000000,
        change: 28.06,
        trend: 'up'
    },
    orders: {
        current: 32,
        previous: 28,
        change: 14.29,
        trend: 'up'
    },
    profit: {
        current: 42350000,
        previous: 35000000,
        change: 21.0,
        trend: 'up'
    },
    avgOrderValue: {
        current: 3921875,
        previous: 3500000,
        change: 12.05,
        trend: 'up'
    },
    cancelRate: {
        current: 2.5,
        previous: 5.0,
        change: -50.0,
        trend: 'down'
    },
    newCustomers: {
        current: 18,
        previous: 12,
        change: 50.0,
        trend: 'up'
    }
};

const recentOrders = [
    { id: 'DH-2026-001', customer: 'Nguyễn Văn A', type: 'Đám Cưới', date: '2026-01-18', tables: 25, amount: 45000000, status: 'confirmed' },
    { id: 'DH-2026-002', customer: 'Trần Thị B', type: 'Thôi Nôi', date: '2026-01-20', tables: 12, amount: 18000000, status: 'pending' },
    { id: 'DH-2026-003', customer: 'Lê Văn C', type: 'Đám Hỏi', date: '2026-01-22', tables: 15, amount: 28000000, status: 'confirmed' },
    { id: 'DH-2026-004', customer: 'Phạm Thị D', type: 'Sinh Nhật', date: '2026-01-25', tables: 8, amount: 12000000, status: 'in_progress' },
    { id: 'DH-2026-005', customer: 'Hoàng Văn E', type: 'Đám Cưới', date: '2026-01-28', tables: 30, amount: 55000000, status: 'confirmed' }
];

const upcomingEvents = [
    { id: 1, title: 'Đám Cưới - Nguyễn Văn A', date: '2026-01-18', time: '10:00', location: 'Q. Tân Bình', type: 'Đám Cưới' },
    { id: 2, title: 'Thôi Nôi - Trần Thị B', date: '2026-01-20', time: '09:00', location: 'Q. Gò Vấp', type: 'Thôi Nôi' },
    { id: 3, title: 'Đám Hỏi - Lê Văn C', date: '2026-01-22', time: '08:30', location: 'Q. Bình Thạnh', type: 'Đám Hỏi' },
    { id: 4, title: 'Sinh Nhật - Phạm Thị D', date: '2026-01-25', time: '17:00', location: 'Q. 7', type: 'Sinh Nhật' }
];

const monthlyRevenue = [
    { month: 'T8', revenue: 85, profit: 28 },
    { month: 'T9', revenue: 92, profit: 31 },
    { month: 'T10', revenue: 78, profit: 25 },
    { month: 'T11', revenue: 110, profit: 38 },
    { month: 'T12', revenue: 145, profit: 52 },
    { month: 'T1', revenue: 125, profit: 42 }
];

const eventTypeStats = [
    { type: 'Đám Cưới', count: 15, percentage: 35, color: '#FF6B6B' },
    { type: 'Thôi Nôi', count: 12, percentage: 28, color: '#4ECDC4' },
    { type: 'Đám Hỏi', count: 8, percentage: 19, color: '#FFE66D' },
    { type: 'Đám Dỗ', count: 5, percentage: 12, color: '#95E1D3' },
    { type: 'Khác', count: 3, percentage: 7, color: '#A8D8EA' }
];

const quickLinks = [
    { title: 'Tạo báo giá', href: '/bao-gia', icon: ClipboardList, color: 'from-blue-500 to-cyan-500' },
    { title: 'Quản lý đơn', href: '/don-hang', icon: ShoppingCart, color: 'from-orange-500 to-red-500' },
    { title: 'Lịch sự kiện', href: '/lich', icon: Calendar, color: 'from-purple-500 to-pink-500' },
    { title: 'Tài chính', href: '/tai-chinh', icon: Wallet, color: 'from-green-500 to-emerald-500' },
    { title: 'Nhân sự', href: '/hr', icon: Users, color: 'from-teal-500 to-cyan-500' },
    { title: 'Nhà cung cấp', href: '/vendor', icon: Store, color: 'from-amber-500 to-orange-500' },
    { title: 'Báo cáo', href: '/bao-cao', icon: BarChart3, color: 'from-indigo-500 to-blue-500' },
    { title: 'Cài đặt', href: '/settings', icon: MoreHorizontal, color: 'from-gray-500 to-slate-600' },
];

// Utility Functions
function formatCurrency(value: number): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
}

function formatFullCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(value);
}

function getStatusConfig(status: string) {
    switch (status) {
        case 'confirmed':
            return { label: 'Đã xác nhận', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
        case 'pending':
            return { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
        case 'in_progress':
            return { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-700', icon: Activity };
        case 'cancelled':
            return { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: XCircle };
        default:
            return { label: status, color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
    }
}

// Animation Variants
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.08
        }
    }
};

export default function DashboardPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Chào buổi sáng');
        else if (hour < 18) setGreeting('Chào buổi chiều');
        else setGreeting('Chào buổi tối');
        return () => clearInterval(timer);
    }, []);

    const maxHeight = Math.max(...monthlyRevenue.map(m => m.revenue));

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
                <div className="max-w-[1600px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo & Title */}
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                                <ChefHat className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">ẨM THỰC GIÁO TUYẾT</h1>
                                <p className="text-xs text-gray-500">Hệ thống quản lý nội bộ</p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm đơn hàng, khách hàng..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            <button className="relative p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                NV
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-[1600px] mx-auto px-6 py-8">
                {/* Welcome Section */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">{greeting}! 👋</h2>
                    <p className="text-gray-500">
                        {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {quickLinks.map((link, index) => (
                        <motion.div key={link.href} variants={fadeInUp}>
                            <Link
                                href={link.href}
                                className="group flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                    <link.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-medium text-gray-700 group-hover:text-gray-900">{link.title}</span>
                                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* KPI Cards */}
                <motion.div
                    className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {/* Revenue */}
                    <motion.div variants={fadeInUp} className="col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-medium ${kpiData.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {kpiData.revenue.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {kpiData.revenue.change}%
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(kpiData.revenue.current)}</div>
                        <div className="text-xs text-gray-500">Doanh thu tháng này</div>
                    </motion.div>

                    {/* Orders */}
                    <motion.div variants={fadeInUp} className="col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-medium ${kpiData.orders.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {kpiData.orders.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {kpiData.orders.change}%
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{kpiData.orders.current}</div>
                        <div className="text-xs text-gray-500">Đơn hàng tháng này</div>
                    </motion.div>

                    {/* Profit */}
                    <motion.div variants={fadeInUp} className="col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-medium ${kpiData.profit.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {kpiData.profit.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {kpiData.profit.change}%
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(kpiData.profit.current)}</div>
                        <div className="text-xs text-gray-500">Lợi nhuận tháng này</div>
                    </motion.div>

                    {/* Avg Order Value */}
                    <motion.div variants={fadeInUp} className="col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-medium ${kpiData.avgOrderValue.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {kpiData.avgOrderValue.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {kpiData.avgOrderValue.change}%
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(kpiData.avgOrderValue.current)}</div>
                        <div className="text-xs text-gray-500">Giá trị TB/đơn</div>
                    </motion.div>

                    {/* Cancel Rate */}
                    <motion.div variants={fadeInUp} className="col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-medium ${kpiData.cancelRate.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {kpiData.cancelRate.change < 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                {Math.abs(kpiData.cancelRate.change)}%
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{kpiData.cancelRate.current}%</div>
                        <div className="text-xs text-gray-500">Tỷ lệ hủy đơn</div>
                    </motion.div>

                    {/* New Customers */}
                    <motion.div variants={fadeInUp} className="col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-medium ${kpiData.newCustomers.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {kpiData.newCustomers.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {kpiData.newCustomers.change}%
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{kpiData.newCustomers.current}</div>
                        <div className="text-xs text-gray-500">Khách hàng mới</div>
                    </motion.div>
                </motion.div>

                {/* Charts & Tables Row */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <motion.div
                        className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Doanh thu & Lợi nhuận</h3>
                                <p className="text-sm text-gray-500">6 tháng gần nhất (đơn vị: triệu VNĐ)</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
                                    <span className="text-gray-600">Doanh thu</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                                    <span className="text-gray-600">Lợi nhuận</span>
                                </div>
                            </div>
                        </div>

                        {/* Bar Chart */}
                        <div className="flex items-end justify-between h-64 gap-4 px-4">
                            {monthlyRevenue.map((item, index) => (
                                <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex justify-center gap-1.5 h-52">
                                        {/* Revenue Bar */}
                                        <motion.div
                                            className="w-6 bg-gradient-to-t from-orange-500 to-red-400 rounded-t-lg relative group cursor-pointer"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(item.revenue / maxHeight) * 100}%` }}
                                            transition={{ delay: index * 0.1, duration: 0.5 }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {item.revenue}M
                                            </div>
                                        </motion.div>
                                        {/* Profit Bar */}
                                        <motion.div
                                            className="w-6 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg relative group cursor-pointer"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(item.profit / maxHeight) * 100}%` }}
                                            transition={{ delay: index * 0.1 + 0.1, duration: 0.5 }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {item.profit}M
                                            </div>
                                        </motion.div>
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">{item.month}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Event Type Distribution */}
                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Loại tiệc</h3>
                                <p className="text-sm text-gray-500">Phân bổ tháng này</p>
                            </div>
                            <PieChart className="w-5 h-5 text-gray-400" />
                        </div>

                        {/* Donut Chart Placeholder */}
                        <div className="relative w-40 h-40 mx-auto mb-6">
                            <svg className="w-full h-full transform -rotate-90">
                                {eventTypeStats.reduce((acc, item, index) => {
                                    const offset = acc.offset;
                                    const circumference = 2 * Math.PI * 60;
                                    const strokeDasharray = (item.percentage / 100) * circumference;
                                    const strokeDashoffset = -offset;

                                    acc.elements.push(
                                        <circle
                                            key={item.type}
                                            cx="80"
                                            cy="80"
                                            r="60"
                                            fill="transparent"
                                            stroke={item.color}
                                            strokeWidth="20"
                                            strokeDasharray={`${strokeDasharray} ${circumference}`}
                                            strokeDashoffset={strokeDashoffset}
                                            className="transition-all duration-500"
                                        />
                                    );
                                    acc.offset += strokeDasharray;
                                    return acc;
                                }, { elements: [] as JSX.Element[], offset: 0 }).elements}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-2xl font-bold text-gray-900">43</span>
                                <span className="text-xs text-gray-500">Tổng tiệc</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-3">
                            {eventTypeStats.map((item) => (
                                <div key={item.type} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-sm text-gray-600">{item.type}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                                        <span className="text-xs text-gray-400">({item.percentage}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Recent Orders & Upcoming Events */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h3>
                                <p className="text-sm text-gray-500">5 đơn hàng mới nhất</p>
                            </div>
                            <Link href="/don-hang" className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                                Xem tất cả <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recentOrders.map((order) => {
                                const statusConfig = getStatusConfig(order.status);
                                return (
                                    <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                                            <Utensils className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-900 truncate">{order.customer}</span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-500">{order.type}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{order.id}</span>
                                                <span>•</span>
                                                <span>{order.tables} bàn</span>
                                                <span>•</span>
                                                <span>{new Date(order.date).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-gray-900 mb-1">{formatFullCurrency(order.amount)}</div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                                <statusConfig.icon className="w-3 h-3" />
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Upcoming Events */}
                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Sự kiện sắp tới</h3>
                                <p className="text-sm text-gray-500">Lịch trong 2 tuần tới</p>
                            </div>
                            <Link href="/lich" className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                                Xem lịch <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {upcomingEvents.map((event, index) => (
                                <div key={event.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                                    <div className="flex flex-col items-center min-w-[50px]">
                                        <div className="text-xs text-gray-500 uppercase">
                                            {new Date(event.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {new Date(event.date).getDate()}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            T{new Date(event.date).getMonth() + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 mb-1">{event.title}</div>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {event.time}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {event.location}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.type === 'Đám Cưới' ? 'bg-red-100 text-red-700' :
                                        event.type === 'Thôi Nôi' ? 'bg-pink-100 text-pink-700' :
                                            event.type === 'Đám Hỏi' ? 'bg-orange-100 text-orange-700' :
                                                'bg-purple-100 text-purple-700'
                                        }`}>
                                        {event.type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-400">
                    © 2026 ẨM THỰC GIÁO TUYẾT - Hệ thống quản lý nội bộ
                </div>
            </div>
        </main>
    );
}
