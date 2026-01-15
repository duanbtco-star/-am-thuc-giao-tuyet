'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ChevronLeft,
    Search,
    MoreVertical,
    Calendar,
    MapPin,
    Users,
    Phone,
    CheckCircle,
    Clock,
    XCircle,
    ChefHat,
    RefreshCw,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUSES, EVENT_TYPES } from '@/lib/constants';
import { orderApi, Order } from '@/lib/google-sheets';
import { CardSkeleton, ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';

// Fallback mock data for when API is not available
const mockOrders: Order[] = [
    {
        order_id: 'ORD-20260115-A1X',
        quote_id: '',
        customer_name: 'Nguyễn Văn An',
        phone: '0912 345 678',
        event_type: 'dam_cuoi',
        event_date: '2026-01-25',
        event_time: '11:00',
        location: '123 Lê Văn Sỹ, Q.3, TP.HCM',
        guest_count: 150,
        menu_items: [],
        total_amount: 45000000,
        deposit: 20000000,
        remaining: 25000000,
        status: 'confirmed',
        assigned_vendors: [],
        created_at: '',
        notes: '',
    },
    {
        order_id: 'ORD-20260114-B2Y',
        quote_id: '',
        customer_name: 'Trần Thị Bích',
        phone: '0987 654 321',
        event_type: 'thoi_noi',
        event_date: '2026-01-20',
        event_time: '10:00',
        location: '456 Nguyễn Đình Chiểu, Q.1, TP.HCM',
        guest_count: 50,
        menu_items: [],
        total_amount: 15000000,
        deposit: 5000000,
        remaining: 10000000,
        status: 'preparing',
        assigned_vendors: [],
        created_at: '',
        notes: '',
    },
    {
        order_id: 'ORD-20260113-C3Z',
        quote_id: '',
        customer_name: 'Lê Văn Cường',
        phone: '0909 111 222',
        event_type: 'dam_hoi',
        event_date: '2026-01-18',
        event_time: '09:00',
        location: '789 Điện Biên Phủ, Q.10, TP.HCM',
        guest_count: 80,
        menu_items: [],
        total_amount: 25000000,
        deposit: 10000000,
        remaining: 15000000,
        status: 'in_progress',
        assigned_vendors: [],
        created_at: '',
        notes: '',
    },
    {
        order_id: 'ORD-20260110-D4W',
        quote_id: '',
        customer_name: 'Phạm Thị Dung',
        phone: '0933 444 555',
        event_type: 'dam_cuoi',
        event_date: '2026-01-10',
        event_time: '11:30',
        location: '321 Cách Mạng Tháng 8, Q.Tân Bình, TP.HCM',
        guest_count: 200,
        menu_items: [],
        total_amount: 60000000,
        deposit: 60000000,
        remaining: 0,
        status: 'completed',
        assigned_vendors: [],
        created_at: '',
        notes: '',
    },
];

const statusIcons: Record<string, React.ElementType> = {
    confirmed: CheckCircle,
    preparing: Clock,
    in_progress: ChefHat,
    completed: CheckCircle,
    cancelled: XCircle,
};

const statusColors: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-700',
    preparing: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const { addToast } = useToast();

    // Fetch orders from API
    const fetchOrders = useCallback(async (showRefreshToast = false) => {
        try {
            if (showRefreshToast) setRefreshing(true);
            else setLoading(true);
            setError(null);

            const response = await orderApi.getAll();

            if (response.success && response.data) {
                // Ensure data is always an array
                const ordersData = Array.isArray(response.data) ? response.data : [];
                // Use mock data if API returns empty array (backend not configured yet)
                if (ordersData.length === 0) {
                    console.info('No orders from API, using mock data for demo');
                    setOrders(mockOrders);
                    setError('Đang hiển thị dữ liệu mẫu (API chưa có dữ liệu)');
                } else {
                    setOrders(ordersData);
                }
                if (showRefreshToast) {
                    addToast('success', 'Đã cập nhật danh sách đơn hàng');
                }
            } else {
                // Use mock data if API fails
                console.warn('API failed, using mock data');
                setOrders(mockOrders);
                if (showRefreshToast) {
                    addToast('warning', 'Đang sử dụng dữ liệu mẫu');
                }
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setOrders(mockOrders);
            setError('Không thể kết nối API. Đang hiển thị dữ liệu mẫu.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Ensure orders is always an array before filtering
    const safeOrders = Array.isArray(orders) ? orders : [];
    const filteredOrders = safeOrders.filter(order => {
        const matchesSearch = order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.phone?.includes(searchTerm);
        const matchesStatus = !statusFilter || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getEventInfo = (eventType: string) => {
        const event = Object.values(EVENT_TYPES).find(e => e.id === eventType);
        return event || { name: eventType, icon: '🍽️', color: '#888' };
    };

    const getStatusInfo = (status: string) => {
        const info = Object.values(ORDER_STATUSES).find(s => s.id === status);
        return info || { name: status, color: '#888' };
    };

    const getStatusCount = (status: string) => {
        return safeOrders.filter(o => o.status === status).length;
    };

    return (
        <main className="min-h-screen bg-background-light">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="section-container">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <ChevronLeft className="w-5 h-5 text-text-secondary" />
                            <span className="text-text-secondary hidden sm:inline">Quay lại</span>
                        </Link>

                        <h1 className="text-lg font-semibold text-primary">Quản lý đơn hàng</h1>

                        <button
                            onClick={() => fetchOrders(true)}
                            disabled={refreshing}
                            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 text-text-secondary ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="section-container py-6 sm:py-8">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm theo tên khách, mã đơn, SĐT..."
                            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-accent focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <button
                            onClick={() => setStatusFilter(null)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0 ${!statusFilter ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-100'
                                }`}
                        >
                            Tất cả ({orders.length})
                        </button>
                        {Object.values(ORDER_STATUSES).map(status => (
                            <button
                                key={status.id}
                                onClick={() => setStatusFilter(status.id)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0 ${statusFilter === status.id ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-100'
                                    }`}
                            >
                                {status.name} ({getStatusCount(status.id)})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary Cards - Hidden on loading */}
                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6 sm:mb-8">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        {Object.values(ORDER_STATUSES).map(status => {
                            const count = getStatusCount(status.id);
                            const StatusIcon = statusIcons[status.id] || AlertCircle;

                            return (
                                <motion.div
                                    key={status.id}
                                    className={`bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 cursor-pointer hover:shadow-apple transition-all ${statusFilter === status.id ? 'ring-2 ring-accent' : ''}`}
                                    onClick={() => setStatusFilter(statusFilter === status.id ? null : status.id)}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${statusColors[status.id]}`}>
                                            <StatusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xl sm:text-2xl font-semibold text-primary">{count}</p>
                                            <p className="text-xs sm:text-sm text-text-secondary">{status.name}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <p className="text-sm text-yellow-800">{error}</p>
                    </div>
                )}

                {/* Orders List */}
                {loading ? (
                    <div className="bg-white rounded-2xl p-6">
                        <ListSkeleton rows={5} />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    searchTerm || statusFilter ? (
                        <div className="bg-white rounded-2xl">
                            <EmptyState
                                icon="search"
                                title="Không tìm thấy đơn hàng"
                                description={`Không có đơn hàng nào phù hợp với "${searchTerm || getStatusInfo(statusFilter || '').name}"`}
                                action={{
                                    label: 'Xóa bộ lọc',
                                    onClick: () => { setSearchTerm(''); setStatusFilter(null); }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl">
                            <EmptyState
                                icon="cart"
                                title="Chưa có đơn hàng nào"
                                description="Đơn hàng sẽ xuất hiện ở đây sau khi được tạo từ báo giá"
                            />
                        </div>
                    )
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredOrders.map((order, index) => {
                                const eventInfo = getEventInfo(order.event_type);
                                const statusInfo = getStatusInfo(order.status);

                                return (
                                    <motion.div
                                        key={order.order_id}
                                        layout
                                        className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-apple-lg transition-all cursor-pointer"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            {/* Left: Order Info */}
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0" style={{ backgroundColor: `${eventInfo.color}20` }}>
                                                    {eventInfo.icon}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-primary truncate">{order.customer_name}</h3>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                                            {statusInfo.name}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-text-secondary mb-2">{order.order_id}</p>

                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4 flex-shrink-0" />
                                                            <span className="truncate">{formatDate(order.event_date)} • {order.event_time}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-4 h-4 flex-shrink-0" />
                                                            {order.guest_count} khách
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-4 h-4 flex-shrink-0" />
                                                            {order.phone}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Amount Info */}
                                            <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                                                <div className="text-left lg:text-right">
                                                    <p className="text-base sm:text-lg font-semibold text-primary">{formatCurrency(order.total_amount)}</p>
                                                    <p className="text-xs sm:text-sm text-text-secondary">
                                                        Đã cọc: {formatCurrency(order.deposit)}
                                                    </p>
                                                    {order.remaining > 0 && (
                                                        <p className="text-xs sm:text-sm text-accent font-medium">
                                                            Còn lại: {formatCurrency(order.remaining)}
                                                        </p>
                                                    )}
                                                </div>

                                                <button
                                                    className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center flex-shrink-0"
                                                    onClick={(e) => { e.stopPropagation(); }}
                                                >
                                                    <MoreVertical className="w-5 h-5 text-text-secondary" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                                            <span className="flex items-center gap-2 text-sm text-text-secondary">
                                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                                <span className="truncate">{order.location}</span>
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto"
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Mobile handle */}
                            <div className="sm:hidden flex justify-center pt-3">
                                <div className="w-10 h-1 bg-gray-300 rounded-full" />
                            </div>

                            <div className="p-6 sm:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl sm:text-2xl font-semibold text-primary">Chi tiết đơn hàng</h2>
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                                    >
                                        <XCircle className="w-6 h-6 text-text-secondary" />
                                    </button>
                                </div>

                                {/* Order Header */}
                                <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl"
                                        style={{ backgroundColor: `${getEventInfo(selectedOrder.event_type).color}20` }}>
                                        {getEventInfo(selectedOrder.event_type).icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-primary">{selectedOrder.customer_name}</h3>
                                        <p className="text-text-secondary">{selectedOrder.order_id}</p>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 py-6 border-b border-gray-100">
                                    <div>
                                        <p className="text-sm text-text-secondary mb-1">Loại tiệc</p>
                                        <p className="font-medium text-primary">{getEventInfo(selectedOrder.event_type).name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary mb-1">Số điện thoại</p>
                                        <p className="font-medium text-primary">{selectedOrder.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary mb-1">Ngày & giờ</p>
                                        <p className="font-medium text-primary">{formatDate(selectedOrder.event_date)} • {selectedOrder.event_time}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary mb-1">Số khách</p>
                                        <p className="font-medium text-primary">{selectedOrder.guest_count} người</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-sm text-text-secondary mb-1">Địa điểm</p>
                                        <p className="font-medium text-primary">{selectedOrder.location}</p>
                                    </div>
                                </div>

                                {/* Financial Summary */}
                                <div className="py-6 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-text-secondary">Tổng tiền</span>
                                        <span className="font-semibold text-primary">{formatCurrency(selectedOrder.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-secondary">Đã cọc</span>
                                        <span className="font-medium text-green-600">{formatCurrency(selectedOrder.deposit)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg pt-3 border-t border-gray-100">
                                        <span className="font-semibold text-primary">Còn lại</span>
                                        <span className="font-semibold text-accent">{formatCurrency(selectedOrder.remaining)}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                                    <button className="flex-1 btn-primary">
                                        Cập nhật trạng thái
                                    </button>
                                    <button className="flex-1 btn-outline">
                                        Xem thực đơn
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
